/**
 * Testes unitários para AudioStorageService
 */

import AudioStorageService from '../../js/modules/AudioStorageService.js';

describe('AudioStorageService', () => {
  let storage;

  beforeEach(async () => {
    storage = new AudioStorageService();
    await storage.init();
  });

  afterEach(async () => {
    await storage.clearAll();
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize IndexedDB', async () => {
      expect(storage.db).toBeDefined();
      expect(storage.db.name).toBe('EcoGestoAudioDB');
    });

    it('should not reinitialize if already initialized', async () => {
      const db1 = storage.db;
      await storage.init();
      const db2 = storage.db;

      expect(db1).toBe(db2);
    });

    it('should update metrics after initialization', async () => {
      const metrics = storage.getMetrics();
      expect(metrics.totalAudios).toBeDefined();
      expect(metrics.totalSize).toBeDefined();
    });
  });

  describe('saveAudio', () => {
    it('should save audio to storage', async () => {
      const audioData = {
        id: 'test-audio-1',
        blob: new Blob(['test audio data'], { type: 'audio/wav' }),
        type: 'gene',
        metadata: { test: 'data' },
      };

      const id = await storage.saveAudio(audioData);

      expect(id).toBe('test-audio-1');

      const saved = await storage.getAudio(id);
      expect(saved).toBeDefined();
      expect(saved.id).toBe(id);
      expect(saved.type).toBe('gene');
    });

    it('should generate ID if not provided', async () => {
      const audioData = {
        blob: new Blob(['test'], { type: 'audio/wav' }),
        type: 'mix',
      };

      const id = await storage.saveAudio(audioData);

      expect(id).toBeDefined();
      expect(id).toMatch(/^audio_/);
    });

    it('should save metadata with audio', async () => {
      const metadata = {
        creatureId: 'creature-123',
        generation: 5,
        dna: { frequency: 440 },
      };

      const audioData = {
        blob: new Blob(['test'], { type: 'audio/wav' }),
        type: 'gene',
        metadata,
      };

      const id = await storage.saveAudio(audioData);
      const saved = await storage.getAudio(id);

      expect(saved.metadata).toEqual(metadata);
    });

    it('should update metrics after saving', async () => {
      const audioData = {
        blob: new Blob(['test data'], { type: 'audio/wav' }),
        type: 'gene',
      };

      const metricsBefore = storage.getMetrics();
      await storage.saveAudio(audioData);
      const metricsAfter = storage.getMetrics();

      expect(metricsAfter.totalAudios).toBe(metricsBefore.totalAudios + 1);
      expect(metricsAfter.totalSize).toBeGreaterThan(metricsBefore.totalSize);
    });

    it('should clean old audios when size limit reached', async () => {
      // Save multiple large audios to exceed limit
      const largeBlob = new Blob([new ArrayBuffer(10 * 1024 * 1024)]); // 10MB

      for (let i = 0; i < 6; i++) {
        await storage.saveAudio({
          blob: largeBlob,
          type: 'gene',
        });
        await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure different timestamps
      }

      const metrics = storage.getMetrics();
      expect(metrics.totalSize).toBeLessThanOrEqual(50 * 1024 * 1024);
    });
  });

  describe('getAudio', () => {
    it('should retrieve saved audio', async () => {
      const audioData = {
        id: 'test-get',
        blob: new Blob(['test'], { type: 'audio/wav' }),
        type: 'mix',
      };

      await storage.saveAudio(audioData);
      const retrieved = await storage.getAudio('test-get');

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe('test-get');
      expect(retrieved.blob).toBeInstanceOf(Blob);
    });

    it('should return null for non-existent audio', async () => {
      const result = await storage.getAudio('non-existent');
      expect(result).toBeNull();
    });

    it('should update cache hit metrics', async () => {
      const audioData = {
        id: 'test-cache',
        blob: new Blob(['test'], { type: 'audio/wav' }),
        type: 'gene',
      };

      await storage.saveAudio(audioData);

      const metricsBefore = storage.getMetrics();
      await storage.getAudio('test-cache');
      const metricsAfter = storage.getMetrics();

      expect(metricsAfter.cacheHits).toBe(metricsBefore.cacheHits + 1);
    });

    it('should update cache miss metrics', async () => {
      const metricsBefore = storage.getMetrics();
      await storage.getAudio('non-existent');
      const metricsAfter = storage.getMetrics();

      expect(metricsAfter.cacheMisses).toBe(metricsBefore.cacheMisses + 1);
    });
  });

  describe('listAudios', () => {
    beforeEach(async () => {
      // Save test audios
      await storage.saveAudio({
        id: 'gene-1',
        blob: new Blob(['test1']),
        type: 'gene',
      });
      await new Promise((resolve) => setTimeout(resolve, 10));

      await storage.saveAudio({
        id: 'mix-1',
        blob: new Blob(['test2']),
        type: 'mix',
      });
      await new Promise((resolve) => setTimeout(resolve, 10));

      await storage.saveAudio({
        id: 'gene-2',
        blob: new Blob(['test3']),
        type: 'gene',
      });
    });

    it('should list all audios', async () => {
      const audios = await storage.listAudios();
      expect(audios.length).toBe(3);
    });

    it('should filter by type', async () => {
      const genes = await storage.listAudios({ type: 'gene' });
      expect(genes.length).toBe(2);
      expect(genes.every((a) => a.type === 'gene')).toBe(true);

      const mixes = await storage.listAudios({ type: 'mix' });
      expect(mixes.length).toBe(1);
      expect(mixes[0].type).toBe('mix');
    });

    it('should filter by timestamp range', async () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;

      const recent = await storage.listAudios({ since: oneMinuteAgo });
      expect(recent.length).toBe(3);

      const future = await storage.listAudios({ since: now + 1000 });
      expect(future.length).toBe(0);
    });

    it('should sort by timestamp (newest first)', async () => {
      const audios = await storage.listAudios();
      expect(audios[0].id).toBe('gene-2'); // Last saved
      expect(audios[2].id).toBe('gene-1'); // First saved
    });
  });

  describe('deleteAudio', () => {
    it('should delete audio by ID', async () => {
      const audioData = {
        id: 'test-delete',
        blob: new Blob(['test'], { type: 'audio/wav' }),
        type: 'gene',
      };

      await storage.saveAudio(audioData);
      await storage.deleteAudio('test-delete');

      const deleted = await storage.getAudio('test-delete');
      expect(deleted).toBeNull();
    });

    it('should update metrics after deletion', async () => {
      const audioData = {
        id: 'test-metrics',
        blob: new Blob(['test data'], { type: 'audio/wav' }),
        type: 'gene',
      };

      await storage.saveAudio(audioData);
      const metricsBefore = storage.getMetrics();

      await storage.deleteAudio('test-metrics');
      const metricsAfter = storage.getMetrics();

      expect(metricsAfter.totalAudios).toBe(metricsBefore.totalAudios - 1);
      expect(metricsAfter.totalSize).toBeLessThan(metricsBefore.totalSize);
    });

    it('should handle deleting non-existent audio', async () => {
      await expect(storage.deleteAudio('non-existent')).resolves.not.toThrow();
    });
  });

  describe('cleanOldAudios', () => {
    it('should delete audios older than specified days', async () => {
      // Save old audio (mock timestamp)
      const oldAudioData = {
        id: 'old-audio',
        blob: new Blob(['old'], { type: 'audio/wav' }),
        type: 'gene',
      };

      await storage.saveAudio(oldAudioData);

      // Manually update timestamp to be old
      const audio = await storage.getAudio('old-audio');
      audio.timestamp = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago

      const transaction = storage.db.transaction(['audios'], 'readwrite');
      const store = transaction.objectStore('audios');
      store.put(audio);

      await new Promise((resolve) => {
        transaction.oncomplete = resolve;
      });

      // Clean audios older than 7 days
      const deleted = await storage.cleanOldAudios(7);

      expect(deleted).toBe(1);
      const remaining = await storage.getAudio('old-audio');
      expect(remaining).toBeNull();
    });

    it('should not delete recent audios', async () => {
      await storage.saveAudio({
        id: 'recent',
        blob: new Blob(['test']),
        type: 'gene',
      });

      const deleted = await storage.cleanOldAudios(7);

      expect(deleted).toBe(0);
      const audio = await storage.getAudio('recent');
      expect(audio).not.toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should delete all audios', async () => {
      await storage.saveAudio({
        blob: new Blob(['test1']),
        type: 'gene',
      });
      await storage.saveAudio({
        blob: new Blob(['test2']),
        type: 'mix',
      });

      await storage.clearAll();

      const audios = await storage.listAudios();
      expect(audios.length).toBe(0);
    });

    it('should reset metrics', async () => {
      await storage.saveAudio({
        blob: new Blob(['test']),
        type: 'gene',
      });

      await storage.clearAll();

      const metrics = storage.getMetrics();
      expect(metrics.totalAudios).toBe(0);
      expect(metrics.totalSize).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('should return current metrics', async () => {
      const metrics = storage.getMetrics();

      expect(metrics).toHaveProperty('totalAudios');
      expect(metrics).toHaveProperty('totalSize');
      expect(metrics).toHaveProperty('cacheHits');
      expect(metrics).toHaveProperty('cacheMisses');
      expect(metrics).toHaveProperty('usagePercent');
    });

    it('should calculate usage percentage', async () => {
      const largeBlob = new Blob([new ArrayBuffer(25 * 1024 * 1024)]); // 25MB
      await storage.saveAudio({
        blob: largeBlob,
        type: 'gene',
      });

      const metrics = storage.getMetrics();
      expect(parseFloat(metrics.usagePercent)).toBeCloseTo(50, 0);
    });
  });
});
