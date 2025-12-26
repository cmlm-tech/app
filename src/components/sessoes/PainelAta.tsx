import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, FileText, Save, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { gerarTextoAta, salvarAta, getDadosParaAta, Fala } from "@/services/ataService";
import { pdf } from "@react-pdf/renderer";
import AtaPDF from "@/components/documentos/pdf/templates/AtaPDF";
import type { Presenca } from "@/services/sessaoConduzirService";

interface PainelAtaProps {
    sessaoId: number;
    presencas: Presenca[];
}

export default function PainelAta({ sessaoId, presencas }: PainelAtaProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [textoAta, setTextoAta] = useState("");
    const [falas, setFalas] = useState<Map<number, { falou: boolean; texto: string }>>(new Map());

    // Inicializar falas com vereadores presentes
    useEffect(() => {
        const mapaFalas = new Map<number, { falou: boolean; texto: string }>();
        presencas
            .filter(p => p.status === "Presente")
            .forEach(p => {
                mapaFalas.set(p.agente_publico_id, { falou: false, texto: "" });
            });
        setFalas(mapaFalas);
    }, [presencas]);

    const handleToggleFala = (agenteId: number, falou: boolean) => {
        setFalas(prev => {
            const novo = new Map(prev);
            const atual = novo.get(agenteId) || { falou: false, texto: "" };
            novo.set(agenteId, { ...atual, falou });
            return novo;
        });
    };

    const handleTextoFala = (agenteId: number, texto: string) => {
        setFalas(prev => {
            const novo = new Map(prev);
            const atual = novo.get(agenteId) || { falou: false, texto: "" };
            novo.set(agenteId, { ...atual, texto });
            return novo;
        });
    };

    const handleGerarIA = async () => {
        setLoading(true);
        toast({ title: "IA Trabalhando...", description: "Gerando ata da sessão, aguarde." });

        try {
            // Construir array de falas
            const falasArray: Fala[] = [];
            falas.forEach((valor, agenteId) => {
                if (valor.falou && valor.texto.trim()) {
                    const presenca = presencas.find(p => p.agente_publico_id === agenteId);
                    if (presenca) {
                        falasArray.push({
                            vereadorId: agenteId,
                            nomeVereador: presenca.vereador?.nome_completo || "Vereador",
                            texto: valor.texto,
                        });
                    }
                }
            });

            const texto = await gerarTextoAta(sessaoId, falasArray);
            setTextoAta(texto);
            toast({ title: "Sucesso!", description: "Ata gerada pela IA." });
        } catch (error: any) {
            console.error("Erro ao gerar ata:", error);
            toast({
                title: "Erro na IA",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSalvar = async () => {
        if (!textoAta.trim()) {
            toast({
                title: "Atenção",
                description: "Gere a ata antes de salvar.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await salvarAta(sessaoId, textoAta);
            toast({ title: "Salvo!", description: "Ata salva com sucesso." });
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGerarPDF = async () => {
        if (!textoAta.trim()) {
            toast({
                title: "Atenção",
                description: "Gere e salve a ata antes de exportar o PDF.",
                variant: "destructive",
            });
            return;
        }

        try {
            const dados = await getDadosParaAta(sessaoId);

            const blob = await pdf(
                <AtaPDF
                    sessaoNumero={`${dados.sessao.numero}ª`}
                    sessaoTipo={dados.sessao.tipo}
                    data={new Date(dados.sessao.data).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    })}
                    textoAta={textoAta}
                    presidente={dados.presidente}
                    secretario={dados.secretario}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");

            toast({ title: "PDF Gerado!", description: "Ata aberta em nova aba." });
        } catch (error: any) {
            console.error("Erro ao gerar PDF:", error);
            toast({
                title: "Erro ao gerar PDF",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const vereadorespresentes = presencas.filter(p => p.status === "Presente");

    return (
        <div className="space-y-6">
            {/* Seção 1: Falas dos Vereadores */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Falas dos Vereadores
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                        Selecione os vereadores que fizeram uso da palavra e descreva resumidamente suas falas.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {vereadorespresentes.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            Nenhum vereador presente. Realize a chamada primeiro.
                        </p>
                    ) : (
                        vereadorespresentes.map(presenca => {
                            const fala = falas.get(presenca.agente_publico_id) || { falou: false, texto: "" };
                            return (
                                <div key={presenca.agente_publico_id} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`fala-${presenca.agente_publico_id}`}
                                            checked={fala.falou}
                                            onCheckedChange={(checked) =>
                                                handleToggleFala(presenca.agente_publico_id, checked as boolean)
                                            }
                                        />
                                        <Label
                                            htmlFor={`fala-${presenca.agente_publico_id}`}
                                            className="text-base font-semibold cursor-pointer"
                                        >
                                            {presenca.vereador?.nome_completo || "Vereador"}
                                        </Label>
                                    </div>
                                    {fala.falou && (
                                        <Textarea
                                            placeholder="Descreva o resumo da fala do vereador(a)..."
                                            value={fala.texto}
                                            onChange={(e) => handleTextoFala(presenca.agente_publico_id, e.target.value)}
                                            className="min-h-[100px] text-sm"
                                        />
                                    )}
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            {/* Seção 2: Geração com IA */}
            {vereadorespresentes.length > 0 && (
                <div className="flex justify-center">
                    <Button
                        onClick={handleGerarIA}
                        disabled={loading}
                        size="lg"
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5 mr-2" />
                        )}
                        Gerar Ata com IA
                    </Button>
                </div>
            )}

            {/* Seção 3: Texto da Ata (Editor) */}
            {textoAta && (
                <Card>
                    <CardHeader>
                        <CardTitle>Texto da Ata</CardTitle>
                        <p className="text-sm text-gray-500">
                            Revise e edite o texto gerado pela IA antes de salvar.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={textoAta}
                            onChange={(e) => setTextoAta(e.target.value)}
                            className="min-h-[400px] font-mono text-sm"
                            placeholder="O texto gerado pela IA aparecerá aqui..."
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <Button
                                onClick={handleSalvar}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Salvar Ata
                            </Button>
                            <Button
                                onClick={handleGerarPDF}
                                variant="outline"
                                className="border-blue-600 text-blue-700 hover:bg-blue-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Gerar PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
