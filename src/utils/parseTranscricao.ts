// src/utils/parseTranscricao.ts

export interface ConteudoTranscricao {
  autor: "operador" | "cliente";
  texto: string;
  timestamp: string; // formato mm:ss
}

/**
 * Converte timestamp do formato 0:00:03.210 -> mm:ss
 */
const timestampToMinSec = (timestamp: string): string => {
  const parts = timestamp.split(":"); // ["0", "00", "03.210"]
  const min = parseInt(parts[1], 10);
  const sec = Math.floor(parseFloat(parts[2])); // descarta milissegundos
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

/**
 * Converte uma transcrição no formato [Locutor X] timestamp - timestamp\ntexto
 * para um array compatível com TranscriptionViewer
 */
export const parseTranscricaoText = (transcricaoText: string): ConteudoTranscricao[] => {
  const blocosRegex = /\[Locutor (\d+)\] (\d+:\d+:\d+\.\d+) - \d+:\d+:\d+\.\d+\n([\s\S]*?)(?=\n\[Locutor \d+\]|$)/g;

  const conteudo: ConteudoTranscricao[] = [];
  let match;

  while ((match = blocosRegex.exec(transcricaoText)) !== null) {
    const locutor = match[1];      // "1" ou "2"
    const timestamp = match[2];    // "0:00:03.210"
    const texto = match[3].trim(); // texto falado

    conteudo.push({
      autor: locutor === "1" ? "operador" : "cliente",
      texto,
      timestamp: timestampToMinSec(timestamp),
    });
  }

  return conteudo;
};
