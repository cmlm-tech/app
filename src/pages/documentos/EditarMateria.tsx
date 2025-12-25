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
import { PainelComissoes } from "@/components/documentos/PainelComissoes";

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
    const [autoresArray, setAutoresArray] = useState<string[]>([]); // Array de nomes para Moção

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

            // Buscar membros da comissão se for Projeto de Decreto Legislativo
            let membrosComissao: { nome: string; cargo: string }[] = [];

            if (doc.tiposdedocumento?.nome === 'Projeto de Decreto Legislativo') {
                // Normalizar texto para ignorar acentos
                const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                const textoCompleto = normalize((corpoTexto || '') + ' ' + (ementa || ''));
                const mencionaFinancas = textoCompleto.includes('financas') || textoCompleto.includes('comissao');

                if (mencionaFinancas) {
                    // Buscar a comissão de finanças
                    const { data: comissao } = await supabase
                        .from('comissoes')
                        .select('id')
                        .or('nome.ilike.%finanças%,nome.ilike.%financas%')
                        .limit(1)
                        .single();

                    if (comissao) {
                        // Buscar membros
                        const { data: membrosRef } = await supabase
                            .from('comissaomembros')
                            .select('cargo, agente_publico_id')
                            .eq('comissao_id', comissao.id);

                        if (membrosRef && membrosRef.length > 0) {
                            const agenteIds = membrosRef.map(m => m.agente_publico_id);
                            const { data: agentes } = await supabase
                                .from('agentespublicos')
                                .select('id, nome_completo')
                                .in('id', agenteIds);

                            if (agentes) {
                                const agentesMap = new Map(agentes.map(a => [a.id, a.nome_completo]));
                                membrosComissao = membrosRef.map(m => ({
                                    nome: agentesMap.get(m.agente_publico_id) || "Nome não encontrado",
                                    cargo: m.cargo
                                }));
                            }
                        }
                    }
                }
            }

            const blob = await pdf(
                <DocumentoPDF
                    tipo={doc.tiposdedocumento?.nome || "Documento"}
                    numero={numeroOficial}
                    dataProtocolo={doc.data_protocolo}
                    texto={corpoTexto}
                    autor={autorNome}
                    autorCargo={membrosComissao.length > 0 ? "Comissão Permanente" : undefined}
                    ementa={ementa}
                    autores={autoresArray.length > 0 ? autoresArray : undefined}
                    membrosComissao={membrosComissao}
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
            } else if (tipoNome === "Moção") {
                tabelaFilha = "mocoes";
                colunaTexto = "corpo_texto";
                colunaEmenta = "ementa";
            } else if (tipoNome === "Projeto de Decreto Legislativo") {
                tabelaFilha = "projetosdedecretolegislativo";
                colunaTexto = "justificativa";
                colunaEmenta = "ementa";
            } else if (tipoNome === "Indicação") {
                tabelaFilha = "indicacoes";
                colunaTexto = "justificativa";
                colunaEmenta = "ementa";
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
                    if (childData['numero_requerimento']) (docData as any).numero_oficial = childData['numero_requerimento'];
                    if (childData['numero_mocao']) (docData as any).numero_oficial = childData['numero_mocao'];
                    // numero_decreto: extrair apenas o número inteiro (pode vir como 14, "14", ou "14/2025")
                    if (childData['numero_decreto']) {
                        const numStr = String(childData['numero_decreto']);
                        // Extrair apenas a parte numérica antes da barra (se houver)
                        const numOnly = numStr.split('/')[0];
                        const numPadded = numOnly.padStart(3, '0');
                        (docData as any).numero_oficial = `${numPadded}/${docData.ano}`;
                    }
                    // numero_indicacao: mesma lógica
                    if (childData['numero_indicacao']) {
                        (docData as any).numero_oficial = `${childData['numero_indicacao']}/${docData.ano}`;
                    }
                }
            }

            // 3. Fetch Author(s) - For Moção, fetch ALL authors; for others, fetch single author
            const docTipo = docData.tiposdedocumento?.nome;

            if (docTipo === "Moção") {
                // Fetch ALL authors for Moção
                const { data: authorsData } = await supabase
                    .from("documentoautores")
                    .select("autor_id, papel")
                    .eq("documento_id", Number(docId))
                    .order('papel', { ascending: true }); // Principal first

                if (authorsData && authorsData.length > 0) {
                    // Set first author ID for numbering logic
                    setAutorId(authorsData[0].autor_id);

                    // Fetch all author names
                    const authorIds = authorsData.map(a => a.autor_id);
                    const { data: agentesData } = await supabase
                        .from("agentespublicos")
                        .select("id, nome_completo")
                        .in("id", authorIds);

                    if (agentesData) {
                        // Store array for PDF and join for display
                        const authorNamesArray = agentesData.map(a => a.nome_completo);
                        setAutoresArray(authorNamesArray);
                        setAutorNome(authorNamesArray.join(", "));
                    }
                }
            } else {
                // Single author for other document types
                const { data: authData } = await supabase
                    .from("documentoautores")
                    .select("autor_id")
                    .eq("documento_id", Number(docId))
                    .single();

                if (authData?.autor_id) {
                    setAutorId(authData.autor_id);
                    const { data: agenteData } = await supabase
                        .from("agentespublicos")
                        .select("nome_completo")
                        .eq("id", authData.autor_id)
                        .single();
                    if (agenteData) setAutorNome(agenteData.nome_completo);
                }
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
            else if (tipoNome === "Moção") { tabelaFilha = "mocoes"; colunaTexto = "corpo_texto"; }
            else if (tipoNome === "Projeto de Decreto Legislativo") { tabelaFilha = "projetosdedecretolegislativo"; colunaTexto = "justificativa"; }
            else if (tipoNome === "Indicação") { tabelaFilha = "indicacoes"; colunaTexto = "justificativa"; }

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
        // Get and normalize document type BEFORE validations
        const tipoNome = (doc.tiposdedocumento as any)?.nome;
        const tipoNormalizado = tipoNome?.trim().toLowerCase();

        // Check document type with flexible matching
        const isOficio = tipoNormalizado?.includes('oficio') || tipoNormalizado?.includes('ofício');
        const isProjetoLei = tipoNormalizado?.includes('projeto') && tipoNormalizado?.includes('lei');
        const isRequerimento = tipoNormalizado?.includes('requerimento');

        // Specific check for Ofício
        if (isOficio && !autorId) {
            toast({ title: "Erro de Autor", description: "Autor não identificado. Não é possível gerar numeração para Ofício.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            let novoNumero = 0;

            if (isOficio) {
                if (!autorId) throw new Error("Autor não identificado para gerar numeração de Ofício.");



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



                if (errDocs) throw errDocs;

                const docIds = docsAutor.map(d => d.id);


                // Passo B: Pegar max numero_oficio destes docs (EXCLUINDO o documento atual!)
                if (docIds.length > 0) {
                    // IMPORTANTE: Filtrar o documento atual para não considerar o próprio número
                    const docIdsFiltrados = docIds.filter(id => id !== doc.id);


                    if (docIdsFiltrados.length > 0) {
                        // Use maybeSingle() instead of single() to handle empty results gracefully
                        const { data: oficiosList, error: errList } = await supabase
                            .from('oficios')
                            .select('numero_oficio, documento_id')
                            .in('documento_id', docIdsFiltrados)
                            .not('numero_oficio', 'is', null) // Only get non-null numbers
                            .order('numero_oficio', { ascending: false });

                        if (errList) {
                            console.error("Erro ao buscar ofícios:", errList);
                        }

                        // Get the maximum number from the list
                        if (oficiosList && oficiosList.length > 0) {
                            novoNumero = oficiosList[0].numero_oficio;
                        } else {
                        }
                    } else {
                    }
                } else {
                }

                novoNumero += 1; // Incrementa

                // Atualizar
                const { error: upErr } = await supabase.from('oficios').update({ numero_oficio: novoNumero }).eq('documento_id', doc.id);
                if (upErr) {
                    console.error("Erro ao salvar número:", upErr);
                    throw upErr;
                }


            } else if (isProjetoLei) {
                // Global por ano (não filtrado por autor)
                const { data: docsAno, error: errDocs } = await supabase
                    .from('documentos')
                    .select('id')
                    .eq('ano', doc.ano);

                if (errDocs) throw errDocs;

                // Excluir o documento atual
                const docIds = docsAno.map(d => d.id).filter(id => id !== doc.id);

                if (docIds.length > 0) {
                    const { data: projetosList } = await supabase
                        .from('projetosdelei')
                        .select('numero_lei')
                        .in('documento_id', docIds)
                        .not('numero_lei', 'is', null)
                        .order('numero_lei', { ascending: false });

                    if (projetosList && projetosList.length > 0) {
                        novoNumero = projetosList[0].numero_lei;
                    }
                }
                novoNumero += 1;

                const { error: upErr } = await supabase.from('projetosdelei').update({ numero_lei: novoNumero }).eq('documento_id', doc.id);
                if (upErr) {
                    console.error("Erro ao salvar número:", upErr);
                    throw upErr;
                }

            } else if (isRequerimento) {
                // Global por ano (não filtrado por autor)
                const { data: docsAno, error: errDocs } = await supabase
                    .from('documentos')
                    .select('id')
                    .eq('ano', doc.ano);

                if (errDocs) throw errDocs;

                // Excluir o documento atual
                const docIds = docsAno.map(d => d.id).filter(id => id !== doc.id);

                if (docIds.length > 0) {
                    const { data: requerimentosList } = await supabase
                        .from('requerimentos')
                        .select('numero_requerimento')
                        .in('documento_id', docIds)
                        .not('numero_requerimento', 'is', null)
                        .order('numero_requerimento', { ascending: false });

                    if (requerimentosList && requerimentosList.length > 0) {
                        novoNumero = requerimentosList[0].numero_requerimento;
                    }
                }
                novoNumero += 1;

                const { error: upErr } = await supabase.from('requerimentos').update({ numero_requerimento: novoNumero }).eq('documento_id', doc.id);
                if (upErr) {
                    console.error("Erro ao salvar número:", upErr);
                    throw upErr;
                }

            } else if (tipoNome === "Moção") {
                // Global por ano (numeração sequencial da Câmara)
                const { data: docsAno, error: errDocs } = await supabase
                    .from('documentos')
                    .select('id')
                    .eq('ano', doc.ano);

                if (errDocs) throw errDocs;

                // Excluir o documento atual
                const docIds = docsAno.map(d => d.id).filter(id => id !== doc.id);

                if (docIds.length > 0) {
                    const { data: mocoesList } = await supabase
                        .from('mocoes')
                        .select('numero_mocao')
                        .in('documento_id', docIds)
                        .not('numero_mocao', 'is', null)
                        .order('numero_mocao', { ascending: false });

                    if (mocoesList && mocoesList.length > 0) {
                        novoNumero = mocoesList[0].numero_mocao;
                    }
                }
                novoNumero += 1;

                const { error: upErr } = await supabase.from('mocoes').update({ numero_mocao: novoNumero }).eq('documento_id', doc.id);
                if (upErr) {
                    console.error("Erro ao salvar número:", upErr);
                    throw upErr;
                }

            } else if (tipoNome === "Projeto de Decreto Legislativo") {
                // Global por ano (mesma lógica de Projeto de Lei)
                const { data: docsAno, error: errDocs } = await supabase
                    .from('documentos')
                    .select('id')
                    .eq('ano', doc.ano);

                if (errDocs) throw errDocs;

                const docIds = docsAno.map(d => d.id).filter(id => id !== doc.id);

                if (docIds.length > 0) {
                    const { data: decretosList } = await supabase
                        .from('projetosdedecretolegislativo')
                        .select('numero_decreto')
                        .in('documento_id', docIds)
                        .not('numero_decreto', 'is', null)
                        .order('numero_decreto', { ascending: false });

                    if (decretosList && decretosList.length > 0) {
                        // Extrair apenas o número inteiro (pode vir como "15" ou "15/2025")
                        const numStr = String(decretosList[0].numero_decreto);
                        novoNumero = parseInt(numStr.split('/')[0], 10) || 0;
                    }
                }
                novoNumero += 1;

                // Salvar APENAS o número inteiro no banco
                const { error: upErr } = await supabase.from('projetosdedecretolegislativo').update({ numero_decreto: novoNumero }).eq('documento_id', doc.id);
                if (upErr) {
                    console.error("Erro ao salvar número:", upErr);
                    throw upErr;
                }

            } else if (tipoNome === "Indicação") {
                // Global por ano (mesma lógica de Projeto de Lei)
                const { data: docsAno, error: errDocs } = await supabase
                    .from('documentos')
                    .select('id')
                    .eq('ano', doc.ano);

                if (errDocs) throw errDocs;

                const docIds = docsAno.map(d => d.id).filter(id => id !== doc.id);

                if (docIds.length > 0) {
                    const { data: indicacoesList } = await supabase
                        .from('indicacoes')
                        .select('numero_indicacao')
                        .in('documento_id', docIds)
                        .not('numero_indicacao', 'is', null)
                        .order('numero_indicacao', { ascending: false });

                    if (indicacoesList && indicacoesList.length > 0) {
                        const numStr = String(indicacoesList[0].numero_indicacao);
                        novoNumero = parseInt(numStr.split('/')[0], 10) || 0;
                    }
                }
                novoNumero += 1;

                const { error: upErr } = await supabase.from('indicacoes').update({ numero_indicacao: novoNumero }).eq('documento_id', doc.id);
                if (upErr) {
                    console.error("Erro ao salvar número:", upErr);
                    throw upErr;
                }

            } else {
                console.error("❌ Tipo não reconhecido:", tipoNome);
                throw new Error(`Geração automática não suportada para o tipo "${tipoNome}". Tipos válidos: Ofício, Projeto de Lei, Requerimento, Moção, Projeto de Decreto Legislativo, Indicação.`);
            }

            // Formatar número para exibição
            const numeroFormatado = tipoNome === "Projeto de Decreto Legislativo"
                ? `${String(novoNumero).padStart(3, '0')}/${doc.ano}`
                : `${novoNumero}/${doc.ano}`;

            toast({ title: "Oficializado!", description: `${tipoNome} recebeu o número ${numeroFormatado}.`, className: "bg-blue-600 text-white" });

            // Update local state immediately (No reload needed)
            setDoc((prev: any) => ({
                ...prev,
                numero_oficial: numeroFormatado
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
            else if (tipoNome === "Moção") { tabelaFilha = "mocoes"; colunaEmenta = "ementa"; }
            else if (tipoNome === "Projeto de Decreto Legislativo") { tabelaFilha = "projetosdedecretolegislativo"; colunaEmenta = "ementa"; }
            else if (tipoNome === "Indicação") { tabelaFilha = "indicacoes"; colunaEmenta = "ementa"; }

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
    // numero_oficial já vem formatado como "016/2025", não precisa adicionar ano novamente
    const labelNumeroOficial = (doc as any).numero_oficial
        ? `${doc.tiposdedocumento?.nome} nº ${(doc as any).numero_oficial} - ${autorNome}`
        : "Aguardando geração...";

    return (
        <AppLayout>
            <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate("/documentos/materias")}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                                {doc.tiposdedocumento?.nome} {doc.ano}.{doc.numero_protocolo_geral.toString().padStart(7, '0')}
                            </h1>
                            <p className="text-sm text-gray-500 truncate">
                                Autor: {autorNome || "Carregando..."} • Status: <span className="font-semibold text-indigo-600">{doc.status}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={handleGerarPDF} disabled={generatingPDF} className="flex-1 sm:flex-none">
                            {generatingPDF ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                            <span className="hidden sm:inline">Visualizar Oficial</span>
                            <span className="sm:hidden">PDF</span>
                        </Button>
                        <Button onClick={handleSalvar} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 flex-1 sm:flex-none">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            <span className="hidden sm:inline">Salvar Alterações</span>
                            <span className="sm:hidden">Salvar</span>
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

                        {/* Bloco de Comissões */}
                        <PainelComissoes
                            docId={doc.id}
                            ano={doc.ano}
                            disabled={saving}
                        />
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
