/**
 * Music.AI Integration Configuration
 * @module config/musicai.config
 */

const config = {
  api: {
    key: '', // Will be set from environment or UI
    baseUrl: 'https://api.music.ai/v1',
    timeout: 60000, // 60 seconds
    maxRetries: 3,
    retryDelay: 1000, // 1 second base delay
  },

  workflow: {
    id: 'genetic_mix_v1',
    modules: [
      { name: 'source_loader', params: {} },
      {
        name: 'mixing',
        params: { balance_mode: 'intelligent', dynamic_range_control: true },
      },
      {
        name: 'enhance',
        params: { noise_reduction: true, clarity_boost: true },
      },
      { name: 'mastering', params: { preset: 'modern_warm' } },
      { name: 'export_audio', params: { format: 'mp3' } },
    ],
  },

  storage: {
    maxSizeMB: 50,
    cleanupDays: 7,
    dbName: 'EcoGestoAudio',
    version: 1,
  },

  export: {
    duration: 3, // seconds
    format: 'mp3',
    bitrate: 128, // kbps
    sampleRate: 44100,
  },

  mix: {
    defaultInfluence: 0.3,
    maxHistorySize: 20,
    enableFallback: true,
  },

  debug: {
    enabled: false,
    logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
  },
};

export default config;
