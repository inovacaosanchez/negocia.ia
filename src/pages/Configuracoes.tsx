    import { useState, useEffect } from "react";
    import { Settings, Edit, Lock, Save, X } from "lucide-react";
    import { SidebarProvider } from "@/components/ui/sidebar";
    import { AppSidebar } from "@/components/AppSidebar";
    import Header from "@/components/Header";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Button } from "@/components/ui/button";
    import { Textarea } from "@/components/ui/textarea";
    import { Input } from "@/components/ui/input";
    import { ScrollArea } from "@/components/ui/scroll-area";
    import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    } from "@/components/ui/dialog";
    import { useToast } from "@/hooks/use-toast";

    // Senha de acesso - em produção usar Lovable Cloud Secrets
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

    interface PromptBlockProps {
    title: string;
    promptKey: string;
    content: string;
    onSave: (key: string, content: string) => void;
    }

    function PromptBlock({ title, promptKey, content, onSave }: PromptBlockProps) {
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [editedContent, setEditedContent] = useState(content);
    const [passwordError, setPasswordError] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        setEditedContent(content);
    }, [content]);

    const handleEditClick = () => {
        setPassword("");
        setPasswordError("");
        setIsPasswordDialogOpen(true);
    };

    const handlePasswordSubmit = () => {
        if (password === ADMIN_PASSWORD) {
        setIsPasswordDialogOpen(false);
        setIsEditDialogOpen(true);
        setPassword("");
        setPasswordError("");
        } else {
        setPasswordError("Senha incorreta");
        }
    };

    const handleSave = async () => {
        try {
            await onSave(promptKey, editedContent);
            setIsEditDialogOpen(false);
            toast({
                title: "Prompt salvo",
                description: "O prompt foi atualizado com sucesso.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message || "Não foi possível salvar o prompt. Verifique se o servidor está rodando.",
                variant: "destructive",
            });
        }
    };

    return (
        <>
        <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                {title}
            </CardTitle>
            <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="flex items-center gap-2"
            >
                <Edit className="h-4 w-4" />
                Editar
            </Button>
            </CardHeader>
            <CardContent>
            <ScrollArea className="h-48 rounded-md border border-border bg-muted/30 p-4">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {content}
                </pre>
            </ScrollArea>
            </CardContent>
        </Card>

        {/* Dialog de Senha */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Autenticação Necessária
                </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                Digite a senha de administrador para editar o prompt.
                </p>
                <Input
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                />
                {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancelar
                </Button>
                <Button onClick={handlePasswordSubmit}>Confirmar</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Editar {title}
                </DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Digite o conteúdo do prompt..."
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
                </Button>
                <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
    }

    export default function Configuracoes() {
    const [prompts, setPrompts] = useState<Record<string, string>>({
        analise: "",
        comportamento: "",
    });

    const loadPrompts = async () => {
        try {
            const [analiseRes, comportamentoRes] = await Promise.all([
                fetch("/prompts/prompt-analise.txt", { cache: "no-store" }),
                fetch("/prompts/prompt-comportamento.txt", { cache: "no-store" }),
            ]);

            if (!analiseRes.ok || !comportamentoRes.ok) {
                throw new Error("Erro ao carregar prompts");
            }

            const analiseText = await analiseRes.text();
            const comportamentoText = await comportamentoRes.text();

            setPrompts({
                analise: analiseText,
                comportamento: comportamentoText,
            });
        } catch (error) {
            console.error("Erro ao carregar prompts:", error);
        }
    };

    useEffect(() => {
        loadPrompts();
    }, []);

    const handleSavePrompt = async (key: string, content: string) => {
        try {
            console.log(`Tentando salvar prompt: ${key}`, { contentLength: content.length });
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

            const apiUrl = import.meta.env.VITE_API_URL || 'http://172.25.0.19:5000';
            const response = await fetch(`${apiUrl}/api/prompts/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key, content }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log(`Resposta do servidor:`, { status: response.status, ok: response.ok });

            if (!response.ok) {
                let errorMessage = `Erro HTTP: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    console.error("Erro detalhado do servidor:", errorData);
                } catch (e) {
                    const textError = await response.text().catch(() => "");
                    console.error("Resposta de erro (texto):", textError);
                    errorMessage = textError || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log(`✅ Prompt ${key} atualizado com sucesso`, result);
            
            // Aguarda um pouco antes de recarregar para garantir que o arquivo foi escrito
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Recarrega os prompts do servidor para garantir sincronização
            await loadPrompts();
        } catch (error: any) {
            console.error("❌ Erro ao salvar prompt:", error);
            
            if (error.name === 'AbortError') {
                throw new Error("Timeout: O servidor demorou muito para responder. Verifique se o servidor está rodando.");
            }
            
            if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://172.25.0.19:5000';
                throw new Error(`Não foi possível conectar ao servidor. Verifique se o servidor está rodando em ${apiUrl}`);
            }
            
            // Recarrega os prompts em caso de erro para reverter qualquer mudança
            await loadPrompts();
            throw error; // Re-lança o erro para ser tratado no componente
        }
    };

    return (
        <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                <PromptBlock
                    title="Prompt de Análise"
                    promptKey="analise"
                    content={prompts.analise}
                    onSave={handleSavePrompt}
                />

                <PromptBlock
                    title="Prompt de Comportamento"
                    promptKey="comportamento"
                    content={prompts.comportamento}
                    onSave={handleSavePrompt}
                />
                </div>
            </main>
            </div>
        </div>
        </SidebarProvider>
    );
    }
