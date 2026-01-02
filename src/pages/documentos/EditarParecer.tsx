import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, CheckCircle, ExternalLink, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { pdf } from "@react-pdf/renderer";
import ParecerPDF from "@/components/documentos/pdf/templates/ParecerPDF";
import { adicionarParecerProximaSessao } from "@/services/parecerService";
import { uploadMateriaPDF, atualizarUrlPDF } from "@/services/storageService";

export default function EditarParecer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [parecer, setParecer] = useState<any>(null);
    const [materiaOriginal, setMateriaOriginal] = useState<any>(null);
    const [comissao, setComissao] = useState<any>(null);
    const [comissaoMembros, setComissaoMembros] = useState<any[]>([]);
    const [corpoTexto, setCorpoTexto] = useState("");
    const [resultado, setResultado] = useState<string>(""); // Favorável, Contrário, Com Emendas
    const [nomeAutorMateria, setNomeAutorMateria] = useState("Não informado");

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
                        ano,
                        data_protocolo,
                        status,
                        protocolos!documentos_protocolo_id_fkey ( numero )
                    ),
                    comissao:comissoes ( id, nome ),
                    materia:documentos!pareceres_materia_documento_id_fkey (
                        id,
                        ano,
                        tiposdedocumento ( nome ),
                        protocolos!documentos_protocolo_id_fkey ( numero ),
                        documentoautores ( autor_id, autor_type ),
                        projetosdelei ( numero_lei, ementa, corpo_texto, justificativa ),
                        oficios ( numero_oficio, assunto, corpo_texto, justificativa ),
                        requerimentos ( numero_requerimento, justificativa, corpo_texto ),
                        mocoes ( numero_mocao, ementa, justificativa, homenageado_texto ),
                        indicacoes ( numero_indicacao, ementa, justificativa, destinatario_texto ),
                        projetosdedecretolegislativo ( numero_decreto, ementa, corpo_texto, justificativa ),
                        projetosderesolucao ( ementa, corpo_texto, justificativa ),
                        projetosdeemendaorganica ( ementa, corpo_texto, justificativa )
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

            // Carregar membros da comissão
            if (parecerData.comissao?.id) {
                const { data: membrosData } = await supabase
                    .from("comissaomembros")
                    .select(`
                        cargo,
                        agente:agentespublicos ( nome_completo )
                    `)
                    .eq("comissao_id", parecerData.comissao.id);

                if (membrosData) {
                    const formatados = membrosData.map((m: any) => ({
                        nome: m.agente?.nome_completo || "Nome Indisponível",
                        cargo: m.cargo
                    }));
                    setComissaoMembros(formatados);
                }
            }

            // Resolver nome do autor da matéria original
            if (parecerData.materia?.documentoautores?.length > 0) {
                const autor = parecerData.materia.documentoautores[0];
                if (autor.autor_id) {
                    // Tenta buscar em agentes públicos (vereadores)
                    const { data: agente } = await supabase
                        .from("agentespublicos")
                        .select("nome_completo")
                        .eq("id", autor.autor_id)
                        .single();

                    if (agente) {
                        setNomeAutorMateria(agente.nome_completo);
                    } else {
                        // Se não achar, tenta comissões (autoria de comissão)
                        const { data: comissaoAutor } = await supabase
                            .from("comissoes")
                            .select("nome")
                            .eq("id", autor.autor_id)
                            .single();

                        if (comissaoAutor) {
                            setNomeAutorMateria(comissaoAutor.nome);
                        }
                    }
                }
            }

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

            // 0. Gerar e Salvar PDF no Storage
            const numeroMateria = materiaOriginal.projetosdelei?.[0]?.numero_lei ||
                materiaOriginal.oficios?.[0]?.numero_oficio ||
                materiaOriginal.requerimentos?.[0]?.numero_requerimento ||
                materiaOriginal.mocoes?.[0]?.numero_mocao ||
                materiaOriginal.indicacoes?.[0]?.numero_indicacao ||
                materiaOriginal.projetosdedecretolegislativo?.[0]?.numero_decreto ||
                materiaOriginal.protocolos?.numero || "";

            const blob = await pdf(
                <ParecerPDF
                    comissaoNome={comissao?.nome || "Comissão"}
                    materiaTipo={materiaOriginal.tiposdedocumento?.nome || "Documento"}
                    materiaNumero={numeroMateria?.toString()}
                    materiaAno={materiaOriginal.ano}
                    parecerNumero={`${parecer.documento?.protocolos?.numero || parecer.id}/${parecer.documento?.ano}`}
                    texto={corpoTexto}
                    dataProtocolo={parecer.documento?.data_protocolo}
                    membros={comissaoMembros}
                />
            ).toBlob();

            // Fazer upload para o bucket 'pareceres'
            // Assinatura: pdfBlob, tipo, numero, ano, id
            const { url: pdfUrl } = await uploadMateriaPDF(
                blob,
                "Parecer", // Tipo fixo para garantir bucket correto
                parecer.documento?.protocolos?.numero, // Número do protocolo
                parecer.documento?.ano, // Ano
                parecer.documento_id
            );

            // Salvar URL no documento
            await atualizarUrlPDF(parecer.documento_id, pdfUrl);

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

                // 2.3 Add Tramitação
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

            // 4. Adicionar parecer e matéria à próxima sessão
            if (parecer.documento_id && materiaOriginal?.id) {
                await adicionarParecerProximaSessao(parecer.documento_id, materiaOriginal.id);
            }

            // 5. Registrar atividade no log
            const { registrarParecer } = await import("@/services/atividadeLogService");

            await registrarParecer(
                parecer.documento_id,
                comissao?.nome || "Comissão",
                numeroMateria,
                materiaOriginal?.ano || new Date().getFullYear(),
                materiaOriginal?.tiposdedocumento?.nome || "Matéria"
            );

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

    async function handleGerarIA() {
        if (!parecer || !materiaOriginal || !comissao) return;

        setSaving(true);
        toast({ title: "IA Trabalhando...", description: "Gerando minuta do parecer, aguarde." });

        try {
            const ementaMateria =
                materiaOriginal.projetosdelei?.[0]?.ementa ||
                materiaOriginal.oficios?.[0]?.assunto ||
                materiaOriginal.requerimentos?.[0]?.justificativa ||
                materiaOriginal.mocoes?.[0]?.ementa ||
                materiaOriginal.indicacoes?.[0]?.ementa ||
                materiaOriginal.projetosdedecretolegislativo?.[0]?.ementa ||
                materiaOriginal.projetosderesolucao?.[0]?.ementa ||
                materiaOriginal.projetosdeemendaorganica?.[0]?.ementa ||
                "Não informado";

            const textoCompletoMateria =
                materiaOriginal.projetosdelei?.[0]?.corpo_texto ||
                materiaOriginal.projetosdelei?.[0]?.justificativa ||
                materiaOriginal.oficios?.[0]?.corpo_texto ||
                materiaOriginal.oficios?.[0]?.justificativa ||
                materiaOriginal.requerimentos?.[0]?.corpo_texto ||
                materiaOriginal.requerimentos?.[0]?.justificativa ||
                materiaOriginal.mocoes?.[0]?.justificativa ||
                materiaOriginal.mocoes?.[0]?.homenageado_texto ||
                materiaOriginal.indicacoes?.[0]?.justificativa ||
                materiaOriginal.projetosdedecretolegislativo?.[0]?.corpo_texto ||
                materiaOriginal.projetosdedecretolegislativo?.[0]?.justificativa ||
                materiaOriginal.projetosderesolucao?.[0]?.corpo_texto ||
                materiaOriginal.projetosderesolucao?.[0]?.justificativa ||
                materiaOriginal.projetosdeemendaorganica?.[0]?.corpo_texto ||
                materiaOriginal.projetosdeemendaorganica?.[0]?.justificativa ||
                "";

            const numeroMateria = materiaOriginal.projetosdelei?.[0]?.numero_lei ||
                materiaOriginal.oficios?.[0]?.numero_oficio ||
                materiaOriginal.requerimentos?.[0]?.numero_requerimento ||
                materiaOriginal.mocoes?.[0]?.numero_mocao ||
                materiaOriginal.indicacoes?.[0]?.numero_indicacao ||
                materiaOriginal.projetosdedecretolegislativo?.[0]?.numero_decreto ||
                materiaOriginal.protocolos?.numero || "S/N";

            // Construir contexto rico para a IA
            const contextoParecer = `
                Gere um PARECER DA COMISSÃO DE ${comissao.nome.toUpperCase()}.
                
                MATÉRIA ANALISADA:
                - Tipo: ${materiaOriginal.tiposdedocumento?.nome}
                - Número: ${numeroMateria}/${materiaOriginal.ano}
                - Autor: ${nomeAutorMateria}
                - Ementa/Assunto: ${ementaMateria}
                
                TEXTO/JUSTIFICATIVA DA MATÉRIA ORIGINAL:
                "${textoCompletoMateria}"
                
                MEMBROS DA COMISSÃO (APENAS PARA CONTEXTO, NÃO INCLUA NO TEXTO FINAL):
                ${comissaoMembros.map((m: any) => `- ${m.nome} (${m.cargo})`).join("\n")}

                ESTRUTURA DESEJADA DO TEXTO DE SAÍDA:
                1. RELATÓRIO: Resumo do que trata a matéria, citando o autor.
                2. ANÁLISE: Análise da constitucionalidade, legalidade e mérito.
                3. CONCLUSÃO/VOTO: Parecer favorável ou contrário.
                
                IMPORTANTE:
                - Gere texto formal e técnico.
                - NÃO inclua cabeçalho (já existe no layout).
                - NÃO inclua lista de assinaturas ou membros ao final (já existe no layout).
                - NÃO coloque data ou local ao final.
            `;

            const { data: dataIA, error: erroEdge } = await supabase.functions.invoke('gerar-minuta', {
                body: {
                    documento_id: parecer.documento_id,
                    protocolo_geral: parecer.documento?.protocolos?.numero,
                    tipo: "Parecer",
                    contexto: contextoParecer,
                    autor_nome: comissao.nome,
                }
            });

            if (erroEdge) throw erroEdge;

            if (dataIA?.texto) {
                setCorpoTexto(dataIA.texto);
                toast({ title: "Sucesso!", description: "Texto gerado pela IA." });
            } else {
                throw new Error("A IA não retornou texto.");
            }

        } catch (error: any) {
            console.error("Erro IA:", error);
            toast({ title: "Erro na IA", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    async function handleGerarPDF() {
        if (!parecer || !materiaOriginal) return;

        try {
            const numeroMateria = materiaOriginal.projetosdelei?.[0]?.numero_lei ||
                materiaOriginal.oficios?.[0]?.numero_oficio ||
                materiaOriginal.requerimentos?.[0]?.numero_requerimento ||
                materiaOriginal.mocoes?.[0]?.numero_mocao ||
                materiaOriginal.indicacoes?.[0]?.numero_indicacao ||
                materiaOriginal.projetosdedecretolegislativo?.[0]?.numero_decreto ||
                materiaOriginal.protocolos?.numero || "";

            const blob = await pdf(
                <ParecerPDF
                    comissaoNome={comissao?.nome || "Comissão"}
                    materiaTipo={materiaOriginal.tiposdedocumento?.nome || "Documento"}
                    materiaNumero={numeroMateria?.toString()}
                    materiaAno={materiaOriginal.ano}
                    parecerNumero={`${parecer.documento?.protocolos?.numero || parecer.id}/${parecer.documento?.ano}`}
                    texto={corpoTexto}
                    dataProtocolo={parecer.documento?.data_protocolo}
                    membros={comissaoMembros}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast({ title: "Erro", description: "Falha ao gerar o PDF.", variant: "destructive" });
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
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleGerarPDF} className="gap-2">
                            <FileText className="w-4 h-4" />
                            Visualizar Oficial
                        </Button>
                        <Badge className={statusFinalizado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                            {parecer.status}
                        </Badge>
                    </div>
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
                                onClick={handleGerarIA}
                                disabled={saving}
                                className="border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Gerar com IA
                            </Button>
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
