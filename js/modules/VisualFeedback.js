/**
 * VisualFeedback - Módulo de Feedback e Visualização
 * Fornece representação visual do estado do sistema
 */

export default class VisualFeedback {
  constructor() {
    this.handsCanvas = null;
    this.handsCtx = null;
    this.ecosystemCanvas = null;
    this.ecosystemCtx = null;
    this.genealogyCanvas = null;
    this.genealogyCtx = null;

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
  }

  init() {
    console.log("🎨 Inicializando VisualFeedback...");

    // Canvas de mãos (reutilizando o ID poseCanvas por compatibilidade)
    this.handsCanvas = document.getElementById("poseCanvas");
    this.handsCtx = this.handsCanvas.getContext("2d");

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

    console.log("✅ VisualFeedback inicializado");
  }

  /**
   * Desenha mãos detectadas
   */
  drawPose(landmarks) {
    if (!landmarks || !this.handsCtx) return;

    const ctx = this.handsCtx;
    const canvas = this.handsCanvas;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar pontos dos landmarks
    ctx.fillStyle = "#4ecca3";
    ctx.strokeStyle = "#4ecca3";
    ctx.lineWidth = 2;

    // Desenhar conexões entre pontos (mão)
    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4], // Polegar
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8], // Indicador
      [0, 9],
      [9, 10],
      [10, 11],
      [11, 12], // Médio
      [0, 13],
      [13, 14],
      [14, 15],
      [15, 16], // Anelar
      [0, 17],
      [17, 18],
      [18, 19],
      [19, 20], // Mínimo
      [5, 9],
      [9, 13],
      [13, 17], // Palma
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
   * Desenha visualização do ecossistema de criaturas
   */
  drawEcosystem(creatures) {
    if (!this.ecosystemCtx) return;

    const ctx = this.ecosystemCtx;
    const canvas = this.ecosystemCanvas;

    // Limpar com fade effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar cada criatura como um círculo pulsante
    creatures.forEach((creature, index) => {
      const x = (index + 1) * (canvas.width / (creatures.length + 1));
      const baseY = canvas.height / 2;

      // Animação: pulsar baseado na frequência
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * creature.dna.lfoRate) * 20;
      const y = baseY + pulse;

      // Tamanho baseado no volume
      const radius = 20 + creature.dna.volume * 50;

      // Cor baseada no tipo
      const color = this.colors[creature.type] || this.colors.neutral;

      // Desenhar círculo com glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Desenhar frequência como ondas
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const waveLength = 100;
      const waveAmplitude = creature.dna.lfoDepth / 10;

      for (let i = -waveLength; i < waveLength; i += 2) {
        const wx = x + i;
        const wy =
          y + Math.sin(i / 10 + time * creature.dna.lfoRate) * waveAmplitude;

        if (i === -waveLength) {
          ctx.moveTo(wx, wy);
        } else {
          ctx.lineTo(wx, wy);
        }
      }
      ctx.stroke();

      // Nome da criatura
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#fff";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(creature.name, x, y + radius + 20);

      // Geração
      ctx.fillStyle = "#888";
      ctx.font = "10px monospace";
      ctx.fillText(`Gen ${creature.generation}`, x, y + radius + 35);
    });
  }

  /**
   * Desenha árvore genealógica das criaturas
   */
  drawGenealogy(genealogy, creatures) {
    if (!this.genealogyCtx) return;

    const ctx = this.genealogyCtx;
    const canvas = this.genealogyCanvas;

    // Limpar
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
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

        // Desenhar nó da criatura
        const color = this.colors[creature.type] || this.colors.neutral;
        const radius = 15;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Nome
        ctx.fillStyle = "#fff";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(creature.name.split("-")[0], x, y + radius + 15);

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
                ctx.strokeStyle = "rgba(78, 204, 163, 0.3)";
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
    if (this.handsCtx) {
      this.handsCtx.clearRect(
        0,
        0,
        this.handsCanvas.width,
        this.handsCanvas.height
      );
    }

    if (this.ecosystemCtx) {
      this.ecosystemCtx.fillStyle = "rgba(0, 0, 0, 1)";
      this.ecosystemCtx.fillRect(
        0,
        0,
        this.ecosystemCanvas.width,
        this.ecosystemCanvas.height
      );
    }

    if (this.genealogyCtx) {
      this.genealogyCtx.fillStyle = "rgba(0, 0, 0, 1)";
      this.genealogyCtx.fillRect(
        0,
        0,
        this.genealogyCanvas.width,
        this.genealogyCanvas.height
      );
    }
  }
}
