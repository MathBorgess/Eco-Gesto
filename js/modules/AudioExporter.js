/**
 * AudioExporter - Exportação de genes sonoros como arquivos de áudio
 * @module modules/AudioExporter
 */

import config from '../config/musicai.config.js';
import Logger from '../utils/Logger.js';

class AudioExporter {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.config = config.export;
    this.logger = new Logger('AudioExporter', config.debug);
  }

  /**
   * Captura áudio de uma criatura durante N segundos
   * @param {Object} creature - Criatura sonora
   * @param {number} duration - Duração em segundos
   * @returns {Promise<AudioBuffer>}
   */
  async captureCreatureAudio(creature, duration = null) {
    duration = duration || this.config.duration;

    try {
      this.logger.info('Capturing creature audio', {
        creature: creature.id,
        duration,
      });

      const { dna } = creature;
      const sampleRate = this.config.sampleRate;
      const numFrames = sampleRate * duration;

      // Create offline context for rendering
      const offlineContext = new OfflineAudioContext(
        2, // stereo
        numFrames,
        sampleRate
      );

      // Recreate creature's audio graph in offline context
      const oscillator = offlineContext.createOscillator();
      const gainNode = offlineContext.createGain();
      const filter = offlineContext.createBiquadFilter();
      const panner = offlineContext.createStereoPanner();
      const lfo = offlineContext.createOscillator();
      const lfoGain = offlineContext.createGain();

      // Configure oscillator
      oscillator.type = dna.waveType || 'sine';
      oscillator.frequency.value = dna.frequency || 440;

      // Configure LFO
      lfo.frequency.value = dna.lfoRate || 2;
      lfoGain.gain.value = dna.lfoDepth || 50;
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);

      // Configure filter
      filter.type = 'lowpass';
      filter.frequency.value = dna.filterFreq || 1000;
      filter.Q.value = dna.filterQ || 5;

      // Configure pan
      panner.pan.value = dna.pan || 0;

      // Apply ADSR envelope
      const now = offlineContext.currentTime;
      const envelope = dna.envelope || {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.6,
        release: 0.5,
      };

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(
        dna.volume || 0.3,
        now + envelope.attack
      );
      gainNode.gain.linearRampToValueAtTime(
        (dna.volume || 0.3) * envelope.sustain,
        now + envelope.attack + envelope.decay
      );
      gainNode.gain.setValueAtTime(
        (dna.volume || 0.3) * envelope.sustain,
        now + duration - envelope.release
      );
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      // Connect graph
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(offlineContext.destination);

      // Start oscillators
      oscillator.start(0);
      lfo.start(0);

      // Render
      const buffer = await offlineContext.startRendering();

      this.logger.info('Audio captured successfully', {
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
      });

      return buffer;
    } catch (error) {
      this.logger.error('Error capturing audio', error);
      throw error;
    }
  }

  /**
   * Exporta AudioBuffer para WAV
   * @param {AudioBuffer} buffer
   * @returns {Blob}
   */
  exportToWAV(buffer) {
    try {
      this.logger.debug('Exporting to WAV');

      const numberOfChannels = buffer.numberOfChannels;
      const length = buffer.length * numberOfChannels * 2;
      const arrayBuffer = new ArrayBuffer(44 + length);
      const view = new DataView(arrayBuffer);

      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, buffer.sampleRate, true);
      view.setUint32(28, buffer.sampleRate * 2 * numberOfChannels, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length, true);

      // Write PCM data
      let offset = 44;
      for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = buffer.getChannelData(channel)[i];
          const s = Math.max(-1, Math.min(1, sample));
          view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
          offset += 2;
        }
      }

      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      this.logger.info('WAV exported', { size: blob.size });
      return blob;
    } catch (error) {
      this.logger.error('Error exporting to WAV', error);
      throw error;
    }
  }

  /**
   * Exporta AudioBuffer para MP3 (usando lamejs)
   * @param {AudioBuffer} buffer
   * @param {number} bitrate - kbps
   * @returns {Promise<Blob>}
   */
  async exportToMP3(buffer, bitrate = null) {
    bitrate = bitrate || this.config.bitrate;

    try {
      this.logger.debug('Exporting to MP3', { bitrate });

      // Check if lamejs is available
      if (typeof lamejs === 'undefined') {
        this.logger.warn('lamejs not loaded, falling back to WAV');
        return this.exportToWAV(buffer);
      }

      const mp3encoder = new lamejs.Mp3Encoder(
        buffer.numberOfChannels,
        buffer.sampleRate,
        bitrate
      );

      const samples = buffer.getChannelData(0);
      const sampleBlockSize = 1152;
      const mp3Data = [];

      for (let i = 0; i < samples.length; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
      }

      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }

      const blob = new Blob(mp3Data, { type: 'audio/mp3' });
      this.logger.info('MP3 exported', { size: blob.size, bitrate });
      return blob;
    } catch (error) {
      this.logger.error('Error exporting to MP3', error);
      // Fallback to WAV
      return this.exportToWAV(buffer);
    }
  }

  /**
   * Cria URL temporária para Blob
   * @param {Blob} blob
   * @returns {string}
   */
  createBlobURL(blob) {
    const url = URL.createObjectURL(blob);
    this.logger.debug('Blob URL created', { url });
    return url;
  }

  /**
   * Libera URL temporária
   * @param {string} url
   */
  revokeURL(url) {
    URL.revokeObjectURL(url);
    this.logger.debug('Blob URL revoked', { url });
  }

  /**
   * Exporta criatura completa (captura + conversão)
   * @param {Object} creature
   * @param {string} format - 'wav' | 'mp3'
   * @returns {Promise<{blob: Blob, url: string}>}
   */
  async exportCreature(creature, format = null) {
    format = format || this.config.format;

    try {
      const buffer = await this.captureCreatureAudio(creature);

      let blob;
      if (format === 'mp3') {
        blob = await this.exportToMP3(buffer);
      } else {
        blob = this.exportToWAV(buffer);
      }

      const url = this.createBlobURL(blob);

      return { blob, url };
    } catch (error) {
      this.logger.error('Error exporting creature', error);
      throw error;
    }
  }
}

export default AudioExporter;
