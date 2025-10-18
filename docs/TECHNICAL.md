# 🧬 Eco-Gesto - Documentação Técnica

## Arquitetura do Sistema

```
Eco-Gesto/
├── index.html              # Interface principal
├── styles.css              # Estilos visuais
├── js/
│   ├── main.js            # Orquestrador principal (EcoGestoSystem)
│   └── modules/
│       ├── BodyTracker.js      # Detecção gestual
│       ├── SoundEngine.js      # Síntese sonora
│       ├── EvolutionEngine.js  # Algoritmos evolutivos
│       └── VisualFeedback.js   # Visualizações
├── README.md              # Documentação do contexto
└── INSTRUCTIONS.md        # Guia de uso
```

## Fluxo de Dados

```
┌─────────────────┐
│   WebCam Feed   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  BodyTracker    │ ◄── MediaPipe Hands API
│  - detectPoses  │
│  - extract      │
│    Features     │
│  - classify     │
│    GestureType  │
└────────┬────────┘
         │
         │ gesture {type, features, landmarks}
         ▼
┌─────────────────────────────────────────┐
│        EcoGestoSystem (main.js)         │
│  ┌──────────────────────────────────┐   │
│  │  handleGesture()                 │   │
│  │  - Decide: New or Crossover?     │   │
│  │  - Maintain creature limit       │   │
│  │  - Update history                │   │
│  └──────┬────────────────┬──────────┘   │
│         │                │               │
│         │ novo           │ cruzar        │
│         ▼                ▼               │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │ SoundEngine  │  │ EvolutionEngine │  │
│  │ create       │  │ - selectParents │  │
│  │ Creature     │  │ - crossover     │  │
│  │ FromGesture  │  │ - mutate        │  │
│  └──────┬───────┘  └────────┬────────┘  │
│         │                   │            │
│         │ creature          │ offspring  │
│         └───────┬───────────┘            │
│                 ▼                        │
│         ┌──────────────┐                 │
│         │  creatures[] │                 │
│         │     pool     │                 │
│         └──────┬───────┘                 │
│                │                         │
└────────────────┼─────────────────────────┘
                 │
                 ├──► SoundEngine.playCreature()
                 │    └─► Web Audio API (oscillators, filters, LFO)
                 │
                 └──► VisualFeedback
                      ├─► drawPose()
                      ├─► drawEcosystem()
                      └─► drawGenealogy()
```

## Módulos Detalhados

### 1. BodyTracker.js

**Responsabilidade**: Captura e análise de gestos corporais

**Dependências**:
- MediaPipe Hands
- getUserMedia API

**Métodos Principais**:
```javascript
async init()
  // Inicializa MediaPipe e webcam

async setupCamera()
  // Configura stream de vídeo

extractGestureFeatures(landmarks)
  // Retorna: {position, velocity, amplitude, direction, openness, energy}

classifyGestureType(features)
  // Retorna: 'explosive' | 'subtle' | 'expansive' | 'contracted' | etc
```

**Features Extraídas**:
- `position {x, y}`: Centro da mão (0-1)
- `velocity`: Velocidade do movimento
- `amplitude`: Dispersão espacial da mão
- `direction {x, y}`: Vetor de direção
- `openness`: Distância polegar-mindinho
- `energy`: Combinação velocidade × amplitude

### 2. SoundEngine.js

**Responsabilidade**: Criar e gerenciar criaturas sonoras

**Dependências**:
- Web Audio API

**Estrutura do DNA Sonoro**:
```javascript
{
  frequency: number,      // Hz (200-800)
  volume: number,         // 0-1
  waveType: string,       // 'sine' | 'triangle' | 'sawtooth' | 'square'
  lfoRate: number,        // Hz (0.5-8)
  lfoDepth: number,       // Hz (10-200)
  pan: number,            // -1 a 1
  envelope: {
    attack: number,       // segundos
    decay: number,
    sustain: number,      // 0-1
    release: number       // segundos
  },
  filterFreq: number,     // Hz (400-2000)
  filterQ: number         // 0-20
}
```

**Métodos Principais**:
```javascript
createCreatureFromGesture(gesture)
  // Gera DNA baseado em features do gesto
  // Retorna: creature object

playCreature(creature)
  // Inicia síntese sonora com Web Audio API
  // Cria: oscillator → filter → gain → pan → master

stopCreature(creatureId)
  // Para som com fade out suave
```

**Cadeia de Áudio**:
```
LFO (modulação)
    │
    ▼
Oscillator (tom base) → Filter (timbre) → Gain (ADSR) → Pan → Master → Output
```

### 3. EvolutionEngine.js

**Responsabilidade**: Algoritmos genéticos para reprodução

**Métodos Principais**:
```javascript
selectParents(creatures)
  // Seleciona 2 criaturas com maior fitness
  // Fitness = f(idade, volume, variedade)

crossover(parent1, parent2, currentGesture, mutationRate)
  // Cruzamento genético:
  // 1. Herdar parâmetros de pais (50/50)
  // 2. Aplicar mutações (taxa configurável)
  // 3. Influenciar com gesto atual (15%)
  // Retorna: offspring

mutate(value, mutationRate)
  // Adiciona variação ±20% com probabilidade mutationRate

calculateFitness(creature)
  // Score baseado em: idade, volume, variedade frequência
```

**Algoritmo de Crossover**:
```python
for each parameter in DNA:
    # Herança
    value = random_choice(parent1[param], parent2[param])
    
    # Mutação
    if random() < mutationRate:
        value += value * random(-0.2, 0.2)
    
    # Influência gestual
    gestureValue = mapGestureToParameter(currentGesture, param)
    value = blend(value, gestureValue, 0.15)
    
    offspring[param] = value
```

### 4. VisualFeedback.js

**Responsabilidade**: Renderização visual do sistema

**Canvas Utilizados**:
- `poseCanvas`: Overlay na webcam com landmarks
- `ecosystemCanvas`: Visualização das criaturas ativas
- `genealogyCanvas`: Árvore genealógica

**Métodos Principais**:
```javascript
drawPose(landmarks)
  // Desenha esqueleto da mão detectada

drawEcosystem(creatures)
  // Círculos pulsantes representando criaturas
  // - Tamanho = volume
  // - Cor = tipo
  // - Pulsação = lfoRate
  // - Ondas = frequência

drawGenealogy(genealogy, creatures)
  // Árvore visual da linhagem
  // - Nós = criaturas
  // - Linhas = relações pais-filhos
  // - Layout por geração
```

**Esquema de Cores**:
```javascript
{
  explosive: '#ff6b6b',   // Vermelho
  subtle: '#4ecdc4',      // Ciano
  expansive: '#ffe66d',   // Amarelo
  contracted: '#a8dadc',  // Azul claro
  hybrid: '#c77dff',      // Roxo
  // ...
}
```

### 5. main.js (EcoGestoSystem)

**Responsabilidade**: Orquestração e lógica principal

**Estado do Sistema**:
```javascript
{
  creatures: [],        // Pool de criaturas vivas
  genealogy: [],        // Histórico de cruzamentos
  gestureHistory: [],   // Gestos detectados
  config: {
    maxCreatures: 5,
    mutationRate: 0.1,
    crossoverThreshold: 0.3,
    gestureTimeout: 2000
  }
}
```

**Lógica de Cruzamento vs Criação**:
```javascript
if (creatures.length >= 2 && 
    timeSinceLastGesture < 2000ms &&
    random() < 0.3) {
    // CRUZAMENTO
    offspring = breedCreatures(gesture)
} else {
    // NOVA CRIATURA
    creature = createFromGesture(gesture)
}
```

## Parâmetros de Configuração

### Mapeamentos Gesto → Som

| Feature do Gesto | Parâmetro Sonoro | Range Entrada | Range Saída |
|------------------|------------------|---------------|-------------|
| position.y       | frequency        | 0 → 1         | 800 → 200 Hz |
| energy           | volume           | 0 → 1         | 0.1 → 0.6 |
| velocity         | lfoRate          | 0 → 0.1       | 0.5 → 8 Hz |
| amplitude        | lfoDepth         | 0 → 0.5       | 10 → 200 Hz |
| position.x       | pan              | 0 → 1         | -1 → 1 |
| openness         | filterFreq       | 0 → 0.5       | 400 → 2000 Hz |
| velocity         | attack           | 0 → 0.1       | 0.5 → 0.05 s |
| energy           | release          | 0 → 1         | 1 → 0.3 s |

### Tipos de Gesto e Timbres

| Tipo Gesto   | Condição                    | WaveType  |
|--------------|-----------------------------|-----------
| explosive    | energy > 0.5                | sawtooth  |
| subtle       | energy < 0.1                | sine      |
| expansive    | openness > 0.3              | triangle  |
| contracted   | openness < 0.15             | square    |
| upward       | abs(dir.y) > abs(dir.x)*1.5 | -         |
| downward     | (e dir.y > 0)               | -         |
| leftward     | abs(dir.x) > abs(dir.y)*1.5 | -         |
| rightward    | (e dir.x > 0)               | -         |

## Performance e Otimizações

### Latência Esperada
- **Detecção de Gesto**: ~50-100ms (MediaPipe)
- **Síntese Sonora**: <10ms (Web Audio API)
- **Renderização Visual**: 16ms (60 FPS)
- **Total**: ~80-130ms

### Limites Recomendados
- Max criaturas simultâneas: 5-10
- Taxa de amostragem áudio: 44100 Hz
- FPS mínimo: 30 (aceitável), 60 (ideal)

### Gargalos Conhecidos
1. MediaPipe em CPU lenta
2. Muitos oscillators simultâneos
3. Canvas rendering com muitas criaturas

## Extensibilidade

### Adicionar Novo Tipo de Gesto

```javascript
// Em BodyTracker.js
classifyGestureType(features) {
    // ... código existente ...
    
    // Novo tipo
    if (features.customCondition) {
        return 'customGesture';
    }
}

// Em SoundEngine.js
selectWaveType(gestureType, features) {
    // ... código existente ...
    
    case 'customGesture':
        return 'customWave';
}

// Em VisualFeedback.js
this.colors = {
    // ... cores existentes ...
    customGesture: '#hexcolor'
}
```

### Adicionar Novo Parâmetro ao DNA

```javascript
// Em SoundEngine.js
createCreatureFromGesture(gesture) {
    const dna = {
        // ... parâmetros existentes ...
        newParameter: this.mapRange(
            gesture.features.someFeature,
            inputMin, inputMax,
            outputMin, outputMax
        )
    }
}

// Em EvolutionEngine.js
crossover(parent1, parent2, ...) {
    // O algoritmo já itera por todos os parâmetros
    // Automaticamente incluirá o novo parâmetro
}
```

## Testes Sugeridos

### Funcionais
- [ ] Detecção de mão em diferentes iluminações
- [ ] Cruzamento gera híbridos coerentes
- [ ] Limite de criaturas funciona corretamente
- [ ] Sons param suavemente sem clicks

### Performance
- [ ] FPS > 30 com 10 criaturas
- [ ] Latência < 150ms total
- [ ] Sem memory leaks após 5min uso

### UX
- [ ] Mapeamentos são intuitivos
- [ ] Feedback visual é claro
- [ ] Controles respondem corretamente

## Troubleshooting

### Console vazio após iniciar
- Verifique permissões de webcam no navegador

### Erro "MediaPipe não carregou"
- Verifique conexão com CDN
- Use navegador compatível (Chrome recomendado)

### Sons com clicks/pops
- Problema no envelope (attack/release muito curtos)
- Ajuste `dna.envelope` para transições mais suaves

### Genealogia não aparece
- Precisa ter pelo menos 1 cruzamento
- Verifique se `genealogy[]` está sendo populado

## Referências

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Algoritmos Genéticos](https://en.wikipedia.org/wiki/Genetic_algorithm)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
