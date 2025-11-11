# 🎼 Especificação Técnica - Integração Music.AI

## 📋 Informações do Documento
- **Projeto**: Eco-Gesto
- **Módulo**: Integração Music.AI
- **Versão**: 1.0
- **Data**: 11 de Novembro de 2025
- **Status**: Draft para Revisão

---

## 1. Requisitos Funcionais

### RF-01: Exportação de Gene Sonoro
**Descrição**: O sistema deve ser capaz de exportar o áudio gerado por uma criatura (gene sonoro) como arquivo WAV ou MP3.

**Critérios de Aceitação**:
- [ ] Capturar buffer de áudio do Web Audio API
- [ ] Converter para formato WAV (16-bit PCM, 44.1kHz)
- [ ] Opcionalmente converter para MP3 (128-192 kbps)
- [ ] Gerar URL temporária ou Blob
- [ ] Duração configurável (padrão: 3 segundos)
- [ ] Liberar recursos após uso

**Prioridade**: ALTA  
**Complexidade**: MÉDIA

---

### RF-02: Upload de Áudio para Music.AI
**Descrição**: O sistema deve fazer upload de áudios (previous_mix e new_gene) para a API Music.AI.

**Critérios de Aceitação**:
- [ ] Suportar upload via multipart/form-data
- [ ] Validar formato antes de upload (WAV/MP3)
- [ ] Validar tamanho máximo (ex: 10MB)
- [ ] Exibir progresso de upload
- [ ] Tratar erros de rede
- [ ] Retry automático (até 3 tentativas)

**Prioridade**: ALTA  
**Complexidade**: MÉDIA

---

### RF-03: Execução de Workflow Music.AI
**Descrição**: O sistema deve enviar requisição para executar workflow customizado de mixagem.

**Critérios de Aceitação**:
- [ ] Autenticação via Bearer Token
- [ ] Enviar parâmetros: previous_mix_url, new_gene_url, influence
- [ ] Receber job_id para tracking
- [ ] Polling de status (pending → processing → completed)
- [ ] Timeout após 60 segundos
- [ ] Tratamento de erros da API (400, 401, 429, 500, 503)

**Prioridade**: ALTA  
**Complexidade**: ALTA

**Exemplo de Request**:
```json
POST https://api.music.ai/v1/workflows/run
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "workflow_id": "genetic_mix_v1",
  "input": {
    "previous_mix_url": "https://storage.example.com/mix_123.mp3",
    "new_gene_url": "https://storage.example.com/gene_456.mp3",
    "influence": 0.3
  },
  "options": {
    "priority": "standard",
    "webhook_url": null
  }
}
```

**Exemplo de Response**:
```json
{
  "job_id": "job_abc123",
  "status": "pending",
  "created_at": "2025-11-11T10:30:00Z",
  "estimated_time": 15
}
```

---

### RF-04: Gerenciamento de Mixagem Evolutiva
**Descrição**: O sistema deve gerenciar o fluxo de mixagem evolutiva, mantendo histórico e estado.

**Critérios de Aceitação**:
- [ ] Armazenar URL do mix anterior (previous_mix_url)
- [ ] Atualizar previous_mix após cada nova mixagem
- [ ] Manter histórico de até 20 mixagens
- [ ] Permitir rollback para mix anterior
- [ ] Exibir metadados (timestamp, parents, influence, duration)
- [ ] Limpar histórico ao resetar sistema

**Prioridade**: ALTA  
**Complexidade**: MÉDIA

---

### RF-05: Controle de Influência do Gene
**Descrição**: O usuário deve poder controlar quanto o novo gene influencia o mix final.

**Critérios de Aceitação**:
- [ ] Slider de 0.0 a 1.0 (padrão: 0.3)
- [ ] 0.0 = mix anterior permanece intacto
- [ ] 1.0 = novo gene domina completamente
- [ ] Valor salvo em localStorage
- [ ] Tooltip explicativo
- [ ] Atualização visual em tempo real

**Prioridade**: MÉDIA  
**Complexidade**: BAIXA

---

### RF-06: Visualização de Histórico
**Descrição**: O usuário deve poder visualizar e reproduzir mixagens anteriores.

**Critérios de Aceitação**:
- [ ] Lista com últimas 20 mixagens
- [ ] Exibir: timestamp, geração, parents, influence
- [ ] Player de áudio para preview
- [ ] Botão de download
- [ ] Botão de delete
- [ ] Indicação visual da mixagem atual

**Prioridade**: MÉDIA  
**Complexidade**: MÉDIA

---

### RF-07: Fallback para Mixagem Local
**Descrição**: Se API Music.AI falhar, o sistema deve fazer mixagem localmente.

**Critérios de Aceitação**:
- [ ] Detectar falha da API automaticamente
- [ ] Mixar áudios usando Web Audio API (convolver/mix)
- [ ] Notificar usuário sobre modo fallback
- [ ] Permitir retry manual
- [ ] Logging de fallbacks para métricas

**Prioridade**: ALTA  
**Complexidade**: ALTA

---

### RF-08: Sistema de Storage
**Descrição**: O sistema deve armazenar áudios temporariamente.

**Critérios de Aceitação**:
- [ ] Implementar via IndexedDB (preferencial)
- [ ] Capacidade mínima de 50MB
- [ ] CRUD completo (create, read, delete)
- [ ] Limpeza automática de áudios >7 dias
- [ ] Exibir uso de storage (X MB / Y MB)
- [ ] Botão de limpeza manual

**Prioridade**: ALTA  
**Complexidade**: MÉDIA

---

## 2. Requisitos Não-Funcionais

### RNF-01: Performance
- **Tempo de Exportação**: ≤2s para áudio de 3s
- **Tempo de Upload**: ≤5s para arquivo de 2MB (4G)
- **Tempo de Mixagem (API)**: ≤30s (p95)
- **Tempo Total (Gesto → Mix Pronto)**: ≤40s (p95)
- **Uso de Memória**: ≤100MB adicional

### RNF-02: Disponibilidade
- **Uptime do Sistema**: 99% (excluindo falhas da API externa)
- **Fallback Success Rate**: ≥95%
- **Error Rate**: ≤5% de requisições

### RNF-03: Segurança
- **API Key**: Armazenada em variável de ambiente, nunca em código
- **HTTPS**: Todas as requisições devem usar TLS
- **CORS**: Configurado corretamente
- **Sanitização**: Todos os inputs devem ser sanitizados
- **Rate Limiting**: Máximo 1 requisição/segundo por usuário

### RNF-04: Usabilidade
- **Loading States**: Feedback visual claro em todas as operações assíncronas
- **Error Messages**: Mensagens claras e acionáveis
- **Responsive**: UI deve funcionar em desktop (prioridade) e tablet
- **Acessibilidade**: Seguir WCAG 2.1 AA mínimo

### RNF-05: Manutenibilidade
- **Code Coverage**: ≥80% em testes
- **Documentação**: Todos os módulos públicos documentados (JSDoc)
- **Linting**: Zero erros no ESLint
- **Modularidade**: Baixo acoplamento entre módulos

### RNF-06: Escalabilidade
- **Quota de API**: Sistema deve funcionar com quota de 1000 requisições/dia
- **Usuários Simultâneos**: Suportar até 10 usuários simultâneos (v1)
- **Storage**: Suportar até 100 áudios no histórico

---

## 3. Arquitetura de Módulos

### 3.1 MusicAIService

**Responsabilidades**:
- Comunicação com API Music.AI
- Autenticação
- Error handling
- Retry logic
- Rate limiting

**Interface Pública**:
```javascript
class MusicAIService {
  /**
   * @param {string} apiKey - API key do Music.AI
   * @param {Object} config - Configurações opcionais
   */
  constructor(apiKey, config = {})

  /**
   * Testa autenticação com a API
   * @returns {Promise<boolean>}
   */
  async authenticate()

  /**
   * Executa workflow de mixagem
   * @param {string} workflowId - ID do workflow
   * @param {Object} inputs - { previous_mix_url, new_gene_url, influence }
   * @returns {Promise<Object>} { job_id, status }
   */
  async runWorkflow(workflowId, inputs)

  /**
   * Verifica status de um job
   * @param {string} jobId
   * @returns {Promise<Object>} { status, result_url, error }
   */
  async getJobStatus(jobId)

  /**
   * Upload de arquivo de áudio
   * @param {Blob} audioBlob
   * @param {Function} onProgress - Callback (percentual)
   * @returns {Promise<string>} URL do áudio
   */
  async uploadAudio(audioBlob, onProgress)

  /**
   * Obtém métricas de uso da API
   * @returns {Object} { quota_used, quota_limit, requests_today }
   */
  getMetrics()
}
```

**Dependências**:
- `axios` (HTTP client)
- `Logger` (logging)

**Testes**:
- ✅ Autenticação válida
- ✅ Autenticação inválida (401)
- ✅ Upload de áudio
- ✅ Execução de workflow
- ✅ Polling de status
- ✅ Retry em falha de rede
- ✅ Rate limiting (429)
- ✅ Timeout

---

### 3.2 AudioExporter

**Responsabilidades**:
- Captura de buffer do Web Audio API
- Conversão para WAV/MP3
- Otimização de tamanho

**Interface Pública**:
```javascript
class AudioExporter {
  /**
   * @param {AudioContext} audioContext
   */
  constructor(audioContext)

  /**
   * Captura áudio de uma criatura durante N segundos
   * @param {Object} creature - Criatura sonora
   * @param {number} duration - Duração em segundos
   * @returns {Promise<AudioBuffer>}
   */
  async captureCreatureAudio(creature, duration = 3)

  /**
   * Exporta AudioBuffer para WAV
   * @param {AudioBuffer} buffer
   * @returns {Blob}
   */
  exportToWAV(buffer)

  /**
   * Exporta AudioBuffer para MP3
   * @param {AudioBuffer} buffer
   * @param {number} bitrate - kbps (padrão: 128)
   * @returns {Promise<Blob>}
   */
  async exportToMP3(buffer, bitrate = 128)

  /**
   * Cria URL temporária para Blob
   * @param {Blob} blob
   * @returns {string} URL
   */
  createBlobURL(blob)

  /**
   * Libera URL temporária
   * @param {string} url
   */
  revokeURL(url)
}
```

**Dependências**:
- `lamejs` (MP3 encoding)
- `SoundEngine` (acesso às criaturas)

**Testes**:
- ✅ Captura de áudio de criatura
- ✅ Conversão para WAV
- ✅ Conversão para MP3
- ✅ Validação de formato
- ✅ Limpeza de memória

---

### 3.3 MixEvolutionManager

**Responsabilidades**:
- Orquestração do fluxo de mixagem
- Gerenciamento de estado
- Histórico
- Cache

**Interface Pública**:
```javascript
class MixEvolutionManager {
  /**
   * @param {MusicAIService} musicAIService
   * @param {AudioExporter} audioExporter
   * @param {AudioStorageService} storageService
   */
  constructor(musicAIService, audioExporter, storageService)

  /**
   * Processa novo gesto e gera mixagem
   * @param {Object} gesture
   * @param {Object} creature
   * @returns {Promise<Object>} { mix_url, metadata }
   */
  async processNewGesture(gesture, creature)

  /**
   * Obtém URL do mix anterior
   * @returns {string|null}
   */
  getPreviousMixUrl()

  /**
   * Atualiza mix atual
   * @param {string} mixUrl
   * @param {Object} metadata
   */
  updateCurrentMix(mixUrl, metadata)

  /**
   * Obtém histórico de mixagens
   * @returns {Array<Object>}
   */
  getHistory()

  /**
   * Limpa histórico
   */
  clearHistory()

  /**
   * Faz rollback para mix anterior
   * @returns {boolean}
   */
  rollbackToPrevious()
}
```

**Dependências**:
- `MusicAIService`
- `AudioExporter`
- `AudioStorageService`
- `Logger`

**Testes**:
- ✅ Fluxo completo de mixagem
- ✅ Gerenciamento de previous_mix
- ✅ Histórico
- ✅ Rollback
- ✅ Fallback em erro

---

### 3.4 AudioStorageService

**Responsabilidades**:
- Armazenamento em IndexedDB
- CRUD de áudios
- Limpeza automática

**Interface Pública**:
```javascript
class AudioStorageService {
  constructor()

  /**
   * Inicializa o IndexedDB
   * @returns {Promise<void>}
   */
  async init()

  /**
   * Salva áudio no storage
   * @param {string} id
   * @param {Blob} audioBlob
   * @param {Object} metadata
   * @returns {Promise<string>} URL de acesso
   */
  async saveAudio(id, audioBlob, metadata)

  /**
   * Recupera áudio do storage
   * @param {string} id
   * @returns {Promise<Blob>}
   */
  async getAudio(id)

  /**
   * Obtém URL de um áudio
   * @param {string} id
   * @returns {Promise<string>}
   */
  async getAudioURL(id)

  /**
   * Remove áudio do storage
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteAudio(id)

  /**
   * Lista todos os áudios
   * @returns {Promise<Array<Object>>}
   */
  async listAudios()

  /**
   * Remove áudios mais antigos que N dias
   * @param {number} days
   * @returns {Promise<number>} Quantidade removida
   */
  async cleanOldAudios(days = 7)

  /**
   * Obtém uso de storage
   * @returns {Promise<Object>} { used, available }
   */
  async getStorageUsage()

  /**
   * Limpa todo o storage
   * @returns {Promise<void>}
   */
  async clearAll()
}
```

**Dependências**:
- `idb` (IndexedDB wrapper)

**Testes**:
- ✅ Inicialização do DB
- ✅ Save/Get áudio
- ✅ Delete áudio
- ✅ Listagem
- ✅ Limpeza automática
- ✅ Uso de storage

---

## 4. Schemas de Dados

### 4.1 Gene Audio
```javascript
{
  id: "gene_abc123",
  creature_id: "creature_456",
  audio_url: "blob:...",
  format: "mp3",
  size: 245678,  // bytes
  duration: 3.0,  // segundos
  sample_rate: 44100,
  bitrate: 128,
  created_at: "2025-11-11T10:30:00Z"
}
```

### 4.2 Mix Metadata
```javascript
{
  id: "mix_xyz789",
  previous_mix_id: "mix_abc123",
  gene_id: "gene_def456",
  audio_url: "https://api.music.ai/output/mix_xyz.mp3",
  influence: 0.3,
  generation: 5,
  parents: ["creature_123", "creature_456"],
  workflow_id: "genetic_mix_v1",
  job_id: "job_abc123",
  processing_time: 18.5,  // segundos
  created_at: "2025-11-11T10:30:00Z",
  metadata: {
    original_features: { ... },
    api_response: { ... }
  }
}
```

### 4.3 Mix History Entry
```javascript
{
  mix: { /* Mix Metadata */ },
  timestamp: "2025-11-11T10:30:00Z",
  status: "completed",  // pending | processing | completed | failed
  error: null  // ou { code, message }
}
```

### 4.4 API Request Log
```javascript
{
  id: "log_123",
  endpoint: "/v1/workflows/run",
  method: "POST",
  status_code: 200,
  response_time: 234,  // ms
  quota_used: 1,
  timestamp: "2025-11-11T10:30:00Z",
  error: null
}
```

---

## 5. Fluxo de Dados Detalhado

### 5.1 Fluxo Normal (Sucesso)

```
1. USER: Faz gesto
   ↓
2. BodyTracker: Detecta e extrai features
   ↓
3. EvolutionEngine: Cria/cruza criatura
   ↓
4. SoundEngine: Gera áudio da criatura
   ↓
5. AudioExporter: Captura buffer (3s)
   ├─> Converte para MP3
   └─> Gera new_gene_url
   ↓
6. MixEvolutionManager:
   ├─> Pega previous_mix_url (ou null se primeiro)
   ├─> Pega gene_influence do UI
   └─> Chama processNewGesture()
   ↓
7. MusicAIService:
   ├─> Upload de new_gene (se necessário)
   ├─> POST /v1/workflows/run
   └─> Recebe job_id
   ↓
8. MusicAIService: Polling de status
   ├─> GET /v1/jobs/{job_id} (a cada 2s)
   └─> Aguarda status = "completed"
   ↓
9. MusicAIService: Retorna result_url
   ↓
10. AudioStorageService: Salva novo mix
   ↓
11. MixEvolutionManager:
    ├─> Atualiza previous_mix_url
    ├─> Adiciona ao histórico
    └─> Emite evento "mix-ready"
    ↓
12. VisualFeedback:
    ├─> Atualiza UI
    ├─> Toca novo mix
    └─> Mostra notificação de sucesso

Total: ~40s (3s captura + 5s upload + 20s processamento + 2s saving)
```

### 5.2 Fluxo com Fallback (API Falha)

```
1-5. [Mesmos passos do fluxo normal]
   ↓
6. MusicAIService: Falha (timeout, 500, etc)
   ↓
7. MixEvolutionManager: Detecta falha
   ├─> Logger registra erro
   ├─> Emite evento "api-fallback"
   └─> Chama localMix()
   ↓
8. MixEvolutionManager.localMix():
   ├─> Carrega previous_mix como AudioBuffer
   ├─> Carrega new_gene como AudioBuffer
   ├─> Mixagem via Web Audio API:
   │   ├─> Cria GainNodes
   │   ├─> previous: gain = (1 - influence)
   │   ├─> new_gene: gain = influence
   │   └─> Combina em OfflineAudioContext
   ├─> Exporta resultado para MP3
   └─> Retorna local_mix_url
   ↓
9-12. [Mesmos passos do fluxo normal]

Total: ~10s (sem API call)
```

---

## 6. Tratamento de Erros

### 6.1 Categorias de Erros

| Código | Tipo | Causa | Ação |
|--------|------|-------|------|
| E001 | NetworkError | Sem internet | Retry automático (3x) |
| E002 | AuthError | API key inválida | Alerta ao admin |
| E003 | QuotaExceeded | Limite da API atingido | Fallback local |
| E004 | TimeoutError | API demorou >60s | Retry 1x, depois fallback |
| E005 | ValidationError | Input inválido | Log e skip |
| E006 | StorageError | IndexedDB cheio | Limpar cache |
| E007 | ExportError | Falha ao exportar áudio | Retry 2x |
| E008 | APIError | Erro 500 da API | Fallback local |

### 6.2 Estratégias de Retry

```javascript
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,  // 1s
  maxDelay: 10000,  // 10s
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
}

async function retryWithBackoff(fn, config = RETRY_CONFIG) {
  let lastError
  for (let i = 0; i < config.maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isRetryable(error, config)) break
      
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, i),
        config.maxDelay
      )
      await sleep(delay)
    }
  }
  throw lastError
}
```

---

## 7. Configuração

### 7.1 Variáveis de Ambiente

```bash
# .env
MUSICAI_API_KEY=your_api_key_here
MUSICAI_API_URL=https://api.music.ai/v1
MUSICAI_WORKFLOW_ID=genetic_mix_v1
MUSICAI_TIMEOUT=60000
MUSICAI_MAX_RETRIES=3

STORAGE_MAX_SIZE_MB=50
STORAGE_CLEANUP_DAYS=7

GENE_DURATION_SECONDS=3
GENE_EXPORT_FORMAT=mp3
GENE_EXPORT_BITRATE=128

DEFAULT_GENE_INFLUENCE=0.3
MAX_HISTORY_SIZE=20

DEBUG_MODE=false
ENABLE_FALLBACK=true
```

### 7.2 Arquivo de Config

```javascript
// js/config/musicai.config.js
export default {
  api: {
    key: import.meta.env.MUSICAI_API_KEY,
    baseUrl: import.meta.env.MUSICAI_API_URL || 'https://api.music.ai/v1',
    timeout: parseInt(import.meta.env.MUSICAI_TIMEOUT) || 60000,
    maxRetries: parseInt(import.meta.env.MUSICAI_MAX_RETRIES) || 3
  },
  
  workflow: {
    id: import.meta.env.MUSICAI_WORKFLOW_ID || 'genetic_mix_v1',
    modules: [
      { name: 'source_loader', params: {} },
      { name: 'mixing', params: { balance_mode: 'intelligent' } },
      { name: 'enhance', params: { noise_reduction: true } },
      { name: 'mastering', params: { preset: 'modern_warm' } },
      { name: 'export_audio', params: { format: 'mp3' } }
    ]
  },
  
  storage: {
    maxSizeMB: parseInt(import.meta.env.STORAGE_MAX_SIZE_MB) || 50,
    cleanupDays: parseInt(import.meta.env.STORAGE_CLEANUP_DAYS) || 7,
    dbName: 'EcoGestoAudio',
    version: 1
  },
  
  export: {
    duration: parseFloat(import.meta.env.GENE_DURATION_SECONDS) || 3,
    format: import.meta.env.GENE_EXPORT_FORMAT || 'mp3',
    bitrate: parseInt(import.meta.env.GENE_EXPORT_BITRATE) || 128
  },
  
  mix: {
    defaultInfluence: parseFloat(import.meta.env.DEFAULT_GENE_INFLUENCE) || 0.3,
    maxHistorySize: parseInt(import.meta.env.MAX_HISTORY_SIZE) || 20,
    enableFallback: import.meta.env.ENABLE_FALLBACK !== 'false'
  },
  
  debug: {
    enabled: import.meta.env.DEBUG_MODE === 'true',
    logLevel: import.meta.env.DEBUG_MODE === 'true' ? 'debug' : 'info'
  }
}
```

---

## 8. Testes

### 8.1 Estrutura de Testes

```
tests/
├── unit/
│   ├── MusicAIService.test.js
│   ├── AudioExporter.test.js
│   ├── MixEvolutionManager.test.js
│   ├── AudioStorageService.test.js
│   └── utils/
│       └── Logger.test.js
├── integration/
│   ├── GestureToMix.test.js
│   ├── FallbackFlow.test.js
│   └── StorageLifecycle.test.js
├── e2e/
│   ├── userFlow.cy.js
│   ├── errorHandling.cy.js
│   └── performance.cy.js
└── mocks/
    ├── musicai-api.mock.js
    ├── audio-buffers.mock.js
    └── creatures.mock.js
```

### 8.2 Casos de Teste Críticos

#### MusicAIService
- ✅ `test('should authenticate with valid API key')`
- ✅ `test('should reject with invalid API key')`
- ✅ `test('should upload audio successfully')`
- ✅ `test('should run workflow and return job_id')`
- ✅ `test('should poll job status until completed')`
- ✅ `test('should handle timeout gracefully')`
- ✅ `test('should retry on 429 rate limit')`
- ✅ `test('should throw on 401 after retries')`

#### AudioExporter
- ✅ `test('should capture creature audio for N seconds')`
- ✅ `test('should export audio to WAV format')`
- ✅ `test('should export audio to MP3 format')`
- ✅ `test('should create blob URL')`
- ✅ `test('should revoke blob URL to free memory')`

#### MixEvolutionManager
- ✅ `test('should process first gesture (no previous mix)')`
- ✅ `test('should process gesture with previous mix')`
- ✅ `test('should update history after successful mix')`
- ✅ `test('should fallback to local mix on API error')`
- ✅ `test('should limit history to maxHistorySize')`
- ✅ `test('should rollback to previous mix')`

#### AudioStorageService
- ✅ `test('should initialize IndexedDB')`
- ✅ `test('should save audio with metadata')`
- ✅ `test('should retrieve saved audio')`
- ✅ `test('should delete audio by id')`
- ✅ `test('should list all audios')`
- ✅ `test('should clean audios older than N days')`
- ✅ `test('should report storage usage')`

---

## 9. Métricas e Monitoramento

### 9.1 Métricas a Coletar

```javascript
{
  // Performance
  export_time_ms: 1234,
  upload_time_ms: 4567,
  api_processing_time_ms: 18900,
  total_time_ms: 25701,
  
  // API
  api_requests_total: 42,
  api_requests_success: 38,
  api_requests_failed: 4,
  api_quota_used: 42,
  api_quota_limit: 1000,
  
  // Storage
  storage_used_mb: 12.5,
  storage_available_mb: 37.5,
  audios_stored: 15,
  
  // Errors
  error_count_by_type: {
    E001_NetworkError: 2,
    E003_QuotaExceeded: 0,
    E004_TimeoutError: 1,
    E008_APIError: 1
  },
  
  // Fallbacks
  fallback_triggered_count: 2,
  fallback_success_count: 2
}
```

### 9.2 Dashboard (HTML)

```html
<div class="metrics-dashboard">
  <div class="metric-card">
    <h3>API Quota</h3>
    <div class="progress-bar">
      <div class="progress" style="width: 42%"></div>
    </div>
    <p>42 / 1000 requests</p>
  </div>
  
  <div class="metric-card">
    <h3>Storage</h3>
    <div class="progress-bar">
      <div class="progress" style="width: 25%"></div>
    </div>
    <p>12.5 MB / 50 MB</p>
  </div>
  
  <div class="metric-card">
    <h3>Success Rate</h3>
    <p class="big-number">90.5%</p>
    <p class="sub-text">38 / 42 requests</p>
  </div>
  
  <div class="metric-card">
    <h3>Avg Processing Time</h3>
    <p class="big-number">18.9s</p>
    <p class="sub-text">Last 10 mixes</p>
  </div>
</div>
```

---

## 10. Considerações de Segurança

### 10.1 Checklist de Segurança

- [ ] **API Key Storage**: Nunca em código, apenas em env vars
- [ ] **HTTPS Only**: Todas as requisições via TLS
- [ ] **Input Validation**: Sanitizar todos os inputs do usuário
- [ ] **CORS**: Configurar corretamente para domínios permitidos
- [ ] **Rate Limiting**: Limitar requisições por IP/usuário
- [ ] **CSP**: Content Security Policy configurado
- [ ] **XSS Prevention**: Escape de conteúdo dinâmico
- [ ] **Dependency Audit**: `npm audit` regularmente

### 10.2 Boas Práticas

1. **Não logar API keys**
2. **Usar tokens temporários quando possível**
3. **Invalidar tokens após uso**
4. **Monitorar acessos suspeitos**
5. **Limpar dados sensíveis da memória**

---

## 11. Glossário

- **Gene Sonoro**: Áudio gerado por uma criatura (entidade sonora)
- **Previous Mix**: Áudio resultante da mixagem anterior
- **Gene Influence**: Parâmetro (0-1) que controla quanto o novo gene afeta o mix
- **Workflow**: Conjunto de módulos de processamento da API Music.AI
- **Fallback**: Alternativa local quando API falha
- **Creature**: Entidade sonora com DNA (parâmetros de síntese)
- **DNA**: Conjunto de parâmetros sonoros (frequency, volume, etc)

---

## 12. Próximos Passos

1. ✅ Revisão desta especificação
2. ⏳ Aprovação dos stakeholders
3. ⏳ Setup do ambiente de desenvolvimento
4. ⏳ Implementação dos módulos core
5. ⏳ Testes e validação
6. ⏳ Deploy em staging
7. ⏳ QA e ajustes
8. ⏳ Deploy em produção

---

**Documento criado por**: Equipe Eco-Gesto  
**Última atualização**: 11 de Novembro de 2025  
**Versão**: 1.0  
**Status**: 📝 Draft para Revisão
