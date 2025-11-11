# 🌱 Eco-Gesto

## Ecossistema de Criaturas Sonoras Evolutivas

Um sistema interativo de composição corporal onde **gestos do performer geram e evoluem texturas sonoras vivas** em tempo real. Cada movimento não produz apenas um som, mas cria uma **criatura sonora autônoma** que evolui, muta e pode cruzar com outras criaturas, formando um ecossistema generativo.

---

## 🎯 Conceito

O **Eco-Gesto** transforma o performer em um **cultivador de jardim sonoro**:

- 🌱 Cada gesto é uma **semente** que gera uma criatura sonora
- 🧬 Criaturas têm **DNA sonoro** (frequência, timbre, envelope, modulação)
- 🔄 Criaturas **evoluem autonomamente** através de mutação
- 👥 Criaturas podem **cruzar** gerando híbridos
- ⏳ Criaturas têm **ciclo de vida** (nascem, vivem, morrem)
- 🎨 Sistema cria **soundscapes emergentes** imprevisíveis

### Metáfora Central

```
Gesto → Criatura Sonora → Ecossistema → Evolução → Paisagem Sonora
```

---

## ✨ Características

### 🎭 Interação Corporal

- Detecção via **webcam** (sem hardware especial)
- **MediaPipe Hands** + **MediaPipe Pose** para captura
- Reconhece: mãos, braços, torso
- Classifica gestos: explosivo, sutil, expansivo, contraído, direcional

### 🎵 Síntese Sonora Evolutiva

- **Web Audio API** para síntese em tempo real
- Osciladores (sine, square, sawtooth, triangle)
- Filtros passa-baixa com ressonância
- Envelope ADSR completo
- Modulação de frequência (FM)
- Pan estéreo

### 🧬 Algoritmos Evolutivos

- **Genoma sonoro** extraído de features gestuais
- **Mutação** com taxa configurável
- **Cruzamento genético** entre criaturas
- **Seleção natural** (limite populacional)
- **Árvore genealógica** visual

### 🎨 Feedback Visual

- Esqueleto corporal em tempo real (verde/amarelo)
- Visualização do ecossistema de criaturas
- Árvore genealógica evolutiva
- Métricas de detecção em tempo real

---

## 🚀 Como Usar

### Instalação

**Zero instalação necessária!** Sistema roda no navegador.

1. Clone o repositório:

```bash
git clone https://github.com/MathBorgess/Eco-Gesto.git
cd Eco-Gesto
```

2. Inicie um servidor HTTP:

```bash
python3 -m http.server 8000
```

3. Abra no navegador:

```
http://localhost:8000
```

### Uso Rápido

1. **Clique em "Iniciar Sistema"**
2. **Permita acesso à câmera**
3. **Faça gestos!**
   - Movimentos amplos e rápidos → sons explosivos
   - Movimentos suaves e lentos → sons sutis
   - Braços abertos → sons expansivos
   - Mãos agitadas → criaturas energéticas

### Controles

- **Taxa de Mutação**: Quanto as criaturas evoluem (0-100%)
- **Máx. Criaturas**: Limite populacional (1-10)
- **Limpar Ecossistema**: Reset completo

---

## 📁 Estrutura do Projeto

```
Eco-Gesto/
├── index.html              # Aplicação principal
├── styles.css              # Estilos
├── README.md               # Este arquivo
│
├── js/
│   ├── main.js                    # Orquestrador do sistema
│   └── modules/
│       ├── BodyTracker.js         # Detecção gestual (MediaPipe)
│       ├── SoundEngine.js         # Síntese sonora (Web Audio)
│       ├── EvolutionEngine.js     # Algoritmos evolutivos
│       └── VisualFeedback.js      # Visualização
│
├── docs/                          # 📚 Documentação completa
│   ├── QUICKSTART.md              # Guia rápido de uso
│   ├── INSTRUCTIONS.md            # Instruções detalhadas
│   ├── TECHNICAL.md               # Documentação técnica
│   ├── ARCHITECTURE.md            # Arquitetura do sistema
│   ├── TESTING.md                 # Guia de testes
│   ├── TROUBLESHOOTING.md         # Resolução de problemas
│   ├── DETECCAO-DEBUG.md          # Debug de detecção
│   ├── TROUBLESHOOTING-MEDIAPIPE.md # Problemas com MediaPipe
│   ├── PROJECT_SUMMARY.md         # Resumo do projeto
│   ├── INDEX.md                   # Índice da documentação
│   ├── REFINAMENTO-DA-IDEIA.md    # 🎯 Como chegamos aqui
│   │
│   └── 🆕 Music.AI Integration (v2.0)
│       ├── MUSICAI_INTEGRATION_PLAN.md    # Plano completo
│       ├── MUSICAI_INTEGRATION_SPEC.md    # Especificação técnica
│       ├── QUICKSTART_MUSICAI.md          # Setup rápido
│       ├── QUALITY_CHECKLIST.md           # Checklist de qualidade
│       ├── EXECUTIVE_SUMMARY.md           # Resumo executivo
│       └── ROADMAP_VISUAL.md              # Timeline visual
│
└── debug/                         # 🔧 Ferramentas de debug
    ├── test-detection.html        # Teste de detecção
    ├── debug.html                 # Debug completo
    └── diagnostico.html           # Diagnóstico do sistema
```

---

## 📚 Documentação

### Guias de Uso

- **[QUICKSTART.md](docs/QUICKSTART.md)** - Comece aqui!
- **[INSTRUCTIONS.md](docs/INSTRUCTIONS.md)** - Manual completo
- **[INDEX.md](docs/INDEX.md)** - Índice de toda documentação

### Documentação Técnica

- **[TECHNICAL.md](docs/TECHNICAL.md)** - Detalhes técnicos
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura do sistema
- **[TESTING.md](docs/TESTING.md)** - Como testar

### Troubleshooting

- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Problemas gerais
- **[DETECCAO-DEBUG.md](docs/DETECCAO-DEBUG.md)** - Debug de detecção
- **[TROUBLESHOOTING-MEDIAPIPE.md](docs/TROUBLESHOOTING-MEDIAPIPE.md)** - MediaPipe

### Contexto do Projeto

- **[REFINAMENTO-DA-IDEIA.md](docs/REFINAMENTO-DA-IDEIA.md)** - 🎯 **Como saímos da ideia original para a implementação**
- **[PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)** - Resumo executivo

---

## 🔧 Ferramentas de Debug

### [debug/diagnostico.html](debug/diagnostico.html)

Sistema de diagnóstico automático que verifica:

- ✅ Navegador compatível
- ✅ MediaPipe carregado
- ✅ Câmera funcionando
- ✅ Sistema inicializado

### [debug/test-detection.html](debug/test-detection.html)

Teste focado em detecção:

- Métricas em tempo real
- Log de gestos detectados
- Visualização de velocidade/energia

### [debug/debug.html](debug/debug.html)

Debug completo com console interativo

---

## 🎓 Conceitos Implementados

### 1. **Síntese Sonora Paramétrica**

- Osciladores (sine, square, sawtooth, triangle)
- Filtros com Q ajustável
- Envelope ADSR
- Modulação FM
- Pan estéreo

### 2. **Algoritmos Evolutivos**

- Genoma (representação genética)
- Mutação (taxa configurável)
- Cruzamento (recombinação genética)
- Seleção natural (limite populacional)

### 3. **Motion Capture**

- MediaPipe Pose (33 landmarks corporais)
- MediaPipe Hands (21 landmarks por mão)
- Extração de features: velocidade, amplitude, direção, energia
- Classificação gestual automática

### 4. **Sistemas Complexos**

- Emergência de comportamento
- Auto-organização
- Imprevisibilidade controlada
- Narrativa generativa

---

## 🌟 Tecnologias

### Core

- **HTML5 Canvas** - Visualização
- **Web Audio API** - Síntese sonora
- **JavaScript ES6** - Lógica

### Libraries

- **MediaPipe Hands** v0.4 - Detecção de mãos
- **MediaPipe Pose** v0.5 - Detecção corporal
- **MediaPipe Camera Utils** - Gerenciamento de câmera

### Navegadores Suportados

- ✅ Chrome 90+ (recomendado)
- ✅ Firefox 88+
- ✅ Edge 90+
- ⚠️ Safari 14+ (parcial)

---

## 🎯 Requisitos

### Mínimos

- Navegador moderno
- Webcam (qualquer resolução)
- Conexão internet (para carregar MediaPipe)

### Recomendados

- Chrome/Firefox
- Webcam 720p
- Iluminação adequada
- Distância: 1-2 metros da câmera

---

## 🎨 Contextos de Uso

### Performance ao Vivo

Performer controla gestos enquanto público assiste projeção

### Instalação Interativa

Múltiplos usuários participam sequencialmente

### Prática Individual

Exploração de timbres e gestos

### Educação

Ensino de síntese sonora e algoritmos evolutivos

### Design Sonoro

Geração de material sonoro experimental

---

## � Music.AI Integration (v2.0) 🆕

### 🎼 Mixagem Evolutiva Profissional

O **Eco-Gesto v2.0** integra-se com a **API Music.AI** para transformar genes sonoros em mixagens profissionais:

- 🎛️ **Mixagem Inteligente**: Cada gesto gera um "gene sonoro" que é mixado profissionalmente
- 🧬 **Evolução com IA**: API Music.AI processa e aprimora as mixagens evolutivas
- 🔄 **Fallback Local**: Sistema continua funcionando mesmo sem conexão à API
- 📊 **Histórico de Mixagens**: Visualize e reproduza mixagens anteriores
- 🎚️ **Controle de Influência**: Ajuste quanto cada novo gesto afeta o mix

**Status**: 📋 Planejamento Completo | ⏳ Implementação Janeiro 2026

👉 **[Plano Completo de Integração](docs/MUSICAI_INTEGRATION_PLAN.md)**  
👉 **[Quick Start Guide](docs/QUICKSTART_MUSICAI.md)**  
👉 **[Especificação Técnica](docs/MUSICAI_INTEGRATION_SPEC.md)**

---

## 🚧 Roadmap Futuro

### ✅ v2.0 - Music.AI Integration (Jan 2026)

- [x] 📋 Planejamento completo
- [ ] 🎛️ Exportação de genes sonoros (MP3/WAV)
- [ ] 🌐 Integração com API Music.AI
- [ ] 💾 Sistema de storage (IndexedDB)
- [ ] 🎨 UI de controle de mixagem
- [ ] 📊 Dashboard de métricas
- [ ] 🧪 Testes completos (≥80% coverage)

### v2.1 - Enhancements (Q1 2026)

- [ ] Mais formatos de áudio (FLAC, OGG)
- [ ] Visualização espectral em tempo real
- [ ] Presets de workflows Music.AI
- [ ] Share de mixagens (URL pública)

### v2.2 - Advanced Features (Q2 2026)

- [ ] Machine learning para sugerir influence
- [ ] Colaboração multi-usuário
- [ ] Exportação de projeto completo
- [ ] Integração com DAWs (Ableton, FL Studio)

### v3.0 - Platform (Q3 2026)

- [ ] Backend dedicado
- [ ] Contas de usuário
- [ ] Marketplace de presets
- [ ] App mobile

---

## 📖 Referências Conceituais

### Sistemas Generativos

- **Brian Eno** - Música Generativa
- **Karl Sims** - Evolução de Criaturas Virtuais
- **Jon McCormack** - Eden (ecossistema evolutivo)

### Interação Corporal

- **Stelarc** - Extended Body
- **Troika Ranch** - Isadora
- **Camille Utterback** - Text Rain

### Algoritmos Evolutivos em Música

- **Eduardo Reck Miranda** - Evolutionary Computer Music
- **Gary Lee Nelson** - Procedural composition

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Áreas de interesse:

- 🎵 Novos algoritmos de síntese
- 🧬 Novos operadores evolutivos
- 🎨 Melhorias visuais
- 🔧 Otimizações de performance
- 📚 Documentação
- 🐛 Correção de bugs

---

## 📄 Licença

Este projeto é open-source e está disponível sob a licença MIT.

---

## 👤 Autor

Desenvolvido como protótipo de baixa fidelidade para exploração de conceitos de composição corporal e sistemas generativos.

**Instituição**: Centro de Informática (CIn) - UFPE  
**Contexto**: Programação Multimídia

---

## 🙏 Agradecimentos

- **MediaPipe Team** - Bibliotecas de motion capture
- **Web Audio API Team** - Síntese sonora no navegador
- **GitHub Copilot** - Assistência no desenvolvimento

---

## 📞 Contato e Suporte

### Problemas?

1. Veja [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Execute `debug/diagnostico.html`
3. Consulte [DETECCAO-DEBUG.md](docs/DETECCAO-DEBUG.md)

### Dúvidas Conceituais?

Leia [REFINAMENTO-DA-IDEIA.md](docs/REFINAMENTO-DA-IDEIA.md) para entender a evolução do projeto

---

<p align="center">
  <strong>🌱 Cultive seu jardim sonoro 🎵</strong>
</p>
