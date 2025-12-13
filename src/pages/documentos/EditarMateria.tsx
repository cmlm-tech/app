
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentoDetalhes {
    id: number;
    numero_protocolo_geral: number;
    ano: number;
    tiposdedocumento: { nome: string } | null; // Join relation
    status: string;
    autor: { nome: string } | null; // Manual fetch/map needed or join if view
    data_protocolo: string;
}

export default function EditarMateria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [doc, setDoc] = useState<DocumentoDetalhes | null>(null);
    const [corpoTexto, setCorpoTexto] = useState("");
    const [autorNome, setAutorNome] = useState("");

    // Metadata fields that might be editable
    const [ementa, setEmenta] = useState("");

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
                colunaEmenta = "contexto"; // Assuming 'contexto' stores the summary
            } else if (tipoNome === "Projeto de Lei") {
                tabelaFilha = "projetosdelei";
                colunaTexto = "corpo_texto";
                colunaEmenta = "ementa";
            } else if (tipoNome === "Requerimento") {
                tabelaFilha = "requerimentos";
                colunaTexto = "justificativa";
                colunaEmenta = "ementa"; // Check schema if needed
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
            // Identify table again
            const tipoNome = (doc.tiposdedocumento as any)?.nome;
            let tabelaFilha = "";
            let colunaTexto = "";

            if (tipoNome === "Ofício") { tabelaFilha = "oficios"; colunaTexto = "corpo_texto"; }
            else if (tipoNome === "Projeto de Lei") { tabelaFilha = "projetosdelei"; colunaTexto = "corpo_texto"; }
            else if (tipoNome === "Requerimento") { tabelaFilha = "requerimentos"; colunaTexto = "justificativa"; }

            if (!tabelaFilha) throw new Error("Tipo de documento não suporta edição de texto ainda.");

            // Update
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
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-gray-700">Detalhes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500">Protocolo Geral</label>
                                    <Input readOnly value={`${doc.ano}.${doc.numero_protocolo_geral.toString().padStart(7, '0')}`} className="bg-slate-50" />
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
                                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-indigo-600">
                                    Atualizar Resumo (Em breve)
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
