# NEGOCIA.IA - Plataforma de Análise de Transcrições de Cobrança

## 📋 Visão Geral

NEGOCIA.IA é uma plataforma web moderna para análise, insights e exploração de dados baseados em transcrições e resumos processuais de ligações de cobrança. A aplicação oferece visualização de métricas, filtros avançados, nuvem de palavras e integração com IA para análise contextual.

---

## 🗂️ Estrutura do Projeto

```
negocia-ia/
├── public/
│   └── data/                    # Pasta para arquivos de dados (criar manualmente)
│       ├── transcricoes/        # Arquivos JSON de transcrições
│       ├── resumos/             # Arquivos JSON de resumos
│       └── analitico/           # Arquivos JSON/CSV de dados analíticos
├── src/
│   ├── components/              # Componentes React reutilizáveis
│   │   ├── AIChat.tsx          # Chat com IA contextual
│   │   ├── AnalyticsTable.tsx  # Tabela analítica com ordenação
│   │   ├── FilterBar.tsx       # Barra de filtros globais
│   │   ├── Header.tsx          # Cabeçalho da aplicação
│   │   ├── MetricCard.tsx      # Cards de métricas animados
│   │   ├── SummaryViewer.tsx   # Visualizador de resumos
│   │   ├── TranscriptionViewer.tsx # Visualizador de transcrições
│   │   ├── WordCloudChart.tsx  # Nuvem de palavras
│   │   └── ui/                 # Componentes Shadcn UI
│   ├── data/
│   │   └── mockData.ts         # Dados de demonstração
│   ├── types/
│   │   └── data.ts             # Tipos TypeScript
│   ├── pages/
│   │   ├── Index.tsx           # Página principal
│   │   └── NotFound.tsx        # Página 404
│   ├── lib/
│   │   └── utils.ts            # Utilitários
│   ├── hooks/                  # Hooks customizados
│   ├── App.tsx                 # Componente raiz
│   ├── main.tsx               # Ponto de entrada
│   └── index.css              # Estilos globais e design system
├── tailwind.config.ts         # Configuração Tailwind
├── vite.config.ts             # Configuração Vite
└── README.md                  # Este arquivo
```

---

## 📁 Descrição dos Arquivos

### `/src/components/`

#### `Header.tsx`
- **Função**: Cabeçalho fixo com logo e nome da plataforma
- **Características**: Badge de status "Sistema Ativo" com animação
- **Usa**: Lucide icons, design system tokens

#### `MetricCard.tsx`
- **Função**: Exibe métricas principais em cards animados
- **Props**: `title`, `value`, `icon`, `suffix`, `color`, `delay`
- **Características**: Animação de contagem, hover com glow effect
- **Cores disponíveis**: teal, blue, purple, orange

#### `FilterBar.tsx`
- **Função**: Barra de filtros globais que afeta tabela e nuvem de palavras
- **Filtros**: Data início/fim, tabulação, ID operador, ID ligação, acordo
- **Características**: Botão de limpar filtros, selects com todas as opções

#### `AnalyticsTable.tsx`
- **Função**: Tabela analítica com todos os registros filtrados
- **Colunas**: Data, Operador, ID Ligação, Tabulação, Acordo, Duração, Palavras, Sentimento
- **Características**: Ordenação por clique no cabeçalho, badges coloridos

#### `WordCloudChart.tsx`
- **Função**: Nuvem de palavras gerada a partir das transcrições filtradas
- **Características**: Tamanho proporcional à frequência, cores variadas, hover scale

#### `TranscriptionViewer.tsx`
- **Função**: Visualiza transcrição em formato de chat
- **Características**: Filtro próprio por ID, independente dos filtros globais
- **Layout**: Bolhas de chat estilo WhatsApp, ícones diferenciados

#### `SummaryViewer.tsx`
- **Função**: Exibe resumo processual da ligação selecionada
- **Mostra**: Resumo, pontos-chave, sentimento, próximos passos
- **Vinculação**: Usa o mesmo ID do TranscriptionViewer

#### `AIChat.tsx`
- **Função**: Interface de chat para perguntas à IA
- **Contexto**: Analisa transcrição e resumo da ligação selecionada
- **Estado atual**: Respostas simuladas (preparado para integração)

### `/src/types/data.ts`
Define todos os tipos TypeScript:
- `Transcricao`: Estrutura completa de uma transcrição
- `MensagemChat`: Mensagem individual (operador/cliente)
- `Resumo`: Resumo processual com pontos-chave
- `RegistroAnalitico`: Dados para a tabela analítica
- `FiltrosGlobais`: Estado dos filtros
- `MetricasGerais`: Métricas dos cards
- `PalavraCloud`: Palavras para nuvem

### `/src/data/mockData.ts`
- **Função**: Dados de demonstração da plataforma
- **Contém**: 5 transcrições completas, 5 resumos, dados analíticos
- **Função `gerarNuvemPalavras`**: Processa transcrições e retorna frequência de palavras

### `/src/pages/Index.tsx`
- **Função**: Página principal que orquestra todos os componentes
- **Gerencia**: Estados de filtros, ID selecionado, cálculos de métricas
- **Layout**: Grid responsivo com todas as seções

---

## 🔧 Como Rodar o Projeto

### Requisitos
- Node.js 18+ 
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre na pasta
cd negocia-ia

# Instale as dependências
npm install
# ou
bun install

# Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

A aplicação estará disponível em `http://localhost:8080`

### Build para Produção

```bash
npm run build
# ou
bun run build
```

Os arquivos serão gerados na pasta `dist/`

---

## 📊 Estrutura dos Dados

### Transcrições (`/data/transcricoes/`)

Arquivo JSON com estrutura:
```json
{
  "id": "1",
  "dataLigacao": "2024-01-15",
  "idOperador": "OP001",
  "idLigacao": "LIG001",
  "tabulacao": "Acordo Fechado",
  "acordo": true,
  "duracaoSegundos": 420,
  "palavras": 856,
  "conteudo": [
    {
      "autor": "operador",
      "texto": "Bom dia! Meu nome é Carlos...",
      "timestamp": "00:00"
    },
    {
      "autor": "cliente",
      "texto": "Bom dia, aqui é o João Silva.",
      "timestamp": "00:08"
    }
  ]
}
```

### Resumos (`/data/resumos/`)

```json
{
  "idLigacao": "LIG001",
  "resumo": "Cliente mostrou-se receptivo...",
  "pontosChave": [
    "Cliente receptivo à negociação",
    "Desconto de 40% oferecido"
  ],
  "sentimento": "positivo",
  "proximosPassos": "Enviar SMS com boletos..."
}
```

### Analítico (`/data/analitico/`)

```json
{
  "id": "1",
  "dataLigacao": "2024-01-15",
  "idOperador": "OP001",
  "idLigacao": "LIG001",
  "tabulacao": "Acordo Fechado",
  "acordo": true,
  "duracaoSegundos": 420,
  "palavras": 856
}
```

---

## 🔄 Como Atualizar os Dados

### Passo 1: Prepare os arquivos
Gere arquivos JSON seguindo as estruturas acima.

### Passo 2: Coloque nas pastas corretas
```
public/data/transcricoes/  → arquivos de transcrição
public/data/resumos/       → arquivos de resumo
public/data/analitico/     → dados analíticos
```

### Passo 3: Atualize o código de carregamento
Modifique `/src/data/mockData.ts` para carregar dos arquivos:

```typescript
// Exemplo de carregamento de arquivos locais
export const carregarTranscricoes = async () => {
  const response = await fetch('/data/transcricoes/dados.json');
  return response.json();
};
```

### Passo 4: Reinicie a aplicação
O hot reload do Vite atualizará automaticamente.

---

## 🖥️ Manual de Uso da Interface

### 1. Cards de Métricas
- Exibem totais baseados nos filtros aplicados
- Animação de contagem ao carregar
- Hover mostra efeito de brilho

### 2. Filtros Globais
- **Data Início/Fim**: Filtra por período
- **Tabulação**: Dropdown com tipos únicos
- **ID Operador**: Dropdown com operadores
- **ID Ligação**: Campo de texto (busca parcial)
- **Acordo**: Sim/Não/Todos
- Botão "Limpar" remove todos os filtros

### 3. Tabela Analítica
- Clique nos cabeçalhos para ordenar
- Badges coloridos para Acordo e Sentimento
- Mostra contagem de registros

### 4. Nuvem de Palavras
- Atualiza conforme filtros globais
- Tamanho = frequência da palavra
- Hover mostra contagem exata

### 5. Transcrição (Bloco Independente)
- Campo de busca próprio (não afetado por filtros globais)
- Digite ID (ex: LIG001) e pressione Enter ou clique na lupa
- Exibe conversa em formato de chat

### 6. Resumo Processual
- Exibe automaticamente o resumo da ligação buscada
- Mostra pontos-chave e próximos passos
- Badge de sentimento colorido

### 7. Chat com IA
- Faça perguntas sobre a ligação selecionada
- A IA analisa transcrição + resumo
- Respostas contextuais (integrar com API)

---

## 🔌 Integração com IA

Para ativar respostas reais da IA:

1. Habilite o Lovable Cloud no projeto
2. Crie uma edge function para o chat
3. Modifique `AIChat.tsx` para chamar a API
4. A IA receberá transcrição + resumo como contexto

---

## 🎨 Design System

### Cores Principais
- **Primary (Teal)**: `hsl(174 72% 56%)` - Ações principais
- **Background**: `hsl(222 47% 8%)` - Fundo escuro
- **Card**: `hsl(222 47% 11%)` - Cards e superfícies
- **Muted**: `hsl(222 30% 18%)` - Elementos secundários

### Métricas
- Teal, Blue, Purple, Orange para diferenciação visual

### Componentes
- Todos usam tokens do design system
- Glass morphism em cards
- Animações suaves

---

## 🚀 Próximos Passos Sugeridos

1. **Conectar dados reais**: Substituir mockData por carregamento de arquivos
2. **Integrar IA**: Configurar Lovable Cloud + edge function
3. **Adicionar autenticação**: Proteger acesso à plataforma
4. **Exportar relatórios**: PDF/Excel dos dados filtrados
5. **Histórico de análises**: Salvar conversas com IA

---

## 📞 Suporte

Para dúvidas sobre a plataforma, consulte a documentação do Lovable em https://docs.lovable.dev/

---

**NEGOCIA.IA** - Transformando dados de cobrança em insights acionáveis.
