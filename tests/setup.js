import '@testing-library/jest-dom';

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    frequency: { value: 440 },
    type: 'sine',
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }),
  createGain: jest.fn().mockReturnValue({
    gain: {
      value: 1,
      setValueAtTime: jest.fn(),
      linearRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  }),
  createBiquadFilter: jest.fn().mockReturnValue({
    frequency: { value: 1000 },
    Q: { value: 1 },
    type: 'lowpass',
    connect: jest.fn(),
  }),
  createStereoPanner: jest.fn().mockReturnValue({
    pan: { value: 0 },
    connect: jest.fn(),
  }),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
}));

// Mock OfflineAudioContext
global.OfflineAudioContext = jest.fn().mockImplementation((channels, length, sampleRate) => {
  const mockBuffer = {
    length,
    duration: length / sampleRate,
    sampleRate,
    numberOfChannels: channels,
    getChannelData: jest.fn((_channel) => {
      const data = new Float32Array(length);
      // Fill with some test data (sine wave)
      for (let i = 0; i < length; i++) {
        data[i] = Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 0.5;
      }
      return data;
    }),
  };

  return {
    createOscillator: jest.fn().mockReturnValue({
      frequency: { value: 440 },
      type: 'sine',
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    }),
    createGain: jest.fn().mockReturnValue({
      gain: {
        value: 1,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    }),
    createBiquadFilter: jest.fn().mockReturnValue({
      frequency: { value: 1000 },
      Q: { value: 1 },
      type: 'lowpass',
      connect: jest.fn(),
    }),
    createStereoPanner: jest.fn().mockReturnValue({
      pan: { value: 0 },
      connect: jest.fn(),
    }),
    destination: {},
    currentTime: 0,
    sampleRate,
    startRendering: jest.fn().mockResolvedValue(mockBuffer),
  };
});

// Mock MediaDevices
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(),
};

// Mock IndexedDB
const createMockObjectStore = () => ({
  put: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
  get: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
  getAll: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
  delete: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
  clear: jest.fn().mockReturnValue({ onsuccess: null, onerror: null }),
  createIndex: jest.fn(),
});

global.indexedDB = {
  open: jest.fn().mockReturnValue({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      name: 'EcoGestoAudioDB',
      objectStoreNames: { contains: jest.fn().mockReturnValue(false) },
      createObjectStore: jest.fn().mockReturnValue(createMockObjectStore()),
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue(createMockObjectStore()),
        oncomplete: null,
        onerror: null,
      }),
    },
  }),
};

// Mock fetch
global.fetch = jest.fn();

// Mock Blob
global.Blob = class Blob {
  constructor(parts = [], options = {}) {
    this.parts = parts;
    this.options = options;
    this.type = options.type || '';
    this.size = parts.reduce((acc, part) => {
      if (part instanceof ArrayBuffer) return acc + part.byteLength;
      if (typeof part === 'string') return acc + part.length;
      if (part.byteLength) return acc + part.byteLength;
      return acc + 100; // default size
    }, 0);
  }

  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(this.size));
  }

  text() {
    return Promise.resolve(this.parts.join(''));
  }
};

// Mock URL
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn(),
};

