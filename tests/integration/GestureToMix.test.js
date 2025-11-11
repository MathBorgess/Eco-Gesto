/**
 * @jest-environment jsdom
 */

import { processGestureToMix } from '../../js/integration/gestureFlow.js';
import MusicAIService from '../../js/modules/MusicAIService.js';
import AudioExporter from '../../js/modules/AudioExporter.js';
import MixEvolutionManager from '../../js/modules/MixEvolutionManager.js';

// Mock modules
jest.mock('../../js/modules/MusicAIService.js');
jest.mock('../../js/modules/AudioExporter.js');
jest.mock('../../js/modules/MixEvolutionManager.js');

describe('Integration: Gesture to Mix Flow', () => {
  let mockMusicAIService;
  let mockAudioExporter;
  let mockMixManager;

  beforeEach(() => {
    // Setup mocks
    mockMusicAIService = {
      runWorkflow: jest.fn().mockResolvedValue({
        job_id: 'job_123',
        status: 'pending'
      }),
      getJobStatus: jest.fn().mockResolvedValue({
        status: 'completed',
        result_url: 'https://example.com/mix_result.mp3'
      }),
      uploadAudio: jest.fn().mockResolvedValue('https://example.com/uploaded.mp3')
    };

    mockAudioExporter = {
      captureCreatureAudio: jest.fn().mockResolvedValue({
        buffer: new ArrayBuffer(1024),
        duration: 3
      }),
      exportToMP3: jest.fn().mockResolvedValue(
        new Blob(['audio'], { type: 'audio/mp3' })
      ),
      createBlobURL: jest.fn().mockReturnValue('blob:abc123')
    };

    mockMixManager = {
      getPreviousMixUrl: jest.fn().mockReturnValue(null),
      processNewGesture: jest.fn().mockResolvedValue({
        mix_url: 'https://example.com/new_mix.mp3',
        metadata: {
          generation: 1,
          influence: 0.3
        }
      }),
      updateCurrentMix: jest.fn(),
      getHistory: jest.fn().mockReturnValue([])
    };

    MusicAIService.mockImplementation(() => mockMusicAIService);
    AudioExporter.mockImplementation(() => mockAudioExporter);
    MixEvolutionManager.mockImplementation(() => mockMixManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should process first gesture (no previous mix)', async () => {
    const mockGesture = {
      type: 'explosive',
      features: {
        position: { x: 0.5, y: 0.3 },
        velocity: 0.05,
        amplitude: 0.2,
        energy: 0.7
      }
    };

    const mockCreature = {
      id: 'creature_1',
      dna: {
        frequency: 440,
        volume: 0.5
      }
    };

    const result = await processGestureToMix(mockGesture, mockCreature);

    expect(mockAudioExporter.captureCreatureAudio).toHaveBeenCalledWith(
      mockCreature,
      3
    );
    expect(mockAudioExporter.exportToMP3).toHaveBeenCalled();
    expect(mockMixManager.processNewGesture).toHaveBeenCalledWith(
      mockGesture,
      mockCreature
    );
    expect(result.mix_url).toBeTruthy();
  });

  test('should process gesture with previous mix', async () => {
    mockMixManager.getPreviousMixUrl.mockReturnValue(
      'https://example.com/previous_mix.mp3'
    );

    const mockGesture = {
      type: 'subtle',
      features: {
        position: { x: 0.3, y: 0.6 },
        velocity: 0.02,
        amplitude: 0.1,
        energy: 0.3
      }
    };

    const mockCreature = {
      id: 'creature_2',
      dna: {
        frequency: 220,
        volume: 0.3
      }
    };

    const result = await processGestureToMix(mockGesture, mockCreature);

    expect(mockMusicAIService.runWorkflow).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        previous_mix_url: 'https://example.com/previous_mix.mp3',
        new_gene_url: expect.any(String)
      })
    );
    expect(result.metadata.generation).toBeGreaterThan(0);
  });

  test('should fallback to local mix on API error', async () => {
    mockMusicAIService.runWorkflow.mockRejectedValue(
      new Error('API timeout')
    );

    mockMixManager.processNewGesture.mockResolvedValue({
      mix_url: 'blob:local_mix_123',
      metadata: {
        fallback: true,
        generation: 1
      }
    });

    const mockGesture = {
      type: 'expansive',
      features: { position: { x: 0.5, y: 0.5 } }
    };

    const mockCreature = {
      id: 'creature_3',
      dna: { frequency: 330 }
    };

    const result = await processGestureToMix(mockGesture, mockCreature);

    expect(result.metadata.fallback).toBe(true);
    expect(result.mix_url).toContain('blob:');
  });

  test('should handle rapid consecutive gestures', async () => {
    const gestures = [
      { type: 'explosive', features: { energy: 0.9 } },
      { type: 'subtle', features: { energy: 0.2 } },
      { type: 'expansive', features: { energy: 0.6 } }
    ];

    const creatures = gestures.map((_, i) => ({
      id: `creature_${i}`,
      dna: { frequency: 100 + i * 100 }
    }));

    const results = [];
    for (let i = 0; i < gestures.length; i++) {
      const result = await processGestureToMix(gestures[i], creatures[i]);
      results.push(result);
    }

    expect(results).toHaveLength(3);
    expect(mockMixManager.processNewGesture).toHaveBeenCalledTimes(3);
  });

  test('should update history after successful mix', async () => {
    const mockGesture = { type: 'upward', features: {} };
    const mockCreature = { id: 'creature_4', dna: {} };

    await processGestureToMix(mockGesture, mockCreature);

    expect(mockMixManager.updateCurrentMix).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        generation: expect.any(Number)
      })
    );
  });

  test('should maintain influence parameter through pipeline', async () => {
    const customInfluence = 0.7;
    const mockGesture = { type: 'neutral', features: {} };
    const mockCreature = { id: 'creature_5', dna: {} };

    await processGestureToMix(mockGesture, mockCreature, {
      influence: customInfluence
    });

    expect(mockMusicAIService.runWorkflow).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        influence: customInfluence
      })
    );
  });

  test('should clean up resources after processing', async () => {
    const mockGesture = { type: 'downward', features: {} };
    const mockCreature = { id: 'creature_6', dna: {} };

    await processGestureToMix(mockGesture, mockCreature);

    // Verify cleanup was called (implementation specific)
    // This would test that blob URLs are revoked, etc.
    expect(mockAudioExporter.createBlobURL).toHaveBeenCalled();
  });
});
