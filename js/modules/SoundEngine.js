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
        console.log('🔊 Inicializando SoundEngine...');
        
        // Criar contexto de áudio (precisa de interação do usuário)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain para controlar volume geral
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
        
        console.log('✅ SoundEngine inicializado');
    }
    
    /**
     * Cria uma nova criatura sonora baseada em um gesto
     */
    createCreatureFromGesture(gesture) {
        const { features, type, timestamp, source } = gesture;
        
        // DEBUG: Log completo das features
        console.log('🔍 DEBUG createCreature - features:', JSON.stringify(features, null, 2));
        
        // Valores padrão para features que podem não existir
        const openness = features.openness || features.armSpread || 0.3;
        const amplitude = features.amplitude || 0.2;
        const velocity = Math.max(0.001, features.velocity || 0.01); // Evitar zero
        const energy = Math.max(0.01, features.energy || 0.1); // Evitar zero
        
        console.log('🔍 DEBUG - valores normalizados:', { openness, amplitude, velocity, energy });
        
        // Mapear características do gesto para "DNA" sonoro
        const dna = {
            // Frequência base (pitch) - mapeada da posição Y
            frequency: this.mapRange(features.position.y, 0, 1, 800, 200),
            
            // Volume - mapeado da energia do gesto
            volume: this.mapRange(energy, 0, 1, 0.1, 0.6),
            
            // Tipo de onda (timbre base)
            waveType: this.selectWaveType(type, features),
            
            // Taxa de LFO (modulação) - mapeada da velocidade
            lfoRate: this.mapRange(velocity, 0, 0.1, 0.5, 8),
            
            // Profundidade de LFO - mapeada da amplitude
            lfoDepth: this.mapRange(amplitude, 0, 0.5, 10, 200),
            
            // Pan (esquerda/direita) - mapeado da posição X
            pan: this.mapRange(features.position.x, 0, 1, -1, 1),
            
            // Envelope ADSR
            envelope: {
                attack: this.mapRange(velocity, 0, 0.1, 0.5, 0.05),
                decay: 0.2,
                sustain: 0.6,
                release: this.mapRange(energy, 0, 1, 1, 0.3)
            },
            
            // Filtro
            filterFreq: this.mapRange(openness, 0, 0.5, 400, 2000),
            filterQ: 5
        };
        
        // DEBUG: Verificar DNA final
        console.log('🔍 DEBUG - DNA criado:', JSON.stringify(dna, null, 2));
        const hasInvalidValues = Object.entries(dna).some(([key, value]) => {
            if (key === 'envelope' || key === 'waveType') return false;
            return !isFinite(value) || isNaN(value);
        });
        if (hasInvalidValues) {
            console.error('❌ DNA CONTÉM VALORES INVÁLIDOS!', dna);
        }
        
        // Criar objeto criatura
        const creature = {
            id: `creature_${this.creatureIdCounter++}`,
            name: this.generateCreatureName(type),
            type: type,
            dna: dna,
            birthTime: timestamp,
            generation: 0,
            parents: null,
            gestureOrigin: features
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
        
        // VALIDAÇÃO: Garantir que todos os valores são finitos
        const safeValue = (value, defaultValue) => {
            const isValid = isFinite(value) && !isNaN(value);
            if (!isValid) {
                console.warn(`⚠️ Valor inválido detectado: ${value}, usando default: ${defaultValue}`);
            }
            return isValid ? value : defaultValue;
        };
        
        const safeDna = {
            frequency: safeValue(dna.frequency, 440),
            volume: safeValue(dna.volume, 0.3),
            waveType: dna.waveType || 'sine',
            lfoRate: safeValue(dna.lfoRate, 2),
            lfoDepth: safeValue(dna.lfoDepth, 50),
            pan: safeValue(dna.pan, 0),
            envelope: {
                attack: safeValue(dna.envelope.attack, 0.1),
                decay: safeValue(dna.envelope.decay, 0.2),
                sustain: safeValue(dna.envelope.sustain, 0.6),
                release: safeValue(dna.envelope.release, 0.5)
            },
            filterFreq: safeValue(dna.filterFreq, 1000),
            filterQ: safeValue(dna.filterQ, 5)
        };
        
        const now = this.audioContext.currentTime;
        
        // Criar nós de áudio
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const panner = this.audioContext.createStereoPanner();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        // Configurar oscilador principal
        oscillator.type = safeDna.waveType;
        oscillator.frequency.value = safeDna.frequency;
        
        // Configurar LFO (modulação)
        lfo.frequency.value = safeDna.lfoRate;
        lfoGain.gain.value = safeDna.lfoDepth;
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        // Configurar filtro
        filter.type = 'lowpass';
        filter.frequency.value = safeDna.filterFreq;
        filter.Q.value = safeDna.filterQ;
        
        // Configurar pan
        panner.pan.value = safeDna.pan;
        
        // Configurar envelope ADSR no gain
        gainNode.gain.value = 0;
        gainNode.gain.linearRampToValueAtTime(safeDna.volume, now + safeDna.envelope.attack);
        gainNode.gain.linearRampToValueAtTime(
            safeDna.volume * safeDna.envelope.sustain,
            now + safeDna.envelope.attack + safeDna.envelope.decay
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
            creature
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
        gainNode.gain.linearRampToValueAtTime(0, now + creature.dna.envelope.release);
        
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
        // Validar entrada
        if (!isFinite(value) || isNaN(value)) {
            console.warn(`⚠️ Valor inválido em mapRange: ${value}, usando inMin`);
            value = inMin;
        }
        
        const clamped = Math.max(inMin, Math.min(inMax, value));
        const result = ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
        
        // Validar saída
        if (!isFinite(result) || isNaN(result)) {
            console.warn(`⚠️ mapRange gerou valor inválido, retornando outMin: ${outMin}`);
            return outMin;
        }
        
        return result;
    }
    
    selectWaveType(gestureType, features) {
        const waveTypes = ['sine', 'triangle', 'sawtooth', 'square'];
        
        switch(gestureType) {
            case 'explosive':
                return 'sawtooth';
            case 'subtle':
                return 'sine';
            case 'expansive':
                return 'triangle';
            case 'contracted':
                return 'square';
            default:
                // Selecionar baseado em energia
                const index = Math.floor(features.energy * waveTypes.length) % waveTypes.length;
                return waveTypes[index];
        }
    }
    
    generateCreatureName(type) {
        const prefixes = {
            explosive: 'Ignis',
            subtle: 'Nimbus',
            expansive: 'Aether',
            contracted: 'Terra',
            upward: 'Avis',
            downward: 'Aqua',
            neutral: 'Vox'
        };
        
        const prefix = prefixes[type] || 'Sonic';
        const suffix = Math.floor(Math.random() * 1000);
        
        return `${prefix}-${suffix}`;
    }
}
