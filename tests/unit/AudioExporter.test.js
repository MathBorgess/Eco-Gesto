/**
 * Testes unitários para AudioExporter
 */

import AudioExporter from '../../js/modules/AudioExporter.js';

describe('AudioExporter', () => {
  let exporter;
  let mockAudioContext;

  beforeEach(() => {
    mockAudioContext = new AudioContext();
    exporter = new AudioExporter(mockAudioContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('captureCreatureAudio', () => {
    it('should capture audio from creature DNA', async () => {
      const creature = {
        id: 'test-creature-1',
        dna: {
          waveType: 'sine',
          frequency: 440,
          volume: 0.5,
          lfoRate: 2,
          lfoDepth: 50,
          filterFreq: 1000,
          filterQ: 5,
          pan: 0,
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.6,
            release: 0.5,
          },
        },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);

      expect(buffer).toBeDefined();
      expect(buffer.duration).toBeCloseTo(1, 1);
      expect(buffer.sampleRate).toBe(44100);
      expect(buffer.numberOfChannels).toBe(2);
    });

    it('should apply ADSR envelope correctly', async () => {
      const creature = {
        id: 'test-creature-2',
        dna: {
          waveType: 'triangle',
          frequency: 220,
          volume: 0.3,
          envelope: {
            attack: 0.05,
            decay: 0.1,
            sustain: 0.7,
            release: 0.3,
          },
        },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 0.5);

      expect(buffer).toBeDefined();
      expect(buffer.duration).toBeCloseTo(0.5, 1);

      // Check that audio has content (not silent)
      const channelData = buffer.getChannelData(0);
      const hasSound = Array.from(channelData).some((sample) => Math.abs(sample) > 0.01);
      expect(hasSound).toBe(true);
    });

    it('should handle custom duration', async () => {
      const creature = {
        id: 'test-creature-3',
        dna: {
          frequency: 880,
          volume: 0.4,
        },
      };

      const buffer3s = await exporter.captureCreatureAudio(creature, 3);
      expect(buffer3s.duration).toBeCloseTo(3, 1);

      const buffer5s = await exporter.captureCreatureAudio(creature, 5);
      expect(buffer5s.duration).toBeCloseTo(5, 1);
    });

    it('should use default values for missing DNA properties', async () => {
      const creature = {
        id: 'test-creature-4',
        dna: {}, // Empty DNA
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);

      expect(buffer).toBeDefined();
      expect(buffer.duration).toBeCloseTo(1, 1);
    });
  });

  describe('exportToWAV', () => {
    it('should export buffer to WAV format', async () => {
      const creature = {
        id: 'test-wav',
        dna: { frequency: 440 },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);
      const blob = exporter.exportToWAV(buffer);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('audio/wav');
      expect(blob.size).toBeGreaterThan(0);

      // Check WAV header
      const arrayBuffer = await blob.arrayBuffer();
      const view = new DataView(arrayBuffer);

      // RIFF header
      const riff = String.fromCharCode(
        view.getUint8(0),
        view.getUint8(1),
        view.getUint8(2),
        view.getUint8(3)
      );
      expect(riff).toBe('RIFF');

      // WAVE format
      const wave = String.fromCharCode(
        view.getUint8(8),
        view.getUint8(9),
        view.getUint8(10),
        view.getUint8(11)
      );
      expect(wave).toBe('WAVE');
    });

    it('should handle stereo channels', async () => {
      const creature = {
        id: 'test-stereo',
        dna: { frequency: 440, pan: 0.5 },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);
      const blob = exporter.exportToWAV(buffer);

      const arrayBuffer = await blob.arrayBuffer();
      const view = new DataView(arrayBuffer);

      // Check number of channels in header
      const numChannels = view.getUint16(22, true);
      expect(numChannels).toBe(2);
    });

    it('should handle different sample rates', async () => {
      const creature = {
        id: 'test-sample-rate',
        dna: { frequency: 440 },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);
      const blob = exporter.exportToWAV(buffer);

      const arrayBuffer = await blob.arrayBuffer();
      const view = new DataView(arrayBuffer);

      // Check sample rate in header
      const sampleRate = view.getUint32(24, true);
      expect(sampleRate).toBe(44100);
    });
  });

  describe('exportToMP3', () => {
    it('should export buffer to MP3 format if lamejs available', async () => {
      // Mock lamejs
      global.lamejs = {
        Mp3Encoder: jest.fn().mockImplementation(() => ({
          encodeBuffer: jest.fn().mockReturnValue(new Int8Array([1, 2, 3])),
          flush: jest.fn().mockReturnValue(new Int8Array([4, 5, 6])),
        })),
      };

      const creature = {
        id: 'test-mp3',
        dna: { frequency: 440 },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);
      const blob = await exporter.exportToMP3(buffer, 128);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('audio/mp3');
      expect(global.lamejs.Mp3Encoder).toHaveBeenCalledWith(2, 44100, 128);

      delete global.lamejs;
    });

    it('should fallback to WAV if lamejs unavailable', async () => {
      delete global.lamejs;

      const creature = {
        id: 'test-fallback',
        dna: { frequency: 440 },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);
      const blob = await exporter.exportToMP3(buffer);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('audio/wav');
    });

    it('should use custom bitrate', async () => {
      global.lamejs = {
        Mp3Encoder: jest.fn().mockImplementation(() => ({
          encodeBuffer: jest.fn().mockReturnValue(new Int8Array([1, 2])),
          flush: jest.fn().mockReturnValue(new Int8Array([3, 4])),
        })),
      };

      const creature = {
        id: 'test-bitrate',
        dna: { frequency: 440 },
      };

      const buffer = await exporter.captureCreatureAudio(creature, 1);
      await exporter.exportToMP3(buffer, 192);

      expect(global.lamejs.Mp3Encoder).toHaveBeenCalledWith(2, 44100, 192);

      delete global.lamejs;
    });
  });

  describe('createBlobURL and revokeURL', () => {
    it('should create blob URL', () => {
      const blob = new Blob(['test'], { type: 'audio/wav' });
      const url = exporter.createBlobURL(blob);

      expect(url).toMatch(/^blob:/);
      expect(typeof url).toBe('string');

      exporter.revokeURL(url);
    });

    it('should revoke blob URL', () => {
      const blob = new Blob(['test'], { type: 'audio/wav' });
      const url = exporter.createBlobURL(blob);

      const revokeSpy = jest.spyOn(URL, 'revokeObjectURL');
      exporter.revokeURL(url);

      expect(revokeSpy).toHaveBeenCalledWith(url);
    });
  });

  describe('exportCreature', () => {
    it('should export creature as WAV by default', async () => {
      const creature = {
        id: 'test-export',
        dna: { frequency: 440 },
      };

      const result = await exporter.exportCreature(creature, 'wav');

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('audio/wav');
      expect(result.url).toMatch(/^blob:/);

      exporter.revokeURL(result.url);
    });

    it('should export creature as MP3 when specified', async () => {
      global.lamejs = {
        Mp3Encoder: jest.fn().mockImplementation(() => ({
          encodeBuffer: jest.fn().mockReturnValue(new Int8Array([1])),
          flush: jest.fn().mockReturnValue(new Int8Array([2])),
        })),
      };

      const creature = {
        id: 'test-export-mp3',
        dna: { frequency: 440 },
      };

      const result = await exporter.exportCreature(creature, 'mp3');

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob.type).toBe('audio/mp3');
      expect(result.url).toMatch(/^blob:/);

      exporter.revokeURL(result.url);
      delete global.lamejs;
    });

    it('should handle export errors', async () => {
      const invalidCreature = null;

      await expect(exporter.exportCreature(invalidCreature)).rejects.toThrow();
    });
  });
});
