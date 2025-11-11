# 📑 Índice de Navegação - Eco-Gesto

## 🚀 Início Rápido

Novo no projeto? Comece aqui:

1. **[README.md](README.md)** - Visão geral do projeto
2. **[docs/QUICKSTART.md](docs/QUICKSTART.md)** - Guia de 5 minutos
3. **[docs/INSTRUCTIONS.md](docs/INSTRUCTIONS.md)** - Manual completo de uso

---

## 📚 Documentação por Categoria

### 🎯 Entendendo o Projeto

| Documento                                                        | Descrição                                             | Para quem?                 |
| ---------------------------------------------------------------- | ----------------------------------------------------- | -------------------------- |
| **[docs/REFINAMENTO-DA-IDEIA.md](docs/REFINAMENTO-DA-IDEIA.md)** | 🌟 Como saímos da ideia original para a implementação | Todos - leitura essencial! |
| **[docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md)**           | Resumo executivo do projeto                           | Visão geral rápida         |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**                 | Arquitetura do sistema                                | Desenvolvedores            |

---

### 📖 Guias de Uso

| Documento                                        | Conteúdo              | Quando usar?        |
| ------------------------------------------------ | --------------------- | ------------------- |
| **[docs/QUICKSTART.md](docs/QUICKSTART.md)**     | Guia rápido (5 min)   | Primeira vez usando |
| **[docs/INSTRUCTIONS.md](docs/INSTRUCTIONS.md)** | Manual completo       | Uso detalhado       |
| **[docs/TESTING.md](docs/TESTING.md)**           | Como testar o sistema | Validação e testes  |

---

### 🔧 Troubleshooting

| Documento                                                                  | Problema que resolve  | Quando consultar?   |
| -------------------------------------------------------------------------- | --------------------- | ------------------- |
| **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**                     | Problemas gerais      | Qualquer erro       |
| **[docs/TROUBLESHOOTING-MEDIAPIPE.md](docs/TROUBLESHOOTING-MEDIAPIPE.md)** | MediaPipe não inicia  | Sistema não carrega |
| **[docs/DETECCAO-DEBUG.md](docs/DETECCAO-DEBUG.md)**                       | Detecção não funciona | Não detecta gestos  |

---

### 💻 Documentação Técnica

| Documento                                        | Conteúdo                    | Público         |
| ------------------------------------------------ | --------------------------- | --------------- |
| **[docs/TECHNICAL.md](docs/TECHNICAL.md)**       | Detalhes técnicos completos | Desenvolvedores |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Arquitetura do código       | Desenvolvedores |

---

## 🔧 Ferramentas de Debug

### Páginas Interativas

| Ferramenta                                                 | Uso                               | Acesso                                            |
| ---------------------------------------------------------- | --------------------------------- | ------------------------------------------------- |
| **[debug/diagnostico.html](debug/diagnostico.html)**       | Diagnóstico automático do sistema | `http://localhost:8000/debug/diagnostico.html`    |
| **[debug/test-detection.html](debug/test-detection.html)** | Teste de detecção com métricas    | `http://localhost:8000/debug/test-detection.html` |
| **[debug/debug.html](debug/debug.html)**                   | Console de debug completo         | `http://localhost:8000/debug/debug.html`          |

---

## 🎯 Fluxo de Leitura Recomendado

### Para Usuários (Artistas/Performers)

```
1. README.md
2. docs/QUICKSTART.md
3. docs/INSTRUCTIONS.md
4. Se problemas → docs/TROUBLESHOOTING.md
```

### Para Desenvolvedores

```
1. README.md
2. docs/REFINAMENTO-DA-IDEIA.md (contexto conceitual!)
3. docs/ARCHITECTURE.md
4. docs/TECHNICAL.md
5. Código fonte em js/modules/
```

### Para Quem Tem Problemas

```
1. debug/diagnostico.html (execute primeiro!)
2. docs/TROUBLESHOOTING-MEDIAPIPE.md
3. docs/DETECCAO-DEBUG.md
4. Console do navegador (F12)
```

### Para Estudantes/Pesquisadores

```
1. README.md
2. docs/REFINAMENTO-DA-IDEIA.md (essencial!)
3. docs/PROJECT_SUMMARY.md
4. docs/ARCHITECTURE.md
5. docs/TECHNICAL.md
```

---

## 📂 Estrutura Completa do Projeto

```
Eco-Gesto/
│
├── 📄 README.md ..................... Visão geral principal
├── 📑 INDEX.md ...................... Este arquivo
├── 🎨 index.html .................... Aplicação principal
├── 🎨 styles.css .................... Estilos
│
├── 📁 js/
│   ├── main.js ...................... Orquestrador
│   └── modules/
│       ├── BodyTracker.js ........... Detecção gestual
│       ├── SoundEngine.js ........... Síntese sonora
│       ├── EvolutionEngine.js ....... Algoritmos evolutivos
│       └── VisualFeedback.js ........ Visualização
│
├── 📁 docs/ ......................... 📚 TODA DOCUMENTAÇÃO
│   ├── QUICKSTART.md ................ Guia rápido (5 min)
│   ├── INSTRUCTIONS.md .............. Manual completo
│   ├── TECHNICAL.md ................. Documentação técnica
│   ├── ARCHITECTURE.md .............. Arquitetura do sistema
│   ├── TESTING.md ................... Guia de testes
│   ├── TROUBLESHOOTING.md ........... Problemas gerais
│   ├── DETECCAO-DEBUG.md ............ Debug de detecção
│   ├── TROUBLESHOOTING-MEDIAPIPE.md . MediaPipe não inicia
│   ├── PROJECT_SUMMARY.md ........... Resumo executivo
│   ├── INDEX.md ..................... Índice da documentação
│   └── REFINAMENTO-DA-IDEIA.md ...... 🌟 Evolução conceitual
│
└── 📁 debug/ ........................ 🔧 FERRAMENTAS DEBUG
    ├── diagnostico.html ............. Diagnóstico automático
    ├── test-detection.html .......... Teste de detecção
    └── debug.html ................... Console debug completo
```

---

## 🎯 Documentos Essenciais por Objetivo

### "Quero entender o projeto"

→ **[README.md](README.md)** + **[docs/REFINAMENTO-DA-IDEIA.md](docs/REFINAMENTO-DA-IDEIA.md)**

### "Quero usar o sistema"

→ **[docs/QUICKSTART.md](docs/QUICKSTART.md)** + **[docs/INSTRUCTIONS.md](docs/INSTRUCTIONS.md)**

### "Tenho um problema"

→ **[debug/diagnostico.html](debug/diagnostico.html)** → **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**

### "Quero modificar o código"

→ **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** + **[docs/TECHNICAL.md](docs/TECHNICAL.md)**

### "Não detecta meus gestos"

→ **[docs/DETECCAO-DEBUG.md](docs/DETECCAO-DEBUG.md)** + **[debug/test-detection.html](debug/test-detection.html)**

### "MediaPipe não carrega"

→ **[docs/TROUBLESHOOTING-MEDIAPIPE.md](docs/TROUBLESHOOTING-MEDIAPIPE.md)** + **[debug/diagnostico.html](debug/diagnostico.html)**

---

## 📊 Estatísticas da Documentação

- **Total de documentos**: 11 arquivos
- **Total estimado**: ~25,000 palavras
- **Tempo de leitura completa**: ~2-3 horas
- **Ferramentas de debug**: 3 páginas interativas

### Distribuição:

- 📖 **Guias de Uso**: 3 documentos (~5,000 palavras)
- 🔧 **Troubleshooting**: 3 documentos (~8,000 palavras)
- 💻 **Técnica**: 2 documentos (~6,000 palavras)
- 🎯 **Conceitual**: 3 documentos (~6,000 palavras)

---

## 🌟 Documento Destacado

### [docs/REFINAMENTO-DA-IDEIA.md](docs/REFINAMENTO-DA-IDEIA.md)

**O documento mais importante para entender o projeto!**

Este documento explica:

- ✅ A ideia original ("Instrumento Corporal Imersivo")
- ✅ Decisões de design tomadas
- ✅ Por que escolhemos web ao invés de Unity
- ✅ Evolução do conceito de "gesto → som" para "gesto → criatura → ecossistema"
- ✅ Implementação dos algoritmos evolutivos
- ✅ Justificativas técnicas e artísticas

**Leitura obrigatória para todos!**

---

## 🔍 Busca Rápida

### Procurando por...

**"Como instalar"** → [docs/QUICKSTART.md](docs/QUICKSTART.md)  
**"Como funciona"** → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)  
**"Não funciona"** → [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)  
**"API de áudio"** → [docs/TECHNICAL.md](docs/TECHNICAL.md)  
**"MediaPipe"** → [docs/TROUBLESHOOTING-MEDIAPIPE.md](docs/TROUBLESHOOTING-MEDIAPIPE.md)  
**"Gestos"** → [docs/DETECCAO-DEBUG.md](docs/DETECCAO-DEBUG.md)  
**"Evolução"** → [docs/TECHNICAL.md](docs/TECHNICAL.md) (seção Algoritmos Evolutivos)  
**"Síntese"** → [docs/TECHNICAL.md](docs/TECHNICAL.md) (seção SoundEngine)  
**"História"** → [docs/REFINAMENTO-DA-IDEIA.md](docs/REFINAMENTO-DA-IDEIA.md)  
**"Testes"** → [docs/TESTING.md](docs/TESTING.md)

---

## 💡 Dicas de Navegação

1. **Use Ctrl+F** (Cmd+F no Mac) para buscar dentro dos documentos
2. **Links funcionam!** Clique nos links azuis para navegar
3. **Console do navegador** (F12) mostra logs úteis em tempo real
4. **Páginas de debug** estão em `debug/` - use-as!
5. **Markdown renderizado** fica melhor no GitHub ou editores MD

---

## 🆘 Ainda Perdido?

1. Comece por **[README.md](README.md)**
2. Execute **[debug/diagnostico.html](debug/diagnostico.html)**
3. Leia **[docs/QUICKSTART.md](docs/QUICKSTART.md)**
4. Se tiver problemas, consulte **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**

---

<p align="center">
  <strong>📚 Documentação completa e organizada!</strong><br>
  Toda informação que você precisa está aqui.
</p>
