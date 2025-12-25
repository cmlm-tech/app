import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, CheckCircle, ExternalLink, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function EditarParecer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [parecer, setParecer] = useState<any>(null);
    const [materiaOriginal, setMateriaOriginal] = useState<any>(null);
    const [comissao, setComissao] = useState<any>(null);
    const [corpoTexto, setCorpoTexto] = useState("");
    const [resultado, setResultado] = useState<string>(""); // Favorável, Contrário, Com Emendas

    useEffect(() => {
        carregarParecer();
    }, [id]);

    async function carregarParecer() {
        if (!id) return;

        setLoading(true);
        try {
            // Buscar dados do parecer
            const { data: parecerData, error: parecerError } = await supabase
                .from("pareceres")
                .select(`
                    *,
                    documento:documentos!pareceres_documento_id_fkey (
                        id,
                        numero_protocolo_geral,
                        ano,
                        data_protocolo,
                        status
                    ),
                    comissao:comissoes ( id, nome ),
                    materia:documentos!pareceres_materia_documento_id_fkey (
                        id,
                        numero_protocolo_geral,
                        ano,
                        tiposdedocumento ( nome )
                    )
                `)
                .eq("documento_id", parseInt(id))
                .single();

            if (parecerError) throw parecerError;

            setParecer(parecerData);
            setCorpoTexto(parecerData.corpo_texto || "");
            setResultado(parecerData.resultado || "");
            setComissao(parecerData.comissao);
            setMateriaOriginal(parecerData.materia);

        } catch (error: any) {
            console.error(error);
            toast({ title: "Erro ao carregar parecer", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    async function handleSalvar() {
        if (!id || !parecer) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from("pareceres")
                .update({
                    corpo_texto: corpoTexto,
                    resultado: resultado || null,
                } as any)
                .eq("id", parecer.id);

            if (error) throw error;

            toast({ title: "Salvo!", description: "Parecer atualizado com sucesso." });
        } catch (error: any) {
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    async function handleFinalizar() {
        if (!id || !parecer) return;
        if (!corpoTexto.trim()) {
            toast({ title: "Atenção", description: "O parecer precisa ter um texto antes de ser finalizado.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            // Updated to perform multiple operations

            // 1. Update Parecer status
            const { error: parecerError } = await supabase
                .from("pareceres")
                .update({
                    corpo_texto: corpoTexto,
                    resultado: resultado || null,
                    // Parecer agora assume status "Emitido" ao invés de "Finalizado" (mantendo compatibilidade de lógica se necessário)
                    status: "Emitido"
                } as any)
                .eq("id", parecer.id);

            if (parecerError) throw parecerError;

            // 1.1 Update Parecer Document Status
            const { error: parecerDocError } = await supabase
                .from("documentos")
                .update({ status: "Emitido" } as any)
                .eq("id", parecer.documento_id); // ID do documento do parecer

            if (parecerDocError) throw parecerDocError;

            // 2. Update Document Status (Pronto para Pauta)
            if (materiaOriginal?.id) {
                const { error: docError } = await supabase
                    .from("documentos")
                    .update({ status: "Pronto para Pauta" } as any)
                    .eq("id", materiaOriginal.id);

                if (docError) {
                    console.error("Erro ao atualizar status do documento:", docError);
                    // Non-blocking but should be logged
                }

                // 3. Add Tramitação
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from("tramitacoes")
                        .insert({
                            documento_id: materiaOriginal.id,
                            status: "Pronto para Pauta",
                            descricao: `Parecer da comissão ${comissao?.nome || "de Constituição"} finalizado (${resultado}). Matéria pronta para pauta.`,
                            usuario_id: user.id,
                        } as any);
                }
            }

            toast({
                title: "Parecer Finalizado!",
                description: "A matéria original agora pode ser votada.",
                className: "bg-green-600 text-white"
            });

            // Redirecionar para a matéria original
            if (materiaOriginal?.id) {
                navigate(`/documentos/materias/${materiaOriginal.id}/editar`);
            }
        } catch (error: any) {
            toast({ title: "Erro ao finalizar", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-gov-blue-700" />
                </div>
            </AppLayout>
        );
    }

    if (!parecer) {
        return (
            <AppLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Parecer não encontrado.</p>
                    <Button onClick={() => navigate("/documentos/materias")} className="mt-4">
                        Voltar
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const statusFinalizado = ["Finalizado", "Emitido", "Lido"].includes(parecer.status);

    return (
        <AppLayout>
            <div className="container mx-auto py-6 px-4 max-w-5xl">
                {/* Breadcrumb */}
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/documentos/materias">Matérias</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Editar Parecer</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Parecer da {comissao?.nome}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Protocolo {parecer.documento?.numero_protocolo_geral}/{parecer.documento?.ano}
                            </p>
                        </div>
                    </div>
                    <Badge className={statusFinalizado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {parecer.status}
                    </Badge>
                </div>

                {/* Matéria Original */}
                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Matéria Original
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-blue-900">
                                    {materiaOriginal?.tiposdedocumento?.nome} {materiaOriginal?.numero_protocolo_geral}/{materiaOriginal?.ano}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/documentos/materias/${materiaOriginal?.id}/editar`)}
                            >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Ver Matéria
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Editor de Parecer */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Texto do Parecer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            value={corpoTexto}
                            onChange={(e) => setCorpoTexto(e.target.value)}
                            placeholder="Digite o parecer da comissão..."
                            className="min-h-[400px] font-mono text-sm"
                            disabled={statusFinalizado}
                        />

                        {/* Resultado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resultado do Parecer
                            </label>
                            <div className="flex gap-2">
                                {["Favorável", "Contrário", "Com Emendas"].map((opt) => (
                                    <Button
                                        key={opt}
                                        type="button"
                                        variant={resultado === opt ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setResultado(opt)}
                                        disabled={statusFinalizado}
                                    >
                                        {opt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ações */}
                <div className="flex gap-3 justify-end">
                    {!statusFinalizado && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleSalvar}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Rascunho
                            </Button>
                            <Button
                                onClick={handleFinalizar}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Finalizar Parecer
                            </Button>
                        </>
                    )}
                    {statusFinalizado && (
                        <p className="text-sm text-gray-500 italic">
                            Este parecer já foi finalizado e não pode mais ser editado.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
