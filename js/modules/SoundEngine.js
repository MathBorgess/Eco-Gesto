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
        this.compressor = null;
    }
    
    async init() {
        console.log('🔊 Inicializando SoundEngine...');
        
        // Criar contexto de áudio (precisa de interação do usuário)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // ADICIONAR COMPRESSOR para suavizar picos de áudio
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        // Master gain para controlar volume geral
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        
        // Conectar cadeia: source → compressor → master → destination
        this.compressor.connect(this.masterGain);
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
            // Frequência base (pitch) - mapeada da posição Y (agora mais suave)
            frequency: this.getMusicalFrequency(
                this.mapRange(features.position.y, 0, 1, 150, 800) // Antes: 200-800Hz
            ),
            
            // Volume - mapeado da energia do gesto (agora mais conservador)
            volume: this.mapRange(energy, 0, 1, 0.08, 0.4), // Antes: 0.1-0.6
            
            // Tipo de onda (timbre base) - agora preferindo ondas mais suaves
            waveType: this.selectWaveType(type, features),
            
            // Taxa de LFO (modulação) - mapeada da velocidade (agora mais lenta)
            lfoRate: this.mapRange(velocity, 0, 0.1, 0.1, 3), // Antes: 0.5-8
            
            // Profundidade de LFO - mapeada da amplitude (agora mais sutil)
            lfoDepth: this.mapRange(amplitude, 0, 0.5, 5, 80), // Antes: 10-200
            
            // Pan (esquerda/direita) - mapeado da posição X (agora mais sutil)
            pan: this.mapRange(features.position.x, 0, 1, -0.7, 0.7), // Antes: -1 a 1
            
            // Envelope ADSR - com attack mais lento
            envelope: {
                attack: this.mapRange(velocity, 0, 0.1, 0.1, 0.3), // Antes: 0.05-0.5
                decay: 0.4, // Antes: 0.2
                sustain: 0.7, // Antes: 0.6
                release: this.mapRange(energy, 0, 1, 1.5, 0.5) // Antes: 1-0.3
            },
            
            // Filtro - agora mais restritivo
            filterFreq: this.mapRange(openness, 0, 0.5, 300, 1200), // Antes: 400-2000
            filterQ: 2, // Antes: 5 (menos ressonante)
            
            // NOVO: Detune sutil para criar sons mais ricos
            detune: this.mapRange(energy, 0, 1, -5, 5)
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
     * Converte frequência base para nota em escala musical (mais agradável)
     */
    getMusicalFrequency(baseFreq) {
        // Escala pentatônica menor (mais agradável ao ouvido)
        const pentatonicScale = [1, 6/5, 4/3, 3/2, 9/5, 2];
        const noteIndex = Math.floor(Math.random() * pentatonicScale.length);
        return baseFreq * pentatonicScale[noteIndex];
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
        const safeDna = this.validateDNA(dna);
        
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
        oscillator.detune.value = safeDna.detune; // NOVO: detune sutil
        
        // Configurar LFO (modulação) - agora com wave type suave
        lfo.type = 'sine'; // Sempre sine para LFO mais suave
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
        
        // Configurar envelope ADSR no gain - agora mais suave
        gainNode.gain.value = 0;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(safeDna.volume, now + safeDna.envelope.attack);
        gainNode.gain.linearRampToValueAtTime(
            safeDna.volume * safeDna.envelope.sustain,
            now + safeDna.envelope.attack + safeDna.envelope.decay
        );
        
        // NOVO: Adicionar modulação de filtro dinâmica
        filter.frequency.setValueAtTime(safeDna.filterFreq * 0.8, now);
        filter.frequency.linearRampToValueAtTime(
            safeDna.filterFreq * 1.5, 
            now + safeDna.envelope.attack
        );
        filter.frequency.linearRampToValueAtTime(
            safeDna.filterFreq,
            now + safeDna.envelope.attack + safeDna.envelope.decay
        );
        
        // Conectar cadeia de áudio através do compressor
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(panner);
        panner.connect(this.compressor); // Conectar no compressor ao invés do master diretamente
        
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
     * Valida e ajusta os valores do DNA para garantir sons agradáveis
     */
    validateDNA(dna) {
        const safeValue = (value, defaultValue, min = -Infinity, max = Infinity) => {
            const isValid = isFinite(value) && !isNaN(value) && value >= min && value <= max;
            if (!isValid) {
                console.warn(`⚠️ Valor inválido detectado: ${value}, usando default: ${defaultValue}`);
            }
            return isValid ? Math.max(min, Math.min(max, value)) : defaultValue;
        };
        
        return {
            frequency: safeValue(dna.frequency, 440, 80, 2000), // Limites mais conservadores
            volume: safeValue(dna.volume, 0.2, 0.01, 0.8), // Volume mais seguro
            waveType: ['sine', 'triangle', 'sawtooth', 'square'].includes(dna.waveType) ? 
                     dna.waveType : 'sine', // Garantir wave type válido
            lfoRate: safeValue(dna.lfoRate, 1, 0.01, 10), // LFO mais lento
            lfoDepth: safeValue(dna.lfoDepth, 20, 0, 100), // LFO mais sutil
            pan: safeValue(dna.pan, 0, -1, 1),
            envelope: {
                attack: safeValue(dna.envelope.attack, 0.1, 0.01, 5), // Attack mínimo
                decay: safeValue(dna.envelope.decay, 0.3, 0.01, 5),
                sustain: safeValue(dna.envelope.sustain, 0.7, 0, 1),
                release: safeValue(dna.envelope.release, 1, 0.01, 5) // Release mais longo
            },
            filterFreq: safeValue(dna.filterFreq, 800, 100, 5000), // Filtro mais restritivo
            filterQ: safeValue(dna.filterQ, 2, 0.1, 10), // Menos ressonância
            detune: safeValue(dna.detune, 0, -50, 50) // Detune limitado
        };
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
        // Preferir ondas menos harmônicas (mais suaves)
        switch(gestureType) {
            case 'explosive':
                return 'triangle'; // Menos agressivo que sawtooth
            case 'subtle':
                return 'sine';
            case 'expansive':
                return 'sine'; // Sempre sine para expansivo
            case 'contracted':
                return 'triangle'; // Menos agressivo que square
            default:
                // 80% chance de sine ou triangle (ondas mais suaves)
                return Math.random() < 0.8 ? 
                    (Math.random() < 0.5 ? 'sine' : 'triangle') : 
                    'sawtooth';
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
    
    /**
     * NOVO: Método para testar som de referência agradável
     */
    testPleasantSound() {
        const testCreature = {
            id: 'test_sound',
            dna: {
                frequency: 440,
                volume: 0.3,
                waveType: 'sine',
                lfoRate: 1,
                lfoDepth: 10,
                pan: 0,
                envelope: { attack: 0.2, decay: 0.3, sustain: 0.7, release: 1 },
                filterFreq: 1000,
                filterQ: 2,
                detune: 0
            }
        };
        this.playCreature(testCreature);
        setTimeout(() => this.stopCreature(testCreature.id), 2000);
    }
}
