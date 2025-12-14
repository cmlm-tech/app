import { pdf } from '@react-pdf/renderer';
import { DocumentoPDF } from "@/components/documentos/DocumentoPDF";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentoDetalhes {
    id: number;
    numero_protocolo_geral: number;
    ano: number;
    tiposdedocumento: { nome: string } | null;
    status: string;
    autor: { nome: string } | null;
    data_protocolo: string;
}

export default function EditarMateria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false); // PDF State
    const [doc, setDoc] = useState<DocumentoDetalhes | null>(null);
    const [corpoTexto, setCorpoTexto] = useState("");
    const [autorNome, setAutorNome] = useState("");

    const [autorId, setAutorId] = useState<number | null>(null);

    // Metadata fields that might be editable
    const [ementa, setEmenta] = useState("");

    async function handleGerarPDF() {
        if (!doc) return;
        setGeneratingPDF(true);
        try {
            const numeroOficial = (doc as any).numero_oficial
                ? `${doc.tiposdedocumento?.nome} nº ${(doc as any).numero_oficial.toString().padStart(3, '0')}/${doc.ano}`
                : "Sem Numeração";

            const blob = await pdf(
                <DocumentoPDF
                    tipo={doc.tiposdedocumento?.nome || "Documento"}
                    ano={doc.ano}
                    numero={numeroOficial}
                    protocolo={doc.numero_protocolo_geral}
                    dataProtocolo={doc.data_protocolo}
                    texto={corpoTexto}
                    autor={autorNome}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Falha ao gerar PDF.", variant: "destructive" });
        } finally {
            setGeneratingPDF(false);
        }
    }

    useEffect(() => {
        if (id) carregarDados(id);
    }, [id]);

    async function carregarDados(docId: string) {
        try {
            setLoading(true);

            // 1. Fetch main document info
            const { data: docData, error: docError } = await supabase
                .from("documentos")
                .select(`
        id,
        numero_protocolo_geral,
        ano,
        status,
        data_protocolo,
        tiposdedocumento ( nome )
        `)
                .eq("id", Number(docId))
                .single();

            console.log("Edit Page: Doc Data Response:", docData);
            if (docError) {
                console.error("Edit Page: Doc Error:", docError);
                throw docError;
            }

            // 2. Fetch specific content based on type
            const tipoNome = docData.tiposdedocumento?.nome; // e.g., "Ofício", "Projeto de Lei"
            let tabelaFilha = "";
            let colunaTexto = "";
            let colunaEmenta = ""; // Context/Ementa field

            if (tipoNome === "Ofício") {
                tabelaFilha = "oficios";
                colunaTexto = "corpo_texto";
                colunaEmenta = "assunto";
            } else if (tipoNome === "Projeto de Lei") {
                tabelaFilha = "projetosdelei";
                colunaTexto = "corpo_texto";
                colunaEmenta = "ementa";
            } else if (tipoNome === "Requerimento") {
                tabelaFilha = "requerimentos";
                colunaTexto = "corpo_texto"; // Changed from justificativa to decouple
                colunaEmenta = "justificativa"; // Used as summary
            } // Add others as needed

            if (tabelaFilha) {
                const { data: childData, error: childError } = await supabase
                    .from(tabelaFilha as any)
                    .select("*")
                    .eq("documento_id", Number(docId))
                    .single();

                if (childError && childError.code !== 'PGRST116') { // Ignore not found (maybe not created yet)
                    console.error("Erro child table:", childError);
                }

                if (childData) {
                    setCorpoTexto(childData[colunaTexto] || "");
                    setEmenta(childData[colunaEmenta] || childData['contexto'] || "");

                    // Capture official number if exists
                    if (childData['numero_oficio']) (docData as any).numero_oficial = childData['numero_oficio'];
                    if (childData['numero_lei']) (docData as any).numero_oficial = childData['numero_lei'];
                }
            }

            // 3. Fetch Author (Manual mapping as done in Materias.tsx)
            // First get author ID from documentoautores
            const { data: authData } = await supabase
                .from("documentoautores")
                .select("autor_id")
                .eq("documento_id", Number(docId))
                .single();

            if (authData?.autor_id) {
                setAutorId(authData.autor_id); // Saving ID for numbering logic
                const { data: agenteData } = await supabase
                    .from("agentespublicos")
                    .select("nome_completo")
                    .eq("id", authData.autor_id)
                    .single();
                if (agenteData) setAutorNome(agenteData.nome_completo);
            }

            setDoc(docData as any);

        } catch (error: any) {
            console.error("Erro ao carregar:", error);
            toast({ title: "Erro", description: "Falha ao carregar documento.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    async function handleSalvar() {
        if (!doc) return;
        setSaving(true);
        try {
            const tipoNome = (doc.tiposdedocumento as any)?.nome;
            let tabelaFilha = "";
            let colunaTexto = "";

            if (tipoNome === "Ofício") { tabelaFilha = "oficios"; colunaTexto = "corpo_texto"; }
            else if (tipoNome === "Projeto de Lei") { tabelaFilha = "projetosdelei"; colunaTexto = "corpo_texto"; }
            else if (tipoNome === "Requerimento") { tabelaFilha = "requerimentos"; colunaTexto = "corpo_texto"; }

            if (!tabelaFilha) throw new Error("Tipo de documento não suporta edição de texto ainda.");

            const { error } = await supabase
                .from(tabelaFilha as any)
                .update({ [colunaTexto]: corpoTexto })
                .eq("documento_id", doc.id);

            if (error) throw error;

            toast({ title: "Sucesso!", description: "Texto salvo com sucesso.", className: "bg-green-600 text-white" });

        } catch (err: any) {
            console.error(err);
            toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    async function handleGerarNumero() {
        if (!doc) return;

        // IMPORTANT: Prevent regenerating if number already exists
        if ((doc as any).numero_oficial) {
            toast({
                title: "Número já existe",
                description: `Este documento já possui o número ${(doc as any).numero_oficial}. Não é possível regerar.`,
                variant: "destructive"
            });
            return;
        }

        // Validation: Verify if essential fields are filled
        if (!corpoTexto.trim()) {
            toast({ title: "Dados incompletos", description: "O corpo do texto não pode estar vazio.", variant: "destructive" });
            return;
        }
        if (!ementa.trim()) {
            toast({ title: "Dados incompletos", description: "O resumo/ementa não pode estar vazio.", variant: "destructive" });
            return;
        }
        // Specific check for Ofício
        const tipoNome = (doc.tiposdedocumento as any)?.nome;
        if (tipoNome === "Ofício" && !autorId) {
            toast({ title: "Erro de Autor", description: "Autor não identificado. Não é possível gerar numeração para Ofício.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            let novoNumero = 0;

            if (tipoNome === "Ofício") {
                if (!autorId) throw new Error("Autor não identificado para gerar numeração de Ofício.");

                console.log("🔍 DEBUG - Gerando numeração para Ofício:");
                console.log("  - Autor ID:", autorId);
                console.log("  - Ano:", doc.ano);
                console.log("  - Documento ID atual:", doc.id);

                // 1. Buscar último número DESTE AUTOR no ANO
                // Preciso fazer join manual aqui pq Supabase client side não faz join complexo em filter facil
                // Estratégia: Buscar todos os oficios deste ano, filtrar pelo autor.
                // Melhor: Buscar documentoautores filtrado por autor, join com documentos ano, join com oficios.
                // Simplificação Client-Side:
                // Passo A: Pegar IDs dos documentos deste autor neste ano
                const { data: docsAutor, error: errDocs } = await supabase
                    .from('documentos')
                    .select(`
        id,
        documentoautores!inner(autor_id)
        `)
                    .eq('ano', doc.ano)
                    .eq('documentoautores.autor_id', autorId);

                console.log("  - Documentos do autor encontrados:", docsAutor);
                console.log("  - Erro na busca de docs:", errDocs);

                if (errDocs) throw errDocs;

                const docIds = docsAutor.map(d => d.id);
                console.log("  - IDs dos documentos:", docIds);

                // Passo B: Pegar max numero_oficio destes docs (EXCLUINDO o documento atual!)
                if (docIds.length > 0) {
                    // IMPORTANTE: Filtrar o documento atual para não considerar o próprio número
                    const docIdsFiltrados = docIds.filter(id => id !== doc.id);
                    console.log("  - IDs filtrados (sem o atual):", docIdsFiltrados);

                    if (docIdsFiltrados.length > 0) {
                        // Use maybeSingle() instead of single() to handle empty results gracefully
                        const { data: oficiosList, error: errList } = await supabase
                            .from('oficios')
                            .select('numero_oficio, documento_id')
                            .in('documento_id', docIdsFiltrados)
                            .not('numero_oficio', 'is', null) // Only get non-null numbers
                            .order('numero_oficio', { ascending: false });

                        console.log("  - Lista de ofícios encontrados:", oficiosList);
                        console.log("  - Erro na busca de ofícios:", errList);

                        if (errList) {
                            console.error("  - ❌ ERRO ao buscar ofícios:", errList);
                        }

                        // Get the maximum number from the list
                        if (oficiosList && oficiosList.length > 0) {
                            novoNumero = oficiosList[0].numero_oficio;
                            console.log("  - 📊 Maior número encontrado na lista:", novoNumero);
                        } else {
                            console.log("  - ℹ️ Nenhum ofício anterior encontrado, começando do 0");
                        }
                    } else {
                        console.log("  - ℹ️ Apenas o documento atual existe, começando do 0");
                    }
                } else {
                    console.log("  - ℹ️ Nenhum documento do autor neste ano, começando do 0");
                }

                console.log("  - Número antes do incremento:", novoNumero);
                novoNumero += 1; // Incrementa
                console.log("  - ✅ NOVO NÚMERO GERADO:", novoNumero);

                // Atualizar
                console.log("  - 💾 Salvando número", novoNumero, "no documento", doc.id);
                const { error: upErr } = await supabase.from('oficios').update({ numero_oficio: novoNumero }).eq('documento_id', doc.id);
                if (upErr) {
                    console.error("  - ❌ ERRO ao salvar número:", upErr);
                    throw upErr;
                }
                console.log("  - ✅ Número salvo com sucesso no banco de dados!");


            } else if (tipoNome === "Projeto de Lei") {
                // Global por ano
                const { data: docsAno, error: errDocs } = await supabase
                    .from('documentos')
                    .select('id')
                    .eq('ano', doc.ano);

                if (errDocs) throw errDocs;
                const docIds = docsAno.map(d => d.id);

                if (docIds.length > 0) {
                    const { data: maxPL } = await supabase
                        .from('projetosdelei')
                        .select('numero_lei') // Verifique se é numero_lei ou numero_projeto no schema real
                        .in('documento_id', docIds)
                        .order('numero_lei', { ascending: false })
                        .limit(1)
                        .single();

                    if (maxPL && maxPL.numero_lei) novoNumero = maxPL.numero_lei;
                }
                novoNumero += 1;

                const { error: upErr } = await supabase.from('projetosdelei').update({ numero_lei: novoNumero }).eq('documento_id', doc.id);
                if (upErr) throw upErr;
            } else {
                throw new Error("Geração automática não suportada para este tipo.");
            }

            toast({ title: "Oficializado!", description: `${tipoNome} recebeu o número ${novoNumero}/${doc.ano}.`, className: "bg-blue-600 text-white" });

            // Update local state immediately (No reload needed)
            setDoc((prev: any) => ({
                ...prev,
                numero_oficial: novoNumero
            }));

        } catch (err: any) {
            console.error(err);
            toast({ title: "Erro na numeração", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    async function handleSalvarEmenta() {
        if (!doc) return;
        setSaving(true); // Re-using saving state for simplicity, could split
        try {
            const tipoNome = (doc.tiposdedocumento as any)?.nome;
            let tabelaFilha = "";
            let colunaEmenta = "";

            if (tipoNome === "Ofício") { tabelaFilha = "oficios"; colunaEmenta = "assunto"; }
            else if (tipoNome === "Projeto de Lei") { tabelaFilha = "projetosdelei"; colunaEmenta = "ementa"; }
            else if (tipoNome === "Requerimento") { tabelaFilha = "requerimentos"; colunaEmenta = "justificativa"; }

            if (!tabelaFilha) throw new Error("Tipo de documento não suporta edição de resumo ainda.");

            const { error } = await supabase
                .from(tabelaFilha as any)
                .update({ [colunaEmenta]: ementa }) // using 'ementa' state variable
                .eq("documento_id", doc.id);

            if (error) throw error;

            toast({ title: "Resumo Atualizado!", description: "O campo foi salvo com sucesso.", className: "bg-green-600 text-white" });

        } catch (err: any) {
            console.error(err);
            toast({ title: "Erro ao salvar resumo", description: err.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
            </AppLayout>
        );
    }

    if (!doc) return (
        <AppLayout>
            <div className="p-8 space-y-4">
                <div className="text-red-600 font-bold">Documento não encontrado ou erro ao carregar.</div>
                <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded border">
                    <p>Verifique o console (F12) para mais detalhes.</p>
                </div>
            </div>
        </AppLayout>
    );

    // UI Logic for official number display
    const labelNumeroOficial = (doc as any).numero_oficial
        ? `${doc.tiposdedocumento?.nome} nº ${(doc as any).numero_oficial.toString().padStart(3, '0')}/${doc.ano} - ${autorNome}`
        : "Aguardando geração...";

    return (
        <AppLayout>
            <div className="p-6 max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate("/documentos/materias")}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {doc.tiposdedocumento?.nome} {doc.ano}.{doc.numero_protocolo_geral.toString().padStart(7, '0')}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Autor: {autorNome || "Carregando..."} • Status: <span className="font-semibold text-indigo-600">{doc.status}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleGerarPDF} disabled={generatingPDF}>
                            {generatingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                            Visualizar Oficial
                        </Button>
                        <Button onClick={handleSalvar} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content (Editor) */}
                    <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">
                                Redação Oficial (Minuta)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-md border border-slate-200 min-h-[600px]">
                                <textarea
                                    className="w-full h-full min-h-[550px] bg-transparent resize-none outline-none text-base leading-relaxed text-gray-800 font-serif"
                                    value={corpoTexto}
                                    onChange={(e) => setCorpoTexto(e.target.value)}
                                    placeholder="O texto da matéria aparecerá aqui..."
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 text-right">
                                Suporta HTML básico se gerado pela IA. Edição livre.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Sidebar (Metadata) */}
                    <div className="space-y-6">
                        {/* Box de Numeração Oficial (Destaque) */}
                        <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm border-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-indigo-900">Numeração Oficial</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-mono font-bold text-indigo-700 mb-2">
                                    {(doc as any).numero_oficial ? labelNumeroOficial : "---"}
                                </div>
                                {!(doc as any).numero_oficial && (
                                    <Button size="sm" onClick={handleGerarNumero} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                        {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                        Gerar Número
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-gray-700">Detalhes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Protocolo Geral</label>
                                    <Input disabled value={`${doc.ano}.${doc.numero_protocolo_geral.toString().padStart(7, '0')}`} className="bg-slate-100 opacity-100 font-medium text-slate-700" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Autor</label>
                                    <Input readOnly value={autorNome} className="bg-slate-50" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Data Protocolo</label>
                                    <Input readOnly value={new Date(doc.data_protocolo).toLocaleDateString('pt-BR')} className="bg-slate-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-gray-700">Resumo / Ementa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={ementa}
                                    onChange={e => setEmenta(e.target.value)}
                                    className="min-h-[120px] text-sm"
                                    placeholder="Resumo do pedido..."
                                />
                                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-indigo-600" onClick={handleSalvarEmenta} disabled={saving}>
                                    {saving ? "Salvando..." : "Atualizar Resumo"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
