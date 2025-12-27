import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Tramitacao {
    id: number;
    status: string;
    descricao: string;
    data_hora: string;
    usuario: { nome_completo: string } | null;
}

interface DocumentoInfo {
    id: number;
    status: string;
    tiposdedocumento: { nome: string } | null;
    protocolos: { numero: string } | null;
    ano: number;
    numeroOficial?: string;
}

export default function HistoricoMateria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [documento, setDocumento] = useState<DocumentoInfo | null>(null);
    const [tramitacoes, setTramitacoes] = useState<Tramitacao[]>([]);

    useEffect(() => {
        carregarHistorico();
    }, [id]);

    async function carregarHistorico() {
        try {
            setLoading(true);

            // Buscar dados do documento
            const { data: docData, error: docError } = await supabase
                .from("documentos")
                .select(`
          id,
          status,
          ano,
          tipo_documento_id,
          tiposdedocumento ( nome ),
          protocolos!documentos_protocolo_id_fkey ( numero )
        `)
                .eq("id", Number(id))
                .single();

            if (docError) throw docError;

            // Buscar número oficial baseado no tipo
            let numeroOficial = (docData as any).protocolos?.numero || `${docData.ano}.Rascunho`;
            const tipoNome = (docData as any).tiposdedocumento?.nome;

            if (tipoNome) {
                let tabelaFilha = "";
                let colunaNumero = "";

                if (tipoNome === "Ofício") {
                    tabelaFilha = "oficios";
                    colunaNumero = "numero_oficio";
                } else if (tipoNome === "Projeto de Lei") {
                    tabelaFilha = "projetosdelei";
                    colunaNumero = "numero_lei";
                } else if (tipoNome === "Requerimento") {
                    tabelaFilha = "requerimentos";
                    colunaNumero = "numero_requerimento";
                } else if (tipoNome === "Moção") {
                    tabelaFilha = "mocoes";
                    colunaNumero = "numero_mocao";
                } else if (tipoNome === "Indicação") {
                    tabelaFilha = "indicacoes";
                    colunaNumero = "numero_indicacao";
                } else if (tipoNome === "Projeto de Decreto Legislativo") {
                    tabelaFilha = "projetosdedecretolegislativo";
                    colunaNumero = "numero_decreto_legislativo";
                }

                if (tabelaFilha && colunaNumero) {
                    const { data: childData } = await supabase
                        .from(tabelaFilha as any)
                        .select(colunaNumero)
                        .eq("documento_id", Number(id))
                        .single();

                    if (childData && childData[colunaNumero]) {
                        numeroOficial = `${tipoNome} nº ${childData[colunaNumero]}/${docData.ano}`;
                    }
                }
            }

            setDocumento({ ...docData, numeroOficial } as any);


            // Buscar tramitações
            const { data: tramData, error: tramError } = await supabase
                .from("tramitacoes")
                .select(`
          id,
          status,
          descricao,
          data_hora,
          usuario_id
        `)
                .eq("documento_id", Number(id))
                .order("data_hora", { ascending: false });

            if (tramError) throw tramError;

            // Buscar nomes dos usuários via agentespublicos
            const usuarioIds = [...new Set(tramData?.map(t => t.usuario_id).filter(Boolean))];
            let usuariosMap = new Map();

            if (usuarioIds.length > 0) {
                const { data: usuarios } = await supabase
                    .from("usuarios")
                    .select("id, agentespublicos:agente_publico_id ( nome_completo )")
                    .in("id", usuarioIds);

                if (usuarios) {
                    usuariosMap = new Map(usuarios.map((u: any) => [
                        u.id,
                        u.agentespublicos?.nome_completo || 'Sistema'
                    ]));
                }
            }

            // Mapear para formato correto
            const tramitacoesFormatadas = (tramData || []).map((t: any) => ({
                id: t.id,
                status: t.status,
                descricao: t.descricao,
                data_hora: t.data_hora,
                usuario: t.usuario_id ? { nome_completo: usuariosMap.get(t.usuario_id) || 'Desconhecido' } : null
            }));

            setTramitacoes(tramitacoesFormatadas);

        } catch (error: any) {
            console.error("Erro ao carregar histórico:", error);
            toast({
                title: "Erro",
                description: error.message || "Erro ao carregar histórico",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    function getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            "Rascunho": "bg-gray-500",
            "Protocolado": "bg-blue-500",
            "Em Tramitação": "bg-yellow-500",
            "Aprovado": "bg-green-500",
            "Rejeitado": "bg-red-500",
            "Arquivado": "bg-gray-600",
            "Publicado": "bg-indigo-600",
            "Lido": "bg-cyan-500",
            "Enviado para Comissão": "bg-purple-500",
            "Parecer Emitido": "bg-pink-500"
        };
        return colors[status] || "bg-gray-400";
    }

    function getStatusIcon(status: string) {
        if (status.includes("Aprovado")) return <CheckCircle2 className="w-5 h-5" />;
        if (status.includes("Rejeitado")) return <XCircle className="w-5 h-5" />;
        if (status.includes("Publicado")) return <FileText className="w-5 h-5" />;
        return <Clock className="w-5 h-5" />;
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </AppLayout>
        );
    }

    if (!documento) {
        return (
            <AppLayout>
                <div className="p-6">
                    <p className="text-gray-600">Documento não encontrado.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col gap-6">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate("/documentos/materias")}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Histórico de Tramitação
                            </h1>
                            <p className="text-sm text-gray-500">
                                {documento.numeroOficial || `${documento.tiposdedocumento?.nome} (Sem numeração)`}
                            </p>
                        </div>
                    </div>
                    <Badge className={`${getStatusColor(documento.status)} text-white text-sm px-4 py-2`}>
                        {documento.status}
                    </Badge>
                </div>

                {/* Timeline de Tramitações */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Linha do Tempo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tramitacoes.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                Nenhuma tramitação registrada ainda.
                            </p>
                        ) : (
                            <div className="space-y-0">
                                {tramitacoes.map((tram, index) => (
                                    <div key={tram.id} className="flex gap-4 relative">
                                        {/* Linha vertical */}
                                        {index < tramitacoes.length - 1 && (
                                            <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                                        )}

                                        {/* Ícone */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getStatusColor(tram.status)} flex items-center justify-center text-white z-10`}>
                                            {getStatusIcon(tram.status)}
                                        </div>

                                        {/* Conteúdo */}
                                        <div className="flex-1 pb-8">
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <h3 className="font-semibold text-gray-800">{tram.status}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {new Date(tram.data_hora).toLocaleString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{tram.descricao}</p>
                                                {tram.usuario && (
                                                    <p className="text-xs text-gray-500">
                                                        Por: {tram.usuario.nome_completo}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
