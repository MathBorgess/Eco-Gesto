# 🌱 Eco-Gesto - Instruções de Uso

## Instalação e Execução

### Opção 1: Servidor Local Simples

```bash
# Usando Python 3
python3 -m http.server 8000

# Usando Python 2
python -m SimpleHTTPServer 8000

# Usando Node.js (se tiver npx)
npx http-server -p 8000
```

Depois acesse: `http://localhost:8000`

### Opção 2: VS Code Live Server

1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

## Como Usar o Sistema

### 1. Inicialização

1. Abra a aplicação no navegador
2. Permita acesso à webcam quando solicitado
3. Clique em "Iniciar Sistema"
4. Aguarde a detecção da câmera e carregamento do MediaPipe

### 2. Gerando Criaturas Sonoras

#### Criar Nova Criatura Original
Faça um gesto com a mão em frente à câmera. O tipo de gesto influencia o "DNA" da criatura:

- **Gesto Rápido** → Criatura aguda e energética (onda sawtooth)
- **Gesto Lento** → Criatura grave e suave (onda sine)
- **Mão Aberta** → Criatura expansiva (onda triangle)
- **Mão Fechada** → Criatura contraída (onda square)
- **Movimento Vertical** → Afeta o pitch (grave ↓ / agudo ↑)
- **Movimento Horizontal** → Afeta o pan (esquerda ← / direita →)

#### Criar Criatura Híbrida (Cruzamento)
Faça gestos consecutivos rápidos (menos de 2 segundos entre eles):
- O sistema automaticamente cruza duas criaturas existentes
- O novo gesto influencia 15% do DNA do híbrido
- O híbrido herda características dos "pais"

### 3. Parâmetros de Controle

#### Taxa de Mutação (0 - 1.0)
- **Baixa (0.0 - 0.2)**: Híbridos muito similares aos pais
- **Média (0.2 - 0.5)**: Variações interessantes mantendo coerência
- **Alta (0.5 - 1.0)**: Mutações significativas, mais experimentação

#### Máx. Criaturas (1 - 10)
- Define quantas criaturas podem coexistir
- Quando atingir o limite, criaturas mais antigas são removidas
- Mais criaturas = ecossistema mais complexo

### 4. Visualizações

#### Área de Vídeo (esquerda)
- Mostra feed da webcam
- Overlay com pontos detectados da mão
- Conexões entre os pontos formam esqueleto da mão

#### Ecossistema (direita superior)
- Cada círculo = uma criatura ativa
- Tamanho = volume da criatura
- Cor = tipo de gesto que gerou
- Pulsação = taxa de LFO/modulação
- Ondas = visualização da frequência

#### Lista de Criaturas (direita inferior)
- Nome e parâmetros de cada criatura
- Frequência (Hz) do tom base
- Volume
- Geração (0 = original, 1+ = híbrido)

#### Árvore Genealógica (inferior)
- Visualiza linhagem das criaturas
- Linhas conectam pais → filhos
- Cores indicam tipos de criaturas
- Organizadas por geração (de cima para baixo)

## Mapeamento Gesto → Som

### DNA de uma Criatura Sonora

Cada criatura possui um "genoma" sonoro com os seguintes parâmetros:

```javascript
{
  frequency: 200-800 Hz,      // Pitch base (posição Y do gesto)
  volume: 0.1-0.6,            // Amplitude (energia do gesto)
  waveType: sine/triangle/    // Timbre (tipo de gesto)
            sawtooth/square,
  lfoRate: 0.5-8 Hz,          // Velocidade modulação (velocidade do gesto)
  lfoDepth: 10-200 Hz,        // Profundidade modulação (amplitude do gesto)
  pan: -1 a 1,                // Esquerda/direita (posição X do gesto)
  envelope: {                 // Formato temporal do som
    attack: 0.05-0.5s,
    decay: 0.2s,
    sustain: 0.6,
    release: 0.3-1s
  },
  filterFreq: 400-2000 Hz,    // Corte do filtro (abertura da mão)
  filterQ: 5                  // Ressonância do filtro
}
```

### Algoritmo de Cruzamento

Quando duas criaturas se reproduzem:

1. **Seleção de Pais**: Escolhe as 2 criaturas mais "aptas" (recentes e com características interessantes)

2. **Cruzamento Genético**: 
   - Cada parâmetro é herdado aleatoriamente de um dos pais
   - 50% de chance de vir do pai 1 ou pai 2

3. **Mutação**:
   - Cada parâmetro tem chance de sofrer mutação (taxa configurável)
   - Mutação adiciona variação de ±20% do valor

4. **Influência Gestual**:
   - Gesto atual influencia 15% do DNA final
   - Permite "direcionar" a evolução através de gestos

5. **Geração**:
   - Híbrido recebe geração = max(pais) + 1
   - Permite rastrear "idade evolutiva"

## Conceitos Testados

### ✅ Mapeamento Gestual-Sonoro
- Relação direta e compreensível entre movimento e som
- Diferentes gestos produzem timbres distintos
- Posição espacial mapeia para parâmetros sonoros

### ✅ Evolução/Aleatoriedade Controlada
- Gestos consecutivos cruzam criaturas existentes
- Mutações adicionam variedade mantendo coerência
- Performer influencia direção da evolução

### ✅ Causalidade e Feedback
- Feedback visual imediato (círculos pulsantes)
- Visualização da árvore genealógica
- Lista de criaturas ativas com parâmetros

### ✅ Narrativa Gestual
- Sensação de "criar vida" através de gestos
- Progressão através de gerações
- História visível da performance

## Limitações Conhecidas

1. **Detecção Gestual**:
   - Requer boa iluminação
   - Melhor com fundo simples
   - Detecção pode ser instável em movimento muito rápido

2. **Síntese Sonora**:
   - Timbres básicos (Web Audio API simples)
   - Sem samples ou síntese complexa
   - Limite de polifonia (10 criaturas simultâneas)

3. **Performance**:
   - Pode ter latência em máquinas mais lentas
   - Canvas pode ter FPS baixo com muitas criaturas

4. **UX**:
   - Sem controle individual de criaturas
   - Não é possível "salvar" ecossistemas
   - Sem modo de gravação/replay

## Melhorias Futuras

- [ ] Adicionar mais tipos de síntese (FM, granular)
- [ ] Permitir salvar/carregar ecossistemas
- [ ] Modo de gravação e exportação de áudio
- [ ] Detecção de corpo inteiro (não só mãos)
- [ ] Múltiplos performers simultâneos
- [ ] Visualizações 3D do ecossistema
- [ ] Sistema de "morte" de criaturas por inatividade
- [ ] Interações entre criaturas (competição/simbiose)

## Solução de Problemas

### Webcam não funciona
- Verifique permissões do navegador
- Use HTTPS ou localhost (HTTP bloqueia câmera)
- Teste em navegador diferente (Chrome recomendado)

### Sem som
- Verifique volume do sistema
- Clique em "Iniciar Sistema" (Audio Context precisa de interação)
- Verifique console para erros

### Detecção instável
- Melhore iluminação do ambiente
- Use fundo mais uniforme
- Ajuste posição da câmera

### Performance ruim
- Reduza número máximo de criaturas
- Feche outras abas/aplicações
- Use navegador mais recente

## Tecnologias Utilizadas

- **MediaPipe Hands**: Detecção de mãos em tempo real
- **Web Audio API**: Síntese sonora nativa do navegador
- **HTML5 Canvas**: Visualizações gráficas
- **JavaScript ES6 Modules**: Arquitetura modular

## Créditos

Desenvolvido como protótipo de baixa fidelidade para sistema de composição corporal com criaturas sonoras evolutivas.

Conceitos inspirados em:
- Sistemas de vida artificial
- Algoritmos genéticos
- Performance audiovisual interativa
- Ecologia sonora
