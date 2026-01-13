import React, { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addRegimentoChunk, clearRegimentoChunks, countRegimentoChunks } from "@/services/regimentusService";
import { AppLayout } from "@/components/AppLayout";

const UploadRegimento = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [chunks, setChunks] = useState<Array<{ secao: string; artigo: string; conteudo: string }>>([
        { secao: "", artigo: "", conteudo: "" }
    ]);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: ''
    });
    const [chunksCount, setChunksCount] = useState<number | null>(null);

    React.useEffect(() => {
        loadChunksCount();
    }, []);

    const loadChunksCount = async () => {
        try {
            const count = await countRegimentoChunks();
            setChunksCount(count);
        } catch (error) {
            console.error('Erro ao carregar contagem:', error);
        }
    };

    const addChunkField = () => {
        setChunks([...chunks, { secao: "", artigo: "", conteudo: "" }]);
    };

    const updateChunk = (index: number, field: keyof typeof chunks[0], value: string) => {
        const newChunks = [...chunks];
        newChunks[index][field] = value;
        setChunks(newChunks);
    };

    const removeChunk = (index: number) => {
        setChunks(chunks.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsProcessing(true);
        setStatus({ type: null, message: '' });

        try {
            // Validação
            const validChunks = chunks.filter(c => c.conteudo.trim() !== '');
            if (validChunks.length === 0) {
                setStatus({ type: 'error', message: 'Adicione pelo menos um chunk com conteúdo!' });
                setIsProcessing(false);
                return;
            }

            // Salvar chunks no banco
            for (const chunk of validChunks) {
                await addRegimentoChunk({
                    titulo: chunk.artigo || null,
                    conteudo: chunk.conteudo,
                    secao: chunk.secao || null,
                    artigo: chunk.artigo || null,
                    metadata: {}
                });
            }

            setStatus({
                type: 'success',
                message: `✅ ${validChunks.length} chunk(s) adicionado(s) com sucesso!`
            });

            // Limpar formulário
            setChunks([{ secao: "", artigo: "", conteudo: "" }]);

            // Atualizar contagem
            await loadChunksCount();

        } catch (error) {
            console.error('Erro ao processar:', error);
            setStatus({ type: 'error', message: 'Erro ao salvar chunks. Verifique o console.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Tem certeza que deseja limpar TODOS os chunks do regimento? Esta ação não pode ser desfeita!')) {
            return;
        }

        setIsProcessing(true);
        try {
            await clearRegimentoChunks();
            setStatus({ type: 'success', message: '✅ Todos os chunks foram removidos!' });
            setChunksCount(0);
        } catch (error) {
            console.error('Erro ao limpar:', error);
            setStatus({ type: 'error', message: 'Erro ao limpar chunks.' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto py-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Upload do Regimento Interno</h1>
                    <p className="text-muted-foreground">
                        Adicione o conteúdo do regimento interno por partes (artigos, capítulos, etc.)
                    </p>
                </div>

                {chunksCount !== null && (
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                            <strong>{chunksCount}</strong> chunk(s) já cadastrado(s) no banco de dados.
                            {chunksCount > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="ml-4"
                                    onClick={handleClearAll}
                                    disabled={isProcessing}
                                >
                                    Limpar Todos
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {status.type && (
                    <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                        {status.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Adicionar Chunks do Regimento</CardTitle>
                        <CardDescription>
                            Divida o regimento em partes menores (artigos, capítulos, seções) para melhor organização
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {chunks.map((chunk, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Chunk {index + 1}</h3>
                                    {chunks.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeChunk(index)}
                                        >
                                            Remover
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor={`secao-${index}`}>Seção/Capítulo</Label>
                                        <Input
                                            id={`secao-${index}`}
                                            placeholder="Ex: Capítulo I, Título II"
                                            value={chunk.secao}
                                            onChange={(e) => updateChunk(index, 'secao', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`artigo-${index}`}>Artigo</Label>
                                        <Input
                                            id={`artigo-${index}`}
                                            placeholder="Ex: Art. 5º, Art. 127"
                                            value={chunk.artigo}
                                            onChange={(e) => updateChunk(index, 'artigo', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor={`conteudo-${index}`}>Conteúdo *</Label>
                                    <Textarea
                                        id={`conteudo-${index}`}
                                        placeholder="Cole aqui o texto do artigo ou seção do regimento..."
                                        value={chunk.conteudo}
                                        onChange={(e) => updateChunk(index, 'conteudo', e.target.value)}
                                        className="min-h-[150px]"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addChunkField}
                                className="w-full"
                            >
                                + Adicionar Outro Chunk
                            </Button>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isProcessing}
                            className="w-full"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Salvar Chunks no Banco
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Instruções</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>1. <strong>Divida o regimento</strong> em partes lógicas (artigos, capítulos, seções)</p>
                        <p>2. <strong>Preencha os campos</strong> de cada chunk com informações relevantes</p>
                        <p>3. <strong>Cole o conteúdo</strong> completo de cada parte</p>
                        <p>4. <strong>Adicione quantos chunks</strong> precisar usando o botão "+"</p>
                        <p>5. <strong>Salve</strong> quando terminar - os chunks ficarão disponíveis para o Regimentus</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default UploadRegimento;
