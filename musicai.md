🎯 Prompt de Integração — Sistema Genético + Music.AI API
Objetivo:
Integrar o sistema de geração de áudio via algoritmo genético com a API do Music.AI, de modo que, a cada gesto captado, o sistema envie dois inputUrls:
o áudio mixado anterior (previous_mix_url),
o novo gene sonoro (new_gene_url).
A Music.AI deve retornar o novo áudio resultante da fusão dos dois, utilizando um workflow personalizado de mixagem e enhancement.
🔧 Requisitos Técnicos
Linguagem: JavaScript (Node.js ou Web)
Comunicação: HTTP requests (fetch ou axios)
Autenticação: API Key (Bearer token)
Output esperado: URL do novo áudio mixado (armazenado pelo Music.AI ou retornado em base64)
🧬 Estrutura Lógica
Captura de gesto
Cada gesto do usuário gera parâmetros genéticos (geneConfig).
O algoritmo genético cria um novo gene sonoro exportado como new_gene_url.
Integração com Music.AI
Enviar os dois arquivos (previous_mix_url, new_gene_url) para o endpoint /v1/workflows/run.
Workflow customizado para “Genetic Mix Enhancement” com módulos reais do Music.AI.
⚙️ Exemplo de Workflow no Music.AI
{
"modules": [
{
"name": "source_loader",
"params": { "inputs": ["$input.previous_mix_url", "$input.new_gene_url"] }
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
"params": { "preset": "modern_warm" }
},
{
"name": "export_audio",
"params": { "format": "mp3", "output_url": "$output.mixed_audio" }
}
]
}
💻 Exemplo de Implementação (JS)
async function generateNewMix(previousMixUrl, newGeneUrl) {
const response = await fetch("https://api.music.ai/v1/workflows/run", {
method: "POST",
headers: {
"Authorization": "Bearer YOUR_MUSICAI_API_KEY",
"Content-Type": "application/json"
},
body: JSON.stringify({
input: {
previous_mix_url: previousMixUrl,
new_gene_url: newGeneUrl
},
workflow: "genetic_mix_workflow_v1"
})
});

const data = await response.json();
return data.output?.mixed_audio || null;
}

// Exemplo de uso:
const newAudioUrl = await generateNewMix(
"https://example.com/previous_mix.mp3",
"https://example.com/new_gene.mp3"
);
console.log("Novo áudio mixado:", newAudioUrl);
💡 Sugestões Criativas
Adicione um parâmetro de “gene influence” (ex: 0–1) para controlar quanto o novo gene afeta o mix.
Gere variações visuais sincronizadas com o espectro do áudio resultante.
Permita que o algoritmo genético evolua com base no feedback do público ou intensidade do gesto.
