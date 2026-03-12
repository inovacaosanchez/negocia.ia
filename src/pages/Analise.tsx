import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import TranscriptionViewer from "@/components/TranscriptionViewer";
import SummaryViewer from "@/components/SummaryViewer";
import AIChat from "@/components/AIChat";
import ExpandableBlock from "@/components/ExpandableBlock";
import AnalyticsTable from "@/components/AnalyticsTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transcricao, Resumo, MensagemChat, RegistroAnalitico } from "@/types/data";
import { Sparkles, Loader2, TableIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import fs from "fs";
import path from "path";

/* 🔹 Mesmo helper do AIChat */
const stripHtml = (text: string) =>
  text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const Analise = () => {
  const [transcricoes, setTranscricoes] = useState<Transcricao[]>([]);
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [selectedLigacaoId, setSelectedLigacaoId] = useState("");
  const [analiseResultado, setAnaliseResultado] = useState<string>("");
  const [analisando, setAnalisando] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [analitico, setAnalitico] = useState<RegistroAnalitico[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const transcricaoCache = useMemo(() => new Map<string, Transcricao>(), []);
  const resumoCache = useMemo(() => new Map<string, Resumo>(), []);

  useEffect(() => {
    const fetchTranscricao = async (id: string) => {
      if (!id) return;

      if (transcricaoCache.has(id)) {
        setTranscricoes([transcricaoCache.get(id)!]);
        return;
      }

      try {
        const res = await fetch(`/transcricoes/${id}.txt`);
        if (!res.ok) throw new Error();

        const texto = await res.text();
        const linhas = texto.split("\n").filter(Boolean);

        const conteudo: MensagemChat[] = linhas.map((linha) => {
          const match = linha.match(
            /^(OPERADOR|CLIENTE)(?: \[(.*?)\])?: (.*)$/i
          );
          if (match) {
            return {
              autor:
                match[1].toLowerCase() === "operador"
                  ? "operador"
                  : "cliente",
              timestamp: match[2] || undefined,
              texto: match[3] || "",
            };
          }
          return { autor: "cliente", texto: linha };
        });

        const novaTranscricao: Transcricao = {
          id,
          idLigacao: id,
          idOperador: "desconhecido",
          conteudo,
          dataLigacao: new Date(),
          tabulacao: "",
          acordo: false,
          duracaoSegundos: 0,
          palavras: 0,
        };

        transcricaoCache.set(id, novaTranscricao);
        setTranscricoes([novaTranscricao]);
      } catch {
        setTranscricoes([]);
      }
    };

    fetchTranscricao(selectedLigacaoId);
  }, [selectedLigacaoId, transcricaoCache]);

  useEffect(() => {
    const fetchResumo = async (id: string) => {
      if (!id) return;

      if (resumoCache.has(id)) {
        setResumos([resumoCache.get(id)!]);
        return;
      }

      try {
        const res = await fetch(`/data/resumos/${id.trim()}.txt`);
        if (!res.ok) throw new Error();

        const conteudo = await res.text();
        const json = JSON.parse(conteudo);
        const item = Array.isArray(json) ? json[0] : json;

        const campoResumo = item?.ListaCampos?.find(
          (c: any) =>
            String(c.Identificador || "").trim().toUpperCase() === "RESUMO"
        );

        const novoResumo: Resumo = {
          idLigacao: id,
          resumo: campoResumo?.Valor?.trim() || "CAMPO RESUMO VAZIO",
          sentimento: "neutro",
          pontosChave: [],
          proximosPassos: "",
        };

        resumoCache.set(id, novoResumo);
        setResumos([novoResumo]);
      } catch {
        setResumos([]);
      }
    };

    fetchResumo(selectedLigacaoId);
  }, [selectedLigacaoId, resumoCache]);

  const parseData = (dataStr?: string): Date | undefined => {
    if (!dataStr || dataStr.length !== 8) return undefined;
    const dia = parseInt(dataStr.slice(0, 2), 10);
    const mes = parseInt(dataStr.slice(2, 4), 10) - 1;
    const ano = parseInt(dataStr.slice(4, 8), 10);
    return new Date(ano, mes, dia);
  };

  useEffect(() => {
    if (!isAnalyticsModalOpen) return;

    const fetchAnalyticsData = async () => {
      setLoadingAnalytics(true);
      try {
        const res = await fetch("/data/analitico/analitico.json", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const mappedAnalitico: RegistroAnalitico[] = json.map((r: any) => ({
          id: r["ID LIGACAO"] || "",
          idLigacao: r["ID LIGACAO"] || "",
          idOperador: r["COD_NEGOCIADOR"] || "",
          tabulacao: r["TABULACAO"] || "",
          acordo: r["NEGOCIO_NAONEGOCIO"]?.toLowerCase() === "sim",
          duracaoSegundos: r["DURACAO"]
            ? parseFloat(Number(r["DURACAO"]).toFixed(2))
            : 0,
          palavras: r["QTD_PALAVRAS"] || 0,
          cliente: r["CLIENTE"] || "",
          cpfCnpj: r["CPFCNPJ"] || "",
          dataLigacao: r["DATA_LIGACAO"]
            ? parseData(r["DATA_LIGACAO"])
            : undefined,
        }));

        setAnalitico(mappedAnalitico);
      } catch (err: any) {
        setAnalitico([]);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalyticsData();
  }, [isAnalyticsModalOpen]);

  const enviarAnaliseBackend = async (
    pergunta: string,
    contexto: string[]
  ) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://172.25.0.19:5000';
    const response = await fetch(`${apiUrl}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pergunta,
        contexto,
        idLigacao: selectedLigacaoId,
      }),
    });

    const data = await response.json();
    return data.resposta;
  };

  const handleAnalise = async () => {
    if (!selectedLigacaoId) return;

    setAnalisando(true);
    setAnaliseResultado("");

try {
    const resPrompt = await fetch("/prompts/prompt-analise.txt");
    const promptArquivo = await resPrompt.text();

    const pergunta = `
Faça a análise a seguir, você deve responder exclusivamente em HTML, sem qualquer texto fora de tags. A resposta deve manter exatamente a estrutura do texto fornecido, 
incluindo numeração e organização. Todos os títulos numerados devem estar em negrito usando a tag <strong>. Sempre que houver respostas do tipo 
“Sim”, “Não” ou “Parcial”, essas palavras devem obrigatoriamente aparecer em negrito e na cor laranja, utilizando <span style="color:#f97316;"><strong>Sim</strong></span> 
(aplicando o mesmo padrão para “Não” e “Parcial”). Informações relevantes, estratégicas ou processuais devem ser destacadas visualmente usando <mark> ou 
<span style="font-weight:600;">, sem exageros ou alteração do conteúdo original. A linguagem deve ser técnica, objetiva e profissional, sem emojis, sem Markdown e 
sem listas adicionais. Não alterar a numeração, não resumir e não adicionar comentários fora do conteúdo analisado.

${promptArquivo}
    `.trim();

      const contexto: string[] = [];

      const transcricaoAtual = transcricoes.find(
        (t) => t.idLigacao === selectedLigacaoId
      );
      const resumoAtual = resumos.find(
        (r) => r.idLigacao === selectedLigacaoId
      );

      if (Array.isArray(transcricaoAtual?.conteudo)) {
        const textoTranscricao = transcricaoAtual.conteudo
          .map((l) => stripHtml(l.texto ?? ""))
          .join(" ")
          .trim();

        if (textoTranscricao) contexto.push(textoTranscricao);
      }

      if (resumoAtual?.resumo) {
        contexto.push(stripHtml(resumoAtual.resumo));
      }

      const respostaIA = await enviarAnaliseBackend(pergunta, contexto);
      setAnaliseResultado(respostaIA);
    } catch {
      setAnaliseResultado(
        "<p><strong>Erro:</strong> não foi possível executar a análise.</p>"
      );
    }

    setAnalisando(false);
  };

  const transcricaoAtual = transcricoes.find(
    (t) => t.idLigacao === selectedLigacaoId
  );
  const resumoAtual = resumos.find(
    (r) => r.idLigacao === selectedLigacaoId
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-semibold text-foreground">
              Análise de Ligações
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsModalOpen(true)}
              className="ml-auto"
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Ver Analítico
            </Button>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpandableBlock title="Transcrição" className="h-[400px]">
                <TranscriptionViewer
                  transcricoes={transcricoes}
                  onIdChange={setSelectedLigacaoId}
                  selectedId={selectedLigacaoId}
                />
              </ExpandableBlock>

              <ExpandableBlock title="Resumo Processual" className="h-[400px]">
                <SummaryViewer
                  idLigacao={selectedLigacaoId}
                />
              </ExpandableBlock>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpandableBlock title="Análise Inteligente" className="h-[400px]">
                <div className="glass-card p-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Análise Inteligente
                    </h3>
                  </div>

                  <div className="mb-4">
                    <Button
                      onClick={handleAnalise}
                      disabled={!selectedLigacaoId || analisando}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {analisando ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          ANÁLISE
                        </>
                      )}
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    {analiseResultado ? (
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                        <div
                          className="text-sm leading-relaxed text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: analiseResultado,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-muted-foreground h-full">
                        <p>
                          {selectedLigacaoId
                            ? 'Clique em "ANÁLISE" para analisar a ligação'
                            : "Selecione uma ligação para analisar"}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </ExpandableBlock>

              <ExpandableBlock title="Chat com IA" className="h-[400px]">
                <AIChat
                  transcricao={transcricaoAtual}
                  resumo={resumoAtual}
                />
              </ExpandableBlock>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Analítico de Transcrições</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando dados...</span>
              </div>
            ) : (
              <AnalyticsTable dados={analitico} hideSentimentoColumn />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Analise;