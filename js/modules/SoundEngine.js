/**
 * SoundEngine - Módulo de Síntese e Mapeamento Sonoro
 * Versão Melódica: Sons musicais e harmônicos
 */

export default class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.activeCreatures = new Map(); // Map<creatureId, audioNodes>
        this.creatureIdCounter = 0;
        this.masterGain = null;
        this.compressor = null;
        this.currentScale = [];
        this.setMusicalScale('major');
    }
    
    async init() {
        console.log('🎵 Inicializando SoundEngine - Versão Melódica...');
        
        // Criar contexto de áudio (precisa de interação do usuário)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Compressor para mixagem musical
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 12;
        this.compressor.ratio.value = 3;
        
        // Master gain para controlar volume geral
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        
        // Conectar cadeia
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
        
        console.log('✅ SoundEngine Melódico inicializado');
    }
    
    /**
     * Define a escala musical atual
     */
    setMusicalScale(scaleName = 'major') {
        const scales = {
            major: [0, 2, 4, 5, 7, 9, 11], // C D E F G A B
            minor: [0, 2, 3, 5, 7, 8, 10], // C D Eb F G Ab Bb
            pentatonic: [0, 2, 4, 7, 9], // C D E G A
            harmonic: [0, 2, 3, 5, 7, 8, 11], // C D Eb F G Ab B
            blues: [0, 3, 5, 6, 7, 10] // C Eb F Gb G Bb
        };
        
        this.currentScale = scales[scaleName] || scales.major;
        console.log(`🎼 Escala definida: ${scaleName}`);
    }
    
    /**
     * Cria uma nova criatura sonora baseada em um gesto - Versão Melódica
     */
    createCreatureFromGesture(gesture) {
        const { features, type, timestamp, source } = gesture;
        
        // Valores padrão para features que podem não existir
        const openness = features.openness || features.armSpread || 0.3;
        const amplitude = features.amplitude || 0.2;
        const velocity = Math.max(0.001, features.velocity || 0.01);
        const energy = Math.max(0.01, features.energy || 0.1);
        
        // Selecionar instrumento baseado no gesto
        let soundProfile;
        switch(type) {
            case 'explosive':
                soundProfile = this.createBrassSound(features);
                break;
            case 'subtle':
                soundProfile = this.createHarpSound(features);
                break;
            case 'expansive':
                soundProfile = this.createStringPadSound(features);
                break;
            case 'contracted':
                soundProfile = this.createPianoSound(features);
                break;
            case 'upward':
                soundProfile = this.createFluteSound(features);
                break;
            case 'downward':
                soundProfile = this.createBassSound(features);
                break;
            default:
                soundProfile = this.createSynthPadSound(features);
        }
        
        const dna = {
            ...soundProfile,
            volume: this.mapRange(energy, 0, 1, 0.08, 0.4),
            pan: this.mapRange(features.position.x, 0, 1, -0.9, 0.9),
            birthTime: timestamp,
            color: this.generateColorFromSound(soundProfile, features),
            initialPosition: {
                x: Math.random(), // 0 a 1
                y: Math.random()  // 0 a 1
            }
        };
        
        // Criar objeto criatura
        const creature = {
            id: `melody_${this.creatureIdCounter++}`,
            name: this.generateInstrumentName(type),
            type: type,
            dna: dna,
            birthTime: timestamp,
            generation: 0,
            instrumentType: soundProfile.instrumentType,
            gestureOrigin: features
        };

        console.log('🎵 SoundEngine criou criatura:', creature);
        console.log('🎵 DNA da criatura:', creature.dna);
        console.log('🎵 Cor da criatura:', creature.dna.color);
                
        return creature;
    }
    
    /**
     * Gera uma frequência baseada na escala atual
     */
    getScaledFrequency(baseNote = 220, features) {
        const octave = Math.floor(features.position.y * 3); // 0-2 octaves
        const noteIndex = Math.floor(features.position.x * this.currentScale.length);
        const semitone = this.currentScale[noteIndex % this.currentScale.length];
        const totalSemitones = semitone + (octave * 12);
        
        return baseNote * Math.pow(2, totalSemitones / 12);
    }
    
    /**
     * Instrumentos Musicais
     */
    createHarpSound(features) {
        const baseFreq = this.getScaledFrequency(220, features);
        return {
            instrumentType: 'harp',
            frequency: baseFreq,
            waveType: 'sine',
            filterType: 'lowpass',
            filterFreq: 3000 + (features.openness * 4000),
            filterQ: 2,
            envelope: {
                attack: 0.01 + (features.velocity * 0.1),
                decay: 0.3 + (features.energy * 0.7),
                sustain: 0.1,
                release: 1 + (features.amplitude * 2)
            },
            lfoRate: 0.5,
            lfoDepth: 2,
            arpeggio: true,
            arpeggioRate: 0.1 + (features.velocity * 0.3)
        };
    }
    
    createFluteSound(features) {
        const baseFreq = this.getScaledFrequency(440, features);
        return {
            instrumentType: 'flute',
            frequency: baseFreq,
            waveType: 'sine',
            filterType: 'bandpass',
            filterFreq: 1500 + (features.energy * 2000),
            filterQ: 4,
            envelope: {
                attack: 0.1 + (features.velocity * 0.3),
                decay: 0.2,
                sustain: 0.8,
                release: 0.5 + (features.amplitude * 1)
            },
            lfoRate: 5 + (features.energy * 8), // Vibrato
            lfoDepth: 3 + (features.openness * 10),
            detune: Math.sin(Date.now() * 0.01) * 8 // Vibrato sutil
        };
    }
    
    createPianoSound(features) {
        const baseFreq = this.getScaledFrequency(110, features);
        return {
            instrumentType: 'piano',
            frequency: baseFreq,
            waveType: 'triangle',
            filterType: 'lowpass',
            filterFreq: 2000 + (features.openness * 3000),
            filterQ: 1,
            envelope: {
                attack: 0.001,
                decay: 0.1 + (features.velocity * 0.4),
                sustain: 0.05,
                release: 0.3 + (features.energy * 0.7)
            },
            pitchEnvelope: {
                attack: 0.01,
                decay: 0.1,
                startFreq: baseFreq * 1.02, // Leve ataque mais agudo
                endFreq: baseFreq
            }
        };
    }
    
    createStringPadSound(features) {
        const baseFreq = this.getScaledFrequency(110, features);
        return {
            instrumentType: 'strings',
            frequency: baseFreq,
            waveType: 'sawtooth',
            filterType: 'lowpass',
            filterFreq: 800 + (features.openness * 2000),
            filterQ: 0.7,
            envelope: {
                attack: 0.5 + (features.velocity * 2),
                decay: 0.3,
                sustain: 0.9,
                release: 2 + (features.amplitude * 3)
            },
            lfoRate: 0.2 + (features.energy * 0.5),
            lfoDepth: 10 + (features.openness * 30),
            chorus: true,
            detune: 5 // Leve detune para som mais cheio
        };
    }
    
    createBrassSound(features) {
        const baseFreq = this.getScaledFrequency(220, features);
        return {
            instrumentType: 'brass',
            frequency: baseFreq,
            waveType: 'sawtooth',
            filterType: 'lowpass',
            filterFreq: 1200 + (features.energy * 1800),
            filterQ: 1.5,
            envelope: {
                attack: 0.05 + (features.velocity * 0.2),
                decay: 0.2,
                sustain: 0.7,
                release: 0.4 + (features.amplitude * 0.6)
            },
            lfoRate: 0.3,
            lfoDepth: 5
        };
    }
    
    createBassSound(features) {
        const baseFreq = this.getScaledFrequency(55, features); // Notas graves
        return {
            instrumentType: 'bass',
            frequency: baseFreq,
            waveType: 'sine',
            filterType: 'lowpass',
            filterFreq: 400 + (features.openness * 600),
            filterQ: 2,
            envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.8,
                release: 0.2 + (features.energy * 0.5)
            },
            lfoRate: 0.1 + (features.velocity * 0.5),
            lfoDepth: 3
        };
    }
    
    createSynthPadSound(features) {
        const baseFreq = this.getScaledFrequency(220, features);
        return {
            instrumentType: 'synth',
            frequency: baseFreq,
            waveType: 'sawtooth',
            filterType: 'lowpass',
            filterFreq: 600 + (features.openness * 2000),
            filterQ: 0.5,
            envelope: {
                attack: 0.3 + (features.velocity * 1),
                decay: 0.5,
                sustain: 0.9,
                release: 1.5 + (features.amplitude * 2)
            },
            lfoRate: 0.1 + (features.energy * 0.3),
            lfoDepth: 20 + (features.openness * 50),
            detune: 7 // Detune para som stereo
        };
    }
    
    /**
     * Toca o som de uma criatura - Versão Melódica
     */
    playCreature(creature) {
        if (this.activeCreatures.has(creature.id)) return;
        
        const { dna } = creature;
        const safeDna = this.validateDNA(dna);
        const now = this.audioContext.currentTime;
        
        // Criar oscilador principal
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = safeDna.waveType;
        oscillator.frequency.value = safeDna.frequency;
        if (safeDna.detune) oscillator.detune.value = safeDna.detune;
        
        // Configurar envelope de pitch se existir
        if (safeDna.pitchEnvelope) {
            oscillator.frequency.setValueAtTime(safeDna.pitchEnvelope.startFreq, now);
            oscillator.frequency.linearRampToValueAtTime(
                safeDna.pitchEnvelope.endFreq, 
                now + safeDna.pitchEnvelope.decay
            );
        }
        
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const panner = this.audioContext.createStereoPanner();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        // Configurar LFO para vibrato/tremolo
        lfo.type = 'sine';
        lfo.frequency.value = safeDna.lfoRate;
        lfoGain.gain.value = safeDna.lfoDepth;
        
        // Conectar LFO baseado no tipo de instrumento
        if (safeDna.instrumentType === 'flute') {
            lfoGain.connect(oscillator.detune); // Vibrato
        } else {
            lfoGain.connect(filter.frequency); // Modulação de filtro
        }
        
        // Configurar filtro
        filter.type = safeDna.filterType;
        filter.frequency.value = safeDna.filterFreq;
        filter.Q.value = safeDna.filterQ;
        
        // Configurar pan
        panner.pan.value = safeDna.pan;
        
        // Envelope ADSR
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(safeDna.volume, now + safeDna.envelope.attack);
        gainNode.gain.linearRampToValueAtTime(
            safeDna.volume * safeDna.envelope.sustain,
            now + safeDna.envelope.attack + safeDna.envelope.decay
        );
        
        // Conectar cadeia
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.compressor);
        lfo.connect(lfoGain);
        
        // Iniciar
        oscillator.start(now);
        lfo.start(now);
        
        // Arpeggio automático para harpa
        if (safeDna.arpeggio && safeDna.arpeggioRate) {
            this.startArpeggio(creature, safeDna);
        }
        
        this.activeCreatures.set(creature.id, {
            oscillator,
            gainNode,
            filter,
            panner,
            lfo,
            lfoGain,
            creature
        });
        
        console.log(`🎵 ${creature.instrumentType} ${creature.id} tocando`);
    }
    
    /**
     * Inicia arpeggio automático
     */
    startArpeggio(creature, dna) {
        const arpeggioNotes = [0, 2, 4, 7, 4, 2]; // Padrão de arpeggio
        let currentNote = 0;
        
        const playNextNote = () => {
            if (!this.activeCreatures.has(creature.id)) return;
            
            const noteIndex = arpeggioNotes[currentNote % arpeggioNotes.length];
            const newFreq = dna.frequency * Math.pow(2, noteIndex / 12);
            
            creature.dna.frequency = newFreq;
            const nodes = this.activeCreatures.get(creature.id);
            if (nodes) {
                nodes.oscillator.frequency.linearRampToValueAtTime(
                    newFreq, 
                    this.audioContext.currentTime + 0.1
                );
            }
            
            currentNote++;
            setTimeout(playNextNote, dna.arpeggioRate * 1000);
        };
        
        playNextNote();
    }
    
    /**
     * Para o som de uma criatura
     */
    stopCreature(creatureId) {
        const nodes = this.activeCreatures.get(creatureId);
        if (!nodes) return;
        
        const { oscillator, gainNode, lfo, creature } = nodes;
        const now = this.audioContext.currentTime;
        
        // Fade out musical
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + creature.dna.envelope.release);
        
        setTimeout(() => {
            try {
                oscillator.stop();
                lfo.stop();
            } catch (e) {
                // Ignorar erro se já foi parado
            }
            this.activeCreatures.delete(creatureId);
        }, creature.dna.envelope.release * 1000 + 100);
        
        console.log(`🔇 ${creature.instrumentType} ${creatureId} parou`);
    }
    
    /**
     * Utilitários
     */
    mapRange(value, inMin, inMax, outMin, outMax) {
        if (!isFinite(value) || isNaN(value)) {
            console.warn(`⚠️ Valor inválido em mapRange: ${value}, usando inMin`);
            value = inMin;
        }
        
        const clamped = Math.max(inMin, Math.min(inMax, value));
        const result = ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
        
        if (!isFinite(result) || isNaN(result)) {
            console.warn(`⚠️ mapRange gerou valor inválido, retornando outMin: ${outMin}`);
            return outMin;
        }
        
        return result;
    }
    
    validateDNA(dna) {
        const safeValue = (value, defaultValue, min = -Infinity, max = Infinity) => {
            const isValid = isFinite(value) && !isNaN(value) && value >= min && value <= max;
            return isValid ? Math.max(min, Math.min(max, value)) : defaultValue;
        };
        
        return {
            instrumentType: dna.instrumentType || 'synth',
            frequency: safeValue(dna.frequency, 440, 20, 2000),
            volume: safeValue(dna.volume, 0.2, 0.01, 0.5),
            waveType: ['sine', 'triangle', 'sawtooth', 'square'].includes(dna.waveType) ? 
                     dna.waveType : 'sine',
            lfoRate: safeValue(dna.lfoRate, 1, 0.01, 15),
            lfoDepth: safeValue(dna.lfoDepth, 10, 0, 100),
            pan: safeValue(dna.pan, 0, -1, 1),
            envelope: {
                attack: safeValue(dna.envelope.attack, 0.1, 0.001, 5),
                decay: safeValue(dna.envelope.decay, 0.3, 0.01, 5),
                sustain: safeValue(dna.envelope.sustain, 0.7, 0, 1),
                release: safeValue(dna.envelope.release, 1, 0.01, 8)
            },
            filterType: ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch'].includes(dna.filterType) ?
                      dna.filterType : 'lowpass',
            filterFreq: safeValue(dna.filterFreq, 1000, 50, 10000),
            filterQ: safeValue(dna.filterQ, 1, 0.1, 10),
            detune: safeValue(dna.detune, 0, -50, 50),
            arpeggio: dna.arpeggio || false,
            arpeggioRate: safeValue(dna.arpeggioRate, 0.2, 0.05, 2)
        };
    }
    
    generateInstrumentName(type) {
        const instrumentNames = {
            explosive: 'Trompete',
            subtle: 'Harpa',
            expansive: 'Cordas',
            contracted: 'Piano',
            upward: 'Flauta',
            downward: 'Baixo',
            neutral: 'Synth'
        };
        
        const name = instrumentNames[type] || 'Instrumento';
        const adjectives = ['Celestial', 'Harmônico', 'Melódico', 'Rítmico', 'Suave', 'Brilhante'];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        
        return `${adjective}-${name}-${Math.floor(Math.random() * 1000)}`;
    }
    
    /**
     * Método para teste de sons melódicos
     */
    testMelodicSounds() {
        const testInstruments = [
            { type: 'harp', features: { energy: 0.5, openness: 0.7, velocity: 0.3, amplitude: 0.4, position: {x: 0.2, y: 0.8} } },
            { type: 'flute', features: { energy: 0.7, openness: 0.5, velocity: 0.6, amplitude: 0.3, position: {x: 0.5, y: 0.6} } },
            { type: 'piano', features: { energy: 0.4, openness: 0.3, velocity: 0.8, amplitude: 0.5, position: {x: 0.8, y: 0.4} } }
        ];
        
        testInstruments.forEach((instrument, index) => {
            setTimeout(() => {
                const creature = this.createCreatureFromGesture({
                    type: instrument.type,
                    features: instrument.features,
                    timestamp: Date.now()
                });
                this.playCreature(creature);
                
                // Parar após 4 segundos
                setTimeout(() => {
                    this.stopCreature(creature.id);
                }, 4000);
            }, index * 5000);
        });
    }
    
    /**
     * Muda a escala musical em tempo real
     */
    changeScale(scaleName) {
        this.setMusicalScale(scaleName);
        console.log(`🎼 Escala alterada para: ${scaleName}`);
    }

    /**
 * Gera cor baseada nas características sonoras
 */
generateColorFromSound(soundProfile, features) {
    // Mapear instrumento para matiz base
    const instrumentHues = {
        'harp': 200,      // Azul claro
        'flute': 280,     // Roxo/Violeta
        'piano': 30,      // Laranja
        'strings': 120,   // Verde
        'brass': 0,       // Vermelho
        'bass': 240,      // Azul escuro
        'synth': 180      // Ciano
    };
    
    const baseHue = instrumentHues[soundProfile.instrumentType] || 180;
    
    // Variar matiz baseado na frequência
    const hueVariation = (soundProfile.frequency - 220) / 10;
    const hue = (baseHue + hueVariation) % 360;
    
    // Saturação baseada na energia
    const saturation = this.mapRange(features.energy, 0, 1, 50, 100);
    
    // Luminosidade baseada na amplitude
    const lightness = this.mapRange(features.amplitude, 0, 1, 40, 70);
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
}
