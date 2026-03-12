export interface Transcricao {
  id: string;
  dataLigacao: Date;
  idOperador: string;
  idLigacao: string;
  tabulacao: string;
  acordo: boolean;
  duracaoSegundos: number;
  conteudo: MensagemChat[];
  palavras: number;
}

export interface MensagemChat {
  autor: "operador" | "cliente";
  texto: string;
  timestamp?: string;
}

export interface Resumo {
  idLigacao: string;
  resumo: string;
  pontosChave: string[];
  sentimento: "positivo" | "neutro" | "negativo";
  proximosPassos?: string;
}

export interface RegistroAnalitico {
  id: string;
  dataLigacao?: Date;
  idOperador: string;
  idLigacao: string;
  tabulacao: string;
  acordo: boolean;
  duracaoSegundos: number;
  palavras: number;
  cliente?: string;
  cpfCnpj?: string;
  sentimento?: string;
}

export interface FiltrosGlobais {
  dataInicio?: string;
  dataFim?: string;
  tabulacao?: string;
  idOperador?: string;
  idLigacao?: string;
  acordo?: boolean | null;
}

export interface MetricasGerais {
  totalTranscricoes: number;
  totalResumos: number;
  totalPalavras: number;
  duracaoMedia: number;
}

export interface PalavraCloud {
  text: string;
  value: number;
}
