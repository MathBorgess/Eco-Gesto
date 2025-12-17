/**
 * Eco-Gesto - Sistema de Composição Corporal com Criaturas Sonoras Evolutivas
 * Arquivo principal que integra todos os módulos
 */

import BodyTracker from './modules/BodyTracker.js';
import EvolutionEngine from './modules/EvolutionEngine.js';
import SoundEngine from './modules/SoundEngine.js';
import VisualFeedback from './modules/VisualFeedback.js';
// import MixEvolutionManager from './modules/MixEvolutionManager.js';

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
      musicAI: {
        enabled: false, // Desabilitado por padrão até configurar API key
        influence: 0.5, // Influência do Music.AI no volume (0-1)
      },
    };

    // Inicializar módulos
    this.bodyTracker = new BodyTracker();
    this.soundEngine = new SoundEngine();
    this.evolutionEngine = new EvolutionEngine();
    this.visualFeedback = new VisualFeedback();
    this.mixManager = null; // Inicializado sob demanda

    this.lastGestureTime = 0;
    this.consecutiveGestures = 0;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Botão de iniciar
    document.getElementById('startBtn').addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation();
      this.toggleSystem();
    });

    // Botão de limpar
    document.getElementById('clearBtn').addEventListener('click', () => {
      this.clearEcosystem();
    });

    // Slider de mutação
    document.getElementById('mutationRate').addEventListener('input', e => {
      this.config.mutationRate = parseFloat(e.target.value);
      document.getElementById('mutationValue').textContent =
        this.config.mutationRate.toFixed(2);
    });

    // Slider de criaturas máximas
    document.getElementById('maxCreatures').addEventListener('input', e => {
      this.config.maxCreatures = parseInt(e.target.value);
      document.getElementById('maxCreaturesValue').textContent =
        this.config.maxCreatures;
      this.maintainCreatureLimit();
    });
  }

  async toggleSystem() {
    const startBtn = document.getElementById('startBtn');
    console.log('🔄 toggleSystem chamado. isRunning:', this.isRunning);

    if (!this.isRunning) {
      try {
        console.log('📸 Inicializando BodyTracker...');
        await this.bodyTracker.init();
        
        console.log('🎵 Inicializando SoundEngine...');
        await this.soundEngine.init();
        
        console.log('🎨 Inicializando VisualFeedback...');
        this.visualFeedback.init();

        // Configurar callback de detecção de gestos
        this.bodyTracker.onGestureDetected = gesture => {
          console.log('📣 Callback onGestureDetected chamado!');
          this.handleGesture(gesture);
        };

        this.isRunning = true;
        console.log('✅ isRunning setado para TRUE');

        console.log('🎬 Iniciando loop de visualização...');
        this.startVisualizationLoop();

        startBtn.innerHTML = '<span class="icon">⏹</span> Parar Sistema';
        startBtn.classList.add('active');

        console.log('✅ Sistema Eco-Gesto iniciado! isRunning:', this.isRunning);
      } catch (error) {
        console.error('❌ Erro ao iniciar sistema:', error);
        alert('Erro ao iniciar sistema. Verifique as permissões da câmera.');
      }
    } else {
      console.log('⏹️ Parando sistema...');
      this.bodyTracker.stop();
      this.clearEcosystem();
      this.isRunning = false;
      startBtn.innerHTML = '<span class="icon">▶</span> Iniciar Sistema';
      startBtn.classList.remove('active');

      console.log('⏹️ Sistema parado');
    }
  }

  handleGesture(gesture) {
    console.log('🖐️ handleGesture CHAMADO!');
    const currentTime = Date.now();
    const timeSinceLastGesture = currentTime - this.lastGestureTime;

    console.log('🖐️ Gesto detectado:', gesture.type, gesture);

    let newCreature;

    // Decidir: criar nova criatura ou cruzar existentes?
    if (
      this.creatures.length >= 2 &&
      timeSinceLastGesture < this.config.gestureTimeout &&
      Math.random() < this.config.crossoverThreshold
    ) {
      // CRUZAMENTO
      newCreature = this.breedCreatures(gesture);
      console.log('🧬 Cruzamento realizado! Nova criatura híbrida gerada');
      this.consecutiveGestures++;
    } else {
      // CRIAÇÃO NOVA
      console.log('🌱 Criando criatura do gesto...');
      newCreature = this.soundEngine.createCreatureFromGesture(gesture);
      console.log('🌱 Nova criatura criada:', newCreature);
      console.log('🌱 Criatura tem cor?', newCreature.dna.color);
      this.consecutiveGestures = 0;
    }

    console.log('🔍 Criatura antes de adicionar:', newCreature);
    console.log('🔍 Array creatures antes:', this.creatures.length);
    
    // Adicionar ao ecossistema
    this.addCreature(newCreature);
    
    console.log('🔍 Array creatures depois:', this.creatures.length);
    console.log('🔍 Creatures array completo:', this.creatures);

    // Processar com Music.AI se habilitado
    if (this.config.musicAI.enabled && this.mixManager) {
      this.processMusicAI(newCreature);
    }

    // Atualizar histórico
    this.gestureHistory.push({
      gesture,
      creature: newCreature,
      timestamp: currentTime,
    });

    this.lastGestureTime = currentTime;

    // Atualizar visualização
    this.updateCreatureList();
}


  playMixedAudio(url) {
    // Criar elemento de áudio temporário para reproduzir mix
    const audio = new Audio(url);
    audio.volume = this.config.musicAI.influence;
    
    audio.play().catch(error => {
      console.error('Erro ao reproduzir mix:', error);
    });

    // Cleanup após reprodução
    audio.onended = () => {
      URL.revokeObjectURL(url);
    };
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
      timestamp: Date.now(),
    });

    return offspring;
  }

  addCreature(creature) {
    console.log('➕ addCreature chamado. Criatura:', creature.id);
    
    // Adicionar ao pool
    this.creatures.push(creature);
    
    console.log('📊 Total de criaturas agora:', this.creatures.length);
    console.log('📋 Array creatures:', this.creatures);

    // Manter limite de criaturas
    this.maintainCreatureLimit();

    // Ativar som da criatura
    this.soundEngine.playCreature(creature);

    console.log(
      `✨ Criatura ${creature.id} adicionada. Total: ${this.creatures.length}`
    );
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

    listEl.innerHTML = this.creatures
      .map(
        creature => `
            <div class="creature-item">
                <span class="creature-name">${creature.name}</span>
                <span class="creature-params">
                    F: ${creature.dna.frequency.toFixed(0)}Hz | 
                    Vol: ${creature.dna.volume.toFixed(2)} |
                    Gen: ${creature.generation}
                </span>
            </div>
        `
      )
      .join('');
  }

startVisualizationLoop() {
    console.log('🎬 startVisualizationLoop INICIADO. isRunning:', this.isRunning);
    
    let frameCount = 0;
    
    const update = () => {
      if (!this.isRunning) {
        console.log('⚠️ Loop parado porque isRunning =', this.isRunning);
        return;
      }

      frameCount++;
      
      // Log a cada 60 frames (aproximadamente 1 segundo)
      if (frameCount % 60 === 0) {
        console.log(`🔄 Frame ${frameCount} - Criaturas: ${this.creatures.length}`);
      }

      // Atualizar visualização do ecossistema
      console.log("🎨 Frame executado. Criaturas:", this.creatures.length);
      this.visualFeedback.drawEcosystem(this.creatures);

      // Atualizar árvore genealógica
      this.visualFeedback.drawGenealogy(this.genealogy, this.creatures);

      // Desenhar mãos detectadas
      const landmarks = this.bodyTracker.getLastLandmarks();
      if (landmarks) {
        this.visualFeedback.drawPose(landmarks);
      }

      requestAnimationFrame(update);
    };

    console.log('🎬 Chamando primeira iteração do update...');
    update();
  }
}

// Inicializar sistema quando página carregar
window.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 Inicializando Eco-Gesto...');
  const system = new EcoGestoSystem();
  window.ecoGestoSystem = system; // Expor globalmente para debug

window.addEventListener('beforeunload', (e) => {
  console.log('⚠️ Página tentando descarregar!');
});

document.addEventListener('click', (e) => {
  console.log('🖱️ Clique em:', e.target);
  if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
    console.log('🖱️ Elemento:', e.target.outerHTML);
  }
})
});
