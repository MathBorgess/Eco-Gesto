/**
 * Testes unitários para MixEvolutionManager
 */

import MixEvolutionManager from '../../js/modules/MixEvolutionManager.js';
import MusicAIService from '../../js/modules/MusicAIService.js';
import AudioExporter from '../../js/modules/AudioExporter.js';
import AudioStorageService from '../../js/modules/AudioStorageService.js';

jest.mock('../../js/modules/MusicAIService.js');
jest.mock('../../js/modules/AudioExporter.js');
jest.mock('../../js/modules/AudioStorageService.js');

describe('MixEvolutionManager', () => {
  let manager;
  let mockAudioContext;
  let mockMusicAI;
  let mockExporter;
  let mockStorage;

  beforeEach(() => {
    mockAudioContext = new AudioContext();

    // Setup mocks
    mockMusicAI = {
      authenticate: jest.fn().mockResolvedValue(true),
      runWorkflow: jest.fn().mockResolvedValue({ id: 'job-123' }),
      getJobStatus: jest.fn().mockResolvedValue({
        status: 'completed',
        output_url: 'https://example.com/output.mp3',
      }),
      uploadAudio: jest.fn().mockResolvedValue('https://example.com/uploaded.wav'),
      getMetrics: jest.fn().mockReturnValue({ requests_total: 10 }),
    };

    mockExporter = {
      exportCreature: jest.fn().mockResolvedValue({
        blob: new Blob(['test']),
        url: 'blob:test',
      }),
      createBlobURL: jest.fn().mockReturnValue('blob:mock'),
    };

    mockStorage = {
      init: jest.fn().mockResolvedValue(true),
      saveAudio: jest.fn().mockResolvedValue('audio-id-123'),
      getAudio: jest.fn().mockResolvedValue(null),
      listAudios: jest.fn().mockResolvedValue([]),
      deleteAudio: jest.fn().mockResolvedValue(undefined),
      clearAll: jest.fn().mockResolvedValue(undefined),
      cleanOldAudios: jest.fn().mockResolvedValue(5),
      getMetrics: jest.fn().mockReturnValue({
        totalAudios: 0,
        totalSize: 0,
      }),
    };

    MusicAIService.mockImplementation(() => mockMusicAI);
    AudioExporter.mockImplementation(() => mockExporter);
    AudioStorageService.mockImplementation(() => mockStorage);

    manager = new MixEvolutionManager(mockAudioContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize successfully', async () => {
      await manager.init();

      expect(mockStorage.init).toHaveBeenCalled();
      expect(mockMusicAI.authenticate).toHaveBeenCalled();
      expect(mockStorage.cleanOldAudios).toHaveBeenCalled();
    });

    it('should throw error if authentication fails', async () => {
      mockMusicAI.authenticate.mockResolvedValue(false);

      await expect(manager.init()).rejects.toThrow('authentication failed');
    });
  });

  describe('setEnabled', () => {
    it('should enable mix evolution', () => {
      manager.setEnabled(true);
      expect(manager.state.enabled).toBe(true);
    });

    it('should disable mix evolution', () => {
      manager.setEnabled(false);
      expect(manager.state.enabled).toBe(false);
    });
  });

  describe('setCallbacks', () => {
    it('should register callbacks', () => {
      const callbacks = {
        onMixStart: jest.fn(),
        onMixComplete: jest.fn(),
      };

      manager.setCallbacks(callbacks);

      expect(manager.callbacks.onMixStart).toBe(callbacks.onMixStart);
      expect(manager.callbacks.onMixComplete).toBe(callbacks.onMixComplete);
    });
  });

  describe('processNewCreature', () => {
    const mockCreature = {
      id: 'creature-1',
      dna: { frequency: 440, waveType: 'sine' },
    };

    beforeEach(async () => {
      await manager.init();
      manager.setEnabled(true);
    });

    it('should skip if disabled', async () => {
      manager.setEnabled(false);

      const result = await manager.processNewCreature(mockCreature);

      expect(result).toBeNull();
      expect(mockExporter.exportCreature).not.toHaveBeenCalled();
    });

    it('should skip if already processing', async () => {
      manager.state.isProcessing = true;

      const result = await manager.processNewCreature(mockCreature);

      expect(result).toBeNull();
    });

    it('should process creature successfully', async () => {
      const result = await manager.processNewCreature(mockCreature);

      expect(result.success).toBe(true);
      expect(result.mixId).toBe('audio-id-123');
      expect(result.geneId).toBe('audio-id-123');
      expect(mockExporter.exportCreature).toHaveBeenCalledWith(mockCreature);
      expect(mockMusicAI.uploadAudio).toHaveBeenCalled();
      expect(mockMusicAI.runWorkflow).toHaveBeenCalled();
      expect(mockMusicAI.getJobStatus).toHaveBeenCalledWith('job-123', expect.any(Object));
    });

    it('should trigger onMixStart callback', async () => {
      const onMixStart = jest.fn();
      manager.setCallbacks({ onMixStart });

      await manager.processNewCreature(mockCreature);

      expect(onMixStart).toHaveBeenCalledWith({ creature: mockCreature });
    });

    it('should trigger onMixProgress callbacks', async () => {
      const onMixProgress = jest.fn();
      manager.setCallbacks({ onMixProgress });

      await manager.processNewCreature(mockCreature);

      expect(onMixProgress).toHaveBeenCalledWith(
        expect.objectContaining({ step: 'gene_exported' })
      );
    });

    it('should trigger onMixComplete callback', async () => {
      const onMixComplete = jest.fn();
      manager.setCallbacks({ onMixComplete });

      await manager.processNewCreature(mockCreature);

      expect(onMixComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          mixId: 'audio-id-123',
        })
      );
    });

    it('should update generation count', async () => {
      expect(manager.state.generationCount).toBe(0);

      await manager.processNewCreature(mockCreature);

      expect(manager.state.generationCount).toBe(1);
    });

    it('should update success count', async () => {
      expect(manager.state.successCount).toBe(0);

      await manager.processNewCreature(mockCreature);

      expect(manager.state.successCount).toBe(1);
    });

    it('should include previous mix if available', async () => {
      // First generation
      await manager.processNewCreature(mockCreature);

      expect(manager.state.previousMixId).toBe('audio-id-123');

      // Mock previous mix retrieval
      mockStorage.getAudio.mockResolvedValue({
        id: 'audio-id-123',
        blob: new Blob(['previous']),
      });

      // Second generation
      await manager.processNewCreature(mockCreature);

      expect(mockMusicAI.runWorkflow).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          previous_mix: 'https://example.com/uploaded.wav',
        })
      );
    });

    it('should fallback on error', async () => {
      mockMusicAI.runWorkflow.mockRejectedValue(new Error('API Error'));

      const result = await manager.processNewCreature(mockCreature);

      expect(result.success).toBe(false);
      expect(result.fallback).toBe(true);
      expect(result.geneId).toBeDefined();
      expect(manager.state.failCount).toBe(1);
    });

    it('should trigger onMixError callback on failure', async () => {
      const onMixError = jest.fn();
      manager.setCallbacks({ onMixError });

      mockMusicAI.runWorkflow.mockRejectedValue(new Error('API Error'));

      await manager.processNewCreature(mockCreature);

      expect(onMixError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          fallback: expect.any(Object),
        })
      );
    });

    it('should save gene metadata', async () => {
      await manager.processNewCreature(mockCreature);

      expect(mockStorage.saveAudio).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'gene',
          metadata: expect.objectContaining({
            creatureId: 'creature-1',
            dna: mockCreature.dna,
          }),
        })
      );
    });

    it('should save mix metadata', async () => {
      await manager.processNewCreature(mockCreature);

      expect(mockStorage.saveAudio).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'mix',
          metadata: expect.objectContaining({
            creatureId: 'creature-1',
            jobId: 'job-123',
            generation: 1,
          }),
        })
      );
    });
  });

  describe('getMixHistory', () => {
    it('should retrieve mix history', async () => {
      const mockMixes = [
        { id: 'mix-1', type: 'mix' },
        { id: 'mix-2', type: 'mix' },
      ];
      mockStorage.listAudios.mockResolvedValue(mockMixes);

      const history = await manager.getMixHistory();

      expect(mockStorage.listAudios).toHaveBeenCalledWith({ type: 'mix' });
      expect(history).toEqual(mockMixes);
    });

    it('should limit history results', async () => {
      const mockMixes = Array(20)
        .fill(null)
        .map((_, i) => ({ id: `mix-${i}`, type: 'mix' }));
      mockStorage.listAudios.mockResolvedValue(mockMixes);

      const history = await manager.getMixHistory(5);

      expect(history.length).toBe(5);
    });
  });

  describe('getGeneHistory', () => {
    it('should retrieve gene history', async () => {
      const mockGenes = [
        { id: 'gene-1', type: 'gene' },
        { id: 'gene-2', type: 'gene' },
      ];
      mockStorage.listAudios.mockResolvedValue(mockGenes);

      const history = await manager.getGeneHistory();

      expect(mockStorage.listAudios).toHaveBeenCalledWith({ type: 'gene' });
      expect(history).toEqual(mockGenes);
    });
  });

  describe('playFromHistory', () => {
    it('should retrieve and create URL for historical audio', async () => {
      const mockAudio = {
        id: 'audio-123',
        blob: new Blob(['test']),
      };
      mockStorage.getAudio.mockResolvedValue(mockAudio);

      const url = await manager.playFromHistory('audio-123');

      expect(mockStorage.getAudio).toHaveBeenCalledWith('audio-123');
      expect(mockExporter.createBlobURL).toHaveBeenCalledWith(mockAudio.blob);
      expect(url).toBe('blob:mock');
    });

    it('should throw error if audio not found', async () => {
      mockStorage.getAudio.mockResolvedValue(null);

      await expect(manager.playFromHistory('non-existent')).rejects.toThrow(
        'Audio not found'
      );
    });
  });

  describe('deleteFromHistory', () => {
    it('should delete audio from storage', async () => {
      await manager.deleteFromHistory('audio-123');

      expect(mockStorage.deleteAudio).toHaveBeenCalledWith('audio-123');
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', async () => {
      manager.state.previousMixId = 'mix-123';

      await manager.clearHistory();

      expect(mockStorage.clearAll).toHaveBeenCalled();
      expect(manager.state.previousMixId).toBeNull();
    });
  });

  describe('getMetrics', () => {
    it('should return combined metrics', () => {
      const metrics = manager.getMetrics();

      expect(metrics).toHaveProperty('state');
      expect(metrics).toHaveProperty('storage');
      expect(metrics).toHaveProperty('musicAI');
      expect(mockStorage.getMetrics).toHaveBeenCalled();
      expect(mockMusicAI.getMetrics).toHaveBeenCalled();
    });

    it('should include current state', () => {
      manager.state.generationCount = 5;
      manager.state.successCount = 4;
      manager.state.failCount = 1;

      const metrics = manager.getMetrics();

      expect(metrics.state.generationCount).toBe(5);
      expect(metrics.state.successCount).toBe(4);
      expect(metrics.state.failCount).toBe(1);
    });
  });
});
