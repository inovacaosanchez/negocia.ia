import { PalavraCloud } from "@/types/data";
import { Cloud } from "lucide-react";
import { useMemo } from "react";

interface WordCloudChartProps {
  palavras: PalavraCloud[];
}

const WordCloudChart = ({ palavras }: WordCloudChartProps) => {
  const palavrasVisuais = useMemo(() => {
    if (palavras.length === 0) return [];
    
    const maxValue = Math.max(...palavras.map((p) => p.value));
    const minValue = Math.min(...palavras.map((p) => p.value));
    
    return palavras.slice(0, 30).map((p, index) => {
      const normalized = maxValue === minValue 
        ? 0.5 
        : (p.value - minValue) / (maxValue - minValue);
      
      const fontSize = 12 + normalized * 24;
      const opacity = 0.5 + normalized * 0.5;
      
      const colors = [
        "text-primary",
        "text-metric-blue",
        "text-metric-navy",
        "text-metric-gold",
        "text-accent",
      ];
      const color = colors[index % colors.length];
      
      return {
        ...p,
        fontSize,
        opacity,
        color,
      };
    });
  }, [palavras]);

  return (
    <div className="glass-card p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Nuvem de Palavras</h3>
      </div>

      <div className="flex flex-wrap gap-2 justify-center items-center min-h-[200px] p-4">
        {palavrasVisuais.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma palavra disponível</p>
        ) : (
          palavrasVisuais.map((palavra, index) => (
            <span
              key={`${palavra.text}-${index}`}
              className={`${palavra.color} cursor-default transition-all duration-200 hover:scale-110`}
              style={{
                fontSize: `${palavra.fontSize}px`,
                opacity: palavra.opacity,
                fontWeight: palavra.fontSize > 24 ? 600 : 400,
              }}
              title={`${palavra.text}: ${palavra.value} ocorrências`}
            >
              {palavra.text}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default WordCloudChart;
