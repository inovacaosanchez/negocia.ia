
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { Transcricao, Resumo } from "@/types/data";

interface AIChatProps {
  transcricao: Transcricao | undefined;
  resumo: Resumo | undefined;
}

interface Mensagem {
  autor: "user" | "ai";
  texto: string;
}

// Helper para remover tags HTML básicas
const stripHtml = (text: string) =>
  text
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "") // remove scripts
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")   // remove estilos
    .replace(/<\/?[^>]+(>|$)/g, "")                     // remove tags
    .replace(/&nbsp;/g, " ")                            // trata entidades comuns
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")                               // normaliza espaços
    .trim();

const AIChat = ({ transcricao, resumo }: AIChatProps) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const enviarPerguntaBackend = async (pergunta: string, contexto: string[]) => {
    console.log("📤 ENVIANDO PARA O BACKEND:", { pergunta, contexto });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://172.25.0.19:5000';
      const response = await fetch(`${apiUrl}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pergunta,
          contexto, // [transcrição limpa, resumo limpo]
          idLigacao: transcricao?.idLigacao,
        }),
      });

      if (!response.ok) {
        const erroTexto = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${erroTexto}`);
      }

      const data = await response.json();
      if (!data.resposta) throw new Error("Resposta inválida do backend");
      return data.resposta;
    } catch (err) {
      console.error("Erro backend:", err);
      throw err;
    }
  };

  const handleEnviar = async () => {
    if (!input.trim()) return;

    if (!transcricao && !resumo) {
      setMensagens((prev) => [
        ...prev,
        { autor: "user", texto: input },
        { autor: "ai", texto: "Por favor, selecione uma transcrição primeiro usando o campo de busca." },
      ]);
      setInput("");
      return;
    }

    const pergunta = input;
    setInput("");
    setMensagens((prev) => [...prev, { autor: "user", texto: pergunta }]);
    setIsLoading(true);

    try {
      const contexto: string[] = [];

      // MONTA TEXTO DA TRANSCRIÇÃO
      let textoTranscricao = "";
      if (Array.isArray(transcricao?.conteudo)) {
        textoTranscricao = transcricao.conteudo
          .map((linha) => stripHtml(linha?.texto ?? "")) // 🔸 Sanitiza cada linha
          .join(" ")
          .trim();

        console.log("🔎 Texto da transcrição (limpo):", textoTranscricao);
        if (textoTranscricao.length > 0) {
          contexto.push(textoTranscricao); // índice 0 = transcrição
        }
      }

      // ADICIONA RESUMO (limpo)
      if (resumo?.resumo) {
        const resumoLimpo = stripHtml(resumo.resumo);
        contexto.push(resumoLimpo); // índice 1 = resumo
      }

      const respostaIA = await enviarPerguntaBackend(pergunta, contexto);
      setMensagens((prev) => [...prev, { autor: "ai", texto: respostaIA }]);
    } catch (err) {
      setMensagens((prev) => [
        ...prev,
        {
          autor: "ai",
          texto: "Ocorreu um erro ao tentar acessar o modelo via backend. Verifique chave e endpoint.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Chat com IA</h3>
        {transcricao && (
          <span className="text-xs text-muted-foreground ml-auto">
            Contexto: {transcricao.idLigacao}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-4">
          {mensagens.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bot className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Faça perguntas sobre a transcrição e resumo</p>
              <p className="text-xs mt-1">A IA analisará o contexto da ligação selecionada.</p>
            </div>
          )}

          {mensagens.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.autor === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.autor === "ai" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.autor === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.texto}</p>
              </div>

              {msg.autor === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Faça uma pergunta sobre a ligação..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="bg-secondary border-border"
        />
        <Button onClick={handleEnviar} disabled={isLoading || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIChat;
``
