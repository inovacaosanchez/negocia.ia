import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AzureOpenAI } from 'openai';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ===== Request logging (tempo e status) =====
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'N/A'}`);
  const start = Date.now();
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`⬅️  ${req.method} ${req.originalUrl} — ${res.statusCode} (${ms} ms)`);
  });
  next();
});

// ===== Azure OpenAI client =====
const client = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  azureEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: '2025-01-01-preview',
});

// ===== Logging helpers =====
const truncate = (str, max = 400) => {
  if (typeof str !== 'string') return str;
  return str.length > max ? `${str.slice(0, max)}… [${str.length} chars]` : str;
};

const logSection = (title, dataObj) => {
  console.log(`\n===== ${title} =====`);
  console.log(JSON.stringify(dataObj, null, 2));
  console.log(`===== END ${title} =====\n`);
};

// ===== Caches =====
const transcricaoCache = new Map();
const resumoCache = new Map();

// ===== Paths =====
// Usa caminhos relativos ao diretório do projeto atual
const projectRoot = process.cwd();
const caminhoTranscricoes = path.join(projectRoot, 'public', 'data', 'transcricoes');
const caminhoResumos = path.join(projectRoot, 'public', 'data', 'resumos');

// ===== Paths (PROMPTS EDITÁVEIS) =====
const caminhoPrompts = path.join(projectRoot, 'public', 'prompts');
const caminhoPromptsBackup = path.join(caminhoPrompts, 'backups');

if (!fs.existsSync(caminhoPromptsBackup)) {
  fs.mkdirSync(caminhoPromptsBackup, { recursive: true });
}

// ===== Helpers =====
const normalizeId = (id) => String(id).trim().replace(/\.[^.\s]+$/, '');

const readTextIfExists = (fullPath) => {
  try {
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf-8');
    }
  } catch (error) {
    console.error(`Erro ao ler arquivo: ${fullPath}`, error);
  }
  return null;
};

const loadTranscricao = (id) => {
  const cached = transcricaoCache.get(id);
  if (cached) return cached;
  const transPath = path.join(caminhoTranscricoes, `${id}.txt`);
  const text = readTextIfExists(transPath);
  if (text) transcricaoCache.set(id, text);
  return text;
};

const loadResumo = (id) => {
  const cached = resumoCache.get(id);
  if (cached) return cached;
  const resumoPath = path.join(caminhoResumos, `${id}.txt`);
  const text = readTextIfExists(resumoPath);
  if (text) resumoCache.set(id, text);
  return text;
};

// ===== Health check endpoint =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== Rota principal: usa APENAS os arquivos locais (.txt) por idLigacao =====
app.post('/api/ai', async (req, res) => {
  try {
    const { pergunta, idLigacao } = req.body;

    if (!pergunta || !idLigacao) {
      return res.status(400).json({ error: 'Pergunta e ID da ligação são obrigatórios' });
    }

    const id = normalizeId(idLigacao);

    const transPath = path.join(caminhoTranscricoes, `${id}.txt`);
    const resumoPath = path.join(caminhoResumos, `${id}.txt`);

    const transcricao = loadTranscricao(id);
    const resumo = loadResumo(id);

    logSection('📦 CONTEXTO DOS ARQUIVOS', {
      idLigacao: id,
      transPath,
      resumoPath,
      transPathExists: fs.existsSync(transPath),
      resumoPathExists: fs.existsSync(resumoPath),
      transLen: transcricao?.length || 0,
      resumoLen: resumo?.length || 0,
      transHead: truncate(transcricao ?? null, 600),
      resumoHead: truncate(resumo ?? null, 600),
    });

    if (!transcricao && !resumo) {
      return res.status(404).json({
        error: 'Nenhum dado de contexto encontrado para o ID fornecido (transcrição e resumo ausentes)',
        debug: { id, transPath, resumoPath },
      });
    }

// ===== Carregar o arquivo prompt-analise.txt =====
const promptAnalisePath = path.join(caminhoPrompts, "prompt-comportamento.txt");
const promptAnalise = readTextIfExists(promptAnalisePath) ?? "";

    const systemPrompt = `

### INSTRUÇÕES DO ARQUIVO prompt-analise.txt ###
${promptAnalise}

### RESUMO ###
${resumo ?? 'Resumo não encontrado.'}

### TRANSCRIÇÃO ###
${transcricao ?? 'Transcrição não encontrada.'}
`.trim();

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: pergunta },
    ];

    logSection('🚀 PAYLOAD PARA AZURE', {
      model: process.env.AZURE_DEPLOYMENT_NAME,
      messages: messages.map(m => ({
        role: m.role,
        contentHead: truncate(m.content, 800),
        contentLength: m.content?.length || 0,
      })),
    });

    const response = await client.chat.completions.create({
      model: process.env.AZURE_DEPLOYMENT_NAME,
      messages,
    });

    const respostaIA =
      response?.choices?.[0]?.message?.content ??
      'Não foi possível gerar resposta com base no contexto fornecido.';

    logSection('📥 RESPOSTA DA AZURE', {
      respostaHead: truncate(respostaIA, 1000),
      respostaLength: respostaIA?.length || 0,
    });

    return res.json({ resposta: respostaIA });
  } catch (err) {
    console.error('Erro backend:', err);
    return res.status(500).json({ error: err?.message || 'Erro no Azure' });
  }
});

// ===== Salvar Prompt com Backup (Configurações) =====
app.post('/api/prompts/save', (req, res) => {
  try {
    const { key, content } = req.body;

    console.log(`📝 Tentativa de salvar prompt: key="${key}", contentLength=${content?.length || 0}`);

    if (!key || typeof content !== 'string') {
      console.error('❌ Validação falhou:', { key, contentType: typeof content });
      return res.status(400).json({ error: 'Key e content são obrigatórios' });
    }

    const fileName = `prompt-${key}.txt`;
    const filePath = path.join(caminhoPrompts, fileName);

    console.log(`📁 Caminho do arquivo: ${filePath}`);
    console.log(`📁 Caminho existe? ${fs.existsSync(filePath)}`);
    console.log(`📁 Diretório existe? ${fs.existsSync(caminhoPrompts)}`);

    if (!fs.existsSync(caminhoPrompts)) {
      console.error(`❌ Diretório de prompts não existe: ${caminhoPrompts}`);
      return res.status(500).json({ 
        error: `Diretório de prompts não encontrado: ${caminhoPrompts}`,
        debug: { caminhoPrompts, filePath }
      });
    }

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`);
      // Lista arquivos no diretório para debug
      const filesInDir = fs.readdirSync(caminhoPrompts).filter(f => f.endsWith('.txt'));
      console.log(`📋 Arquivos no diretório:`, filesInDir);
      return res.status(404).json({ 
        error: `Arquivo de prompt não encontrado: ${fileName}`,
        debug: { 
          filePath, 
          caminhoPrompts,
          arquivosDisponiveis: filesInDir
        }
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `prompt-${key}_${timestamp}.txt`;
    const backupPath = path.join(caminhoPromptsBackup, backupName);

    // Garante que o diretório de backup existe
    if (!fs.existsSync(caminhoPromptsBackup)) {
      fs.mkdirSync(caminhoPromptsBackup, { recursive: true });
    }

    const currentContent = fs.readFileSync(filePath, 'utf-8');
    fs.writeFileSync(backupPath, currentContent);
    fs.writeFileSync(filePath, content, 'utf-8');

    console.log(`✅ Prompt "${fileName}" atualizado | Backup: ${backupName}`);
    console.log(`📊 Tamanho do conteúdo: ${content.length} caracteres`);

    return res.json({ 
      success: true, 
      fileName,
      backupName,
      contentLength: content.length 
    });
  } catch (error) {
    console.error('❌ Erro ao salvar prompt:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      error: 'Erro ao salvar o prompt',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ===== Endpoints de debug =====
app.get('/api/debug/contexto/:id', (req, res) => {
  const id = normalizeId(req.params.id);
  const transPath = path.join(caminhoTranscricoes, `${id}.txt`);
  const resumoPath = path.join(caminhoResumos, `${id}.txt`);
  const transcricao = loadTranscricao(id);
  const resumo = loadResumo(id);
  return res.json({
    idLigacao: id,
    transPath,
    resumoPath,
    transPathExists: fs.existsSync(transPath),
    resumoPathExists: fs.existsSync(resumoPath),
    transLen: transcricao?.length || 0,
    resumoLen: resumo?.length || 0,
    transHead: truncate(transcricao ?? null, 400),
    resumoHead: truncate(resumo ?? null, 400),
  });
});

app.get('/api/debug/files', (req, res) => {
  try {
    const transFiles = fs.readdirSync(caminhoTranscricoes).filter(f => f.toLowerCase().endsWith('.txt'));
    const resumoFiles = fs.readdirSync(caminhoResumos).filter(f => f.toLowerCase().endsWith('.txt'));
    res.json({
      transcricoesCount: transFiles.length,
      resumosCount: resumoFiles.length,
      transcricoesSample: transFiles.slice(0, 20),
      resumosSample: resumoFiles.slice(0, 20),
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Falha ao listar arquivos' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  // Encontra o primeiro IP IPv4 não interno
  for (const interfaceName of Object.keys(networkInterfaces)) {
    const addresses = networkInterfaces[interfaceName];
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal) {
        localIP = addr.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
  
  console.log(`\n🚀 Servidor backend rodando:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Rede:    http://${localIP}:${PORT}\n`);
});
