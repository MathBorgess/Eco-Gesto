/**
 * Eco-Gesto - Sistema de Composição Corporal com Criaturas Sonoras Evolutivas
 * Arquivo principal que integra todos os módulos
 */

import BodyTracker from './modules/BodyTracker.js';
import EvolutionEngine from './modules/EvolutionEngine.js';
import SoundEngine from './modules/SoundEngine.js';
import VisualFeedback from './modules/VisualFeedback.js';
import MixEvolutionManager from './modules/MixEvolutionManager.js';

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
        enabled: false, // Music.AI desabilitado por padrão
        influence: 0.5, // Influência da mixagem (0-1)
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
    document.getElementById('startBtn').addEventListener('click', () => {
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

    // === Music.AI Controls ===
    
    // Toggle Music.AI
    const musicAIToggle = document.getElementById('musicAIToggle');
    if (musicAIToggle) {
      musicAIToggle.addEventListener('change', async e => {
        this.config.musicAI.enabled = e.target.checked;
        await this.toggleMusicAI(e.target.checked);
      });
    }

    // Slider de influência
    const influenceSlider = document.getElementById('musicAIInfluence');
    if (influenceSlider) {
      influenceSlider.addEventListener('input', e => {
        this.config.musicAI.influence = parseFloat(e.target.value);
        const valueEl = document.getElementById('influenceValue');
        if (valueEl) {
          valueEl.textContent = (this.config.musicAI.influence * 100).toFixed(0) + '%';
        }
      });
    }

    // Botão de histórico
    const historyBtn = document.getElementById('showHistoryBtn');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        this.showMixHistory();
      });
    }

    // Botão de métricas
    const metricsBtn = document.getElementById('showMetricsBtn');
    if (metricsBtn) {
      metricsBtn.addEventListener('click', () => {
        this.showMetrics();
      });
    }
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
        this.bodyTracker.onGestureDetected = gesture => {
          this.handleGesture(gesture);
        };

        // Inicializar Music.AI se estiver habilitado
        if (this.config.musicAI.enabled && !this.mixManager) {
          await this.initMusicAI();
        }

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

  async initMusicAI() {
    try {
      console.log('🎼 Inicializando Music.AI...');
      
      const audioContext = this.soundEngine.audioContext;
      this.mixManager = new MixEvolutionManager(audioContext);

      // Configurar callbacks
      this.mixManager.setCallbacks({
        onMixStart: data => {
          this.updateMusicAIStatus('Processando gene...', 'processing');
          console.log('🎛️ Mix iniciado:', data);
        },
        onMixProgress: data => {
          const messages = {
            gene_exported: 'Gene exportado',
            uploading_gene: `Upload: ${data.progress || 0}%`,
            workflow_started: 'Workflow iniciado',
            processing: `Processando: ${data.status}`,
          };
          this.updateMusicAIStatus(
            messages[data.step] || 'Processando...',
            'processing'
          );
        },
        onMixComplete: data => {
          this.updateMusicAIStatus('Mix completo!', 'success');
          console.log('✅ Mix completo:', data);
          
          // Reproduzir mix se influência > 0
          if (this.config.musicAI.influence > 0 && data.mixUrl) {
            this.playMixedAudio(data.mixUrl);
          }

          // Atualizar histórico
          this.updateMixHistoryUI();
        },
        onMixError: data => {
          this.updateMusicAIStatus('Erro - usando fallback', 'error');
          console.error('❌ Erro no mix:', data.error);
          
          // Reproduzir gene original como fallback
          if (data.fallback && data.fallback.geneUrl) {
            this.playMixedAudio(data.fallback.geneUrl);
          }
        },
      });

      // Inicializar
      await this.mixManager.init();
      this.mixManager.setEnabled(true);

      this.updateMusicAIStatus('Pronto', 'ready');
      console.log('✅ Music.AI inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar Music.AI:', error);
      this.updateMusicAIStatus('Erro na inicialização', 'error');
      
      // Desabilitar toggle
      const toggle = document.getElementById('musicAIToggle');
      if (toggle) {
        toggle.checked = false;
        this.config.musicAI.enabled = false;
      }
    }
  }

  async toggleMusicAI(enabled) {
    if (enabled && !this.mixManager) {
      await this.initMusicAI();
    } else if (this.mixManager) {
      this.mixManager.setEnabled(enabled);
      this.updateMusicAIStatus(
        enabled ? 'Ativado' : 'Desativado',
        enabled ? 'ready' : 'idle'
      );
    }
  }

  updateMusicAIStatus(message, status) {
    const statusEl = document.getElementById('musicAIStatus');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `status-${status}`;
    }
  }

  handleGesture(gesture) {
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

  async processMusicAI(creature) {
    try {
      console.log('🎼 Processando criatura com Music.AI:', creature.id);
      
      // Processar de forma assíncrona
      const result = await this.mixManager.processNewCreature(creature);
      
      if (result && result.success) {
        console.log('✅ Mix gerado:', result.mixId);
      } else if (result && result.fallback) {
        console.log('⚠️ Fallback usado:', result.geneId);
      }
    } catch (error) {
      console.error('❌ Erro ao processar com Music.AI:', error);
    }
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
    // Adicionar ao pool
    this.creatures.push(creature);

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

  async showMixHistory() {
    if (!this.mixManager) {
      alert('Music.AI não está inicializado');
      return;
    }

    try {
      const mixes = await this.mixManager.getMixHistory(20);
      const genes = await this.mixManager.getGeneHistory(20);

      // Criar modal com histórico
      const modal = this.createHistoryModal(mixes, genes);
      document.body.appendChild(modal);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      alert('Erro ao carregar histórico');
    }
  }

  createHistoryModal(mixes, genes) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>📜 Histórico de Áudios</h2>
        
        <h3>🎛️ Mixagens (${mixes.length})</h3>
        <div class="history-list">
          ${mixes.map(mix => `
            <div class="history-item" data-id="${mix.id}">
              <span class="history-time">${new Date(mix.timestamp).toLocaleString()}</span>
              <span class="history-meta">Gen ${mix.metadata.generation || 'N/A'}</span>
              <button class="play-btn" data-url="${mix.id}" data-type="mix">▶️ Play</button>
              <button class="delete-btn" data-id="${mix.id}">🗑️</button>
            </div>
          `).join('')}
        </div>

        <h3>🧬 Genes (${genes.length})</h3>
        <div class="history-list">
          ${genes.map(gene => `
            <div class="history-item" data-id="${gene.id}">
              <span class="history-time">${new Date(gene.timestamp).toLocaleString()}</span>
              <span class="history-meta">Creature ${gene.metadata.creatureId || 'N/A'}</span>
              <button class="play-btn" data-url="${gene.id}" data-type="gene">▶️ Play</button>
              <button class="delete-btn" data-id="${gene.id}">🗑️</button>
            </div>
          `).join('')}
        </div>

        <button id="clearHistoryBtn" class="btn-danger">🗑️ Limpar Histórico</button>
      </div>
    `;

    // Event listeners
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.onclick = e => {
      if (e.target === modal) modal.remove();
    };

    // Play buttons
    modal.querySelectorAll('.play-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.url;
        try {
          const url = await this.mixManager.playFromHistory(id);
          this.playMixedAudio(url);
        } catch (error) {
          console.error('Erro ao reproduzir:', error);
          alert('Erro ao reproduzir áudio');
        }
      };
    });

    // Delete buttons
    modal.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        if (confirm('Deletar este áudio?')) {
          await this.mixManager.deleteFromHistory(id);
          modal.remove();
          this.showMixHistory(); // Recarregar
        }
      };
    });

    // Clear history button
    const clearBtn = modal.querySelector('#clearHistoryBtn');
    if (clearBtn) {
      clearBtn.onclick = async () => {
        if (confirm('Limpar TODO o histórico?')) {
          await this.mixManager.clearHistory();
          modal.remove();
        }
      };
    }

    return modal;
  }

  showMetrics() {
    if (!this.mixManager) {
      alert('Music.AI não está inicializado');
      return;
    }

    const metrics = this.mixManager.getMetrics();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>📊 Métricas Music.AI</h2>
        
        <h3>🎛️ Estado</h3>
        <ul>
          <li>Ativo: ${metrics.state.enabled ? '✅' : '❌'}</li>
          <li>Processando: ${metrics.state.isProcessing ? '⏳' : '✅'}</li>
          <li>Gerações: ${metrics.state.generationCount}</li>
          <li>Sucessos: ${metrics.state.successCount}</li>
          <li>Falhas: ${metrics.state.failCount}</li>
        </ul>

        <h3>💾 Storage</h3>
        <ul>
          <li>Total de Áudios: ${metrics.storage.totalAudios}</li>
          <li>Tamanho Total: ${(metrics.storage.totalSize / 1024 / 1024).toFixed(2)} MB</li>
          <li>Uso: ${metrics.storage.usagePercent}%</li>
          <li>Cache Hits: ${metrics.storage.cacheHits}</li>
          <li>Cache Misses: ${metrics.storage.cacheMisses}</li>
        </ul>

        <h3>🌐 API Music.AI</h3>
        <ul>
          <li>Requisições Totais: ${metrics.musicAI.requests_total}</li>
          <li>Sucessos: ${metrics.musicAI.requests_success}</li>
          <li>Falhas: ${metrics.musicAI.requests_failed}</li>
          <li>Rate Limits: ${metrics.musicAI.rate_limits || 0}</li>
          <li>Quota Usado: ${metrics.musicAI.quota_used || 0}</li>
        </ul>
      </div>
    `;

    modal.querySelector('.close').onclick = () => modal.remove();
    modal.onclick = e => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  }

  updateMixHistoryUI() {
    // Atualizar contador de histórico se elemento existir
    const historyCount = document.getElementById('historyCount');
    if (historyCount && this.mixManager) {
      this.mixManager.getMixHistory().then(mixes => {
        historyCount.textContent = mixes.length;
      });
    }
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
    const update = () => {
      if (!this.isRunning) return;

      // Atualizar visualização do ecossistema
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

    update();
  }
}

// Inicializar sistema quando página carregar
window.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 Inicializando Eco-Gesto...');
  const system = new EcoGestoSystem();
  window.ecoGestoSystem = system; // Expor globalmente para debug
});
