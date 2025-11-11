# 🎼 Plano de Implementação - Integração Music.AI

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Roadmap de Implementação](#roadmap-de-implementação)
4. [Timeline Estimado](#timeline-estimado)
5. [Dependências e Ferramentas](#dependências-e-ferramentas)
6. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 🎯 Visão Geral

### Objetivo
Integrar o sistema de geração de áudio via algoritmo genético (Eco-Gesto) com a API do Music.AI para criar uma experiência de mixagem evolutiva em tempo real, onde cada gesto captado contribui para a evolução sonora através de processamento profissional de áudio.

### Escopo
- **In Scope:**
  - Integração com API Music.AI v1
  - Sistema de exportação de genes sonoros
  - Gerenciamento de mixagem evolutiva
  - Storage temporário de áudios
  - UI para controle e visualização
  - Testes automatizados (unit, integration, e2e)
  - Documentação completa

- **Out of Scope (Fase 1):**
  - Integração com outros serviços de áudio além do Music.AI
  - Sistema de pagamento/billing próprio
  - Backend dedicado para storage permanente
  - App mobile nativo

### Stakeholders
- **Desenvolvedores**: Equipe de desenvolvimento
- **Usuários Finais**: Artistas, músicos, performers interativos
- **Parceiro Técnico**: Music.AI Platform

---

## 🏗️ Arquitetura

### Visão de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    ECO-GESTO SYSTEM                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👋 Gesture Input (Webcam + MediaPipe)                     │
│              ↓                                              │
│  🧬 EvolutionEngine (Genetic Algorithm)                    │
│              ↓                                              │
│  🔊 SoundEngine (Web Audio API)                            │
│              ↓                                              │
│  📤 NEW: AudioExporter                                     │
│              ↓                                              │
│  🎵 NEW: MixEvolutionManager ←──────────┐                 │
│              ↓                           │                  │
│  🌐 NEW: MusicAIService                 │                  │
│       │                                   │                  │
│       │ HTTP Request                      │ Store Mix        │
│       ↓                                   │                  │
│  ┌──────────────────┐                    │                  │
│  │   MUSIC.AI API   │                    │                  │
│  │   - Mixing       │                    │                  │
│  │   - Enhancement  │                    │                  │
│  │   - Mastering    │                    │                  │
│  └────────┬─────────┘                    │                  │
│           │                               │                  │
│           │ New Mix URL                   │                  │
│           └───────────────────────────────┘                  │
│                        ↓                                     │
│  📊 VisualFeedback + 🎧 AudioPlayer                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Módulos Novos

#### 1. **MusicAIService** (`js/modules/MusicAIService.js`)
**Responsabilidade**: Comunicação com API Music.AI

```javascript
class MusicAIService {
  constructor(apiKey, config)
  async authenticate()
  async runWorkflow(workflowId, inputs)
  async uploadAudio(audioBlob)
  async getWorkflowStatus(jobId)
  handleRateLimit()
  handleErrors(error)
}
```

**Features**:
- Autenticação Bearer Token
- Rate limiting e retry logic
- Queue de requisições
- Error handling robusto
- Métricas e logging

---

#### 2. **AudioExporter** (`js/modules/AudioExporter.js`)
**Responsabilidade**: Exportar genes sonoros como arquivos de áudio

```javascript
class AudioExporter {
  constructor(audioContext)
  async captureGeneAudio(creature, duration)
  async exportToWAV(audioBuffer)
  async exportToMP3(audioBuffer)
  createBlobURL(blob)
  cleanup(url)
}
```

**Features**:
- Captura de Web Audio API buffer
- Conversão WAV/MP3
- Otimização de tamanho
- Limpeza de memória

---

#### 3. **MixEvolutionManager** (`js/modules/MixEvolutionManager.js`)
**Responsabilidade**: Orquestrar fluxo de mixagem evolutiva

```javascript
class MixEvolutionManager {
  constructor(musicAIService, audioExporter, storageService)
  async processNewGesture(gesture, creature)
  async createMix(previousMixUrl, newGeneUrl, influence)
  getPreviousMixUrl()
  updateMixHistory(mixUrl, metadata)
  getMixHistory()
  async applyGeneInfluence(influence)
}
```

**Features**:
- Gerenciamento de previous_mix_url
- Controle de gene influence
- Histórico de mixagens
- Cache inteligente
- Fallback para mixagem local

---

#### 4. **AudioStorageService** (`js/modules/AudioStorageService.js`)
**Responsabilidade**: Armazenamento temporário de áudios

```javascript
class AudioStorageService {
  async uploadToStorage(audioBlob, metadata)
  async getAudioUrl(audioId)
  async deleteOldAudios(maxAge)
  async getCacheSize()
  clearCache()
}
```

**Estratégias**:
- **Opção 1**: localStorage + Base64 (limitado, ~5-10MB)
- **Opção 2**: IndexedDB (melhor para áudios, ~50MB+)
- **Opção 3**: Upload para S3/Firebase/Cloudinary
- **Recomendação**: IndexedDB local + upload opcional

---

### Fluxo de Dados Detalhado

```
1. 👋 GESTO DETECTADO
   ├─> BodyTracker extrai features
   └─> classifica tipo de gesto

2. 🧬 CRIAÇÃO/CRUZAMENTO
   ├─> EvolutionEngine gera creature
   └─> SoundEngine define DNA sonoro

3. 📤 EXPORTAÇÃO (NOVO)
   ├─> AudioExporter captura áudio do gene (2-4s)
   ├─> Converte para WAV/MP3
   └─> Gera new_gene_url

4. 🎵 MIXAGEM (NOVO)
   ├─> MixEvolutionManager pega previous_mix_url
   ├─> Prepara inputs: {previous, newGene, influence}
   └─> Chama MusicAIService

5. 🌐 API MUSIC.AI
   ├─> Workflow: source_loader → mixing → enhance → master
   ├─> Processa em cloud
   └─> Retorna mixed_audio_url

6. 💾 ARMAZENAMENTO
   ├─> AudioStorageService salva novo mix
   └─> Atualiza previous_mix_url para próximo gesto

7. 📊 VISUALIZAÇÃO
   ├─> VisualFeedback atualiza UI
   ├─> Player toca novo mix
   └─> Histórico atualizado
```

---

## 🗓️ Roadmap de Implementação

### Sprint 1: Fundação (Semana 1-2)
**Objetivo**: Setup inicial e estrutura base

#### Task 1.1: Planejamento e Especificação
- [ ] Criar documento de especificação técnica detalhada
- [ ] Definir schemas de dados (DNA, Gesture, Mix)
- [ ] Criar diagramas de arquitetura e fluxo
- [ ] Revisar e aprovar especificação com stakeholders
- **Deliverable**: `docs/MUSICAI_INTEGRATION_SPEC.md`

#### Task 1.2: Setup de Ambiente
- [ ] Configurar estrutura de pastas
- [ ] Setup de ferramentas de teste (Jest)
- [ ] Configurar ESLint e Prettier
- [ ] Criar arquivo `.env.example`
- **Deliverable**: Ambiente configurado

#### Task 1.3: MusicAIService Base
- [ ] Implementar classe base
- [ ] Sistema de autenticação
- [ ] Métodos HTTP básicos (GET, POST)
- [ ] Logger integrado
- **Deliverable**: `js/modules/MusicAIService.js` (v0.1)

---

### Sprint 2: Core Features (Semana 3-4)
**Objetivo**: Funcionalidades principais

#### Task 2.1: AudioExporter
- [ ] Implementar captura de buffer do Web Audio API
- [ ] Conversão para WAV (PCM)
- [ ] Otimização de tamanho de arquivo
- [ ] Geração de URLs temporárias
- **Deliverable**: `js/modules/AudioExporter.js`
- **Test Coverage**: ≥80%

#### Task 2.2: MusicAIService Completo
- [ ] Implementar `runWorkflow()`
- [ ] Implementar `uploadAudio()`
- [ ] Retry logic com exponential backoff
- [ ] Rate limiting handler
- [ ] Error handling completo
- **Deliverable**: `js/modules/MusicAIService.js` (v1.0)
- **Test Coverage**: ≥85%

#### Task 2.3: AudioStorageService
- [ ] Implementar IndexedDB wrapper
- [ ] CRUD de áudios
- [ ] Sistema de limpeza automática
- [ ] Métricas de uso de storage
- **Deliverable**: `js/modules/AudioStorageService.js`
- **Test Coverage**: ≥75%

---

### Sprint 3: Integração (Semana 5-6)
**Objetivo**: Conectar todos os módulos

#### Task 3.1: MixEvolutionManager
- [ ] Implementar orquestração de fluxo
- [ ] Gerenciamento de previous_mix
- [ ] Sistema de cache
- [ ] Fallback para mixagem local
- [ ] Histórico de mixagens
- **Deliverable**: `js/modules/MixEvolutionManager.js`
- **Test Coverage**: ≥80%

#### Task 3.2: Integração com SoundEngine
- [ ] Adicionar hook de exportação em `playCreature()`
- [ ] Modificar `createCreature()` para suportar mixagem
- [ ] Ajustar timings e duração de captura
- **Deliverable**: `js/modules/SoundEngine.js` (atualizado)

#### Task 3.3: Integração com main.js
- [ ] Inicializar novos módulos
- [ ] Conectar fluxo de gestos → mixagem
- [ ] Atualizar event handlers
- [ ] Configurar fallbacks
- **Deliverable**: `js/main.js` (atualizado)

---

### Sprint 4: UI e UX (Semana 7)
**Objetivo**: Interface de usuário

#### Task 4.1: Controles de Mixagem
- [ ] Toggle enable/disable Music.AI
- [ ] Slider de gene influence (0-1)
- [ ] Indicador de status (processing, success, error)
- [ ] Botão de histórico
- **Deliverable**: Controles em `index.html`

#### Task 4.2: Visualização de Histórico
- [ ] Lista de mixagens anteriores
- [ ] Player de áudio para preview
- [ ] Metadados (timestamp, parents, influence)
- [ ] Ações (download, delete)
- **Deliverable**: Modal de histórico

#### Task 4.3: Feedback Visual
- [ ] Animação de processamento
- [ ] Progress bar durante upload/processing
- [ ] Notificações de sucesso/erro
- [ ] Tooltip com informações
- **Deliverable**: Componentes visuais

---

### Sprint 5: Testes (Semana 8)
**Objetivo**: Qualidade e robustez

#### Task 5.1: Testes Unitários
- [ ] MusicAIService (mocks)
- [ ] AudioExporter
- [ ] MixEvolutionManager
- [ ] AudioStorageService
- [ ] Coverage ≥80% em todos os módulos
- **Deliverable**: `tests/unit/*.test.js`

#### Task 5.2: Testes de Integração
- [ ] Fluxo completo: gesture → gene → mix
- [ ] Testes com API mockada
- [ ] Testes de erro e fallback
- [ ] Performance tests
- **Deliverable**: `tests/integration/*.test.js`

#### Task 5.3: Testes E2E
- [ ] Setup Cypress
- [ ] Cenário: usuário inicia sistema e faz gestos
- [ ] Cenário: usuário ajusta gene influence
- [ ] Cenário: usuário visualiza histórico
- [ ] Cenário: erro de API e recuperação
- **Deliverable**: `tests/e2e/*.cy.js`

---

### Sprint 6: Performance e Otimização (Semana 9)
**Objetivo**: Otimizar sistema

#### Task 6.1: Performance
- [ ] Implementar debouncing de gestos
- [ ] Lazy loading de áudios
- [ ] Web Workers para conversão de áudio
- [ ] Compressão de áudios antes de upload
- [ ] Cache inteligente de mixagens
- **Deliverable**: Melhorias de performance

#### Task 6.2: Monitoring
- [ ] Logger estruturado
- [ ] Métricas de API (quota, latência)
- [ ] Performance monitoring
- [ ] Error tracking
- **Deliverable**: `js/utils/Logger.js`, Dashboard

#### Task 6.3: Error Handling
- [ ] Fallback gracioso
- [ ] Retry automático
- [ ] Queue de requisições
- [ ] User notifications
- **Deliverable**: Sistema robusto de erros

---

### Sprint 7: Documentação (Semana 10)
**Objetivo**: Documentação completa

#### Task 7.1: Documentação Técnica
- [ ] API Reference completa
- [ ] Arquitetura atualizada
- [ ] Guia de troubleshooting
- **Deliverable**: `docs/API_REFERENCE.md`

#### Task 7.2: Guias de Usuário
- [ ] Setup Guide (Music.AI API Key)
- [ ] User Guide (como usar o sistema)
- [ ] FAQ
- **Deliverable**: `docs/MUSICAI_SETUP.md`, `docs/USER_GUIDE.md`

#### Task 7.3: Guias de Desenvolvedor
- [ ] Contributing Guide
- [ ] Development Workflow
- [ ] Como adicionar novos workflows
- **Deliverable**: `docs/CONTRIBUTING.md`

---

### Sprint 8: Deploy e Release (Semana 11)
**Objetivo**: Preparar produção

#### Task 8.1: CI/CD
- [ ] Setup GitHub Actions
- [ ] Pipeline de testes automatizados
- [ ] Build otimizado
- [ ] Deploy automático
- **Deliverable**: `.github/workflows/ci.yml`

#### Task 8.2: Produção
- [ ] Environment variables production
- [ ] CDN setup para áudios
- [ ] Configuração de domínio
- [ ] Monitoramento em produção
- **Deliverable**: Sistema em produção

#### Task 8.3: Release
- [ ] CHANGELOG.md
- [ ] Release notes
- [ ] Migration guide
- [ ] Versão 2.0.0
- **Deliverable**: Release publicado

---

## ⏱️ Timeline Estimado

| Sprint | Duração | Período | Foco Principal |
|--------|---------|---------|----------------|
| 1 | 2 semanas | Semana 1-2 | Fundação e setup |
| 2 | 2 semanas | Semana 3-4 | Core features |
| 3 | 2 semanas | Semana 5-6 | Integração |
| 4 | 1 semana | Semana 7 | UI/UX |
| 5 | 1 semana | Semana 8 | Testes |
| 6 | 1 semana | Semana 9 | Performance |
| 7 | 1 semana | Semana 10 | Documentação |
| 8 | 1 semana | Semana 11 | Deploy |

**Total: 11 semanas (~2.5 meses)**

### Milestones

- **M1** (Semana 2): ✅ Setup completo + MusicAIService base
- **M2** (Semana 4): ✅ Todos os módulos core implementados
- **M3** (Semana 6): ✅ Integração completa funcionando
- **M4** (Semana 8): ✅ Testes completos com cobertura ≥80%
- **M5** (Semana 11): 🚀 Deploy em produção

---

## 🛠️ Dependências e Ferramentas

### Dependências Externas

#### NPM Packages
```json
{
  "dependencies": {
    "axios": "^1.6.0",           // HTTP client
    "lamejs": "^1.2.1",          // MP3 encoding
    "idb": "^8.0.0"              // IndexedDB wrapper
  },
  "devDependencies": {
    "jest": "^29.7.0",           // Testing framework
    "cypress": "^13.6.0",        // E2E testing
    "@testing-library/dom": "^9.3.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

#### APIs e Serviços
- **Music.AI API** (v1)
  - Endpoint: `https://api.music.ai/v1/`
  - Autenticação: Bearer Token
  - Rate Limit: 100 req/min (verificar com Music.AI)
  - Pricing: Verificar plano

- **Storage** (Opcional)
  - AWS S3 ou
  - Firebase Storage ou
  - Cloudinary

### Ferramentas de Desenvolvimento
- **VS Code** com extensões:
  - ESLint
  - Prettier
  - Jest Runner
  - GitLens

- **Testing**:
  - Jest (unit + integration)
  - Cypress (e2e)
  - Jest Coverage Reports

- **CI/CD**:
  - GitHub Actions
  - Automated testing
  - Deploy preview

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos

#### 1. **Latência da API Music.AI**
- **Risco**: Processamento pode demorar 5-30 segundos
- **Impacto**: UX degradada, usuário espera muito
- **Mitigação**:
  - ✅ Processamento assíncrono com feedback visual
  - ✅ Cache de mixagens similares
  - ✅ Fallback para mixagem local Web Audio
  - ✅ Queue de requisições em background

#### 2. **Limite de Quota da API**
- **Risco**: Atingir limite de requisições/mês
- **Impacto**: Sistema para de funcionar
- **Mitigação**:
  - ✅ Monitoring de quota em tempo real
  - ✅ Alertas quando atingir 80% do limite
  - ✅ Modo fallback automático
  - ✅ Limite de gestos por minuto configurável

#### 3. **Tamanho dos Arquivos de Áudio**
- **Risco**: Áudios grandes consomem muito storage/bandwidth
- **Impacto**: Custos altos, lentidão
- **Mitigação**:
  - ✅ Compressão MP3 com qualidade ajustável
  - ✅ Duração limitada de genes (2-4s)
  - ✅ Limpeza automática de áudios antigos
  - ✅ Streaming ao invés de download completo

#### 4. **Compatibilidade de Browser**
- **Risco**: Web Audio API e MediaRecorder não uniformes
- **Impacto**: Sistema não funciona em alguns browsers
- **Mitigação**:
  - ✅ Polyfills para browsers antigos
  - ✅ Feature detection com fallback
  - ✅ Mensagens claras de incompatibilidade
  - ✅ Suporte prioritário: Chrome, Firefox, Safari 15+

#### 5. **Race Conditions**
- **Risco**: Múltiplos gestos simultâneos causam bugs
- **Impacto**: Mixagens corrompidas, errors
- **Mitigação**:
  - ✅ Queue serializada de processamento
  - ✅ Locks em operações críticas
  - ✅ Debouncing de gestos muito rápidos
  - ✅ State management claro

### Riscos de Negócio

#### 6. **Custos de API**
- **Risco**: Custo por requisição pode ser alto
- **Impacto**: Inviabilidade financeira
- **Mitigação**:
  - ✅ Calcular ROI antes de deploy
  - ✅ Implementar quotas por usuário
  - ✅ Modo gratuito com limitações
  - ✅ Considerar self-hosted como alternativa

#### 7. **Dependência de Serviço Externo**
- **Risco**: Music.AI sair do ar ou mudar API
- **Impacto**: Sistema para
- **Mitigação**:
  - ✅ Abstração de interface (adapter pattern)
  - ✅ Fallback para processamento local
  - ✅ Considerar múltiplos providers
  - ✅ SLA agreement com Music.AI

---

## 📊 Métricas de Sucesso

### KPIs Técnicos
- ✅ **Test Coverage**: ≥80% em todos os módulos
- ✅ **Performance**: Mixagem completa em <30s (p95)
- ✅ **Disponibilidade**: 99% uptime
- ✅ **Error Rate**: <5% de requisições falhadas
- ✅ **Latência API**: <2s para upload (p95)

### KPIs de Produto
- ✅ **Usuários Ativos**: +50 usuários em primeiro mês
- ✅ **Engagement**: Média de 10+ gestos por sessão
- ✅ **Retention**: 30% voltam após 7 dias
- ✅ **Satisfação**: NPS ≥40

---

## 🔄 Próximos Passos (Pós-Release)

### v2.1 - Melhorias
- [ ] Suporte a mais formatos de áudio (FLAC, OGG)
- [ ] Visualização espectral em tempo real
- [ ] Presets de workflows Music.AI
- [ ] Share de mixagens (URL pública)

### v2.2 - Features Avançadas
- [ ] Machine Learning para sugerir influence
- [ ] Colaboração multi-usuário
- [ ] Exportação de projeto completo
- [ ] Integração com DAWs (Ableton, FL Studio)

### v3.0 - Platform
- [ ] Backend dedicado
- [ ] Contas de usuário
- [ ] Marketplace de presets
- [ ] App mobile

---

## 📚 Referências

- [Music.AI API Documentation](https://docs.music.ai)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Jest Testing Framework](https://jestjs.io/)
- [Cypress E2E Testing](https://www.cypress.io/)

---

**Última Atualização**: 11 de Novembro de 2025  
**Versão do Documento**: 1.0  
**Autor**: Equipe Eco-Gesto  
**Status**: 🟢 Aprovado para Implementação
