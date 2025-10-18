# 🔍 Guia de Debug de Detecção - Eco-Gesto

## O que você deve ver na tela

### ✅ Se a detecção estiver funcionando:

#### 🖐️ **Detecção de Mãos (Amarelo)**
- Esqueleto amarelo completo da mão
- Pontos numerados (0, 4, 8, 12, 16, 20)
- Linhas conectando os dedos
- Texto no topo: "👋 Mãos detectadas: 1" ou "2"

#### 💪 **Detecção de Braços (Verde)**
- Esqueleto verde no tronco e braços
- Pontos rotulados:
  - **OE**: Ombro Esquerdo
  - **OD**: Ombro Direito  
  - **CE**: Cotovelo Esquerdo
  - **CD**: Cotovelo Direito
  - **PE**: Pulso Esquerdo
  - **PD**: Pulso Direito
- Texto: "💪 Pose detectado: SIM"
- Texto: "👁️ Pontos visíveis: X/33"

### ❌ Se a detecção NÃO estiver funcionando:

Você verá apenas os textos:
- "👋 Mãos detectadas: 0"
- "⚠️ Pose não detectado"

**Nenhum esqueleto** amarelo ou verde aparece.

---

## 🛠️ Como Resolver Problemas de Detecção

### 1. 💡 **Iluminação**
O MediaPipe precisa de boa iluminação para funcionar!

**✅ O que fazer:**
- Fique de frente para uma janela ou luz
- Acenda luzes extras no ambiente
- Evite contra-luz (luz atrás de você)
- Evite sombras fortes no seu corpo

**❌ Evite:**
- Ambientes muito escuros
- Estar de costas para a luz principal
- Luz piscando (LEDs ruins)

### 2. 📏 **Distância e Enquadramento**

**✅ Para detecção de MÃOS:**
- Distância: 30-80cm da câmera
- Mostre a mão inteira (do pulso até as pontas dos dedos)
- Mão aberta funciona melhor que fechada
- Palma da mão virada para a câmera

**✅ Para detecção de BRAÇOS:**
- Distância: 1-2 metros da câmera
- Tronco inteiro no quadro (peito até cintura)
- Braços visíveis até os pulsos
- Posição: De frente para câmera

### 3. 🎨 **Contraste Visual**

**✅ O que ajuda:**
- Usar roupas que contrastem com o fundo
  - Fundo claro → roupa escura
  - Fundo escuro → roupa clara
- Pele exposta (braços visíveis)
- Fundo limpo e uniforme

**❌ Evite:**
- Roupas da mesma cor do fundo
- Fundos bagunçados ou complexos
- Padrões muito chamativos na roupa

### 4. 🎭 **Postura e Movimento**

**✅ Para MÃOS:**
- Abra e feche a mão
- Mostre os dedos separados
- Mantenha a mão no quadro
- Movimente suavemente (não rápido demais)

**✅ Para BRAÇOS:**
- Fique de frente para câmera
- Braços ligeiramente afastados do corpo
- Movimentos amplos e claros
- Evite girar muito o corpo

### 5. 🔧 **Configurações Técnicas**

**✅ Verificar:**
- Permissão de acesso à câmera concedida
- Câmera funcionando em outras aplicações
- Usar navegador atualizado (Chrome, Edge, Firefox)
- Conexão de internet estável (para carregar MediaPipe)

**⚙️ Thresholds atuais (já otimizados):**
```javascript
// Confiança mínima de detecção: 0.3 (baixo = mais fácil detectar)
// Confiança mínima de rastreamento: 0.3
// Velocidade mínima para criar criatura: 0.002 (braços) / 0.003 (mãos)
```

---

## 🧪 Testando a Detecção

### Teste 1: Verificar se MediaPipe está carregando
1. Abra o console do navegador (F12)
2. Procure por mensagens:
   - `✅ MediaPipe Hands configurado`
   - `✅ MediaPipe Pose configurado`
   - `✅ BodyTracker inicializado`

### Teste 2: Verificar detecção de mãos
1. Abra `test-detection.html`
2. Coloque a mão aberta perto da câmera (30-50cm)
3. Deve aparecer esqueleto amarelo
4. Veja o contador: "👋 Mãos detectadas: 1"

### Teste 3: Verificar detecção de braços
1. Afaste-se da câmera (1-1.5 metros)
2. Levante os braços na lateral (como um Y)
3. Deve aparecer esqueleto verde com labels
4. Veja: "👁️ Pontos visíveis: 10+" (quanto mais, melhor)

### Teste 4: Verificar geração de criaturas
1. No `index.html` ou `test-detection.html`
2. Faça movimentos amplos e rápidos
3. Console deve mostrar: "👋 GESTO DETECTADO (Mãos)!" ou "💪 GESTO DETECTADO (Braços)!"
4. Criatura deve ser gerada

---

## 📊 Interpretando as Métricas (test-detection.html)

### Velocidade
- **< 0.001**: Muito parado (não detecta)
- **0.002 - 0.005**: Movimento suave (detecta! ✅)
- **> 0.01**: Movimento rápido (detecta facilmente! ✅✅)

### Energia
- **< 0.02**: Baixa energia (gesto "sutil")
- **0.02 - 0.15**: Média energia (gesto "neutral")
- **> 0.15**: Alta energia (gesto "explosivo")

### Tipo de Gesto
- **explosive**: Rápido e energético
- **subtle**: Lento e suave
- **expansive**: Braços/mãos abertos
- **contracted**: Braços/mãos fechados
- **upward/downward**: Movimento vertical
- **leftward/rightward**: Movimento horizontal
- **neutral**: Padrão

---

## 🚨 Problemas Comuns e Soluções

### "Não vejo nenhum esqueleto"
→ MediaPipe não está detectando
→ Soluções: Melhorar iluminação, ajustar distância, aumentar contraste

### "Vejo esqueleto mas não gera criaturas"
→ Detecção OK, mas velocidade muito baixa
→ Solução: Fazer movimentos mais rápidos e amplos

### "Esqueleto pisca ou desaparece"
→ Iluminação inconsistente ou movimento muito rápido
→ Solução: Melhorar iluminação, movimentos mais suaves

### "Detecta mãos mas não braços"
→ Normal! Corpo muito próximo ou não está no quadro
→ Solução: Afastar da câmera para mostrar tronco completo

### "Detecta braços mas não mãos"
→ Normal! Mãos muito longe ou parcialmente ocultas
→ Solução: Aproximar mãos da câmera

---

## 🎯 Configuração IDEAL

```
📸 Câmera: Webcam HD (720p ou melhor)
💡 Iluminação: Luz natural ou 2-3 lâmpadas LED brancas
📏 Distância Mãos: 40-60cm
📏 Distância Braços: 1-1.5 metros
🎨 Fundo: Parede lisa, cor neutra
👕 Roupa: Contraste com o fundo
⚡ Movimento: Amplo, suave, deliberado
```

---

## 🆘 Ainda não funciona?

1. **Tente em outro navegador** (Chrome recomendado)
2. **Tente com outra câmera** (externa se disponível)
3. **Verifique console por erros** (F12 → Console)
4. **Teste em local MUITO bem iluminado** (próximo à janela de dia)
5. **Verifique se outras aplicações conseguem usar a câmera**

### Logs importantes no console:
```javascript
// ✅ Bom:
"📊 Features (Hands): velocity: 0.0045"
"👋 GESTO DETECTADO (Mãos)! expansive"

// ⚠️ Problema:
"Erro ao inicializar BodyTracker"
"Failed to load MediaPipe"
"NotAllowedError: Permission denied"
```

---

**Última atualização**: Sistema otimizado para detecção máxima!
- Thresholds reduzidos
- Visualização debug ativada
- Confiança mínima: 0.3
- Detecção híbrida (mãos + braços)
