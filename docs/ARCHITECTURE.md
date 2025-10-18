# 🎨 Eco-Gesto - Visualização da Arquitetura

## 🌳 Estrutura de Arquivos

```
Eco-Gesto/
│
├── 📄 index.html                    Interface HTML principal
├── 🎨 styles.css                    Estilos CSS (gradientes, animações)
│
├── 📂 js/
│   ├── 🧠 main.js                   Orquestrador (EcoGestoSystem)
│   └── 📂 modules/
│       ├── 👁️  BodyTracker.js       Detecção gestual + MediaPipe
│       ├── 🔊 SoundEngine.js        Síntese sonora + Web Audio
│       ├── 🧬 EvolutionEngine.js    Algoritmos genéticos
│       └── 📊 VisualFeedback.js     Renderização Canvas
│
└── 📚 Documentação/
    ├── README.md                    Contexto original do projeto
    ├── QUICKSTART.md                Guia rápido 5min
    ├── INSTRUCTIONS.md              Manual completo
    ├── TECHNICAL.md                 Arquitetura detalhada
    ├── TESTING.md                   Testes e validação
    └── PROJECT_SUMMARY.md           Resumo executivo
```

## 🔄 Fluxo de Execução

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO INICIA SISTEMA                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   EcoGestoSystem.init   │
        │   - Criar módulos       │
        │   - Setup listeners     │
        └────────────┬────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌───────────┐  ┌──────────┐
│ Body     │  │ Sound     │  │ Visual   │
│ Tracker  │  │ Engine    │  │ Feedback │
│.init()   │  │.init()    │  │.init()   │
└──────────┘  └───────────┘  └──────────┘
     │              │              │
     └──────┬───────┴──────┬───────┘
            │              │
            ▼              ▼
      🎥 Webcam      🔊 AudioContext
      MediaPipe      Web Audio API
```

## 🖐️ Ciclo de Vida de um Gesto

```
    🎥 WEBCAM
    │
    ▼
┌─────────────────────────┐
│  MediaPipe Hands        │
│  - Detecta 21 pontos    │
│  - Tracking contínuo    │
└──────────┬──────────────┘
           │
           │ landmarks[]
           ▼
┌─────────────────────────┐
│  BodyTracker            │
│  .extractFeatures()     │
│  ┌───────────────────┐  │
│  │ position: {x,y}   │  │
│  │ velocity: number  │  │
│  │ amplitude: number │  │
│  │ direction: {x,y}  │  │
│  │ openness: number  │  │
│  │ energy: number    │  │
│  └───────────────────┘  │
└──────────┬──────────────┘
           │
           │ features
           ▼
┌─────────────────────────┐
│  BodyTracker            │
│  .classifyGestureType() │
│  ┌───────────────────┐  │
│  │ explosive         │  │
│  │ subtle            │  │
│  │ expansive         │  │
│  │ contracted        │  │
│  │ upward/downward   │  │
│  │ leftward/rightward│  │
│  └───────────────────┘  │
└──────────┬──────────────┘
           │
           │ gesture {type, features}
           ▼
┌─────────────────────────────────────┐
│  EcoGestoSystem                     │
│  .handleGesture()                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Decisão:                    │   │
│  │                             │   │
│  │ IF creatures >= 2 &&        │   │
│  │    time < 2s &&             │   │
│  │    random < 0.3             │   │
│  │ THEN: CRUZAMENTO            │   │
│  │ ELSE: NOVA CRIATURA         │   │
│  └────────┬────────────┬───────┘   │
│           │            │           │
└───────────┼────────────┼───────────┘
            │            │
     NOVA   │            │  CRUZAMENTO
            ▼            ▼
    ┌──────────┐  ┌─────────────┐
    │ Sound    │  │ Evolution   │
    │ Engine   │  │ Engine      │
    │          │  │             │
    │ create   │  │ select      │
    │ Creature │  │ Parents     │
    │ From     │◄─┤             │
    │ Gesture  │  │ crossover   │
    │          │  │             │
    │          │  │ mutate      │
    └────┬─────┘  └──────┬──────┘
         │                │
         └────────┬───────┘
                  │
                  │ creature {id, dna, ...}
                  ▼
        ┌─────────────────┐
        │  creatures[]    │
        │  Pool Global    │
        └────────┬────────┘
                 │
        ┌────────┼─────────┐
        │        │         │
        ▼        ▼         ▼
    🔊 Play  📊 Visual  📝 Update
    Sound    Feedback   UI List
```

## 🧬 Anatomia de uma Criatura Sonora

```javascript
creature = {
  // Identificação
  id: "creature_123",
  name: "Ignis-456",
  type: "explosive",
  
  // Temporalidade
  birthTime: 1634567890000,
  generation: 0,
  parents: null,  // ou [id1, id2]
  
  // DNA Sonoro
  dna: {
    // Tom base
    frequency: 440,        // Hz (200-800)
    
    // Volume
    volume: 0.4,          // (0.1-0.6)
    
    // Timbre
    waveType: "sawtooth", // sine|triangle|saw|square
    
    // Modulação (vibrato/tremolo)
    lfoRate: 4,           // Hz (0.5-8)
    lfoDepth: 100,        // Hz (10-200)
    
    // Espacialização
    pan: 0.3,             // (-1 a 1)
    
    // Envelope temporal
    envelope: {
      attack: 0.05,       // segundos
      decay: 0.2,
      sustain: 0.6,       // 0-1
      release: 0.3        // segundos
    },
    
    // Filtro (cor tímbrica)
    filterFreq: 1200,     // Hz (400-2000)
    filterQ: 5            // Ressonância
  },
  
  // Origem
  gestureOrigin: {
    position: {x: 0.5, y: 0.3},
    velocity: 0.05,
    amplitude: 0.2,
    // ...
  }
}
```

## 🔊 Cadeia de Áudio (Web Audio API)

```
┌─────────────┐
│ LFO         │ Oscilador de baixa frequência
│ (sine wave) │ Cria vibrato/tremolo
│ 0.5-8 Hz    │
└──────┬──────┘
       │ modulation
       ▼
┌─────────────────────────┐
│ Main Oscillator         │ Gerador de tom principal
│ (sine/saw/square/tri)   │
│ frequency ± lfoDepth    │
└──────────┬──────────────┘
           │ audio signal
           ▼
┌─────────────────────────┐
│ Biquad Filter           │ Moldador de timbre
│ (lowpass)               │
│ cutoff: 400-2000 Hz     │
│ Q: 5                    │
└──────────┬──────────────┘
           │ filtered audio
           ▼
┌─────────────────────────┐
│ Gain Node (ADSR)        │ Envelope de amplitude
│ attack → decay          │
│ sustain → release       │
└──────────┬──────────────┘
           │ enveloped audio
           ▼
┌─────────────────────────┐
│ Stereo Panner           │ Posicionamento estéreo
│ pan: -1 (L) → 1 (R)     │
└──────────┬──────────────┘
           │ spatialized audio
           ▼
┌─────────────────────────┐
│ Master Gain             │ Controle de volume geral
│ 0.3 (30%)               │
└──────────┬──────────────┘
           │
           ▼
      🔊 OUTPUT
```

## 🧬 Algoritmo de Cruzamento (Pseudocódigo)

```python
def crossover(parent1, parent2, gesture, mutationRate):
    offspring = new Creature()
    
    # Para cada gene do DNA
    for gene in DNA_PARAMETERS:
        
        # 1. HERANÇA (50/50)
        if random() < 0.5:
            value = parent1.dna[gene]
        else:
            value = parent2.dna[gene]
        
        # 2. MUTAÇÃO (probabilística)
        if random() < mutationRate:
            variation = value * random(-0.2, 0.2)  # ±20%
            value = value + variation
        
        # 3. INFLUÊNCIA GESTUAL (15%)
        gestureValue = mapGestureToGene(gesture, gene)
        value = blend(value, gestureValue, weight=0.15)
        
        offspring.dna[gene] = value
    
    # Metadados
    offspring.generation = max(parent1.gen, parent2.gen) + 1
    offspring.parents = [parent1.id, parent2.id]
    
    return offspring
```

## 📊 Sistema de Visualização

```
┌────────────────────────────────────────────────┐
│              INTERFACE PRINCIPAL               │
├────────────────────┬───────────────────────────┤
│                    │                           │
│  📹 WEBCAM         │  🌍 ECOSSISTEMA           │
│  + Overlay Pose    │                           │
│                    │   ⭕ ⭕ ⭕               │
│   🖐️ 👁️          │   Criaturas vivas         │
│                    │   (círculos pulsantes)    │
│                    │                           │
│                    ├───────────────────────────┤
│                    │                           │
│                    │  📋 LISTA CRIATURAS       │
│                    │  • Ignis-123 | 440Hz      │
│                    │  • Nimbus-456 | 220Hz     │
│                    │                           │
├────────────────────┴───────────────────────────┤
│                                                │
│  🎚️ CONTROLES                                 │
│  [Iniciar] [Limpar]                           │
│  Taxa Mutação: ━━━●━━ 0.10                    │
│  Max Criaturas: ━━━━●━ 5                      │
│                                                │
├────────────────────────────────────────────────┤
│                                                │
│  🌳 ÁRVORE GENEALÓGICA                         │
│                                                │
│       Gen 0:    ⭕     ⭕                      │
│                  │  ╲  │                      │
│       Gen 1:     │   ⭕ │                      │
│                  │     │                      │
│       Gen 2:     ⭕     ⭕                      │
│                                                │
└────────────────────────────────────────────────┘
```

## 🎯 Mapeamentos Visuais

### Cores por Tipo de Criatura

```
explosive   █ #ff6b6b  Vermelho (energia)
subtle      █ #4ecdc4  Ciano (calma)
expansive   █ #ffe66d  Amarelo (abertura)
contracted  █ #a8dadc  Azul claro (contenção)
upward      █ #95e1d3  Verde claro (ascensão)
downward    █ #5da2d5  Azul médio (descida)
hybrid      █ #c77dff  Roxo (mistura)
neutral     █ #b8b8ff  Lilás (neutro)
```

### Representação Visual de Criatura

```
      Nome
    ↓
  Ignis-456
      │
      ▼
    ⭕━━━  ← Círculo (cor = tipo)
   /  │  \    Tamanho = volume
  ╱   │   ╲   Pulsação = lfoRate
 ∿    ∿    ∿  Ondas = frequência
      │
      ▼
   Gen 2  ← Geração
```

## 🔄 Estados do Sistema

```
┌──────────────┐
│   INICIAL    │
│ (parado)     │
└──────┬───────┘
       │ click "Iniciar"
       ▼
┌──────────────┐
│  INICIANDO   │
│ - init cams  │
│ - load AI    │
└──────┬───────┘
       │ ready
       ▼
┌──────────────┐
│   ATIVO      │◄────────┐
│ - detectando │         │
│ - tocando    │         │
└──────┬───────┘         │
       │                 │
       │ gesto detectado │
       ▼                 │
┌──────────────┐         │
│  PROCESSANDO │         │
│ - criar/     │         │
│   cruzar     │         │
│ - tocar som  │         │
│ - visualizar │─────────┘
└──────┬───────┘
       │ click "Parar"
       ▼
┌──────────────┐
│   PARANDO    │
│ - stop sons  │
│ - clear pool │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   PARADO     │
└──────────────┘
```

## 💾 Estrutura de Dados em Memória

```javascript
EcoGestoSystem {
  // Estado
  isRunning: boolean,
  
  // Pools
  creatures: [
    creature1,
    creature2,
    ...
  ],
  
  genealogy: [
    {parents: [id1, id2], offspring: id3, timestamp},
    ...
  ],
  
  gestureHistory: [
    {gesture, creature, timestamp},
    ...
  ],
  
  // Config
  config: {
    maxCreatures: 5,
    mutationRate: 0.1,
    crossoverThreshold: 0.3,
    gestureTimeout: 2000
  },
  
  // Módulos
  bodyTracker: BodyTracker,
  soundEngine: SoundEngine,
  evolutionEngine: EvolutionEngine,
  visualFeedback: VisualFeedback
}
```

## 🔧 Pontos de Extensão

```
┌────────────────────────────────────┐
│  Adicionar Novo Tipo de Gesto     │
│  → BodyTracker.classifyGesture()  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Adicionar Parâmetro ao DNA        │
│  → SoundEngine.createCreature()    │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Novo Algoritmo Evolutivo          │
│  → EvolutionEngine.crossover()     │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Nova Visualização                 │
│  → VisualFeedback.drawX()          │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  Salvar/Carregar Estado            │
│  → EcoGestoSystem.serialize()      │
└────────────────────────────────────┘
```

---

**Legenda de Ícones**:
- 🎥 Webcam / Vídeo
- 👁️ Detecção Visual
- 🔊 Áudio / Som
- 🧬 Genética / Evolução
- 📊 Visualização / Gráficos
- 🎨 Interface / Design
- 🧠 Lógica / Processamento
- 📂 Estrutura / Organização
- 🔧 Configuração / Ajuste
- 🔄 Fluxo / Processo
- 💾 Dados / Memória
- ⚡ Rápido / Performance
