import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/AppLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getRecentConversations } from "@/services/regimentusService";
import { askRegimentus } from "@/services/geminiService";

interface Message {
    id: number;
    pergunta: string;
    resposta: string;
    created_at: string;
}

const Regimentus = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Carregar histórico ao montar componente
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setIsLoadingHistory(true);
            const history = await getRecentConversations(10);
            setMessages(history);
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);
            setError("Erro ao carregar histórico de conversas");
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const pergunta = inputValue.trim();
        setInputValue("");
        setIsLoading(true);
        setError(null);

        try {
            // Chamar Edge Function segura (chave protegida no backend)
            const result = await askRegimentus(pergunta);

            // Atualizar UI com a nova mensagem
            if (result.conversa_salva) {
                setMessages(prev => [...prev, result.conversa_salva]);
            }

            // Recarregar histórico para pegar possíveis compressões
            await loadHistory();

            // Scroll to bottom
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);

        } catch (error: any) {
            console.error("Erro ao processar pergunta:", error);
            setError(error.message || "Erro ao gerar resposta. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'Agora';
    };

    // Renderizar markdown simples
    const renderMarkdown = (text: string) => {
        let html = text
            // Negrito
            .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            // Itálico
            .replace(/[*_](.+?)[*_]/g, '<em class="italic">$1</em>')
            // Títulos
            .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

        // Processar listas
        const lines = html.split('\n');
        let inList = false;
        const processedLines = lines.map(line => {
            if (line.trim().startsWith('*   ')) {
                if (!inList) {
                    inList = true;
                    return '<ul class="list-disc ml-6 space-y-1"><li>' + line.trim().substring(4) + '</li>';
                }
                return '<li>' + line.trim().substring(4) + '</li>';
            } else if (inList) {
                inList = false;
                return '</ul>' + line;
            }
            return line;
        });

        if (inList) processedLines.push('</ul>');

        return processedLines.join('<br />');
    };

    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-7rem)]">
                {/* Header */}
                <div className="border-b bg-background px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/regimentus.png" alt="Regimentus" className="w-10 h-10" />
                            <div>
                                <h1 className="text-2xl font-semibold">Pergunte ao Regimentus</h1>
                                <p className="text-sm text-muted-foreground">
                                    Consultas compartilhadas sobre o Regimento Interno
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="px-6 pt-4">
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Conversation Area */}
                <ScrollArea className="flex-1 px-6 py-6">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {isLoadingHistory ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <Loader2 className="w-12 h-12 animate-spin text-gov-blue-500 mb-4" />
                                <p className="text-muted-foreground">Carregando histórico...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <img src="/regimentus.png" alt="Regimentus" className="w-24 h-24 mb-4 opacity-50" />
                                <h2 className="text-xl font-semibold mb-2">Nenhuma pergunta ainda</h2>
                                <p className="text-muted-foreground">
                                    Seja o primeiro a fazer uma pergunta sobre o Regimento Interno!
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={msg.id} className="space-y-4">
                                    {index > 0 && <Separator className="my-6" />}

                                    {/* Question */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-medium">👤 Alguém perguntou</span>
                                            <span>•</span>
                                            <span>{formatTimeAgo(msg.created_at)}</span>
                                        </div>
                                        <p className="text-lg font-medium">{msg.pergunta}</p>
                                    </div>

                                    {/* Answer */}
                                    <div className="space-y-2 pl-6 border-l-2 border-gov-blue-500">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Sparkles className="w-4 h-4 text-gov-blue-500" />
                                            <span className="font-medium text-gov-blue-600 dark:text-gov-blue-400">
                                                Regimentus
                                            </span>
                                        </div>
                                        <div
                                            className="text-base leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.resposta) }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t bg-background px-6 py-4">
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                        <div className="flex gap-2">
                            <Textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isLoading ? "Pensando..." : "Comece a digitar sua pergunta sobre o regimento..."}
                                className="min-h-[60px] max-h-[200px] resize-none"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!inputValue.trim() || isLoading}
                                className={`h-[60px] w-[60px] ${isLoading ? 'animate-pulse bg-gov-blue-600' : ''}`}
                            >
                                {isLoading ? (
                                    <Sparkles className="w-5 h-5 animate-bounce" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Pressione Enter para enviar, Shift+Enter para nova linha
                        </p>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};

export default Regimentus;
