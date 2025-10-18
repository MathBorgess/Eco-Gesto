# 🧪 Testes e Validação - Eco-Gesto

## Checklist de Validação do Protótipo

### ✅ Testes de Funcionalidade

#### 1. Inicialização do Sistema
- [ ] Sistema solicita permissão de webcam
- [ ] MediaPipe carrega sem erros
- [ ] Canvas são renderizados corretamente
- [ ] Controles UI respondem ao clique
- [ ] Console não mostra erros críticos

#### 2. Detecção Gestual (BodyTracker)
- [ ] Mão é detectada na webcam
- [ ] Pontos (landmarks) são desenhados corretamente
- [ ] Conexões entre pontos formam esqueleto da mão
- [ ] Features são extraídas (velocity, amplitude, etc)
- [ ] Tipos de gesto são classificados corretamente

**Como testar**:
```javascript
// Abra console do navegador (F12) e observe:
window.ecoGestoSystem.bodyTracker.getLastLandmarks()
// Deve retornar array com 21 pontos se mão detectada
```

#### 3. Criação de Criaturas (SoundEngine)
- [ ] Gesto gera criatura com som
- [ ] Som é audível
- [ ] DNA da criatura reflete features do gesto
- [ ] Diferentes gestos geram timbres diferentes
- [ ] Volume e pan são perceptíveis

**Como testar**:
```javascript
// Console:
window.ecoGestoSystem.creatures
// Deve mostrar array de criaturas ativas com DNA
```

#### 4. Evolução (EvolutionEngine)
- [ ] Gestos consecutivos geram híbridos
- [ ] Híbridos têm características dos pais
- [ ] Mutações são aplicadas
- [ ] Geração é incrementada corretamente
- [ ] Genealogia é registrada

**Como testar**:
```javascript
// Console:
window.ecoGestoSystem.genealogy
// Deve mostrar histórico de cruzamentos
```

#### 5. Visualizações (VisualFeedback)
- [ ] Pose é desenhada sobre webcam
- [ ] Ecossistema mostra círculos pulsantes
- [ ] Árvore genealógica é renderizada
- [ ] Lista de criaturas atualiza
- [ ] Cores correspondem aos tipos

### ✅ Testes de Usabilidade

#### Clareza do Mapeamento
**Teste**: Fazer gestos específicos e observar sons resultantes

| Gesto | Resultado Esperado | ✓ |
|-------|-------------------|---|
| Mão alta (topo da tela) | Som agudo (>500Hz) | [ ] |
| Mão baixa (base da tela) | Som grave (<400Hz) | [ ] |
| Mão esquerda | Pan esquerdo | [ ] |
| Mão direita | Pan direito | [ ] |
| Movimento rápido | LFO rápido, ataque curto | [ ] |
| Movimento lento | LFO lento, ataque longo | [ ] |
| Mão aberta | Timbre triangle/sine | [ ] |
| Mão fechada | Timbre square/saw | [ ] |

#### Feedback Imediato
- [ ] Latência < 200ms entre gesto e som
- [ ] Visualização responde instantaneamente
- [ ] Criatura aparece na lista imediatamente
- [ ] Feedback visual é claro

#### Compreensão do Sistema
- [ ] Usuário entende que gestos criam criaturas
- [ ] Usuário percebe cruzamentos acontecendo
- [ ] Árvore genealógica é compreensível
- [ ] Controles (sliders) têm efeito claro

### ✅ Testes Técnicos

#### Performance

**Teste de FPS**:
```javascript
// Console:
let fps = 0;
let lastTime = performance.now();
setInterval(() => {
  const now = performance.now();
  fps = 1000 / (now - lastTime);
  lastTime = now;
  console.log('FPS:', fps.toFixed(1));
}, 1000);
```

**Métricas Esperadas**:
- [ ] FPS > 30 com 5 criaturas
- [ ] FPS > 24 com 10 criaturas
- [ ] CPU < 80% em máquina média
- [ ] Sem memory leaks após 5min

**Teste de Latência**:
```javascript
// Medir tempo entre gesto e som
window.ecoGestoSystem.bodyTracker.onGestureDetected = (gesture) => {
  const latency = Date.now() - gesture.timestamp;
  console.log('Latência:', latency, 'ms');
};
```

**Expectativa**: < 150ms total

#### Estabilidade
- [ ] Sistema roda por 5+ minutos sem crash
- [ ] Não há audio glitches ou pops
- [ ] Detecção não trava com movimentos rápidos
- [ ] Memória não cresce indefinidamente

**Teste de Memory Leak**:
```javascript
// Console → Memory Profile
// Criar/remover criaturas várias vezes
// Memória deve estabilizar, não crescer linearmente
```

#### Compatibilidade
- [ ] Chrome/Edge (v90+)
- [ ] Firefox (v88+)
- [ ] Safari (v14+)
- [ ] Funciona em diferentes resoluções

### ✅ Testes Artísticos

#### Expressividade
**Cenários de teste**:

1. **Composição Crescente**:
   - Fazer gestos cada vez mais energéticos
   - Espera: Sons progridem de grave/sutil para agudo/intenso
   - [ ] Sensação de "crescendo" é clara

2. **Narrativa Gestual**:
   - Criar 3-5 criaturas de tipos diferentes
   - Fazer cruzamentos estratégicos
   - Espera: Ecossistema evolui coerentemente
   - [ ] Histórico conta uma "história"

3. **Controle Fino**:
   - Tentar criar criatura com pitch específico
   - Tentar posicionar pan exatamente
   - Espera: Controle razoável sobre parâmetros
   - [ ] Performer sente controle

#### Variedade Sonora
- [ ] Pelo menos 4 timbres distintos são perceptíveis
- [ ] Range de frequências é amplo (200-800Hz)
- [ ] Mutações geram variedade interessante
- [ ] Não há sons "ruins" ou irritantes

#### Coerência Musical
- [ ] Criaturas híbridas soam relacionadas aos pais
- [ ] Ecossistema não vira "bagunça sonora"
- [ ] Mutações mantêm qualidade musical
- [ ] É possível criar progressões harmônicas

## 🔍 Casos de Uso Testados

### Caso 1: Primeira Experiência (Usuário Novo)
**Passos**:
1. Abre aplicação
2. Permite webcam
3. Clica "Iniciar Sistema"
4. Faz um gesto qualquer

**Resultado Esperado**:
- ✅ Som é produzido imediatamente
- ✅ Feedback visual é claro
- ✅ Usuário entende relação gesto-som

### Caso 2: Criação de Ecossistema Simples
**Passos**:
1. Criar 3 criaturas originais (gestos espaçados)
2. Observar cada criatura no ecossistema
3. Verificar lista de criaturas

**Resultado Esperado**:
- ✅ 3 sons simultâneos são distinguíveis
- ✅ Visualização mostra 3 círculos
- ✅ Lista tem 3 entradas com Gen=0

### Caso 3: Primeiro Cruzamento
**Passos**:
1. Ter 2 criaturas ativas
2. Fazer gesto rápido (< 2s após último)
3. Observar mensagem no console

**Resultado Esperado**:
- ✅ Console diz "🧬 Cruzamento realizado!"
- ✅ Nova criatura tem Gen=1
- ✅ Som é híbrido perceptível
- ✅ Árvore genealógica mostra conexão

### Caso 4: Evolução Multi-Geracional
**Passos**:
1. Criar criatura A (gesto lento)
2. Criar criatura B (gesto rápido)
3. Cruzar A+B → C (Gen 1)
4. Criar criatura D (nova original)
5. Cruzar C+D → E (Gen 2)

**Resultado Esperado**:
- ✅ E tem características de A, B e D
- ✅ Árvore mostra 3 gerações
- ✅ Som de E é coerente mas único

### Caso 5: Limite de Criaturas
**Passos**:
1. Configurar Max Criaturas = 3
2. Criar 5 criaturas seguidas

**Resultado Esperado**:
- ✅ Apenas 3 criaturas ativas
- ✅ Primeiras 2 foram removidas
- ✅ Console mostra "💀 Criatura X removida"

### Caso 6: Experimentação com Mutação
**Passos**:
1. Configurar Taxa de Mutação = 0.0
2. Cruzar 2 criaturas → observar híbrido
3. Configurar Taxa de Mutação = 0.8
4. Cruzar mesmas 2 criaturas → observar híbrido

**Resultado Esperado**:
- ✅ Com 0.0: Híbrido muito similar aos pais
- ✅ Com 0.8: Híbrido tem variações grandes
- ✅ Diferença é perceptível

## 🐛 Bugs Conhecidos e Workarounds

### 1. MediaPipe não carrega em HTTP
**Problema**: Erro de CORS ou mixed content  
**Workaround**: Use HTTPS ou localhost

### 2. Som com cliques ao criar/remover criatura
**Problema**: Envelope muito curto  
**Fix**: Ajustar `envelope.attack` e `release` no SoundEngine.js

### 3. Detecção instável com fundo complexo
**Problema**: MediaPipe tem dificuldade  
**Workaround**: Usar fundo simples/uniforme

### 4. Árvore genealógica sobrepõe criaturas
**Problema**: Layout simples não prevê muitas gerações  
**Fix Futuro**: Implementar layout mais inteligente

## 📊 Métricas de Sucesso

### Técnicas
- ✅ FPS médio > 30
- ✅ Latência < 150ms
- ✅ 0 crashes em 5min de uso
- ✅ Compatível com 3+ navegadores

### UX
- ✅ Usuário entende mapeamentos em < 2min
- ✅ Usuário cria primeira criatura híbrida em < 3min
- ✅ Usuário sente controle sobre sons
- ✅ Feedback visual é considerado útil

### Artísticas
- ✅ Variedade sonora é interessante
- ✅ Evoluções mantêm coerência
- ✅ É possível criar "composições"
- ✅ Metáfora de "criaturas vivas" é clara

## 🎯 Próximas Validações

Após implementar melhorias:

1. **Teste com Usuários Reais**
   - Gravar sessões de uso
   - Coletar feedback qualitativo
   - Medir tempo para compreensão

2. **Performance em Dispositivos Variados**
   - Testar em laptop low-end
   - Testar em tablet
   - Medir impacto de diferentes câmeras

3. **Testes de Longa Duração**
   - Sessões de 15-30 minutos
   - Verificar fadiga de uso
   - Observar estratégias emergentes

4. **Comparação com Protótipos Alternativos**
   - Testar metáforas diferentes
   - Comparar mapeamentos alternativos
   - A/B testing de visualizações

---

**Status Atual**: Protótipo funcional, pronto para testes de campo! ✅
