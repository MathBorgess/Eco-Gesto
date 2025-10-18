# 🌱 Eco-Gesto

Sistema de **composição corporal** onde gestos criam e evoluem **criaturas sonoras** através de algoritmos evolutivos.

## 🎯 Conceito

Cada gesto da mão cria uma "criatura sonora" com DNA único. Gestos consecutivos cruzam essas criaturas, gerando híbridos evolutivos.

```
🖐️ Gesto → 🧬 Criatura Sonora → 🎵 Som Sintetizado
🖐️ + 🖐️ → 🧬 Cruzamento → 👶 Criatura Híbrida
```

## ⚡ Início Rápido

```bash
# Execute um servidor local
python3 -m http.server 8000

# Abra no navegador
# http://localhost:8000
```

1. Permita acesso à webcam
2. Clique em "Iniciar Sistema"
3. Faça gestos com a mão → Ouça suas criaturas! 🎵

## 📚 Documentação

- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido de 5 minutos
- **[INSTRUCTIONS.md](INSTRUCTIONS.md)** - Manual completo de uso
- **[TECHNICAL.md](TECHNICAL.md)** - Documentação técnica da arquitetura

## 🎨 O Que Faz

### Mapeamento Gestual-Sonoro
- **Posição Y**: Controla pitch (grave/agudo)
- **Posição X**: Controla pan (esquerda/direita)
- **Velocidade**: Afeta LFO e envelope
- **Amplitude**: Controla volume e profundidade
- **Tipo de gesto**: Define timbre (sine, saw, square, triangle)

### Evolução Sonora
- Gestos consecutivos cruzam criaturas existentes
- Algoritmos genéticos criam híbridos únicos
- Mutações adicionam variações controladas
- Árvore genealógica visual das linhagens

### Feedback Visual
- **Detecção em tempo real** da mão
- **Visualização do ecossistema** (círculos pulsantes)
- **Árvore genealógica** das criaturas
- **Informações de DNA** de cada criatura

## 🛠️ Tecnologias

- **MediaPipe Hands** - Detecção gestual
- **Web Audio API** - Síntese sonora
- **HTML5 Canvas** - Visualizações
- **JavaScript ES6 Modules** - Arquitetura modular

## 📁 Estrutura

```
Eco-Gesto/
├── index.html              # Interface principal
├── styles.css              # Estilos visuais
├── js/
│   ├── main.js            # Orquestrador principal
│   └── modules/
│       ├── BodyTracker.js      # Detecção gestual (MediaPipe)
│       ├── SoundEngine.js      # Síntese sonora (Web Audio)
│       ├── EvolutionEngine.js  # Algoritmos genéticos
│       └── VisualFeedback.js   # Visualizações (Canvas)
└── docs/
    ├── QUICKSTART.md      # Guia rápido
    ├── INSTRUCTIONS.md    # Manual completo
    └── TECHNICAL.md       # Documentação técnica
```

## 🎯 Conceitos Testados

✅ **Mapeamento Gestual-Sonoro**: Relação clara entre movimento e som  
✅ **Evolução Controlada**: Cruzamentos e mutações mantêm coerência  
✅ **Causalidade e Feedback**: Respostas visuais e sonoras imediatas  
✅ **Narrativa Gestual**: Sensação de "compor" através de gestos  

## 🧬 Como Funciona

### 1. Detecção (BodyTracker)
```javascript
Webcam → MediaPipe Hands → Features {
  position, velocity, amplitude, 
  direction, openness, energy
}
```

### 2. Mapeamento (SoundEngine)
```javascript
Features → DNA Sonoro {
  frequency, volume, waveType,
  lfoRate, lfoDepth, pan,
  envelope, filterFreq
}
```

### 3. Evolução (EvolutionEngine)
```javascript
Parent1 + Parent2 + CurrentGesture → 
  Crossover + Mutation → 
    Offspring
```

### 4. Visualização (VisualFeedback)
```javascript
Sistema → Canvas {
  Pose Detection,
  Ecosystem View,
  Genealogy Tree
}
```

## 🎮 Controles

- **Taxa de Mutação**: 0.0 (conservador) ↔ 1.0 (experimental)
- **Máx. Criaturas**: 1-10 criaturas simultâneas
- **Limpar Ecossistema**: Remove todas as criaturas

## 🌟 Recursos

- ✨ Criaturas originais geradas por gestos únicos
- 🧬 Cruzamento genético com herança de características
- 🎲 Mutações aleatórias controladas
- 📊 Visualização em tempo real do ecossistema
- 🌳 Árvore genealógica das linhagens
- 🎵 Síntese sonora responsiva e expressiva

## 🐛 Requisitos

- **Navegador**: Chrome/Edge (recomendado), Firefox, Safari
- **Câmera**: Webcam funcional
- **Iluminação**: Ambiente bem iluminado
- **Conexão**: Internet (para CDNs do MediaPipe)

## 📝 Limitações

- Protótipo de **baixa fidelidade** (funcionalidade > polimento)
- Síntese sonora básica (oscillators simples)
- Detecção gestual simplificada mas funcional
- Sem persistência de estado (não salva ecossistemas)

## 🔮 Melhorias Futuras

- [ ] Síntese avançada (FM, granular, samples)
- [ ] Detecção de corpo inteiro
- [ ] Múltiplos performers
- [ ] Salvar/carregar ecossistemas
- [ ] Gravação e exportação de áudio
- [ ] Interações entre criaturas
- [ ] Modo de "morte" por inatividade

## 👨‍💻 Desenvolvimento

Este é um protótipo experimental focado em testar a metáfora de **criaturas sonoras evolutivas** controladas por gestos corporais.

### Módulos Principais

1. **BodyTracker**: Captura gestos e extrai features
2. **SoundEngine**: Cria e gerencia criaturas sonoras
3. **EvolutionEngine**: Implementa algoritmos genéticos
4. **VisualFeedback**: Renderiza visualizações

### Extensibilidade

O sistema é modular e fácil de estender:
- Adicionar novos tipos de gestos
- Criar novos parâmetros sonoros
- Implementar novos algoritmos evolutivos
- Expandir visualizações

## 📄 Licença

Projeto educacional/experimental - Use livremente!

## 🤝 Contribuições

Sugestões, melhorias e feedback são bem-vindos!

---

**Conceito**: Ecossistema de criaturas sonoras evolutivas  
**Interação**: Gestos corporais em tempo real  
**Tecnologia**: Web (MediaPipe + Web Audio API)  
**Foco**: Protótipo de baixa fidelidade

🌱 Crie, evolua e componha seu ecossistema sonoro! 🎵
