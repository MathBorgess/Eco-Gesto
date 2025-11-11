# 🚀 Quick Start - Integração Music.AI

## ⏱️ Setup em 10 minutos

### Pré-requisitos
- Node.js 16+ instalado
- Conta na plataforma Music.AI
- Navegador moderno (Chrome, Firefox, Safari 15+)

---

## Passo 1: Obter API Key do Music.AI

1. Acesse [music.ai](https://music.ai)
2. Crie uma conta ou faça login
3. Vá em **Dashboard → API Keys**
4. Clique em **"Create New API Key"**
5. Dê um nome (ex: "Eco-Gesto Development")
6. Copie a API key gerada

⚠️ **Importante**: Guarde sua API key em local seguro! Ela não será mostrada novamente.

---

## Passo 2: Configurar Projeto

### 2.1 Clonar e Instalar Dependências

```bash
# Clone o repositório (se ainda não fez)
git clone https://github.com/seu-usuario/Eco-Gesto.git
cd Eco-Gesto

# Instale as dependências
npm install
```

### 2.2 Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env
nano .env  # ou use seu editor preferido
```

Substitua `your_api_key_here` pela sua API key:

```bash
MUSICAI_API_KEY=sk_live_abc123xyz...
```

---

## Passo 3: Criar Workflow no Music.AI

1. No dashboard do Music.AI, vá em **Workflows**
2. Clique em **"Create Workflow"**
3. Dê o nome: `genetic_mix_v1`
4. Adicione os seguintes módulos:

```json
{
  "name": "genetic_mix_v1",
  "description": "Mixagem evolutiva para Eco-Gesto",
  "modules": [
    {
      "name": "source_loader",
      "params": {
        "inputs": ["$input.previous_mix_url", "$input.new_gene_url"]
      }
    },
    {
      "name": "mixing",
      "params": {
        "balance_mode": "intelligent",
        "dynamic_range_control": true
      }
    },
    {
      "name": "enhance",
      "params": {
        "noise_reduction": true,
        "clarity_boost": true
      }
    },
    {
      "name": "mastering",
      "params": {
        "preset": "modern_warm"
      }
    },
    {
      "name": "export_audio",
      "params": {
        "format": "mp3",
        "output_url": "$output.mixed_audio"
      }
    }
  ]
}
```

5. Salve o workflow
6. Copie o **Workflow ID** e cole no `.env`:

```bash
MUSICAI_WORKFLOW_ID=wf_abc123...
```

---

## Passo 4: Instalar Dependências Específicas

```bash
# Instalar bibliotecas necessárias
npm install axios lamejs idb

# Instalar dependências de desenvolvimento
npm install --save-dev jest cypress @testing-library/dom
```

---

## Passo 5: Iniciar o Sistema

```bash
# Modo desenvolvimento
npm run dev

# Ou abrir diretamente o HTML
open index.html
```

---

## Passo 6: Testar a Integração

### Teste Manual

1. Abra o sistema no navegador
2. Clique em **"Iniciar Sistema"**
3. Permita acesso à webcam
4. Faça alguns gestos na frente da câmera
5. Aguarde ~30 segundos
6. Ouça o áudio mixado gerado

### Verificar Logs

Abra o **Console do Navegador** (F12) e procure por:

```
✅ MusicAIService inicializado
✅ AudioExporter pronto
✅ MixEvolutionManager ativo
🎵 Processando novo gesto...
🌐 Enviando para Music.AI...
✅ Mix concluído: [URL]
```

---

## Passo 7: Configurações Opcionais

### Ajustar Gene Influence

No HTML, use o slider:

```html
<input type="range" 
       id="geneInfluenceSlider" 
       min="0" 
       max="1" 
       step="0.1" 
       value="0.3">
```

- **0.0**: Mix anterior permanece intacto
- **0.5**: Balanço 50/50
- **1.0**: Novo gene domina completamente

### Habilitar Modo Debug

No `.env`:

```bash
DEBUG_MODE=true
```

Logs mais detalhados serão exibidos no console.

---

## 🧪 Executar Testes

### Testes Unitários

```bash
npm test
```

### Testes E2E

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

---

## 🐛 Troubleshooting

### Erro: "API Key inválida"

**Solução**: Verifique se copiou a key corretamente no `.env`

```bash
# Teste sua API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.music.ai/v1/account
```

### Erro: "Workflow não encontrado"

**Solução**: Verifique se criou o workflow e copiou o ID correto.

### Áudio não está sendo gerado

**Solução**: Verifique o console do navegador. Se há erro de CORS, configure o servidor.

### Fallback sempre ativa

**Solução**: Provavelmente a API está falhando. Verifique:
- Quota da API
- Status da plataforma Music.AI
- Logs de erro no console

---

## 📚 Próximos Passos

✅ Setup completo  
→ Leia a [Documentação Completa](./MUSICAI_INTEGRATION_SPEC.md)  
→ Explore a [Arquitetura](./ARCHITECTURE.md)  
→ Contribua com o projeto: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 💬 Suporte

- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/Eco-Gesto/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/seu-usuario/Eco-Gesto/discussions)
- 📧 Email: contato@ecogesto.com

---

**Tempo total de setup**: ~10 minutos ⚡
