/**
 * @jest-environment jsdom
 */

import MusicAIService from '../../js/modules/MusicAIService.js';

describe('MusicAIService', () => {
  let service;
  const mockApiKey = 'sk_test_123456';

  beforeEach(() => {
    service = new MusicAIService(mockApiKey, {
      baseUrl: 'https://api.music.ai/v1',
      timeout: 5000
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    test('should initialize with valid API key', () => {
      expect(service.apiKey).toBe(mockApiKey);
      expect(service.config.baseUrl).toBe('https://api.music.ai/v1');
    });

    test('should throw error if API key is missing', () => {
      expect(() => new MusicAIService()).toThrow('API key is required');
    });

    test('should authenticate successfully', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ authenticated: true })
        })
      );

      const result = await service.authenticate();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.music.ai/v1/auth/verify',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );
    });

    test('should reject with 401 for invalid API key', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: 'Unauthorized'
        })
      );

      await expect(service.authenticate()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Workflow Execution', () => {
    test('should run workflow successfully', async () => {
      const mockJobId = 'job_abc123';
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            job_id: mockJobId,
            status: 'pending'
          })
        })
      );

      const result = await service.runWorkflow('genetic_mix_v1', {
        previous_mix_url: 'https://example.com/mix1.mp3',
        new_gene_url: 'https://example.com/gene1.mp3',
        influence: 0.3
      });

      expect(result.job_id).toBe(mockJobId);
      expect(result.status).toBe('pending');
    });

    test('should handle workflow validation errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            error: 'Invalid input URLs'
          })
        })
      );

      await expect(
        service.runWorkflow('genetic_mix_v1', {
          previous_mix_url: 'invalid-url',
          new_gene_url: 'also-invalid'
        })
      ).rejects.toThrow('Invalid input URLs');
    });
  });

  describe('Job Status Polling', () => {
    test('should poll until job completes', async () => {
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'processing' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            status: 'completed',
            result_url: 'https://example.com/result.mp3'
          })
        });
      });

      const result = await service.getJobStatus('job_123', {
        pollInterval: 100,
        maxAttempts: 5
      });

      expect(result.status).toBe('completed');
      expect(result.result_url).toBeTruthy();
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    test('should timeout after max attempts', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'processing' })
        })
      );

      await expect(
        service.getJobStatus('job_123', {
          pollInterval: 10,
          maxAttempts: 3
        })
      ).rejects.toThrow('Job timeout');

      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    test('should retry on network error', async () => {
      let attempts = 0;
      global.fetch = jest.fn(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      });

      const result = await service.runWorkflow('test', {});
      expect(result.success).toBe(true);
      expect(attempts).toBe(3);
    });

    test('should handle rate limiting (429)', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          headers: new Map([['Retry-After', '2']]),
          json: () => Promise.resolve({ error: 'Rate limit exceeded' })
        })
      );

      await expect(
        service.runWorkflow('test', {})
      ).rejects.toThrow('Rate limit exceeded');
    });

    test('should handle server errors (500)', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal server error' })
        })
      );

      await expect(
        service.runWorkflow('test', {})
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('Audio Upload', () => {
    test('should upload audio blob successfully', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mp3' });
      const mockUrl = 'https://storage.example.com/audio_123.mp3';

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: mockUrl })
        })
      );

      const result = await service.uploadAudio(mockBlob);
      expect(result).toBe(mockUrl);
    });

    test('should track upload progress', async () => {
      const mockBlob = new Blob(['audio data'], { type: 'audio/mp3' });
      const progressCallback = jest.fn();

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: 'https://example.com/audio.mp3' })
        })
      );

      await service.uploadAudio(mockBlob, progressCallback);
      expect(progressCallback).toHaveBeenCalled();
    });
  });

  describe('Metrics', () => {
    test('should track API usage metrics', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ job_id: 'test' })
        })
      );

      await service.runWorkflow('test', {});
      
      const metrics = service.getMetrics();
      expect(metrics.requests_total).toBe(1);
      expect(metrics.requests_success).toBe(1);
    });

    test('should track failed requests', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500
        })
      );

      try {
        await service.runWorkflow('test', {});
      } catch (e) {
        // Expected error
      }
      
      const metrics = service.getMetrics();
      expect(metrics.requests_failed).toBe(1);
    });
  });
});
