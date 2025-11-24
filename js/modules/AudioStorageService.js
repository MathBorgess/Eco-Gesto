/**
 * AudioStorageService - Gerenciamento local de áudios com IndexedDB
 * @module modules/AudioStorageService
 */

import config from '../config/musicai.config.js';
import Logger from '../utils/Logger.js';

class AudioStorageService {
  constructor() {
    this.config = config.storage;
    this.logger = new Logger('AudioStorageService', config.debug);
    this.db = null;
    this.metrics = {
      totalAudios: 0,
      totalSize: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Inicializa IndexedDB
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, 1);

      request.onerror = () => {
        this.logger.error('Failed to open IndexedDB', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.logger.info('IndexedDB initialized');
        this._updateMetrics();
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, {
            keyPath: 'id',
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          this.logger.info('Object store created');
        }
      };
    });
  }

  /**
   * Salva áudio no storage
   * @param {Object} audioData
   * @returns {Promise<string>} ID do áudio salvo
   */
  async saveAudio(audioData) {
    await this.init();

    const { id, blob, metadata, type } = audioData;

    try {
      // Check size limit
      const currentSize = await this._getTotalSize();
      const maxSize = this.config.maxSizeMB * 1024 * 1024;

      if (currentSize + blob.size > maxSize) {
        this.logger.warn('Storage limit reached, cleaning old audios');
        await this._cleanOldestUntilSpace(blob.size);
      }

      const record = {
        id: id || this._generateId(),
        blob,
        metadata: metadata || {},
        type: type || 'gene',
        timestamp: Date.now(),
        size: blob.size,
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(
          [this.config.storeName],
          'readwrite'
        );
        const store = transaction.objectStore(this.config.storeName);
        const request = store.put(record);

        request.onsuccess = () => {
          this.metrics.totalAudios++;
          this.metrics.totalSize += blob.size;
          this.logger.info('Audio saved', {
            id: record.id,
            size: blob.size,
          });
          resolve(record.id);
        };

        request.onerror = () => {
          this.logger.error('Failed to save audio', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      this.logger.error('Error saving audio', error);
      throw error;
    }
  }

  /**
   * Recupera áudio do storage
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getAudio(id) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.config.storeName],
        'readonly'
      );
      const store = transaction.objectStore(this.config.storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          this.metrics.cacheHits++;
          this.logger.debug('Audio retrieved', { id });
          resolve(request.result);
        } else {
          this.metrics.cacheMisses++;
          this.logger.debug('Audio not found', { id });
          resolve(null);
        }
      };

      request.onerror = () => {
        this.logger.error('Failed to retrieve audio', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Lista todos os áudios (com filtro opcional)
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  async listAudios(filter = {}) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.config.storeName],
        'readonly'
      );
      const store = transaction.objectStore(this.config.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result;

        // Apply filters
        if (filter.type) {
          results = results.filter((r) => r.type === filter.type);
        }
        if (filter.since) {
          results = results.filter((r) => r.timestamp >= filter.since);
        }
        if (filter.until) {
          results = results.filter((r) => r.timestamp <= filter.until);
        }

        // Sort by timestamp (newest first)
        results.sort((a, b) => b.timestamp - a.timestamp);

        this.logger.debug('Audios listed', { count: results.length });
        resolve(results);
      };

      request.onerror = () => {
        this.logger.error('Failed to list audios', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Deleta áudio
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteAudio(id) {
    await this.init();

    // Get size before deleting
    const audio = await this.getAudio(id);
    if (!audio) {
      this.logger.warn('Audio not found for deletion', { id });
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.config.storeName],
        'readwrite'
      );
      const store = transaction.objectStore(this.config.storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        this.metrics.totalAudios--;
        this.metrics.totalSize -= audio.size;
        this.logger.info('Audio deleted', { id });
        resolve();
      };

      request.onerror = () => {
        this.logger.error('Failed to delete audio', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Limpa áudios antigos (mais de N dias)
   * @param {number} maxAgeDays
   * @returns {Promise<number>} Quantidade deletada
   */
  async cleanOldAudios(maxAgeDays = null) {
    maxAgeDays = maxAgeDays || this.config.cleanupAgeDays;
    const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    try {
      const allAudios = await this.listAudios({ until: cutoffTime });
      let deleted = 0;

      for (const audio of allAudios) {
        await this.deleteAudio(audio.id);
        deleted++;
      }

      this.logger.info('Old audios cleaned', { deleted, maxAgeDays });
      return deleted;
    } catch (error) {
      this.logger.error('Error cleaning old audios', error);
      throw error;
    }
  }

  /**
   * Limpa todos os áudios
   * @returns {Promise<void>}
   */
  async clearAll() {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.config.storeName],
        'readwrite'
      );
      const store = transaction.objectStore(this.config.storeName);
      const request = store.clear();

      request.onsuccess = () => {
        this.metrics.totalAudios = 0;
        this.metrics.totalSize = 0;
        this.logger.info('All audios cleared');
        resolve();
      };

      request.onerror = () => {
        this.logger.error('Failed to clear audios', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Obtém métricas de uso
   * @returns {Object}
   */
  getMetrics() {
    return {
      ...this.metrics,
      usagePercent: (
        (this.metrics.totalSize / (this.config.maxSizeMB * 1024 * 1024)) *
        100
      ).toFixed(2),
    };
  }

  // === Private Methods ===

  _generateId() {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async _getTotalSize() {
    const audios = await this.listAudios();
    return audios.reduce((sum, audio) => sum + audio.size, 0);
  }

  async _updateMetrics() {
    const audios = await this.listAudios();
    this.metrics.totalAudios = audios.length;
    this.metrics.totalSize = audios.reduce((sum, a) => sum + a.size, 0);
  }

  async _cleanOldestUntilSpace(requiredSpace) {
    const audios = await this.listAudios();
    audios.sort((a, b) => a.timestamp - b.timestamp); // oldest first

    let freedSpace = 0;
    let deleted = 0;

    for (const audio of audios) {
      if (freedSpace >= requiredSpace) break;
      await this.deleteAudio(audio.id);
      freedSpace += audio.size;
      deleted++;
    }

    this.logger.info('Space freed', { deleted, freedSpace });
  }
}

export default AudioStorageService;
