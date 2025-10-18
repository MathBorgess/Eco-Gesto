# 🚀 Guia Rápido - Eco-Gesto

## Início Rápido (5 minutos)

### 1. Executar o Projeto

```bash
# Navegue até a pasta do projeto
cd /Users/matheusborges/github/cin/Eco-Gesto

# Inicie um servidor local (escolha um):

# Opção A - Python 3
python3 -m http.server 8000

# Opção B - Python 2
python -m SimpleHTTPServer 8000

# Opção C - Node.js
npx http-server -p 8000
```

**Depois abra no navegador**: http://localhost:8000

### 2. Primeiros Passos

1. ✅ Permita acesso à webcam
2. ✅ Clique em **"Iniciar Sistema"**
3. ✅ **IMPORTANTE**: Faça movimentos **RÁPIDOS e AMPLOS** com a mão
4. ✅ Escute sua primeira criatura! 🎵
5. ✅ Faça outro gesto rápido → Veja o cruzamento acontecer! 🧬

### 🐛 Modo Debug (Se não funcionar)

Se nenhuma criatura for gerada, use o modo debug:

```bash
# No navegador, abra:
http://localhost:8000/debug.html
```

O modo debug mostra:
- ✅ Status do sistema em tempo real
- ✅ Logs detalhados de detecção
- ✅ Features extraídas dos gestos
- ✅ Botão para testar criação manual

**Dicas para detecção funcionar**:
- 💡 Faça movimentos **RÁPIDOS** (acelere a mão)
- 💡 Movimentos **GRANDES** (use todo o braço)
- 💡 Boa iluminação (evite contra-luz)
- 💡 Fundo simples (parede lisa de cor única)
- 💡 Mão visível e próxima à câmera

### 3. Experimente

- 🖐️ **Mão aberta** + movimento rápido = criatura expansiva aguda
- ✊ **Mão fechada** + movimento lento = criatura contraída grave
- 🔄 Faça gestos consecutivos para criar híbridos
- 🎚️ Ajuste "Taxa de Mutação" para mais variação

## Estrutura do Projeto

```
Eco-Gesto/
├── index.html                    # 🎨 Interface principal
├── styles.css                    # 💅 Estilos visuais
├── js/
│   ├── main.js                  # 🧠 Lógica principal
│   └── modules/
│       ├── BodyTracker.js       # 👁️ Detecção de gestos
│       ├── SoundEngine.js       # 🔊 Síntese sonora
│       ├── EvolutionEngine.js   # 🧬 Algoritmos genéticos
│       └── VisualFeedback.js    # 📊 Visualizações
│
├── README.md                     # 📖 Contexto do projeto
├── INSTRUCTIONS.md               # 📚 Manual completo
├── TECHNICAL.md                  # 🔧 Documentação técnica
└── QUICKSTART.md                 # ⚡ Este arquivo
```

## Conceito Principal

**Cada gesto cria uma "criatura sonora" com DNA único!**

```
🖐️ Gesto → 🧬 DNA Sonoro → 🎵 Som Sintetizado

🖐️ + 🖐️ → 🧬 Cruzamento → 🎵 Híbrido
```

### DNA de uma Criatura

- **Frequência**: Tom (grave ↔ agudo)
- **Timbre**: Forma de onda (sine, saw, square, triangle)
- **Volume**: Intensidade sonora
- **LFO**: Modulação (vibrato/tremolo)
- **Pan**: Posição estéreo (esquerda ↔ direita)
- **Envelope**: Forma temporal (ADSR)
- **Filtro**: Cor tímbrica

## Mapeamentos Rápidos

| Seu Gesto         | Efeito no Som                |
| ----------------- | ---------------------------- |
| ↕️ **Vertical**   | Pitch (grave/agudo)          |
| ↔️ **Horizontal** | Pan (esquerda/direita)       |
| ⚡ **Rápido**     | Timbre brilhante, LFO rápido |
| 🐌 **Lento**      | Timbre suave, LFO lento      |
| 🙌 **Grande**     | Volume alto, filtro aberto   |
| 👌 **Pequeno**    | Volume baixo, filtro fechado |

## Problemas Comuns

### "Webcam não funciona"

- ✅ Use Chrome/Edge (melhor compatibilidade)
- ✅ Permita acesso à câmera quando solicitado
- ✅ Use HTTPS ou localhost (não file://)

### "Não ouço som"

- ✅ Volume do sistema ligado
- ✅ Clique em "Iniciar Sistema" (precisa interação)
- ✅ **Abra o console (F12) e veja se há mensagem "🖐️ GESTO DETECTADO!"**

### "Nenhuma criatura é gerada" ⚠️

**Solução 1: Gestos mais expressivos**
- 🏃 Faça movimentos **MUITO RÁPIDOS** (sacuda a mão)
- 📏 Movimentos **GRANDES** (use todo o espaço da câmera)
- ⏱️ O threshold de velocidade foi reduzido para 0.008

**Solução 2: Use o modo debug**
```
http://localhost:8000/debug.html
```
- Veja logs em tempo real
- Use botão "Testar Gesto Manual" para criar criatura
- Verifique se MediaPipe está detectando sua mão

**Solução 3: Console do navegador (F12)**
Procure por:
- `📊 Features:` - Mostra velocity e energy detectadas
- `🖐️ GESTO DETECTADO!` - Confirma detecção
- `👋 Nenhuma mão detectada` - Mão não visível
- Erros em vermelho - Problema técnico

### "Detecção instável"

- ✅ Melhore iluminação (evite contra-luz)
- ✅ Use fundo simples/uniforme
- ✅ Ajuste distância da câmera
- ✅ Tente Chrome ao invés de Firefox/Safari

## O Que Observar

### Área de Vídeo (Esquerda)

- 👁️ Pontos verdes = mão detectada
- 📏 Linhas conectam pontos da mão

### Ecossistema (Direita)

- 🔵 Círculos = criaturas vivas
- 💗 Pulsação = ritmo da modulação
- 🌊 Ondas = frequência do som

### Lista de Criaturas

- 📛 Nome da criatura
- 🎵 Frequência (Hz)
- 🔊 Volume
- 🧬 Geração (0=original, 1+=híbrido)

### Árvore Genealógica (Abaixo)

- 🔴 Círculos = criaturas
- 📈 Linhas = parentesco
- 📊 Níveis = gerações

## Dicas Para Melhor Experiência

1. **Comece Simples**: Faça gestos lentos e deliberados
2. **Experimente**: Teste diferentes velocidades e amplitudes
3. **Observe Relações**: Veja como gestos similares criam sons similares
4. **Crie Narrativas**: Use gestos para "compor" uma progressão
5. **Ajuste Parâmetros**: Mude taxa de mutação durante performance

## Próximos Passos

- 📖 Leia `INSTRUCTIONS.md` para detalhes completos
- 🔧 Veja `TECHNICAL.md` para entender a implementação
- 🎨 Experimente modificar os mapeamentos nos módulos
- 🚀 Expanda com novos tipos de gestos ou sínteses

## Recursos

- **MediaPipe Hands**: https://google.github.io/mediapipe/solutions/hands
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Algoritmos Genéticos**: https://en.wikipedia.org/wiki/Genetic_algorithm

---

**Desenvolvido como protótipo de baixa fidelidade**  
Sistema de composição corporal com criaturas sonoras evolutivas

🌱 Divirta-se criando seu ecossistema sonoro! 🎵
