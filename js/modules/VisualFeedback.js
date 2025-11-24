/**
 * VisualFeedback - Módulo de Feedback e Visualização
 * Fornece representação visual do estado do sistema
 */

// import Perlin from '../utils/noise.js';

export default class VisualFeedback {
  constructor() {
    this.poseCanvas = null;
    this.poseCtx = null;
    this.ecosystemCanvas = null;
    this.ecosystemCtx = null;
    this.genealogyCanvas = null;
    this.genealogyCtx = null;

    // Cores fallback por tipo de gesto (caso creature.dna.color não exista)
    this.colors = {
      explosive: "#ff6b6b",
      subtle: "#4ecdc4",
      expansive: "#ffe66d",
      contracted: "#a8dadc",
      upward: "#95e1d3",
      downward: "#5da2d5",
      hybrid: "#c77dff",
      neutral: "#b8b8ff",
    };

    this.eyesImage = new Image();
    this.eyesImage.src = 'files/eyes.gif';
    this.eyesImageLoaded = false;
    this.eyesImage.onload = () => {
      this.eyesImageLoaded = true;
      console.log('Imagem de olhos carregada');
    };
  }

  init() {
    console.log("🎨 Inicializando VisualFeedback...");

    // Canvas de pose
    this.poseCanvas = document.getElementById("poseCanvas");
    this.poseCtx = this.poseCanvas.getContext("2d");

    // Canvas de ecossistema
    this.ecosystemCanvas = document.getElementById("ecosystemCanvas");
    this.ecosystemCtx = this.ecosystemCanvas.getContext("2d");
    this.ecosystemCanvas.width = this.ecosystemCanvas.offsetWidth;
    this.ecosystemCanvas.height = this.ecosystemCanvas.offsetHeight;

    // Canvas de genealogia
    this.genealogyCanvas = document.getElementById("genealogyCanvas");
    this.genealogyCtx = this.genealogyCanvas.getContext("2d");
    this.genealogyCanvas.width = this.genealogyCanvas.offsetWidth;
    this.genealogyCanvas.height = this.genealogyCanvas.offsetHeight;

    // Listener para redimensionamento
    window.addEventListener('resize', () => this.resizeCanvases());

    console.log("✅ VisualFeedback inicializado");
  }

  resizeCanvases() {
    if (this.ecosystemCanvas) {
      this.ecosystemCanvas.width = this.ecosystemCanvas.offsetWidth;
      this.ecosystemCanvas.height = this.ecosystemCanvas.offsetHeight;
    }
    
    if (this.genealogyCanvas) {
      this.genealogyCanvas.width = this.genealogyCanvas.offsetWidth;
      this.genealogyCanvas.height = this.genealogyCanvas.offsetHeight;
    }
  }

  /**
   * Desenha pose corporal detectada
   */
  drawPose(landmarks) {
    if (!landmarks || !this.poseCtx) return;

    const ctx = this.poseCtx;
    const canvas = this.poseCanvas;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar pontos dos landmarks
    ctx.fillStyle = "#4ecca3";
    ctx.strokeStyle = "#4ecca3";
    ctx.lineWidth = 2;

    // Desenhar conexões entre pontos (mão)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Polegar
      [0, 5], [5, 6], [6, 7], [7, 8], // Indicador
      [0, 9], [9, 10], [10, 11], [11, 12], // Médio
      [0, 13], [13, 14], [14, 15], [15, 16], // Anelar
      [0, 17], [17, 18], [18, 19], [19, 20], // Mínimo
      [5, 9], [9, 13], [13, 17], // Palma
    ];

    // Desenhar linhas
    ctx.beginPath();
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
      ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
    });
    ctx.stroke();

    // Desenhar pontos
    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  }

  /**
   * Desenha visualização do ecossistema de criaturas como círculos coloridos
   */
  drawEcosystem(creatures) {
    if (!this.ecosystemCtx) return;

    const ctx = this.ecosystemCtx;
    const canvas = this.ecosystemCanvas;

    // Limpar com fade effect suave
    ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar grade de fundo sutil
    this.drawGrid(ctx, canvas);

    // Desenhar cada criatura
    creatures.forEach((creature, index) => {
      console.log("desenhando criatura: ", creature);
      this.drawCreature(ctx, canvas, creature, index, creatures.length);
    });
  }

  /**
   * Desenha uma criatura individual como círculo colorido
   */
  drawCreature(ctx, canvas, creature, index, total) {
    const { dna } = creature;
    const color = dna.color || this.colors[creature.type] || this.colors.neutral;

    // Usar posição inicial randomizada ou fallback
    const initX = dna.initialPosition?.x ?? 1
    const initY = dna.initialPosition?.y ?? 1

    // Converter para coordenadas do canvas
    const baseX = this.mapRange(initX, 0, 1, 80, canvas.width - 80);
    const baseY = this.mapRange(initY, 0, 1, 80, canvas.height - 80);

    // Animação multi-camadas
    const time = Date.now() / 1000;
    const seed = index * 0.1; // Cada criatura tem fase diferente
    
    // Movimento orbital principal
    const orbitSpeed = (dna.lfoRate || 1) * 0.3;
    const orbitSize = 15 + (dna.lfoDepth || 10) / 3;
    const orbitX = Math.cos(time * orbitSpeed + seed) * orbitSize;
    const orbitY = Math.sin(time * orbitSpeed + seed) * orbitSize;
    
    // Flutuação lenta
    const floatX = Math.sin(time * 0.2 + seed) * 15;
    const floatY = Math.cos(time * 0.15 + seed) * 18;
    
    // Posição final
    const x = baseX + orbitX + floatX;
    const y = baseY + orbitY + floatY;

    // Tamanho baseado no volume e envelope
    const baseRadius = 25 + (dna.volume * 100);
    const envelopeMultiplier = 1 + (dna.envelope.sustain * 0.3);

    // Animação de pulsação baseada em LFO
    const lfoFreq = dna.lfoRate || 1;
    const lfoAmount = (dna.lfoDepth || 10) / 100;
    const pulse = Math.sin(time * lfoFreq * Math.PI * 2) * lfoAmount;
    const radius = baseRadius * envelopeMultiplier * (1 + pulse * 0.4);

    ctx.save();

    // === CÍRCULO EXTERNO (Aura/Glow) ===
    ctx.shadowBlur = 40;
    ctx.shadowColor = color;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fill();

    // === CÍRCULO MÉDIO ===
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = this.lightenColor(color, 20);
    ctx.globalAlpha = 0.8;
    ctx.fill();

    // === CÍRCULO INTERNO (Núcleo) ===
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = this.lightenColor(color, 40);
    ctx.globalAlpha = 1;
    ctx.fill();

    // === ANEL DE FREQUÊNCIA ===
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.1, 0, Math.PI * 2);
    ctx.strokeStyle = this.lightenColor(color, 30);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + pulse * 0.3;
    ctx.stroke();

    // === PARTÍCULAS MUSICAIS (para instrumentos com arpeggio/vibrato) ===
    if (dna.arpeggio || (dna.lfoDepth || 0) > 30) {
      this.drawMusicParticles(ctx, x, y, radius, color, time, lfoFreq);
    }

    // === ONDAS DE FREQUÊNCIA ===
    this.drawFrequencyWaves(ctx, x, y, radius, color, time, dna);

    // === INFORMAÇÕES DA CRIATURA ===
    this.drawCreatureInfo(ctx, creature, x, y, radius, color);

    this.drawCreatureTentacles(ctx, x, y, radius, color, time);

    ctx.restore();

    // === OLHOS ANIMADOS ===;
    if (this.eyesImageLoaded) {
      const eyeSize = radius;
      ctx.drawImage(
        this.eyesImage, 
        x - eyeSize / 2,  
        y,  
        eyeSize, 
        eyeSize
      );
    }
  }

  /**
   * Desenha partículas orbitando a criatura
   */
  drawMusicParticles(ctx, x, y, radius, color, time, lfoFreq) {
    const particleCount = 8;
    const seed = Math.random();
    // const noise = new Perlin(seed);
    
    ctx.save();
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * lfoFreq;
      const orbitRadius = radius * 1.4 + Math.sin(time * 2 + i) * 15;
      const px = x + Math.cos(angle) * orbitRadius;
      const py = y + Math.sin(angle) * orbitRadius;
      const size = 3 + Math.sin(time * 3 + i) * 2;
      
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Desenha ondas de frequência emanando da criatura
   */
  drawFrequencyWaves(ctx, x, y, radius, color, time, dna) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;

    const waveLength = 120;
    const waveAmplitude = (dna.lfoDepth || 10) / 8;
    const waveSpeed = dna.lfoRate || 1;

    ctx.beginPath();
    for (let i = -waveLength; i < waveLength; i += 3) {
      const wx = x + i;
      const wy = y + radius * 1.6 + Math.sin((i / 10) + (time * waveSpeed)) * waveAmplitude;
      
      if (i === -waveLength) {
        ctx.moveTo(wx, wy);
      } else {
        ctx.lineTo(wx, wy);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Desenha informações da criatura
   */
  drawCreatureInfo(ctx, creature, x, y, radius, color) {
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#000';

    // Nome do instrumento (parte principal do nome)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    const instrumentName = creature.instrumentType ? 
      creature.instrumentType.toUpperCase() : 
      creature.name.split('-')[1] || 'SOUND';
    ctx.fillText(instrumentName, x, y - radius - 15);

    // ID e Geração
    ctx.font = '11px monospace';
    ctx.fillStyle = this.lightenColor(color, 60);
    const displayId = creature.id.split('_')[1] || creature.id.slice(-4);
    ctx.fillText(`#${displayId} • Gen ${creature.generation}`, x, y - radius - 2);

    // Frequência
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = color;
    ctx.fillText(`${creature.dna.frequency.toFixed(0)} Hz`, x, y + radius + 22);

    // Volume e Pan
    ctx.font = '10px monospace';
    ctx.fillStyle = '#888';
    const panText = creature.dna.pan > 0 ? `R${(creature.dna.pan * 100).toFixed(0)}%` : 
                    creature.dna.pan < 0 ? `L${(Math.abs(creature.dna.pan) * 100).toFixed(0)}%` : 'C';
    ctx.fillText(`Vol: ${(creature.dna.volume * 100).toFixed(0)}% • ${panText}`, x, y + radius + 36);

    ctx.restore();
  }

  /**
   * Adiciona brilho ambiente ao canvas
   */
  addAmbientGlow(ctx, canvas, creatures) {
    creatures.forEach(creature => {
      const color = creature.dna.color || this.colors[creature.type];
      const x = this.mapRange(creature.dna.pan || 0, -1, 1, 80, canvas.width - 80);
      const y = this.mapRange(creature.dna.frequency, 50, 2000, canvas.height - 80, 80);
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200);
      gradient.addColorStop(0, this.addAlpha(color, 0.08));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }

  drawCreatureTentacles(ctx, x, y, radius, color, time) {
    const tentacleCount = 20;
    ctx.save();
    ctx.strokeStyle = this.lightenColor(color, 20);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;

    for (let i = 0; i < tentacleCount; i++) {
      const angle = (i / tentacleCount) * Math.PI * 2 + time * 0.5;
      const length = radius + 20 + Math.sin(time * 3 + i) * 10;

      ctx.beginPath();
      ctx.moveTo(x, y);
      const tx = x + Math.cos(angle) * length;
      const ty = y + Math.sin(angle) * length;
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Desenha grade de fundo sutil
   */
  drawGrid(ctx, canvas) {
    ctx.save();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Linhas verticais
    for (let x = 0; x < canvas.width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Linhas horizontais
    for (let y = 0; y < canvas.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Desenha árvore genealógica das criaturas
   */
  drawGenealogy(genealogy, creatures) {
    if (!this.genealogyCtx) return;

    const ctx = this.genealogyCtx;
    const canvas = this.genealogyCanvas;

    // Limpar
    ctx.fillStyle = "rgba(10, 10, 10, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (genealogy.length === 0) {
      ctx.fillStyle = "#666";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        "Nenhum cruzamento ainda...",
        canvas.width / 2,
        canvas.height / 2
      );
      return;
    }

    // Criar mapa de criaturas por ID
    const creatureMap = new Map();
    creatures.forEach((c) => creatureMap.set(c.id, c));

    // Organizar em níveis de geração
    const generations = new Map();

    creatures.forEach((creature) => {
      if (!generations.has(creature.generation)) {
        generations.set(creature.generation, []);
      }
      generations.get(creature.generation).push(creature);
    });

    // Desenhar por geração
    const maxGen = Math.max(...Array.from(generations.keys()));
    const levelHeight = canvas.height / (maxGen + 2);

    generations.forEach((creaturesInGen, gen) => {
      const y = levelHeight * (gen + 1);
      const spacing = canvas.width / (creaturesInGen.length + 1);

      creaturesInGen.forEach((creature, index) => {
        const x = spacing * (index + 1);

        // Usar cor gerada ou fallback
        const color = creature.dna.color || this.colors[creature.type] || this.colors.neutral;
        const radius = 18;

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        // Círculo da criatura
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Borda
        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.lightenColor(color, 40);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nome
        ctx.fillStyle = "#fff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000';
        const shortName = creature.name.split("-")[0];
        ctx.fillText(shortName, x, y + radius + 18);

        // Desenhar linhas para pais (se híbrido)
        if (creature.parents && creature.parents.length === 2) {
          const prevGen = gen - 1;
          if (generations.has(prevGen)) {
            const prevCreatures = generations.get(prevGen);

            creature.parents.forEach((parentId) => {
              const parentIndex = prevCreatures.findIndex(
                (c) => c.id === parentId
              );
              if (parentIndex !== -1) {
                const parentX = spacing * (parentIndex + 1);
                const parentY = levelHeight * (prevGen + 1);

                // Linha conectando filho aos pais
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "rgba(78, 204, 163, 0.4)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(parentX, parentY + radius);
                ctx.lineTo(x, y - radius);
                ctx.stroke();
              }
            });
          }
        }
      });
    });
  }

  /**
   * Limpa todas as visualizações
   */
  clear() {
    if (this.poseCtx) {
      this.poseCtx.clearRect(
        0,
        0,
        this.poseCanvas.width,
        this.poseCanvas.height
      );
    }

    if (this.ecosystemCtx) {
      this.ecosystemCtx.fillStyle = "rgba(10, 10, 10, 1)";
      this.ecosystemCtx.fillRect(
        0,
        0,
        this.ecosystemCanvas.width,
        this.ecosystemCanvas.height
      );
    }

    if (this.genealogyCtx) {
      this.genealogyCtx.fillStyle = "rgba(10, 10, 10, 1)";
      this.genealogyCtx.fillRect(
        0,
        0,
        this.genealogyCanvas.width,
        this.genealogyCanvas.height
      );
    }
  }

  /**
   * Utilitários de cor e mapeamento
   */
  mapRange(value, inMin, inMax, outMin, outMax) {
    const clamped = Math.max(inMin, Math.min(inMax, value));
    return ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
  }

  lightenColor(color, percent) {
    // Se for HSL
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const h = hslMatch[1];
      const s = hslMatch[2];
      const l = Math.min(100, parseInt(hslMatch[3]) + percent);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    // Se for hex
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      
      const factor = 1 + (percent / 100);
      const newR = Math.min(255, Math.floor(r * factor));
      const newG = Math.min(255, Math.floor(g * factor));
      const newB = Math.min(255, Math.floor(b * factor));
      
      return `rgb(${newR}, ${newG}, ${newB})`;
    }
    
    return color;
  }

  addAlpha(color, alpha) {
    // Se for HSL, converter para HSLA
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      return `hsla(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%, ${alpha})`;
    }
    
    // Se for hex, converter para rgba
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    return color;
  }
}