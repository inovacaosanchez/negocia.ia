import { useEffect, useState } from "react";
import { FileText, CheckCircle, AlertCircle, MinusCircle, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from "jspdf";

interface Campo {
  Identificador: string;
  Valor: string;
}

interface ResumoArquivo {
  IDEspaider: number;
  Identificador: string;
  ListaCampos: Campo[];
}

interface SummaryViewerProps {
  idLigacao: string;
}

const SummaryViewer = ({ idLigacao }: SummaryViewerProps) => {
  const [resumoTexto, setResumoTexto] = useState<string | null>(null);

  useEffect(() => {
    if (!idLigacao) {
      setResumoTexto(null);
      return;
    }

    const fetchResumo = async () => {
      try {
        const cleanId = idLigacao.trim();
        const filePath = `/data/resumos/${cleanId}.txt`;

        const response = await fetch(filePath);

        if (!response.ok) {
          setResumoTexto("NENHUM RESUMO ENCONTRADO");
          return;
        }

        const text = await response.text();

        let parsed: ResumoArquivo[];

        try {
          parsed = JSON.parse(text);
        } catch {
          setResumoTexto("CAMPO RESUMO VAZIO");
          return;
        }

        if (!parsed.length) {
          setResumoTexto("CAMPO RESUMO VAZIO");
          return;
        }

        const campoResumo = parsed[0].ListaCampos.find(
          (c) => c.Identificador === "RESUMO"
        );

        if (!campoResumo || !campoResumo.Valor || campoResumo.Valor.trim() === "") {
          setResumoTexto("CAMPO RESUMO VAZIO");
          return;
        }

        setResumoTexto(campoResumo.Valor);
      } catch (error) {
        setResumoTexto("NENHUM RESUMO ENCONTRADO");
      }
    };

    fetchResumo();
  }, [idLigacao]);

  // mantém exatamente sua lógica original
  const getSentimentoInfo = (sentimento?: string) => {
    switch (sentimento) {
      case "positivo":
        return { icon: CheckCircle, color: "text-metric-gold bg-metric-gold/20", label: "Positivo" };
      case "negativo":
        return { icon: AlertCircle, color: "text-destructive bg-destructive/20", label: "Negativo" };
      default:
        return { icon: MinusCircle, color: "text-muted-foreground bg-muted", label: "Neutro" };
    }
  };

  const sentimentoInfo = getSentimentoInfo(undefined);
  const SentimentoIcon = sentimentoInfo.icon;

  const handleDownloadPDF = () => {
    if (!resumoTexto || !idLigacao) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    
    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Processual", margin, 20);
    
    // Informações da ligação
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Ligação: ${idLigacao}`, margin, 35);
    doc.text(`Sentimento: ${sentimentoInfo.label}`, margin, 42);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, margin, 49);
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(margin, 55, pageWidth - margin, 55);
    
    // Conteúdo do resumo
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(resumoTexto, maxWidth);
    let yPosition = 65;
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 7;
    });
    
    // Salvar o PDF
    const fileName = `Resumo_Processual_${idLigacao}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Resumo Processual</h3>
        {resumoTexto && idLigacao && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPDF}
            className="ml-auto h-8 px-2"
            title="Baixar PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>

      {resumoTexto ? (
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ligação:</span>
              <span className="font-mono text-primary">{idLigacao}</span>

              <Badge className={`ml-auto ${sentimentoInfo.color}`}>
                <SentimentoIcon className="h-3 w-3 mr-1" />
                {sentimentoInfo.label}
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {resumoTexto}
              </p>
            </div>

          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
            {idLigacao ? (
              <p>Nenhum resumo encontrado para {idLigacao}</p>
            ) : (
              <p>Busque uma ligação para ver o resumo</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryViewer;
