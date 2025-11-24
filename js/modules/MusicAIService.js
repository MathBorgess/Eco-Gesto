/**
 * MusicAIService - Comunicação com API Music.AI
 * @module modules/MusicAIService
 */

import config from '../config/musicai.config.js';
import Logger from '../utils/Logger.js';

class MusicAIService {
  constructor(apiKey = null, customConfig = {}) {
    this.apiKey = apiKey || config.api.key;
    this.config = { ...config.api, ...customConfig };
    this.logger = new Logger('MusicAIService', config.debug);

    this.metrics = {
      requests_total: 0,
      requests_success: 0,
      requests_failed: 0,
      quota_used: 0,
      quota_limit: 1000, // Default, will be updated
    };

    if (!this.apiKey) {
      this.logger.warn('API key not provided, service will not work');
    }
  }

  /**
   * Testa autenticação com a API
   * @returns {Promise<boolean>}
   */
  async authenticate() {
    try {
      this.logger.info('Testing authentication...');

      const response = await this._fetch('/auth/verify', {
        method: 'GET',
      });

      if (response.authenticated) {
        this.logger.info('Authentication successful');
        return true;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      this.logger.error('Authentication error', error);
      throw error;
    }
  }

  /**
   * Executa workflow de mixagem
   * @param {string} workflowId - ID do workflow
   * @param {Object} inputs - Inputs do workflow
   * @returns {Promise<Object>} { job_id, status }
   */
  async runWorkflow(workflowId, inputs) {
    try {
      this.logger.info('Running workflow', { workflowId, inputs });

      const response = await this._fetch('/workflows/run', {
        method: 'POST',
        body: JSON.stringify({
          workflow_id: workflowId,
          input: inputs,
          options: {
            priority: 'standard',
          },
        }),
      });

      this.logger.info('Workflow started', { job_id: response.job_id });
      return response;
    } catch (error) {
      this.logger.error('Workflow execution error', error);
      throw error;
    }
  }

  /**
   * Verifica status de um job com polling
   * @param {string} jobId
   * @param {Object} options - { pollInterval, maxAttempts }
   * @returns {Promise<Object>} { status, result_url, error }
   */
  async getJobStatus(jobId, options = {}) {
    const pollInterval = options.pollInterval || 2000;
    const maxAttempts = options.maxAttempts || 30;
    let attempts = 0;

    this.logger.info('Polling job status', { jobId });

    while (attempts < maxAttempts) {
      try {
        const response = await this._fetch(`/jobs/${jobId}`, {
          method: 'GET',
        });

        this.logger.debug('Job status', { status: response.status, attempts });

        if (response.status === 'completed') {
          this.logger.info('Job completed', { result_url: response.result_url });
          return response;
        }

        if (response.status === 'failed') {
          throw new Error(response.error || 'Job failed');
        }

        attempts++;
        await this._sleep(pollInterval);
      } catch (error) {
        this.logger.error('Error polling job status', error);
        throw error;
      }
    }

    throw new Error('Job timeout: exceeded maximum attempts');
  }

  /**
   * Upload de arquivo de áudio
   * @param {Blob} audioBlob
   * @param {Function} onProgress - Callback (percentual)
   * @returns {Promise<string>} URL do áudio
   */
  async uploadAudio(audioBlob, onProgress = null) {
    try {
      this.logger.info('Uploading audio', {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'gene.mp3');

      // Simple fetch without progress tracking (can be enhanced with XMLHttpRequest)
      const response = await this._fetch('/audio/upload', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });

      if (onProgress) onProgress(100);

      this.logger.info('Audio uploaded', { url: response.url });
      return response.url;
    } catch (error) {
      this.logger.error('Audio upload error', error);
      throw error;
    }
  }

  /**
   * Obtém métricas de uso da API
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Helper: Fetch com retry logic
   */
  async _fetch(endpoint, options = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const maxRetries = options.maxRetries || this.config.maxRetries;

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.metrics.requests_total++;

        const headers = {
          Authorization: `Bearer ${this.apiKey}`,
          ...(!options.isFormData && { 'Content-Type': 'application/json' }),
        };

        const response = await fetch(url, {
          ...options,
          headers,
          signal: AbortSignal.timeout(this.config.timeout),
        });

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 5;
          this.logger.warn('Rate limited, retrying...', { retryAfter });
          await this._sleep(retryAfter * 1000);
          continue;
        }

        // Handle errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        this.metrics.requests_success++;
        return data;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed`, error);

        // Don't retry on certain errors
        if (error.message.includes('401') || error.message.includes('403')) {
          break;
        }

        if (attempt < maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await this._sleep(Math.min(delay, 10000));
        }
      }
    }

    this.metrics.requests_failed++;
    throw lastError;
  }

  /**
   * Helper: Sleep
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Atualiza API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.logger.info('API key updated');
  }
}

export default MusicAIService;
