/**
 * BodyTracker - Módulo de Captura e Análise de Gestos com Mãos
 * Detecta gestos usando apenas MediaPipe Hands
 * Versão simplificada focada exclusivamente em detecção de mãos
 */

export default class BodyTracker {
  constructor() {
    this.hands = null;
    this.camera = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;
    this.isInitialized = false;

    this.onGestureDetected = null; // Callback para gestos detectados

    // Estado para análise de movimento
    this.previousHandLandmarks = null;
    this.gestureStartTime = null;
    this.movementHistory = [];
    this.lastGestureType = null;
    this.gestureDebounceTime = 500; // ms entre detecções
    this.lastGestureTime = 0;
  }

  async init() {
    console.log("🎥 Inicializando BodyTracker (Hands Only)...");

    // Verificar se MediaPipe Hands está disponível
    if (typeof window.Hands === "undefined") {
      console.error("❌ MediaPipe Hands NÃO está carregado! Verifique o CDN.");
      throw new Error("MediaPipe Hands não carregado");
    }
    console.log("✅ MediaPipe Hands disponível");

    this.videoElement = document.getElementById("videoInput");
    this.canvasElement = document.getElementById("poseCanvas");

    if (!this.videoElement) {
      console.error("❌ Elemento #videoInput não encontrado!");
      throw new Error("Elemento de vídeo não encontrado");
    }
    if (!this.canvasElement) {
      console.error("❌ Elemento #poseCanvas não encontrado!");
      throw new Error("Elemento de canvas não encontrado");
    }
    console.log("✅ Elementos DOM encontrados");

    this.canvasCtx = this.canvasElement.getContext("2d");

    try {
      console.log("⏳ Configurando MediaPipe Hands...");
      // Configurar MediaPipe Hands
      this.hands = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.hands.onResults((results) => this.onHandsResults(results));

      console.log("✅ MediaPipe Hands configurado");

      // Marcar como inicializado ANTES de iniciar a câmera
      this.isInitialized = true;

      // Iniciar câmera
      console.log("⏳ Iniciando câmera...");
      await this.setupCamera();
      console.log("✅ Câmera iniciada");

      console.log("✅ BodyTracker inicializado (modo mãos apenas)");
    } catch (error) {
      console.error("❌ Erro ao inicializar BodyTracker:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  async setupCamera() {
    console.log("📷 Solicitando acesso à câmera...");

    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Acesso à câmera concedido");

      this.videoElement.srcObject = stream;

      return new Promise((resolve, reject) => {
        this.videoElement.onloadedmetadata = () => {
          console.log("✅ Metadados do vídeo carregados");
          this.videoElement
            .play()
            .then(() => {
              console.log("✅ Vídeo iniciado");
              this.startDetection();
              resolve();
            })
            .catch((err) => {
              console.error("❌ Erro ao iniciar vídeo:", err);
              reject(err);
            });
        };

        this.videoElement.onerror = (err) => {
          console.error("❌ Erro ao carregar vídeo:", err);
          reject(err);
        };
      });
    } catch (error) {
      console.error("❌ Erro ao acessar câmera:", error);
      if (error.name === "NotAllowedError") {
        alert(
          "⚠️ Acesso à câmera negado! Por favor, permita o acesso à câmera e recarregue a página."
        );
      } else if (error.name === "NotFoundError") {
        alert(
          "⚠️ Nenhuma câmera encontrada! Conecte uma câmera e recarregue a página."
        );
      }
      throw error;
    }
  }

  startDetection() {
    console.log("🔍 Iniciando loop de detecção...");
    let frameCount = 0;
    let lastLogTime = Date.now();

    const detectFrame = async () => {
      if (!this.isInitialized) {
        console.log("⚠️ Loop de detecção parado - sistema não inicializado");
        return;
      }

      try {
        await this.hands.send({ image: this.videoElement });
        frameCount++;

        // Log a cada 5 segundos para não poluir o console
        if (Date.now() - lastLogTime > 5000) {
          console.log(
            `🔄 Detecção rodando... (${frameCount} frames processados)`
          );
          lastLogTime = Date.now();
        }

        requestAnimationFrame(detectFrame);
      } catch (error) {
        console.error("❌ Erro no loop de detecção:", error);
        // Tentar continuar mesmo com erro
        requestAnimationFrame(detectFrame);
      }
    };

    detectFrame();
    console.log("✅ Loop de detecção iniciado");
  }

  onHandsResults(results) {
    // Ajustar tamanho do canvas se necessário
    if (results.image && this.canvasElement.width !== results.image.width) {
      this.canvasElement.width = results.image.width;
      this.canvasElement.height = results.image.height;
    }

    // Limpar canvas
    this.canvasCtx.save();
    this.canvasCtx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    // Espelhar horizontalmente para texto
    this.canvasCtx.save();
    this.canvasCtx.scale(-1, 1);
    this.canvasCtx.translate(-this.canvasElement.width, 0);

    // Mostrar status da detecção
    this.canvasCtx.fillStyle = "#ffe66d";
    this.canvasCtx.font = "16px monospace";
    this.canvasCtx.fillText(
      `👋 Mãos detectadas: ${
        results.multiHandLandmarks ? results.multiHandLandmarks.length : 0
      }`,
      10,
      30
    );

    this.canvasCtx.restore();

    // Processar mãos detectadas
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const currentHandLandmarks = results.multiHandLandmarks[0];

      // Desenhar todas as mãos
      results.multiHandLandmarks.forEach((landmarks) => {
        this.drawHands(landmarks);
      });

      // Extrair características do gesto
      const features = this.extractGestureFeatures(currentHandLandmarks);

      if (features) {
        const gestureType = this.classifyGestureType(features);
        const currentTime = Date.now();
        
        console.log(`📍 Posição: X=${features.position.x.toFixed(2)}, Y=${features.position.y.toFixed(2)}`);

        // Detectar gestos significativos
        if (
          features.velocity > 0.005 &&
          currentTime - this.lastGestureTime > this.gestureDebounceTime
        ) {
          const gesture = {
            type: gestureType,
            features: features,
            landmarks: currentHandLandmarks,
            timestamp: currentTime,
            source: "hands",
          };

          console.log("👋 GESTO DETECTADO!", gesture.type);

          if (this.onGestureDetected) {
            this.onGestureDetected(gesture);
          }

          this.lastGestureTime = currentTime;
        }
      }

      this.previousHandLandmarks = currentHandLandmarks;
    }

    this.canvasCtx.restore();
  }



  extractGestureFeatures(landmarks) {
    // Manter método original para compatibilidade (mãos)
    const features = {
      position: { x: 0, y: 0 },
      velocity: 0,
      amplitude: 0,
      direction: { x: 0, y: 0 },
      openness: 0,
      energy: 0,
    };

    // Calcular centro da mão
    let sumX = 0,
      sumY = 0;
    landmarks.forEach((point) => {
      sumX += point.x;
      sumY += point.y;
    });
    features.position.x = sumX / landmarks.length;
    features.position.y = sumY / landmarks.length;

    // Calcular velocidade
    if (this.previousHandLandmarks) {
      let prevSumX = 0,
        prevSumY = 0;
      this.previousHandLandmarks.forEach((point) => {
        prevSumX += point.x;
        prevSumY += point.y;
      });
      const prevX = prevSumX / this.previousHandLandmarks.length;
      const prevY = prevSumY / this.previousHandLandmarks.length;

      const dx = features.position.x - prevX;
      const dy = features.position.y - prevY;

      features.velocity = Math.sqrt(dx * dx + dy * dy);
      features.direction.x = dx;
      features.direction.y = dy;
    }

    // Calcular amplitude
    let sumDist = 0;
    landmarks.forEach((point) => {
      const dist = Math.sqrt(
        Math.pow(point.x - features.position.x, 2) +
          Math.pow(point.y - features.position.y, 2)
      );
      sumDist += dist;
    });
    features.amplitude = sumDist / landmarks.length;

    // Calcular openness
    const thumb = landmarks[4];
    const pinky = landmarks[20];
    features.openness = Math.sqrt(
      Math.pow(thumb.x - pinky.x, 2) + Math.pow(thumb.y - pinky.y, 2)
    );

    // Calcular energia
    features.energy = features.velocity * features.amplitude * 10;

    return features;
  }

  classifyGestureType(features) {
    const { velocity, amplitude, direction, energy, openness } = features;

    // Classificação baseada em características das mãos
    if (energy > 0.15) {
      return "explosive"; // Gesto explosivo/rápido
    } else if (energy < 0.02) {
      return "subtle"; // Gesto sutil/lento
    }

    if (openness > 0.3) {
      return "expansive"; // Mão aberta
    } else if (openness < 0.15) {
      return "contracted"; // Mão fechada
    }

    // Analisar direção predominante
    if (Math.abs(direction.y) > Math.abs(direction.x) * 1.5) {
      if (direction.y > 0) {
        return "downward"; // Movimento para baixo
      } else {
        return "upward"; // Movimento para cima
      }
    }

    if (Math.abs(direction.x) > Math.abs(direction.y) * 1.5) {
      if (direction.x > 0) {
        return "rightward"; // Movimento para direita
      } else {
        return "leftward"; // Movimento para esquerda
      }
    }

    // Default
    return "neutral";
  }



  drawHands(landmarks) {
    const ctx = this.canvasCtx;
    const canvas = this.canvasElement;

    ctx.save();

    ctx.strokeStyle = "#ffe66d";
    ctx.fillStyle = "#ffe66d";
    ctx.lineWidth = 3;

    // Conexões da mão
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
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      ctx.beginPath();
      ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
      ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
      ctx.stroke();
    });

    // Desenhar pontos (maiores para melhor visualização)
    landmarks.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        6,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // DEBUG: Desenhar número do ponto para pontos-chave
      if (
        index === 0 ||
        index === 4 ||
        index === 8 ||
        index === 12 ||
        index === 16 ||
        index === 20
      ) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.fillText(
          index,
          point.x * canvas.width + 8,
          point.y * canvas.height + 3
        );
        ctx.fillStyle = "#ffe66d";
      }
    });

    ctx.restore();
  }

  getLastLandmarks() {
    // Retornar landmarks das mãos
    return this.previousHandLandmarks;
  }

  stop() {
    this.isInitialized = false;
    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject.getTracks().forEach((track) => track.stop());
    }
  }
}
