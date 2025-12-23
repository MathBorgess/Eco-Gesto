# 🎵 Technical Guide: How Creatures Mix and Create Sounds

This document provides a detailed technical explanation of how **Eco-Gesto** creatures generate, synthesize, and mix sounds through the Web Audio API and genetic algorithms.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Sound Creation Pipeline](#sound-creation-pipeline)
3. [Creature DNA (Sound Genome)](#creature-dna-sound-genome)
4. [Audio Synthesis Chain](#audio-synthesis-chain)
5. [Genetic Mixing (Crossover)](#genetic-mixing-crossover)
6. [Mutation Algorithms](#mutation-algorithms)
7. [Music.AI Integration](#musicai-integration)
8. [Code Examples](#code-examples)

---

## System Overview

Eco-Gesto transforms hand gestures into living "sound creatures" through a multi-stage pipeline:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Gesture   │ ──▶ │   Feature    │ ──▶ │    DNA      │ ──▶ │   Audio     │
│  Detection  │     │  Extraction  │     │  Synthesis  │     │  Playback   │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
       │                                        │
       │                                        ▼
       │                              ┌─────────────────┐
       │                              │    Evolution    │
       │                              │    Engine       │
       └─────────────────────────────▶│   (Crossover)   │
                                      └─────────────────┘
```

### Core Modules

| Module | File | Responsibility |
|--------|------|----------------|
| **SoundEngine** | `js/modules/SoundEngine.js` | Creates creatures from gestures, synthesizes audio |
| **EvolutionEngine** | `js/modules/EvolutionEngine.js` | Genetic algorithms for creature mixing |
| **MixEvolutionManager** | `js/modules/MixEvolutionManager.js` | Orchestrates Music.AI integration |
| **AudioExporter** | `js/modules/AudioExporter.js` | Exports creature audio for external processing |

---

## Sound Creation Pipeline

### Step 1: Gesture Detection → Feature Extraction

When a hand is detected via MediaPipe Hands, the `BodyTracker` module extracts these features:

```javascript
{
  position: { x: 0.5, y: 0.3 },  // Hand center (normalized 0-1)
  velocity: 0.05,                // Movement speed
  amplitude: 0.2,                // Hand spread/dispersion
  direction: { x: 0.8, y: -0.2 }, // Movement direction vector
  openness: 0.7,                 // Thumb-to-pinky distance
  energy: 0.35                   // velocity × amplitude
}
```

### Step 2: Gesture Classification

Features are classified into gesture types that determine the instrument:

| Gesture Type | Condition | Instrument |
|--------------|-----------|------------|
| `explosive` | energy > 0.5 | Brass (Trumpet) |
| `subtle` | energy < 0.1 | Harp |
| `expansive` | openness > 0.3 | String Pad |
| `contracted` | openness < 0.15 | Piano |
| `upward` | direction.y strong upward | Flute |
| `downward` | direction.y strong downward | Bass |
| `neutral` | default | Synth Pad |

### Step 3: DNA Generation

Each creature receives a unique "DNA" (sound genome) derived from gesture features:

```javascript
// In SoundEngine.createCreatureFromGesture()
const dna = {
  frequency: getScaledFrequency(baseNote, features),
  volume: mapRange(features.position.y, 0, 1, 0.6, 0.01),
  waveType: 'sawtooth',  // Based on instrument
  lfoRate: 0.3,
  lfoDepth: 5,
  pan: 0,
  envelope: { attack, decay, sustain, release },
  filterFreq: 1200,
  filterQ: 1.5
};
```

---

## Creature DNA (Sound Genome)

A creature's DNA is a complete genetic representation of its sound:

```javascript
creature = {
  id: "melody_123",
  name: "Celestial-Harpa-456",
  type: "subtle",
  instrumentType: "harp",
  generation: 0,
  parents: null,  // or [parent1_id, parent2_id] for hybrids
  
  dna: {
    // === PITCH ===
    frequency: 440,        // Hz (20-2000, based on position/scale)
    
    // === VOLUME ===
    volume: 0.35,          // 0.01-0.6 (inverted Y position)
    
    // === TIMBRE ===
    waveType: "sine",      // sine | triangle | sawtooth | square
    filterType: "lowpass", // lowpass | highpass | bandpass
    filterFreq: 3000,      // Hz (cutoff frequency)
    filterQ: 2,            // Resonance factor
    
    // === MODULATION ===
    lfoRate: 0.5,          // Hz (vibrato speed)
    lfoDepth: 2,           // Hz (vibrato depth)
    detune: 0,             // Cents (-50 to 50)
    
    // === TEMPORAL (ADSR Envelope) ===
    envelope: {
      attack: 0.01,        // Fade-in time (seconds)
      decay: 0.3,          // Decay time
      sustain: 0.1,        // Sustain level (0-1)
      release: 1.0         // Fade-out time
    },
    
    // === SPATIAL ===
    pan: 0,                // Stereo position (-1 L to +1 R)
    
    // === SPECIAL ===
    arpeggio: true,        // Enable arpeggio pattern
    arpeggioRate: 0.1      // Arpeggio speed
  }
}
```

### Musical Scale System

Creatures use a configurable musical scale for frequency selection. Each scale is defined as an array of **semitones from the root note** (C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11):

```javascript
const scales = {
  major: [0, 2, 4, 5, 7, 9, 11],      // C D E F G A B
  minor: [0, 2, 3, 5, 7, 8, 10],      // C D Eb F G Ab Bb
  pentatonic: [0, 2, 4, 7, 9],        // C D E G A
  harmonic: [0, 2, 3, 5, 7, 8, 11],   // Harmonic minor
  blues: [0, 3, 5, 6, 7, 10]          // Blues scale
};

// Calculate frequency from position using current scale
getScaledFrequency(baseNote, features) {
  const scale = this.currentScale;  // Reference to active scale array
  const octave = Math.floor(features.position.y * 3);  // 0-2 octaves
  const noteIndex = Math.floor(features.position.x * scale.length);
  const semitone = scale[noteIndex % scale.length];
  
  // Formula: frequency = baseNote × 2^(semitones/12)
  return baseNote * Math.pow(2, (semitone + octave * 12) / 12);
}
```

---

## Audio Synthesis Chain

Each creature creates the following Web Audio API signal chain:

```
┌─────────────┐
│     LFO     │  Low Frequency Oscillator (0.5-8 Hz)
│  (sine)     │  Creates vibrato/tremolo effects
└──────┬──────┘
       │ modulates frequency or filter
       ▼
┌──────────────────────┐
│   Main Oscillator    │  Generates base tone
│  (sine/saw/tri/sq)   │  Frequency from DNA (20-2000 Hz)
└──────────┬───────────┘
           │ raw waveform
           ▼
┌──────────────────────┐
│   Biquad Filter      │  Shapes timbre/color
│  (lowpass/highpass)  │  Cutoff: 400-10000 Hz
│  Q: 0.1-10           │  Resonance boost
└──────────┬───────────┘
           │ filtered audio
           ▼
┌──────────────────────┐
│   Gain Node (ADSR)   │  Amplitude envelope
│  Attack → Decay →    │  Controls volume shape
│  Sustain → Release   │  over time
└──────────┬───────────┘
           │ shaped audio
           ▼
┌──────────────────────┐
│   Stereo Panner      │  Spatial positioning
│  pan: -1 (L) → 1 (R) │  Left/Right placement
└──────────┬───────────┘
           │ stereo audio
           ▼
┌──────────────────────┐
│   Dynamics           │  Master compression
│   Compressor         │  Prevents clipping
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Master Gain        │  Overall volume (30%)
└──────────┬───────────┘
           │
           ▼
        🔊 OUTPUT
```

### Implementation Example

```javascript
// From SoundEngine.playCreature()
playCreature(creature) {
  const { dna } = creature;
  const now = this.audioContext.currentTime;
  
  // Create nodes
  const oscillator = this.audioContext.createOscillator();
  const gainNode = this.audioContext.createGain();
  const filter = this.audioContext.createBiquadFilter();
  const panner = this.audioContext.createStereoPanner();
  const lfo = this.audioContext.createOscillator();
  const lfoGain = this.audioContext.createGain();
  
  // Configure oscillator
  oscillator.type = dna.waveType;
  oscillator.frequency.value = dna.frequency;
  oscillator.detune.value = dna.detune || 0;
  
  // Configure LFO for vibrato
  lfo.type = 'sine';
  lfo.frequency.value = dna.lfoRate;
  lfoGain.gain.value = dna.lfoDepth;
  lfo.connect(lfoGain);
  lfoGain.connect(oscillator.frequency);  // or filter.frequency
  
  // Configure filter
  filter.type = dna.filterType;
  filter.frequency.value = dna.filterFreq;
  filter.Q.value = dna.filterQ;
  
  // Apply ADSR envelope
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(dna.volume, now + dna.envelope.attack);
  gainNode.gain.linearRampToValueAtTime(
    dna.volume * dna.envelope.sustain,
    now + dna.envelope.attack + dna.envelope.decay
  );
  
  // Connect chain
  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(panner);
  panner.connect(this.compressor);
  
  oscillator.start(now);
  lfo.start(now);
}
```

---

## Genetic Mixing (Crossover)

When conditions are met, two parent creatures can "breed" to produce a hybrid offspring:

### Breeding Conditions

```javascript
// In main.js handleGesture()
if (
  creatures.length >= 2 &&           // At least 2 creatures exist
  timeSinceLastGesture < 2000ms &&   // Recent gesture activity
  Math.random() < 0.3                 // 30% crossover probability
) {
  // CROSSOVER: Breed existing creatures
  offspring = breedCreatures(gesture);
} else {
  // CREATE: Generate new creature from gesture
  creature = createCreatureFromGesture(gesture);
}
```

### Parent Selection (Fitness-Based)

Parents are selected based on a fitness score:

```javascript
// In EvolutionEngine.calculateFitness()
calculateFitness(creature) {
  const age = Date.now() - creature.birthTime;
  
  // Favor younger creatures
  const ageFactor = 1 / (1 + age / 10000);
  
  // Favor moderate volumes
  const volumeFactor = 1 - Math.abs(creature.dna.volume - 0.35);
  
  // Favor frequency variety
  const frequencyVariety = Math.abs(creature.dna.frequency - 500) / 500;
  
  return ageFactor * 0.5 + volumeFactor * 0.3 + frequencyVariety * 0.2;
}

// Select top 2 by fitness
selectParents(creatures) {
  return creatures
    .sort((a, b) => calculateFitness(b) - calculateFitness(a))
    .slice(0, 2);
}
```

### Crossover Algorithm

The crossover process combines genetic material from both parents:

```
Parent 1 DNA                    Parent 2 DNA
┌─────────────────┐            ┌─────────────────┐
│ freq: 440       │            │ freq: 880       │
│ volume: 0.4     │            │ volume: 0.2     │
│ waveType: sine  │            │ waveType: saw   │
│ lfoRate: 2      │            │ lfoRate: 6      │
│ filterFreq: 800 │            │ filterFreq: 1500│
│ attack: 0.1     │            │ attack: 0.5     │
└────────┬────────┘            └────────┬────────┘
         │                              │
         └──────────┬───────────────────┘
                    │
                    ▼ 50/50 Selection + Mutation + Gesture Influence
         ┌─────────────────────────┐
         │      OFFSPRING DNA      │
         │ freq: 448 (+mutation)   │ ← from Parent 1, mutated
         │ volume: 0.22            │ ← from Parent 2, mutated
         │ waveType: saw           │ ← from Parent 2
         │ lfoRate: 5.8            │ ← blended with gesture
         │ filterFreq: 1200        │ ← gesture influence (15%)
         │ attack: 0.35            │ ← average + mutation
         └─────────────────────────┘
```

### Implementation

```javascript
// In EvolutionEngine.crossover()
crossover(parent1, parent2, currentGesture, mutationRate) {
  const offspringDNA = {};
  
  // For each DNA parameter
  Object.keys(parent1.dna).forEach(key => {
    if (key === 'envelope') {
      // Handle ADSR envelope separately
      offspringDNA.envelope = this.crossoverEnvelope(
        parent1.dna.envelope,
        parent2.dna.envelope,
        mutationRate
      );
    } else if (key === 'waveType') {
      // Discrete selection: pick one parent's value
      offspringDNA.waveType = Math.random() < 0.5 
        ? parent1.dna.waveType 
        : parent2.dna.waveType;
      
      // Small chance of complete mutation
      if (Math.random() < mutationRate * 0.5) {
        offspringDNA.waveType = ['sine', 'triangle', 'sawtooth', 'square']
          [Math.floor(Math.random() * 4)];
      }
    } else {
      // Numeric: select from parent, then mutate
      const parentValue = Math.random() < 0.5 
        ? parent1.dna[key] 
        : parent2.dna[key];
      offspringDNA[key] = this.mutate(parentValue, mutationRate);
    }
  });
  
  // Apply 15% influence from current gesture
  const gestureInfluence = 0.15;
  if (currentGesture?.features) {
    offspringDNA.frequency = this.blend(
      offspringDNA.frequency,
      mapRange(currentGesture.features.position.y, 0, 1, 800, 200),
      gestureInfluence
    );
    // ... apply to other parameters
  }
  
  return {
    id: `hybrid_${Date.now()}`,
    name: generateHybridName(parent1, parent2),
    type: 'hybrid',
    dna: offspringDNA,
    generation: Math.max(parent1.generation, parent2.generation) + 1,
    parents: [parent1.id, parent2.id]
  };
}
```

---

## Mutation Algorithms

Mutations introduce random variations to maintain genetic diversity:

### Mutation Function

```javascript
// In EvolutionEngine.mutate()
mutate(value, mutationRate) {
  // Skip mutation with probability (1 - mutationRate)
  if (Math.random() > mutationRate) {
    return value;
  }
  
  // Apply ±20% random variation
  const mutationAmount = value * (Math.random() * 0.4 - 0.2);
  const mutated = value + mutationAmount;
  
  // Prevent extreme values: set minimum at 10% of original
  // This avoids zero/negative values while preserving genetic stability
  return Math.max(value * 0.1, mutated);
}
```

### Blend Function

```javascript
// Weighted average of two values
blend(value1, value2, weight) {
  return value1 * (1 - weight) + value2 * weight;
}

// Example: 85% parent DNA + 15% gesture influence
frequency = blend(parentFreq, gestureFreq, 0.15);
```

### Envelope Crossover

ADSR envelopes are crossed over independently:

```javascript
crossoverEnvelope(env1, env2, mutationRate) {
  return {
    attack: mutate(
      Math.random() < 0.5 ? env1.attack : env2.attack,
      mutationRate
    ),
    decay: mutate(
      Math.random() < 0.5 ? env1.decay : env2.decay,
      mutationRate
    ),
    sustain: mutate(
      Math.random() < 0.5 ? env1.sustain : env2.sustain,
      mutationRate
    ),
    release: mutate(
      Math.random() < 0.5 ? env1.release : env2.release,
      mutationRate
    )
  };
}
```

---

## Music.AI Integration

The `MixEvolutionManager` provides optional integration with Music.AI for professional audio processing:

### Processing Pipeline

```
┌──────────────┐
│   Creature   │
│   Created    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│  AudioExporter               │
│  - Offline rendering         │
│  - Export to WAV/MP3         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  MusicAIService              │
│  - Upload gene audio         │
│  - Upload previous mix       │
│  - Run workflow              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Music.AI Cloud              │
│  - Source loading            │
│  - Intelligent mixing        │
│  - Noise reduction           │
│  - Mastering                 │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  AudioStorageService         │
│  - Cache in IndexedDB        │
│  - Maintain history          │
└──────────────────────────────┘
```

### Music.AI Workflow Example

```javascript
// Workflow sent to Music.AI API
{
  "modules": [
    {
      "name": "source_loader",
      "params": { 
        "inputs": ["$input.previous_mix_url", "$input.new_gene_url"] 
      }
    },
    {
      "name": "mixing",
      "params": {
        "balance_mode": "intelligent",
        "dynamic_range_control": true
      }
    },
    {
      "name": "enhance",
      "params": {
        "noise_reduction": true,
        "clarity_boost": true
      }
    },
    {
      "name": "mastering",
      "params": { "preset": "modern_warm" }
    },
    {
      "name": "export_audio",
      "params": { 
        "format": "mp3", 
        "output_url": "$output.mixed_audio" 
      }
    }
  ]
}
```

### Influence Parameter

The Music.AI influence slider (0-100%) controls how much the processed mix affects playback:

```javascript
// In main.js
playMixedAudio(url) {
  const audio = new Audio(url);
  audio.volume = this.config.musicAI.influence;  // 0.0 - 1.0
  audio.play();
}
```

---

## Code Examples

### Creating a Creature Manually

```javascript
const soundEngine = new SoundEngine();
await soundEngine.init();

// Create creature from gesture
const gesture = {
  type: 'explosive',
  features: {
    position: { x: 0.5, y: 0.3 },
    velocity: 0.08,
    amplitude: 0.4,
    openness: 0.6,
    energy: 0.55
  },
  timestamp: Date.now()
};

const creature = soundEngine.createCreatureFromGesture(gesture);
soundEngine.playCreature(creature);

// Stop after 5 seconds
setTimeout(() => {
  soundEngine.stopCreature(creature.id);
}, 5000);
```

### Breeding Two Creatures

```javascript
const evolutionEngine = new EvolutionEngine();

const parent1 = { /* creature object */ };
const parent2 = { /* creature object */ };
const gesture = { /* current gesture */ };
const mutationRate = 0.1;

const offspring = evolutionEngine.crossover(
  parent1,
  parent2,
  gesture,
  mutationRate
);

console.log(`Hybrid ${offspring.name} born!`);
console.log(`Generation: ${offspring.generation}`);
console.log(`Parents: ${offspring.parents.join(' + ')}`);
```

### Changing Musical Scale

```javascript
// Change scale dynamically
soundEngine.changeScale('pentatonic');  // or 'major', 'minor', 'blues', 'harmonic'
```

---

## Summary

Eco-Gesto's sound system operates through these key mechanisms:

1. **Gesture → DNA**: Hand movements are mapped to a comprehensive sound genome
2. **DNA → Audio**: The Web Audio API synthesizes the DNA into real-time audio
3. **Crossover**: Two creatures can breed, mixing their genetic sound parameters
4. **Mutation**: Random variations ensure evolutionary diversity
5. **Music.AI**: Optional cloud processing enhances mixes professionally

The result is an **emergent soundscape** where each creature evolves independently, and their genetic mixing produces unpredictable, organic musical textures.

---

**See Also:**
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [TECHNICAL.md](TECHNICAL.md) - Technical documentation
- [MUSICAI_INTEGRATION_SPEC.md](MUSICAI_INTEGRATION_SPEC.md) - Music.AI API details
