# 🔧 Guia de Troubleshooting - Eco-Gesto

## ⚠️ Problema: "Nenhuma criatura é gerada ao me movimentar"

Este é o problema mais comum! Aqui estão todas as soluções:

### 🎯 Solução Rápida (Mais Comum)

**O sistema precisa de gestos RÁPIDOS e AMPLOS para detectar!**

#### Teste Rápido:
1. Abra o console do navegador (F12)
2. Procure por mensagens do tipo:
   - `📊 Features: velocity: 0.0023, energy: 0.0156, type: subtle`
   
3. **Se velocity < 0.008**: Seus gestos estão muito lentos!
   
#### Como fazer gestos que funcionam:
✅ **FAÇA**:
- 🏃 Movimentos RÁPIDOS (sacuda a mão, acelere!)
- 📏 Movimentos GRANDES (use todo o braço, não só o pulso)
- ⚡ Acelere e desacelere bruscamente
- 🔄 Movimentos circulares rápidos
- 👋 "Acene" vigorosamente

❌ **NÃO FAÇA**:
- 🐌 Movimentos lentos e suaves
- 👌 Gestos pequenos apenas com os dedos
- 🗿 Mão parada (o sistema detecta MOVIMENTO)
- 😴 Gestos "preguiçosos"

### 🐛 Modo Debug Detalhado

Use o modo debug para diagnóstico completo:

```
http://localhost:8000/debug.html
```

#### O que você verá:

1. **Status do Sistema**
   - ✅ Verde = Tudo OK
   - ⚠️ Amarelo = Carregando
   - ❌ Vermelho = Erro

2. **Logs em Tempo Real**
   - `✅ MediaPipe Hands disponível` - Biblioteca carregou
   - `✅ BodyTracker inicializado` - Câmera funcionando
   - `✅ SoundEngine inicializado` - Áudio pronto
   - `📊 Features:` - Características detectadas
   - `🖐️ GESTO DETECTADO!` - Sucesso!

3. **Features Detectadas**
   ```json
   {
     "velocity": 0.0234,  // < 0.008 = muito lento
     "energy": 0.1567,
     "amplitude": 0.2344
   }
   ```

4. **Botão "Testar Gesto Manual"**
   - Cria uma criatura artificialmente
   - Testa se áudio está funcionando
   - Ignora detecção gestual

### 📊 Interpretando os Logs

#### ✅ Logs Normais (Tudo OK):
```
[19:16:04] ✅ MediaPipe Hands disponível
[19:16:05] ✅ BodyTracker inicializado
[19:16:05] ✅ SoundEngine inicializado
[19:16:07] 📊 Features: velocity: 0.0234, energy: 0.1567, type: explosive
[19:16:07] 🖐️ GESTO DETECTADO: explosive
[19:16:07] 🎵 Criatura criada: Ignis-456
```

#### ⚠️ Logs Indicando Gesto Muito Lento:
```
[19:16:07] 📊 Features: velocity: 0.0023, energy: 0.0156, type: subtle
[19:16:08] 📊 Features: velocity: 0.0018, energy: 0.0112, type: subtle
[19:16:09] 📊 Features: velocity: 0.0031, energy: 0.0198, type: subtle
```
**Solução**: Acelere! Velocity precisa > 0.008

#### ❌ Logs de Erro:
```
[19:16:04] ❌ MediaPipe Hands não carregado!
```
**Solução**: Recarregue a página, verifique conexão internet

```
[19:16:10] 👋 Nenhuma mão detectada
[19:16:11] 👋 Nenhuma mão detectada
```
**Solução**: Coloque a mão na frente da câmera

### 🎬 Tutorial Passo-a-Passo

#### 1. Verificar que tudo está carregando:
```bash
# Abra debug.html
http://localhost:8000/debug.html
```

#### 2. Aguarde mensagens de inicialização:
- ✅ Veja "MediaPipe Hands disponível"
- ✅ Veja "BodyTracker inicializado"
- ✅ Veja "SoundEngine inicializado"
- ✅ Status deve ficar verde: "✅ SISTEMA ATIVO"

#### 3. Teste detecção de mão:
- Coloque mão na frente da câmera
- Deve aparecer esqueleto verde na mão
- Console deve logar: `📊 Features: ...`

#### 4. Teste gesto lento primeiro:
- Mova mão devagar
- Veja valor de `velocity` no console
- Provavelmente será < 0.008

#### 5. Faça gesto RÁPIDO:
- Sacuda a mão vigorosamente
- Velocity deve pular para > 0.01
- Deve aparecer: `🖐️ GESTO DETECTADO!`
- Som deve tocar!

#### 6. Se ainda não funcionar, teste manualmente:
- Clique em "Testar Gesto Manual"
- Uma criatura será criada artificialmente
- Se som tocar = áudio OK, problema é só detecção
- Se som não tocar = problema no áudio

### 🔍 Diagnóstico Específico

#### Sintoma: "Console vazio, sem mensagens"
**Causa**: JavaScript não está executando  
**Solução**:
- Verifique se está usando servidor local (não `file://`)
- Abra console (F12) e veja erros
- Tente outro navegador (Chrome recomendado)

#### Sintoma: "Vejo Features mas velocity sempre < 0.008"
**Causa**: Gestos muito lentos  
**Solução**:
- Faça movimentos mais rápidos!
- Tente "sacudir" a mão
- Use movimentos circulares rápidos
- Movimente braço todo, não só pulso

#### Sintoma: "GESTO DETECTADO aparece mas não ouço som"
**Causa**: Problema no áudio  
**Solução**:
- Verifique volume do sistema
- Verifique se navegador tem permissão de áudio
- Tente clicar na página antes (AudioContext precisa interação)
- Abra console e procure erros de AudioContext

#### Sintoma: "👋 Nenhuma mão detectada"
**Causa**: MediaPipe não vê sua mão  
**Solução**:
- Melhore iluminação (evite contra-luz)
- Use fundo mais simples
- Aproxime mão da câmera
- Mantenha mão inteira visível (não corte dedos)

#### Sintoma: "❌ MediaPipe Hands não carregado"
**Causa**: CDN não carregou  
**Solução**:
- Verifique conexão com internet
- Recarregue página (Ctrl+R)
- Limpe cache (Ctrl+Shift+R)
- Verifique se CDN está acessível:
  https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js

### 🎚️ Ajustando Sensibilidade (Avançado)

Se mesmo com gestos rápidos não funciona, você pode ajustar o código:

#### Arquivo: `js/modules/BodyTracker.js`

```javascript
// Linha ~70
if (features.velocity > 0.008 &&  // ← ESTE VALOR
    currentTime - this.lastGestureTime > this.gestureDebounceTime) {
```

**Para gestos mais sensíveis**:
- Mude `0.008` para `0.005` (mais fácil)
- Ou até `0.003` (muito sensível)

**Para gestos menos sensíveis**:
- Mude `0.008` para `0.015` (mais difícil)
- Ou até `0.020` (muito difícil)

Após alterar, recarregue a página (Ctrl+R).

### 📋 Checklist Completo

Marque cada item conforme testa:

#### Ambiente
- [ ] Usando servidor local (não file://)
- [ ] Chrome ou Edge (navegador recomendado)
- [ ] Conexão internet estável
- [ ] Webcam funcionando

#### Inicialização
- [ ] Permissão de câmera concedida
- [ ] Console mostra "✅ MediaPipe Hands disponível"
- [ ] Console mostra "✅ BodyTracker inicializado"
- [ ] Console mostra "✅ SoundEngine inicializado"
- [ ] Vídeo da câmera aparece na tela

#### Detecção
- [ ] Mão detectada (esqueleto verde aparece)
- [ ] Console mostra "📊 Features: ..."
- [ ] Velocity aparece no console
- [ ] Velocity > 0.008 quando movimento rápido

#### Gesto
- [ ] Faço movimentos RÁPIDOS (sacudo mão)
- [ ] Faço movimentos GRANDES (braço todo)
- [ ] Console mostra "🖐️ GESTO DETECTADO!"
- [ ] Console mostra "🎵 Criatura criada: ..."

#### Áudio
- [ ] Volume do sistema está ligado
- [ ] Som toca quando criatura é criada
- [ ] Posso ouvir diferentes timbres
- [ ] Pan funciona (esquerda/direita)

### 🆘 Últimas Opções

Se NADA funcionar:

1. **Grave um vídeo do problema**
   - Mostre a tela inteira
   - Mostre console do navegador (F12)
   - Mostre seus gestos na câmera
   - Isso ajuda muito no diagnóstico!

2. **Verifique requisitos mínimos**
   - Navegador Chrome/Edge versão 90+
   - JavaScript habilitado
   - WebGL disponível (para MediaPipe)
   - Webcam funcional

3. **Teste em outro computador**
   - Às vezes problema é hardware/drivers
   - Teste em máquina diferente se possível

4. **Use versão simplificada**
   - Teste só o `debug.html`
   - Use botão "Testar Gesto Manual"
   - Isso isola se problema é detecção ou áudio

### 📞 Suporte

Se ainda tiver problemas, abra uma issue no GitHub com:

1. **Prints/vídeo do problema**
2. **Log completo do console** (copie e cole)
3. **Seu sistema**:
   - Navegador e versão
   - Sistema operacional
   - Especificações do computador

---

## ✅ Configurações Recomendadas

Para **melhor experiência**:

### Iluminação
- ☀️ Iluminação frontal (de frente para você)
- 🚫 Evite janelas atrás (contra-luz)
- 💡 Luz do dia ou luz branca uniforme

### Posicionamento
- 📏 Distância: 50-80cm da câmera
- 🎯 Mão centralizada no quadro
- ✋ Toda a mão visível (não cortar dedos)

### Ambiente
- 🎨 Fundo simples (parede lisa)
- 🚫 Evite fundos com muitos detalhes
- 🎨 Prefira cores sólidas (branco, cinza, azul)

### Gestos
- ⚡ Velocidade: RÁPIDA (acelere!)
- 📏 Amplitude: GRANDE (braço todo)
- 🔄 Variação: Mude direção, velocidade
- ⏱️ Duração: Movimentos de 0.5-1 segundo

---

**Lembre-se**: O sistema foi calibrado para detectar movimentos EXPRESSIVOS e RÁPIDOS, simulando uma performance ao vivo. Não é para gestos sutis!

🌱 Boa sorte criando seu ecossistema sonoro! 🎵
