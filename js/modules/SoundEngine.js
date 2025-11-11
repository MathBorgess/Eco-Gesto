/**
 * SoundEngine - Módulo de Síntese e Mapeamento Sonoro
 * Cada criatura é uma entidade sonora com "DNA" próprio
 */

export default class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.activeCreatures = new Map(); // Map<creatureId, audioNodes>
    this.creatureIdCounter = 0;
    this.masterGain = null;
  }

  async init() {
    console.log("🔊 Inicializando SoundEngine...");

    // Criar contexto de áudio (precisa de interação do usuário)
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Master gain para controlar volume geral
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);

    console.log("✅ SoundEngine inicializado");
  }

  /**
   * Cria uma nova criatura sonora baseada em um gesto
   */
  createCreatureFromGesture(gesture) {
    const { features, type, timestamp } = gesture;

    // Mapear características do gesto para "DNA" sonoro
    const dna = {
      // Frequência base (pitch) - mapeada da posição Y
      frequency: this.mapRange(features.position.y, 0, 1, 800, 200),

      // Volume - mapeado da energia do gesto
      volume: this.mapRange(features.energy, 0, 1, 0.1, 0.6),

      // Tipo de onda (timbre base)
      waveType: this.selectWaveType(type, features),

      // Taxa de LFO (modulação) - mapeada da velocidade
      lfoRate: this.mapRange(features.velocity, 0, 0.1, 0.5, 8),

      // Profundidade de LFO - mapeada da amplitude
      lfoDepth: this.mapRange(features.amplitude, 0, 0.5, 10, 200),

      // Pan (esquerda/direita) - mapeado da posição X
      pan: this.mapRange(features.position.x, 0, 1, -1, 1),

      // Envelope ADSR
      envelope: {
        attack: this.mapRange(features.velocity, 0, 0.1, 0.5, 0.05),
        decay: 0.2,
        sustain: 0.6,
        release: this.mapRange(features.energy, 0, 1, 1, 0.3),
      },

      // Filtro
      filterFreq: this.mapRange(features.openness, 0, 0.5, 400, 2000),
      filterQ: 5,
    };

    // Criar objeto criatura
    const creature = {
      id: `creature_${this.creatureIdCounter++}`,
      name: this.generateCreatureName(type),
      type: type,
      dna: dna,
      birthTime: timestamp,
      generation: 0,
      parents: null,
      gestureOrigin: features,
    };

    return creature;
  }

  /**
   * Toca o som de uma criatura
   */
  playCreature(creature) {
    if (this.activeCreatures.has(creature.id)) {
      console.warn(`Criatura ${creature.id} já está tocando`);
      return;
    }

    const { dna } = creature;
    const now = this.audioContext.currentTime;

    // Criar nós de áudio
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    const panner = this.audioContext.createStereoPanner();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    // Configurar oscilador principal
    oscillator.type = dna.waveType;
    oscillator.frequency.value = dna.frequency;

    // Configurar LFO (modulação)
    lfo.frequency.value = dna.lfoRate;
    lfoGain.gain.value = dna.lfoDepth;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    // Configurar filtro
    filter.type = "lowpass";
    filter.frequency.value = dna.filterFreq;
    filter.Q.value = dna.filterQ;

    // Configurar pan
    panner.pan.value = dna.pan;

    // Configurar envelope ADSR no gain
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(
      dna.volume,
      now + dna.envelope.attack
    );
    gainNode.gain.linearRampToValueAtTime(
      dna.volume * dna.envelope.sustain,
      now + dna.envelope.attack + dna.envelope.decay
    );

    // Conectar cadeia de áudio
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(this.masterGain);

    // Iniciar osciladores
    oscillator.start(now);
    lfo.start(now);

    // Armazenar referências
    this.activeCreatures.set(creature.id, {
      oscillator,
      gainNode,
      filter,
      panner,
      lfo,
      lfoGain,
      creature,
    });

    console.log(`🎵 Criatura ${creature.id} começou a cantar`);
  }

  /**
   * Para o som de uma criatura
   */
  stopCreature(creatureId) {
    const nodes = this.activeCreatures.get(creatureId);
    if (!nodes) return;

    const { oscillator, gainNode, lfo, creature } = nodes;
    const now = this.audioContext.currentTime;

    // Fade out suave
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(
      0,
      now + creature.dna.envelope.release
    );

    // Parar osciladores após fade out
    setTimeout(() => {
      oscillator.stop();
      lfo.stop();
      this.activeCreatures.delete(creatureId);
    }, creature.dna.envelope.release * 1000 + 100);

    console.log(`🔇 Criatura ${creatureId} parou de cantar`);
  }

  /**
   * Utilitários
   */
  mapRange(value, inMin, inMax, outMin, outMax) {
    const clamped = Math.max(inMin, Math.min(inMax, value));
    return ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  }

  selectWaveType(gestureType, features) {
    const waveTypes = ["sine", "triangle", "sawtooth", "square"];

    switch (gestureType) {
      case "explosive":
        return "sawtooth";
      case "subtle":
        return "sine";
      case "expansive":
        return "triangle";
      case "contracted":
        return "square";
      default:
        // Selecionar baseado em energia
        const index =
          Math.floor(features.energy * waveTypes.length) % waveTypes.length;
        return waveTypes[index];
    }
  }

  generateCreatureName(type) {
    const prefixes = {
      explosive: "Ignis",
      subtle: "Nimbus",
      expansive: "Aether",
      contracted: "Terra",
      upward: "Avis",
      downward: "Aqua",
      neutral: "Vox",
    };

    const prefix = prefixes[type] || "Sonic";
    const suffix = Math.floor(Math.random() * 1000);

    return `${prefix}-${suffix}`;
  }
}
