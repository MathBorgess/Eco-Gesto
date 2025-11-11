/**
 * MixEvolutionManager - Orquestrador da mixagem evolutiva com Music.AI
 * @module modules/MixEvolutionManager
 */

import MusicAIService from './MusicAIService.js';
import AudioExporter from './AudioExporter.js';
import AudioStorageService from './AudioStorageService.js';
import config from '../config/musicai.config.js';
import Logger from '../utils/Logger.js';

class MixEvolutionManager {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.musicAI = new MusicAIService();
    this.exporter = new AudioExporter(audioContext);
    this.storage = new AudioStorageService();
    this.logger = new Logger('MixEvolutionManager', config.debug);

    this.state = {
      enabled: false,
      isProcessing: false,
      previousMixId: null,
      currentJobId: null,
      generationCount: 0,
      successCount: 0,
      failCount: 0,
    };

    this.callbacks = {
      onMixStart: null,
      onMixProgress: null,
      onMixComplete: null,
      onMixError: null,
    };

    this.config = config;
  }

  /**
   * Inicializa o gerenciador
   * @returns {Promise<void>}
   */
  async init() {
    try {
      this.logger.info('Initializing MixEvolutionManager');

      // Initialize storage
      await this.storage.init();

      // Test Music.AI authentication
      const isAuthenticated = await this.musicAI.authenticate();
      if (!isAuthenticated) {
        throw new Error('Music.AI authentication failed');
      }

      // Clean old audios
      await this.storage.cleanOldAudios();

      this.logger.info('MixEvolutionManager initialized successfully');
    } catch (error) {
      this.logger.error('Initialization failed', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa mixagem evolutiva
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.state.enabled = enabled;
    this.logger.info('Mix evolution', { enabled });
  }

  /**
   * Registra callbacks
   * @param {Object} callbacks
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Processa nova criatura → gene → mix
   * @param {Object} creature - Criatura sonora
   * @returns {Promise<Object>} Resultado do mix
   */
  async processNewCreature(creature) {
    if (!this.state.enabled) {
      this.logger.debug('Mix evolution disabled, skipping');
      return null;
    }

    if (this.state.isProcessing) {
      this.logger.warn('Already processing, skipping');
      return null;
    }

    this.state.isProcessing = true;
    this.state.generationCount++;

    try {
      this._triggerCallback('onMixStart', { creature });

      // Step 1: Export creature audio (gene)
      this.logger.info('Step 1: Exporting creature audio', {
        creatureId: creature.id,
      });
      const { blob: geneBlob, url: geneUrl } = await this.exporter.exportCreature(
        creature
      );

      // Save gene to storage
      const geneId = await this.storage.saveAudio({
        id: `gene_${creature.id}`,
        blob: geneBlob,
        type: 'gene',
        metadata: {
          creatureId: creature.id,
          dna: creature.dna,
        },
      });

      this._triggerCallback('onMixProgress', {
        step: 'gene_exported',
        geneId,
      });

      // Step 2: Upload gene to Music.AI
      this.logger.info('Step 2: Uploading gene to Music.AI');
      const geneUploadUrl = await this.musicAI.uploadAudio(geneBlob, (progress) => {
        this._triggerCallback('onMixProgress', {
          step: 'uploading_gene',
          progress,
        });
      });

      // Step 3: Prepare workflow inputs
      const workflowInputs = await this._prepareWorkflowInputs(
        geneUploadUrl,
        creature
      );

      // Step 4: Run Music.AI workflow
      this.logger.info('Step 4: Running Music.AI workflow');
      const job = await this.musicAI.runWorkflow(
        this.config.workflow.id,
        workflowInputs
      );

      this.state.currentJobId = job.id;

      this._triggerCallback('onMixProgress', {
        step: 'workflow_started',
        jobId: job.id,
      });

      // Step 5: Poll job status
      this.logger.info('Step 5: Polling job status');
      const result = await this.musicAI.getJobStatus(job.id, {
        pollInterval: 2000,
        maxAttempts: 30,
        onProgress: (status) => {
          this._triggerCallback('onMixProgress', {
            step: 'processing',
            status: status.status,
            progress: status.progress,
          });
        },
      });

      // Step 6: Download and save mixed audio
      this.logger.info('Step 6: Downloading mixed audio');
      const mixedBlob = await this._downloadMixedAudio(result.output_url);

      const mixId = await this.storage.saveAudio({
        blob: mixedBlob,
        type: 'mix',
        metadata: {
          geneId,
          creatureId: creature.id,
          jobId: job.id,
          previousMixId: this.state.previousMixId,
          generation: this.state.generationCount,
        },
      });

      // Update state
      this.state.previousMixId = mixId;
      this.state.currentJobId = null;
      this.state.successCount++;

      const mixUrl = this.exporter.createBlobURL(mixedBlob);

      const finalResult = {
        success: true,
        mixId,
        mixUrl,
        geneId,
        geneUrl,
        generation: this.state.generationCount,
        jobId: job.id,
      };

      this._triggerCallback('onMixComplete', finalResult);

      this.logger.info('Mix evolution complete', {
        mixId,
        generation: this.state.generationCount,
      });

      return finalResult;
    } catch (error) {
      this.state.failCount++;
      this.logger.error('Mix evolution failed', error);

      // Fallback: use gene directly
      const fallback = await this._handleFallback(creature, error);

      this._triggerCallback('onMixError', { error, fallback });

      return fallback;
    } finally {
      this.state.isProcessing = false;
    }
  }

  /**
   * Obtém histórico de mixes
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getMixHistory(limit = 10) {
    const mixes = await this.storage.listAudios({ type: 'mix' });
    return mixes.slice(0, limit);
  }

  /**
   * Obtém histórico de genes
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getGeneHistory(limit = 10) {
    const genes = await this.storage.listAudios({ type: 'gene' });
    return genes.slice(0, limit);
  }

  /**
   * Reproduz áudio do histórico
   * @param {string} id
   * @returns {Promise<string>} URL do áudio
   */
  async playFromHistory(id) {
    const audio = await this.storage.getAudio(id);
    if (!audio) {
      throw new Error('Audio not found');
    }
    return this.exporter.createBlobURL(audio.blob);
  }

  /**
   * Deleta item do histórico
   * @param {string} id
   */
  async deleteFromHistory(id) {
    await this.storage.deleteAudio(id);
  }

  /**
   * Limpa todo o histórico
   */
  async clearHistory() {
    await this.storage.clearAll();
    this.state.previousMixId = null;
    this.logger.info('History cleared');
  }

  /**
   * Obtém métricas
   * @returns {Object}
   */
  getMetrics() {
    return {
      state: { ...this.state },
      storage: this.storage.getMetrics(),
      musicAI: this.musicAI.getMetrics(),
    };
  }

  // === Private Methods ===

  async _prepareWorkflowInputs(geneUrl, creature) {
    const inputs = {
      modules: this.config.workflow.modules,
      gene_audio: geneUrl,
      gene_metadata: {
        creature_id: creature.id,
        dna: creature.dna,
        generation: this.state.generationCount,
      },
    };

    // Include previous mix if available
    if (this.state.previousMixId) {
      try {
        const previousMix = await this.storage.getAudio(this.state.previousMixId);
        if (previousMix) {
          this.logger.debug('Including previous mix', {
            previousMixId: this.state.previousMixId,
          });

          // Upload previous mix
          const prevUrl = await this.musicAI.uploadAudio(previousMix.blob);
          inputs.previous_mix = prevUrl;
        }
      } catch (error) {
        this.logger.warn('Failed to include previous mix', error);
      }
    }

    return inputs;
  }

  async _downloadMixedAudio(url) {
    this.logger.debug('Downloading mixed audio', { url });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    return await response.blob();
  }

  async _handleFallback(creature, originalError) {
    this.logger.warn('Using fallback: gene without mixing');

    try {
      const { blob, url } = await this.exporter.exportCreature(creature);

      const geneId = await this.storage.saveAudio({
        blob,
        type: 'gene',
        metadata: {
          creatureId: creature.id,
          dna: creature.dna,
          fallback: true,
          error: originalError.message,
        },
      });

      return {
        success: false,
        fallback: true,
        geneId,
        geneUrl: url,
        error: originalError.message,
      };
    } catch (fallbackError) {
      this.logger.error('Fallback also failed', fallbackError);
      throw fallbackError;
    }
  }

  _triggerCallback(name, data) {
    if (this.callbacks[name]) {
      try {
        this.callbacks[name](data);
      } catch (error) {
        this.logger.error(`Callback ${name} failed`, error);
      }
    }
  }
}

export default MixEvolutionManager;
