/**
 * Eco-Gesto - Sistema de Composição Corporal com Criaturas Sonoras Evolutivas
 * Arquivo principal que integra todos os módulos
 */

import BodyTracker from './modules/BodyTracker.js';
import SoundEngine from './modules/SoundEngine.js';
import EvolutionEngine from './modules/EvolutionEngine.js';
import VisualFeedback from './modules/VisualFeedback.js';

class EcoGestoSystem {
    constructor() {
        this.isRunning = false;
        this.creatures = []; // Pool de criaturas sonoras vivas
        this.genealogy = []; // Histórico de cruzamentos
        this.gestureHistory = [];
        
        // Configurações
        this.config = {
            maxCreatures: 5,
            mutationRate: 0.1,
            crossoverThreshold: 0.3, // Probabilidade de cruzamento vs nova criatura
            gestureTimeout: 2000, // Tempo para considerar gesto como "novo" ou "cruzamento"
        };
        
        // Inicializar módulos
        this.bodyTracker = new BodyTracker();
        this.soundEngine = new SoundEngine();
        this.evolutionEngine = new EvolutionEngine();
        this.visualFeedback = new VisualFeedback();
        
        this.lastGestureTime = 0;
        this.consecutiveGestures = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Botão de iniciar
        document.getElementById('startBtn').addEventListener('click', () => {
            this.toggleSystem();
        });
        
        // Botão de limpar
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearEcosystem();
        });
        
        // Slider de mutação
        document.getElementById('mutationRate').addEventListener('input', (e) => {
            this.config.mutationRate = parseFloat(e.target.value);
            document.getElementById('mutationValue').textContent = this.config.mutationRate.toFixed(2);
        });
        
        // Slider de criaturas máximas
        document.getElementById('maxCreatures').addEventListener('input', (e) => {
            this.config.maxCreatures = parseInt(e.target.value);
            document.getElementById('maxCreaturesValue').textContent = this.config.maxCreatures;
            this.maintainCreatureLimit();
        });
    }
    
    async toggleSystem() {
        const startBtn = document.getElementById('startBtn');
        
        if (!this.isRunning) {
            try {
                // Inicializar módulos
                await this.bodyTracker.init();
                await this.soundEngine.init();
                this.visualFeedback.init();
                
                // Configurar callback de detecção de gestos
                this.bodyTracker.onGestureDetected = (gesture) => {
                    this.handleGesture(gesture);
                };
                
                // Iniciar loop de atualização visual
                this.startVisualizationLoop();
                
                this.isRunning = true;
                startBtn.textContent = 'Parar Sistema';
                startBtn.classList.add('active');
                
                console.log('✅ Sistema Eco-Gesto iniciado!');
            } catch (error) {
                console.error('Erro ao iniciar sistema:', error);
                alert('Erro ao iniciar sistema. Verifique as permissões da câmera.');
            }
        } else {
            this.bodyTracker.stop();
            this.clearEcosystem();
            this.isRunning = false;
            startBtn.textContent = 'Iniciar Sistema';
            startBtn.classList.remove('active');
            
            console.log('⏹️ Sistema parado');
        }
    }
    
    handleGesture(gesture) {
        const currentTime = Date.now();
        const timeSinceLastGesture = currentTime - this.lastGestureTime;
        
        console.log('🖐️ Gesto detectado:', gesture.type, gesture);
        
        let newCreature;
        
        // Decidir: criar nova criatura ou cruzar existentes?
        if (this.creatures.length >= 2 && 
            timeSinceLastGesture < this.config.gestureTimeout &&
            Math.random() < this.config.crossoverThreshold) {
            
            // CRUZAMENTO: Criar híbrido de duas criaturas existentes
            newCreature = this.breedCreatures(gesture);
            console.log('🧬 Cruzamento realizado! Nova criatura híbrida gerada');
            this.consecutiveGestures++;
            
        } else {
            // CRIAÇÃO NOVA: Gerar criatura original do gesto
            newCreature = this.soundEngine.createCreatureFromGesture(gesture);
            console.log('🌱 Nova criatura original gerada');
            this.consecutiveGestures = 0;
        }
        
        // Adicionar ao ecossistema
        this.addCreature(newCreature);
        
        // Atualizar histórico
        this.gestureHistory.push({
            gesture,
            creature: newCreature,
            timestamp: currentTime
        });
        
        this.lastGestureTime = currentTime;
        
        // Atualizar visualização
        this.updateCreatureList();
    }
    
    breedCreatures(gesture) {
        // Selecionar duas criaturas para cruzamento
        const parents = this.evolutionEngine.selectParents(this.creatures);
        
        if (parents.length < 2) {
            // Fallback: criar nova criatura
            return this.soundEngine.createCreatureFromGesture(gesture);
        }
        
        // Cruzar genética das criaturas
        const offspring = this.evolutionEngine.crossover(
            parents[0],
            parents[1],
            gesture,
            this.config.mutationRate
        );
        
        // Registrar genealogia
        this.genealogy.push({
            parents: [parents[0].id, parents[1].id],
            offspring: offspring.id,
            timestamp: Date.now()
        });
        
        return offspring;
    }
    
    addCreature(creature) {
        // Adicionar ao pool
        this.creatures.push(creature);
        
        // Manter limite de criaturas
        this.maintainCreatureLimit();
        
        // Ativar som da criatura
        this.soundEngine.playCreature(creature);
        
        console.log(`✨ Criatura ${creature.id} adicionada. Total: ${this.creatures.length}`);
    }
    
    maintainCreatureLimit() {
        // Se exceder limite, remover criaturas mais antigas/fracas
        while (this.creatures.length > this.config.maxCreatures) {
            const removed = this.creatures.shift(); // Remove a mais antiga
            this.soundEngine.stopCreature(removed.id);
            console.log(`💀 Criatura ${removed.id} removida do ecossistema`);
        }
    }
    
    clearEcosystem() {
        // Parar todos os sons
        this.creatures.forEach(creature => {
            this.soundEngine.stopCreature(creature.id);
        });
        
        // Limpar arrays
        this.creatures = [];
        this.genealogy = [];
        this.gestureHistory = [];
        
        // Atualizar UI
        this.updateCreatureList();
        this.visualFeedback.clear();
        
        console.log('🧹 Ecossistema limpo');
    }
    
    updateCreatureList() {
        const countEl = document.getElementById('creatureCount');
        const listEl = document.getElementById('creaturesList');
        
        countEl.textContent = this.creatures.length;
        
        listEl.innerHTML = this.creatures.map(creature => `
            <div class="creature-item">
                <span class="creature-name">${creature.name}</span>
                <span class="creature-params">
                    F: ${creature.dna.frequency.toFixed(0)}Hz | 
                    Vol: ${creature.dna.volume.toFixed(2)} |
                    Gen: ${creature.generation}
                </span>
            </div>
        `).join('');
    }
    
    startVisualizationLoop() {
        const update = () => {
            if (!this.isRunning) return;
            
            // Atualizar visualização do ecossistema
            this.visualFeedback.drawEcosystem(this.creatures);
            
            // Atualizar árvore genealógica
            this.visualFeedback.drawGenealogy(this.genealogy, this.creatures);
            
            // Desenhar pose corporal
            const landmarks = this.bodyTracker.getLastLandmarks();
            if (landmarks) {
                this.visualFeedback.drawPose(landmarks);
            }
            
            requestAnimationFrame(update);
        };
        
        update();
    }
}

// Inicializar sistema quando página carregar
window.addEventListener('DOMContentLoaded', () => {
    console.log('🌱 Inicializando Eco-Gesto...');
    const system = new EcoGestoSystem();
    window.ecoGestoSystem = system; // Expor globalmente para debug
});
