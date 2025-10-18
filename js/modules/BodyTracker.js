/**
 * BodyTracker - Módulo de Captura e Análise Corporal
 * Detecta gestos usando MediaPipe Hands E Pose (tronco + braços)
 * Foco em detecção parcial: não precisa corpo inteiro, apenas peito e braços
 */

export default class BodyTracker {
    constructor() {
        this.hands = null;
        this.pose = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.isInitialized = false;
        
        this.onGestureDetected = null; // Callback para gestos detectados
        
        // Estado para análise de movimento
        this.previousHandLandmarks = null;
        this.previousPoseLandmarks = null;
        this.gestureStartTime = null;
        this.movementHistory = [];
        this.lastGestureType = null;
        this.gestureDebounceTime = 500; // ms entre detecções (reduzido de 800 para 500)
        this.lastGestureTime = 0;
        
        // Modo de detecção: 'hands', 'pose', ou 'hybrid'
        this.detectionMode = 'hybrid'; // Usar ambos para maior robustez
    }
    
    async init() {
        console.log('🎥 Inicializando BodyTracker (Hands + Pose)...');
        
        // Verificar se MediaPipe está disponível
        if (typeof window.Hands === 'undefined') {
            console.error('❌ MediaPipe Hands NÃO está carregado! Verifique o CDN.');
            throw new Error('MediaPipe Hands não carregado');
        }
        if (typeof window.Pose === 'undefined') {
            console.error('❌ MediaPipe Pose NÃO está carregado! Verifique o CDN.');
            throw new Error('MediaPipe Pose não carregado');
        }
        console.log('✅ MediaPipe libraries disponíveis');
        
        this.videoElement = document.getElementById('videoInput');
        this.canvasElement = document.getElementById('poseCanvas');
        
        if (!this.videoElement) {
            console.error('❌ Elemento #videoInput não encontrado!');
            throw new Error('Elemento de vídeo não encontrado');
        }
        if (!this.canvasElement) {
            console.error('❌ Elemento #poseCanvas não encontrado!');
            throw new Error('Elemento de canvas não encontrado');
        }
        console.log('✅ Elementos DOM encontrados');
        
        this.canvasCtx = this.canvasElement.getContext('2d');
        
        try {
            console.log('⏳ Configurando MediaPipe Hands...');
            // Configurar MediaPipe Hands
            this.hands = new window.Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.3,  // Reduzido de 0.5 para 0.3
                minTrackingConfidence: 0.3    // Reduzido de 0.5 para 0.3
            });
            
            this.hands.onResults((results) => this.onHandsResults(results));
            
            console.log('✅ MediaPipe Hands configurado');
            
            console.log('⏳ Configurando MediaPipe Pose...');
            // Configurar MediaPipe Pose (tronco e braços)
            this.pose = new window.Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });
            
            this.pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.3,  // Reduzido de 0.5 para 0.3
                minTrackingConfidence: 0.3    // Reduzido de 0.5 para 0.3
            });
            
            this.pose.onResults((results) => this.onPoseResults(results));
            
            console.log('✅ MediaPipe Pose configurado');
            
            // Iniciar câmera
            console.log('⏳ Iniciando câmera...');
            await this.setupCamera();
            console.log('✅ Câmera iniciada');
            
            this.isInitialized = true;
            console.log('✅ BodyTracker inicializado (modo híbrido)');
        } catch (error) {
            console.error('❌ Erro ao inicializar BodyTracker:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }
    
    async setupCamera() {
        console.log('📷 Solicitando acesso à câmera...');
        
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        };
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Acesso à câmera concedido');
            
            this.videoElement.srcObject = stream;
            
            return new Promise((resolve, reject) => {
                this.videoElement.onloadedmetadata = () => {
                    console.log('✅ Metadados do vídeo carregados');
                    this.videoElement.play()
                        .then(() => {
                            console.log('✅ Vídeo iniciado');
                            this.startDetection();
                            resolve();
                        })
                        .catch(err => {
                            console.error('❌ Erro ao iniciar vídeo:', err);
                            reject(err);
                        });
                };
                
                this.videoElement.onerror = (err) => {
                    console.error('❌ Erro ao carregar vídeo:', err);
                    reject(err);
                };
            });
        } catch (error) {
            console.error('❌ Erro ao acessar câmera:', error);
            if (error.name === 'NotAllowedError') {
                alert('⚠️ Acesso à câmera negado! Por favor, permita o acesso à câmera e recarregue a página.');
            } else if (error.name === 'NotFoundError') {
                alert('⚠️ Nenhuma câmera encontrada! Conecte uma câmera e recarregue a página.');
            }
            throw error;
        }
    }
    
    startDetection() {
        console.log('🔍 Iniciando loop de detecção...');
        let frameCount = 0;
        let lastLogTime = Date.now();
        
        const detectFrame = async () => {
            if (!this.isInitialized) {
                console.log('⚠️ Loop de detecção parado - sistema não inicializado');
                return;
            }
            
            try {
                // Alternar entre hands e pose para economizar processamento
                // Hands a cada frame, Pose a cada 2 frames
                await this.hands.send({ image: this.videoElement });
                
                if (frameCount % 2 === 0) {
                    await this.pose.send({ image: this.videoElement });
                }
                
                frameCount++;
                
                // Log a cada 5 segundos para não poluir o console
                if (Date.now() - lastLogTime > 5000) {
                    console.log(`🔄 Detecção rodando... (${frameCount} frames processados)`);
                    lastLogTime = Date.now();
                }
                
                requestAnimationFrame(detectFrame);
            } catch (error) {
                console.error('❌ Erro no loop de detecção:', error);
                // Tentar continuar mesmo com erro
                requestAnimationFrame(detectFrame);
            }
        };
        
        detectFrame();
        console.log('✅ Loop de detecção iniciado');
    }
    
    onHandsResults(results) {
        // DEBUG: Limpar e desenhar no canvas a cada frame
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // DEBUG: Mostrar status da detecção
        this.canvasCtx.fillStyle = '#ffe66d';
        this.canvasCtx.font = '16px monospace';
        this.canvasCtx.fillText(`👋 Mãos detectadas: ${results.multiHandLandmarks ? results.multiHandLandmarks.length : 0}`, 10, 30);
        
        // Armazenar e processar resultados das mãos
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.previousHandLandmarks = results.multiHandLandmarks[0];
            
            // DEBUG: Desenhar TODAS as mãos detectadas
            results.multiHandLandmarks.forEach((landmarks, index) => {
                this.drawHands(landmarks);
            });
            
            // Também detectar gestos pelas mãos!
            const features = this.extractGestureFeatures(this.previousHandLandmarks);
            
            if (features) {
                const gestureType = this.classifyGestureType(features);
                const currentTime = Date.now();
                
                console.log('📊 Features (Hands):', {
                    velocity: features.velocity.toFixed(4),
                    energy: features.energy.toFixed(4),
                    type: gestureType
                });
                
                // Threshold MUITO reduzido para mãos também
                if (features.velocity > 0.003 && 
                    currentTime - this.lastGestureTime > this.gestureDebounceTime) {
                    
                    const gesture = {
                        type: gestureType,
                        features: features,
                        landmarks: this.previousHandLandmarks,
                        timestamp: currentTime,
                        source: 'hands'
                    };
                    
                    console.log('👋 GESTO DETECTADO (Mãos)!', gesture.type);
                    
                    if (this.onGestureDetected) {
                        this.onGestureDetected(gesture);
                    }
                    
                    this.lastGestureTime = currentTime;
                }
            }
        }
        
        this.canvasCtx.restore();
    }
    
    onPoseResults(results) {
        // Ajustar tamanho do canvas apenas uma vez
        if (this.canvasElement.width !== results.image.width) {
            this.canvasElement.width = results.image.width;
            this.canvasElement.height = results.image.height;
        }
        
        // DEBUG: Desenhar status do pose
        this.canvasCtx.save();
        this.canvasCtx.fillStyle = '#4ecca3';
        this.canvasCtx.font = '16px monospace';
        this.canvasCtx.fillText(`💪 Pose detectado: ${results.poseLandmarks ? 'SIM' : 'NÃO'}`, 10, 60);
        
        if (results.poseLandmarks) {
            this.previousPoseLandmarks = results.poseLandmarks;
            
            // DEBUG: Contar landmarks visíveis
            const visibleCount = results.poseLandmarks.filter(p => p.visibility > 0.3).length;
            this.canvasCtx.fillText(`👁️ Pontos visíveis: ${visibleCount}/33`, 10, 90);
            
            // Desenhar esqueleto do torso e braços
            this.drawUpperBody(results.poseLandmarks);
            
            // Extrair características do movimento do tronco e braços
            const features = this.extractUpperBodyFeatures(results.poseLandmarks);
            
            if (features) {
                // Classificar tipo de gesto
                const gestureType = this.classifyGestureType(features);
                
                // DEBUG: Log features para debug
                console.log('📊 Features (Upper Body):', {
                    velocity: features.velocity.toFixed(4),
                    energy: features.energy.toFixed(4),
                    type: gestureType
                });
                
                // Detectar quando há um gesto significativo
                const currentTime = Date.now();
                
                // Threshold MUITO reduzido para facilitar geração de criaturas
                if (features.velocity > 0.002 && 
                    currentTime - this.lastGestureTime > this.gestureDebounceTime) {
                    
                    const gesture = {
                        type: gestureType,
                        features: features,
                        landmarks: results.poseLandmarks,
                        timestamp: currentTime,
                        source: 'pose' // Indicar que veio do pose
                    };
                    
                    console.log('� GESTO DETECTADO (Braços)!', gesture.type);
                    
                    if (this.onGestureDetected) {
                        this.onGestureDetected(gesture);
                    }
                    
                    this.lastGestureTime = currentTime;
                }
            }
        } else {
            // DEBUG: Mostrar por que não detectou
            this.canvasCtx.fillText('⚠️ Pose não detectado', 10, 90);
        }
        
        this.canvasCtx.restore();
        
        // Desenhar também mãos se disponíveis (já desenhadas em onHandsResults)
        // if (this.previousHandLandmarks) {
        //     this.drawHands(this.previousHandLandmarks);
        // }
    }
    
    extractUpperBodyFeatures(landmarks) {
        // Pontos-chave do MediaPipe Pose para tronco e braços:
        // 11: Ombro esquerdo, 12: Ombro direito
        // 13: Cotovelo esquerdo, 14: Cotovelo direito
        // 15: Pulso esquerdo, 16: Pulso direito
        // 23: Quadril esquerdo, 24: Quadril direito
        
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        
        // Verificar se pontos principais estão visíveis (visibility > 0.5)
        const keyPoints = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist];
        const visiblePoints = keyPoints.filter(p => p && p.visibility > 0.3);
        
        if (visiblePoints.length < 4) {
            // Não temos pontos suficientes
            return null;
        }
        
        const features = {
            position: { x: 0, y: 0 },
            velocity: 0,
            amplitude: 0,
            direction: { x: 0, y: 0 },
            armSpread: 0, // Abertura dos braços
            energy: 0
        };
        
        // Calcular centro do tronco (média dos ombros e pulsos visíveis)
        let sumX = 0, sumY = 0, count = 0;
        keyPoints.forEach(point => {
            if (point && point.visibility > 0.3) {
                sumX += point.x;
                sumY += point.y;
                count++;
            }
        });
        features.position.x = sumX / count;
        features.position.y = sumY / count;
        
        // Calcular velocidade (comparar com frame anterior)
        if (this.previousPoseLandmarks) {
            const prevLeftWrist = this.previousPoseLandmarks[15];
            const prevRightWrist = this.previousPoseLandmarks[16];
            
            let dx = 0, dy = 0, velocityCount = 0;
            
            // Velocidade do pulso esquerdo
            if (leftWrist.visibility > 0.3 && prevLeftWrist.visibility > 0.3) {
                dx += leftWrist.x - prevLeftWrist.x;
                dy += leftWrist.y - prevLeftWrist.y;
                velocityCount++;
            }
            
            // Velocidade do pulso direito
            if (rightWrist.visibility > 0.3 && prevRightWrist.visibility > 0.3) {
                dx += rightWrist.x - prevRightWrist.x;
                dy += rightWrist.y - prevRightWrist.y;
                velocityCount++;
            }
            
            if (velocityCount > 0) {
                dx /= velocityCount;
                dy /= velocityCount;
                
                features.velocity = Math.sqrt(dx * dx + dy * dy);
                features.direction.x = dx;
                features.direction.y = dy;
            }
        }
        
        // Calcular abertura dos braços (distância entre pulsos)
        if (leftWrist.visibility > 0.3 && rightWrist.visibility > 0.3) {
            features.armSpread = Math.sqrt(
                Math.pow(rightWrist.x - leftWrist.x, 2) +
                Math.pow(rightWrist.y - leftWrist.y, 2)
            );
        }
        
        // Calcular amplitude (dispersão dos pontos dos braços)
        let sumDist = 0;
        keyPoints.forEach(point => {
            if (point && point.visibility > 0.3) {
                const dist = Math.sqrt(
                    Math.pow(point.x - features.position.x, 2) +
                    Math.pow(point.y - features.position.y, 2)
                );
                sumDist += dist;
            }
        });
        features.amplitude = sumDist / count;
        
        // Calcular energia (combinação de velocidade e amplitude)
        features.energy = features.velocity * features.amplitude * 15;
        
        return features;
    }
    
    extractGestureFeatures(landmarks) {
        // Manter método original para compatibilidade (mãos)
        const features = {
            position: { x: 0, y: 0 },
            velocity: 0,
            amplitude: 0,
            direction: { x: 0, y: 0 },
            openness: 0,
            energy: 0
        };
        
        // Calcular centro da mão
        let sumX = 0, sumY = 0;
        landmarks.forEach(point => {
            sumX += point.x;
            sumY += point.y;
        });
        features.position.x = sumX / landmarks.length;
        features.position.y = sumY / landmarks.length;
        
        // Calcular velocidade
        if (this.previousHandLandmarks) {
            let prevSumX = 0, prevSumY = 0;
            this.previousHandLandmarks.forEach(point => {
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
        landmarks.forEach(point => {
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
            Math.pow(thumb.x - pinky.x, 2) +
            Math.pow(thumb.y - pinky.y, 2)
        );
        
        // Calcular energia
        features.energy = features.velocity * features.amplitude * 10;
        
        return features;
    }
    
    classifyGestureType(features) {
        const { velocity, amplitude, direction, energy } = features;
        
        // Usar armSpread se disponível (pose), senão usar openness (hands)
        const spread = features.armSpread || features.openness || 0;
        
        // Classificação baseada em características
        // Thresholds MUITO reduzidos para facilitar criação de criaturas
        if (energy > 0.15) {
            return 'explosive'; // Gesto explosivo/rápido
        } else if (energy < 0.02) {
            return 'subtle'; // Gesto sutil/lento
        }
        
        if (spread > 0.3) {
            return 'expansive'; // Braços/mão abertos
        } else if (spread < 0.15) {
            return 'contracted'; // Braços/mão fechados
        }
        
        // Analisar direção predominante
        if (Math.abs(direction.y) > Math.abs(direction.x) * 1.5) {
            if (direction.y > 0) {
                return 'downward'; // Movimento para baixo
            } else {
                return 'upward'; // Movimento para cima
            }
        }
        
        if (Math.abs(direction.x) > Math.abs(direction.y) * 1.5) {
            if (direction.x > 0) {
                return 'rightward'; // Movimento para direita
            } else {
                return 'leftward'; // Movimento para esquerda
            }
        }
        
        // Default
        return 'neutral';
    }
    
    drawUpperBody(landmarks) {
        const ctx = this.canvasCtx;
        const canvas = this.canvasElement;
        
        ctx.save();
        
        // Desenhar apenas tronco e braços
        ctx.strokeStyle = '#4ecca3';
        ctx.fillStyle = '#4ecca3';
        ctx.lineWidth = 4;
        
        // Conexões do tronco e braços
        const connections = [
            [11, 12], // Ombros
            [11, 13], // Ombro esq -> Cotovelo esq
            [13, 15], // Cotovelo esq -> Pulso esq
            [12, 14], // Ombro dir -> Cotovelo dir
            [14, 16], // Cotovelo dir -> Pulso dir
            [11, 23], // Ombro esq -> Quadril esq
            [12, 24], // Ombro dir -> Quadril dir
            [23, 24], // Quadris
        ];
        
        // Desenhar linhas
        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            if (startPoint && endPoint && 
                startPoint.visibility > 0.3 && endPoint.visibility > 0.3) {
                
                ctx.beginPath();
                ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
                ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
                ctx.stroke();
            }
        });
        
        // Desenhar pontos principais (ombros, cotovelos, pulsos)
        const keyPoints = [11, 12, 13, 14, 15, 16];
        const pointNames = {
            11: 'OE', 12: 'OD', 13: 'CE', 14: 'CD', 15: 'PE', 16: 'PD'
        };
        
        keyPoints.forEach(idx => {
            const point = landmarks[idx];
            if (point && point.visibility > 0.3) {
                // Desenhar ponto maior
                ctx.beginPath();
                ctx.arc(
                    point.x * canvas.width,
                    point.y * canvas.height,
                    10,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
                
                // DEBUG: Desenhar label do ponto
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px monospace';
                ctx.fillText(
                    pointNames[idx],
                    point.x * canvas.width + 12,
                    point.y * canvas.height + 5
                );
                ctx.fillStyle = '#4ecca3';
            }
        });
        
        ctx.restore();
    }
    
    drawHands(landmarks) {
        const ctx = this.canvasCtx;
        const canvas = this.canvasElement;
        
        ctx.save();
        
        ctx.strokeStyle = '#ffe66d';
        ctx.fillStyle = '#ffe66d';
        ctx.lineWidth = 3;
        
        // Conexões da mão
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Polegar
            [0, 5], [5, 6], [6, 7], [7, 8], // Indicador
            [0, 9], [9, 10], [10, 11], [11, 12], // Médio
            [0, 13], [13, 14], [14, 15], [15, 16], // Anelar
            [0, 17], [17, 18], [18, 19], [19, 20], // Mínimo
            [5, 9], [9, 13], [13, 17] // Palma
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
            if (index === 0 || index === 4 || index === 8 || index === 12 || index === 16 || index === 20) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.fillText(
                    index,
                    point.x * canvas.width + 8,
                    point.y * canvas.height + 3
                );
                ctx.fillStyle = '#ffe66d';
            }
        });
        
        ctx.restore();
    }
    
    getLastLandmarks() {
        // Retornar landmarks do pose (prioridade) ou hands
        return this.previousPoseLandmarks || this.previousHandLandmarks;
    }
    
    stop() {
        this.isInitialized = false;
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}
