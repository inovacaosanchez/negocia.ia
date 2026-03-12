
import { Transcricao } from "@/types/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, User, Headphones } from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptionViewerProps {
  transcricoes: Transcricao[];
  onIdChange: (id: string) => void;
  selectedId: string;
}

const parseTranscricaoText = (txt: string) => {
  const lines = txt.split("\n").filter(Boolean);
  const conteudo: { autor: "operador" | "cliente"; texto: string; timestamp: string }[] = [];

  lines.forEach((line) => {
    const match = line.match(/^\[Locutor (\d+)\] (\d+:\d+:\d+\.\d+) - \d+:\d+:\d+\.\d+/);
    if (match) {
      conteudo.push({
        autor: match[1] === "1" ? "operador" : "cliente",
        texto: "",
        timestamp: match[2],
      });
    } else {
      if (conteudo.length > 0) {
        conteudo[conteudo.length - 1].texto += (conteudo[conteudo.length - 1].texto ? " " : "") + line.trim();
      }
    }
  });

  return conteudo;
};

// Heurística simples para detectar HTML
const looksLikeHtml = (text = "") => {
  const t = String(text);
  return /<!doctype html>|<html|<head|<body|<div|<span|<p|<script|<style/i.test(t);
};

const TranscriptionViewer = ({ transcricoes, onIdChange, selectedId }: TranscriptionViewerProps) => {
  const [searchInput, setSearchInput] = useState(selectedId);
  const [transcricaoTxt, setTranscricaoTxt] = useState<string>(""); // texto bruto da transcrição
  const [conteudoParse, setConteudoParse] = useState<{ autor: "operador" | "cliente"; texto: string; timestamp: string }[]>([]);
  const [textoBruto, setTextoBruto] = useState<string>(""); // variável para armazenar o texto bruto

  // Atualiza quando o ID é alterado
  useEffect(() => {
    const loadTxt = async () => {
      try {
        const url = `/data/transcricoes/${searchInput}.txt`;
        const response = await fetch(url);

        // Se content-type indicar HTML, não é o arquivo de transcrição
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok || contentType.includes("text/html")) {
          throw new Error("Transcrição não encontrada ou retorno em HTML");
        }

        const text = await response.text();

        // Segunda barreira: inspeciona o conteúdo
        if (looksLikeHtml(text)) {
          throw new Error("Transcrição parece conter HTML (arquivo ausente ou caminho inválido)");
        }

        setTranscricaoTxt(text);
        setConteudoParse(parseTranscricaoText(text));
        setTextoBruto(text); // Armazenar o texto bruto aqui
      } catch (err) {
        console.warn("Falha ao carregar transcrição:", err);
        setTranscricaoTxt("");
        setConteudoParse([]);
        setTextoBruto(""); // Resetar o texto bruto se não encontrar a transcrição
      }
    };

    if (searchInput) loadTxt();
  }, [searchInput]);

  const handleSearch = () => {
    onIdChange(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const transcricaoAtual = transcricoes.find((t) => t.idLigacao === selectedId);

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Transcrição da Ligação</h3>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Digite o ID da ligação (ex: LIG001)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-secondary border-border"
        />
        <Button onClick={handleSearch} size="icon" className="shrink-0">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {transcricaoTxt && transcricaoAtual ? (
        <>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
            <span>ID: <span className="text-primary font-mono">{transcricaoAtual.idLigacao}</span></span>
            <span>Operador: <span className="text-foreground">{transcricaoAtual.idOperador}</span></span>
            <span>Data: <span className="text-foreground">{new Date(transcricaoAtual.dataLigacao).toLocaleDateString("pt-BR")}</span></span>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {conteudoParse.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.autor === "operador" ? "justify-start" : "justify-end"}`}
                >
                  {msg.autor === "operador" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <Headphones className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.autor === "operador" ? "chat-bubble-operator" : "chat-bubble-client"}`}>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {msg.autor === "operador" ? "Operador" : "Cliente"}
                      {msg.timestamp && <span className="ml-2">{msg.timestamp}</span>}
                    </p>
                    <p className="text-sm">{msg.texto}</p>
                  </div>
                  {msg.autor === "cliente" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Digite um ID de ligação para visualizar a transcrição</p>
            <p className="text-xs mt-1">Ex: LIG001, LIG002, LIG003...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionViewer;
