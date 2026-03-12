import { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header";
import MetricCard from "@/components/MetricCard";
import FilterBar from "@/components/FilterBar";
import AnalyticsTable from "@/components/AnalyticsTable";
import WordCloudChart from "@/components/WordCloudChart";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  FiltrosGlobais,
  Transcricao,
  Resumo,
  RegistroAnalitico,
  PalavraCloud,
} from "@/types/data";
import { FileText, FileCheck, Type, Clock } from "lucide-react";

const Index = () => {
  const [transcricoes, setTranscricoes] = useState<Transcricao[]>([]);
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [analitico, setAnalitico] = useState<RegistroAnalitico[]>([]);
  const [totalResumosDisponiveis, setTotalResumosDisponiveis] = useState<number>(0);
  const [palavrasCloud, setPalavrasCloud] = useState<PalavraCloud[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosGlobais>({});
  const [selectedLigacaoId, setSelectedLigacaoId] = useState("");

  const transcricaoCache = useMemo(() => new Map<string, Transcricao>(), []);
  const resumoCache = useMemo(() => new Map<string, Resumo>(), []);

  const parseData = (dataStr?: string): Date | undefined => {
    if (!dataStr || dataStr.length !== 8) return undefined;
    const dia = parseInt(dataStr.slice(0, 2), 10);
    const mes = parseInt(dataStr.slice(2, 4), 10) - 1;
    const ano = parseInt(dataStr.slice(4, 8), 10);
    return new Date(ano, mes, dia);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setLoadError(null);
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

        // Contar resumos disponíveis verificando quais IDs de ligação têm resumos
        const idsLigacao = [...new Set(mappedAnalitico.map((r) => r.idLigacao).filter(Boolean))];
        
        // Verificar resumos em paralelo com limite de concorrência
        const verificarResumo = async (id: string): Promise<number> => {
          try {
            const resResumo = await fetch(`/data/resumos/${id.trim()}.txt`, { method: "HEAD" });
            return resResumo.ok ? 1 : 0;
          } catch {
            return 0;
          }
        };

        // Processar em lotes para não sobrecarregar
        const batchSize = 50;
        let contadorResumos = 0;

        for (let i = 0; i < idsLigacao.length; i += batchSize) {
          const batch = idsLigacao.slice(i, i + batchSize);
          const resultados = await Promise.all(batch.map(verificarResumo));
          contadorResumos += resultados.reduce((acc, val) => acc + val, 0);
        }

        setTotalResumosDisponiveis(contadorResumos);
      } catch (err: any) {
        setLoadError(String(err?.message || err));
        setAnalitico([]);
        setTranscricoes([]);
        setResumos([]);
        setTotalResumosDisponiveis(0);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

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
        const conteudo = linhas.map((linha) => {
          const match = linha.match(
            /^(OPERADOR|CLIENTE)(?: \[(.*?)\])?: (.*)$/i
          );
          if (match) {
            const autor = match[1].toLowerCase() === "operador" ? "operador" : "cliente";
            return {
              autor,
              timestamp: match[2] || undefined,
              texto: match[3] || "",
            } as const;
          }
          return { autor: "cliente" as const, texto: linha };
        });

        const novaTranscricao: Transcricao = {
          id: id,
          idLigacao: id,
          idOperador: "desconhecido",
          tabulacao: "",
          acordo: false,
          duracaoSegundos: 0,
          palavras: 0,
          conteudo,
          dataLigacao: new Date(),
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

  useEffect(() => {
    const montarNuvemPalavras = async () => {
      if (!analitico.length) {
        setPalavrasCloud([]);
        return;
      }

      const ids = [...new Set(analitico.map((r) => r.idLigacao).filter(Boolean))];
      const frequencia = new Map<string, number>();

      const normalizar = (palavra: string) =>
        palavra
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/gi, "");

      for (const id of ids) {
        try {
          const res = await fetch(`/data/transcricoes/${id}.txt`);
          if (!res.ok) continue;
          const texto = await res.text();
          const tokens = texto.split(/\s+/g);
          tokens.forEach((t) => {
            const clean = normalizar(t);
            if (clean.length < 3) return;
            frequencia.set(clean, (frequencia.get(clean) || 0) + 1);
          });
        } catch {
          // ignora falha de uma transcrição
        }
      }

      const lista = Array.from(frequencia.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .map(([text, value]) => ({ text, value }));

      setPalavrasCloud(lista);
    };

    montarNuvemPalavras();
  }, [analitico]);

  const tabulacoes = useMemo(
    () => [...new Set(analitico.map((r) => r.tabulacao))].filter(Boolean),
    [analitico]
  );

  const operadores = useMemo(
    () => [...new Set(analitico.map((r) => r.idOperador))].filter(Boolean),
    [analitico]
  );

  const dadosFiltrados = useMemo(() => {
    const dataInicio = filtros.dataInicio
      ? new Date(filtros.dataInicio)
      : undefined;
    const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : undefined;

    return analitico.filter((r) => {
      if (dataInicio && r.dataLigacao && r.dataLigacao < dataInicio)
        return false;
      if (dataFim && r.dataLigacao && r.dataLigacao > dataFim) return false;
      if (filtros.tabulacao && r.tabulacao !== filtros.tabulacao) return false;
      if (filtros.idOperador && r.idOperador !== filtros.idOperador)
        return false;
      if (
        filtros.idLigacao &&
        !r.idLigacao.toLowerCase().includes(filtros.idLigacao.toLowerCase())
      )
        return false;
      if (
        filtros.acordo !== null &&
        filtros.acordo !== undefined &&
        r.acordo !== filtros.acordo
      )
        return false;
      return true;
    });
  }, [analitico, filtros]);

  const metricas = useMemo(() => {
    const totalTranscricoes = dadosFiltrados.length;
    const totalResumos = totalResumosDisponiveis;
    const totalPalavras = dadosFiltrados.reduce(
      (acc, d) => acc + (d.palavras || 0),
      0
    );
    const duracaoMedia =
      dadosFiltrados.length > 0
        ? (
            dadosFiltrados.reduce(
              (acc, d) => acc + (d.duracaoSegundos || 0),
              0
            ) / dadosFiltrados.length
          ).toFixed(2)
        : "0";

    return {
      totalTranscricoes,
      totalResumos,
      totalPalavras,
      duracaoMedia,
    };
  }, [dadosFiltrados, totalResumosDisponiveis]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="h-15 border-b border-border flex items-center px-4 bg-card">
            <SidebarTrigger className="mr-4" />
            <Header />
          </header>

          <main className="container px-4 py-6 space-y-6">
            {loadingData && (
              <div className="text-sm text-muted-foreground">
                Carregando dados do analítico...
              </div>
            )}

            {loadError && (
              <div className="text-sm text-destructive">
                Erro ao carregar dados: {loadError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total de Transcrições"
                value={metricas.totalTranscricoes}
                icon={FileText}
                color="orange"
                delay={0}
              />
              <MetricCard
                title="Total de Resumos"
                value={metricas.totalResumos}
                icon={FileCheck}
                color="blue"
                delay={100}
              />
              <MetricCard
                title="Total de Palavras"
                value={metricas.totalPalavras}
                icon={Type}
                color="navy"
                delay={200}
              />
              <MetricCard
                title="Duração Média"
                value={Math.floor(Number(metricas.duracaoMedia))}
                suffix="s"
                icon={Clock}
                color="gold"
                delay={300}
              />
            </div>

            <FilterBar
              filtros={filtros}
              onFiltrosChange={setFiltros}
              tabulacoes={tabulacoes}
              operadores={operadores}
            />

            <div className="grid grid-cols-1 gap-6">
              <div className="w-full">
                <AnalyticsTable dados={dadosFiltrados} hideSentimentoColumn />
              </div>
              <div className="w-full">
                <WordCloudChart palavras={palavrasCloud} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
