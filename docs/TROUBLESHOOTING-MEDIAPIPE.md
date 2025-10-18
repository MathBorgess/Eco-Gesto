# 🚨 Troubleshooting - MediaPipe não inicia

## Problema: "MediaPipe não está iniciando"

Se você está vendo uma tela preta sem nenhuma detecção, siga este guia passo a passo.

---

## 🔍 Passo 1: Executar Diagnóstico

Abra a página de diagnóstico:
```
http://localhost:8000/diagnostico.html
```

Esta página irá verificar:
- ✅ Navegador compatível
- ✅ Conexão segura (HTTPS/localhost)
- ✅ MediaPipe Hands carregado
- ✅ MediaPipe Pose carregado
- ✅ Camera Utils carregado
- ✅ API getUserMedia disponível
- ✅ Acesso à câmera concedido
- ✅ MediaPipe pode ser inicializado

**Se todos os itens estiverem com ✅**, o sistema está OK e o problema é outro.

**Se algum item estiver com ❌**, veja as soluções abaixo.

---

## ❌ Problema: "MediaPipe Hands NÃO carregado"

### Causa: 
Scripts CDN não carregaram (sem internet ou bloqueio)

### Solução:
1. **Verifique sua conexão com internet**
2. **Desative extensões de bloqueio** (AdBlock, Privacy Badger, etc.)
3. **Abra o Console** (F12 → Console) e procure por erros de rede
4. **Tente em outro navegador** (Chrome recomendado)
5. **Aguarde alguns segundos** - CDN pode estar lento

### Verificação:
Abra o console e digite:
```javascript
console.log(window.Hands, window.Pose);
```

Se aparecer `undefined undefined`, os scripts não carregaram.

---

## ❌ Problema: "Acesso à Câmera NEGADO"

### Causa:
Você negou permissão de acesso à câmera

### Solução:

#### Chrome/Edge:
1. Clique no ícone de **cadeado/câmera** na barra de endereço
2. Selecione **"Permitir"** para câmera
3. Recarregue a página (F5)

#### Firefox:
1. Clique no ícone de **câmera riscada** na barra de endereço
2. Clique em **"Permitir"**
3. Recarregue a página (F5)

#### Safari:
1. Safari → Configurações → Sites → Câmera
2. Encontre `localhost` e selecione **"Permitir"**
3. Recarregue a página

---

## ❌ Problema: "Nenhuma câmera encontrada"

### Causa:
Nenhuma câmera está conectada ou disponível

### Solução:
1. **Conecte uma webcam** (USB ou integrada)
2. **Verifique se está reconhecida** pelo sistema operacional
3. **Feche outros apps** que usam câmera (Zoom, Teams, Skype, etc.)
4. **No Mac**: Configurações → Privacidade e Segurança → Câmera → Permitir para navegador
5. **No Windows**: Configurações → Privacidade → Câmera → Permitir apps

### Teste:
Abra outra página que use câmera (ex: meet.google.com) para confirmar que funciona.

---

## ⚠️ Problema: "Conexão não segura"

### Causa:
Você está acessando via HTTP (não HTTPS) em domínio que não é localhost

### Solução:
- **Use `localhost`** ou `127.0.0.1` (já está OK no seu caso!)
- **Ou configure HTTPS** se for hospedar em servidor remoto

---

## 🐛 Problema: MediaPipe carrega mas não detecta

Se o diagnóstico passou em TUDO mas ainda não detecta:

### 1. Abra o Console (F12) e veja os logs:

Você DEVE ver:
```
🎥 Inicializando BodyTracker (Hands + Pose)...
✅ MediaPipe libraries disponíveis
✅ Elementos DOM encontrados
⏳ Configurando MediaPipe Hands...
✅ MediaPipe Hands configurado
⏳ Configurando MediaPipe Pose...
✅ MediaPipe Pose configurado
⏳ Iniciando câmera...
📷 Solicitando acesso à câmera...
✅ Acesso à câmera concedido
✅ Metadados do vídeo carregados
✅ Vídeo iniciado
🔍 Iniciando loop de detecção...
✅ Loop de detecção iniciado
✅ Câmera iniciada
✅ BodyTracker inicializado (modo híbrido)
🔄 Detecção rodando... (X frames processados)
```

### 2. Se NÃO vê esses logs:

**Problema A**: Sistema não inicializa
- Verifique se botão "Iniciar Sistema" foi clicado
- Veja se há erro vermelho no console
- Tente recarregar a página (Ctrl+R)

**Problema B**: Câmera não inicia
- Procure por erro: `❌ Erro ao acessar câmera`
- Conceda permissão novamente
- Feche outros apps usando câmera

**Problema C**: Loop não roda
- Procure: `❌ Erro no loop de detecção`
- Pode ser problema de processamento
- Tente fechar outras abas do navegador

### 3. Se vê os logs mas não detecta corpo/mãos:

Isso é problema de **detecção visual**, não de inicialização!

Veja o guia: `DETECCAO-DEBUG.md` para resolver problemas de detecção.

---

## 📋 Checklist Completo

Antes de pedir ajuda, verifique:

- [ ] Acesso `http://localhost:8000` (não IP externo)
- [ ] Diagnóstico (`diagnostico.html`) passa em TUDO
- [ ] Console não mostra erros vermelhos
- [ ] Botão "Iniciar Sistema" foi clicado
- [ ] Permissão de câmera concedida
- [ ] Câmera não está sendo usada por outro app
- [ ] Navegador atualizado (Chrome/Firefox/Edge)
- [ ] Internet funcionando (para carregar CDN)
- [ ] Extensões de bloqueio desativadas para localhost

---

## 🆘 Logs Importantes

### ✅ Log de sucesso completo:
```
🎥 Inicializando BodyTracker (Hands + Pose)...
✅ MediaPipe libraries disponíveis
✅ Elementos DOM encontrados
⏳ Configurando MediaPipe Hands...
✅ MediaPipe Hands configurado
⏳ Configurando MediaPipe Pose...
✅ MediaPipe Pose configurado
⏳ Iniciando câmera...
📷 Solicitando acesso à câmera...
✅ Acesso à câmera concedido
✅ Metadados do vídeo carregados
✅ Vídeo iniciado
🔍 Iniciando loop de detecção...
✅ Loop de detecção iniciado
✅ Câmera iniciada
✅ BodyTracker inicializado (modo híbrido)
```

### ❌ Erros comuns:

**Erro 1:**
```
❌ MediaPipe Hands NÃO está carregado! Verifique o CDN.
```
→ Scripts não carregaram. Verifique internet.

**Erro 2:**
```
NotAllowedError: Permission denied
```
→ Permissão de câmera negada. Conceda permissão.

**Erro 3:**
```
NotFoundError: Requested device not found
```
→ Nenhuma câmera encontrada. Conecte uma câmera.

**Erro 4:**
```
❌ Elemento #videoInput não encontrado!
```
→ HTML não carregou corretamente. Recarregue página.

---

## 🧪 Teste Rápido via Console

Abra o console (F12) e execute:

```javascript
// Teste 1: MediaPipe carregado?
console.log('Hands:', typeof window.Hands);
console.log('Pose:', typeof window.Pose);
// Deve mostrar: "function"

// Teste 2: Elementos existem?
console.log('Video:', document.getElementById('videoInput'));
console.log('Canvas:', document.getElementById('poseCanvas'));
// Deve mostrar: <video> e <canvas>

// Teste 3: Câmera disponível?
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        console.log('✅ Câmera OK');
        stream.getTracks().forEach(t => t.stop());
    })
    .catch(err => console.error('❌ Câmera ERRO:', err));
```

---

## 📞 Ainda com problemas?

1. **Execute** `diagnostico.html` e veja TODOS os resultados
2. **Copie** os logs do console (F12)
3. **Tire print** da tela de diagnóstico
4. **Descreva** exatamente o que você vê (ou não vê)

Com essas informações fica muito mais fácil ajudar! 🎯
