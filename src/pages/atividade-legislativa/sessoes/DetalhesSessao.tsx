import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Radio,
    PauseCircle,
    Users,
    FileText,
    BarChart3,
    Download
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { StatusSessao } from "@/services/sessoesService";

const STATUS_CONFIG = {
    "Agendada": {
        color: "bg-blue-50 border-blue-200",
        textColor: "text-blue-800",
        icon: Calendar,
        label: "Aguardando Início",
        badgeColor: "bg-blue-100 text-blue-800"
    },
    "Em Andamento": {
        color: "bg-green-50 border-green-200",
        textColor: "text-green-800",
        icon: Radio,
        label: "Ao Vivo",
        badgeColor: "bg-green-100 text-green-800 animate-pulse"
    },
    "Realizada": {
        color: "bg-emerald-50 border-emerald-300",
        textColor: "text-emerald-800",
        icon: CheckCircle2,
        label: "Concluída",
        badgeColor: "bg-emerald-100 text-emerald-800"
    },
    "Não Realizada": {
        color: "bg-orange-50 border-orange-300",
        textColor: "text-orange-800",
        icon: AlertCircle,
        label: "Não Realizada",
        badgeColor: "bg-orange-100 text-orange-800"
    },
    "Suspensa": {
        color: "bg-purple-50 border-purple-200",
        textColor: "text-purple-800",
        icon: PauseCircle,
        label: "Suspensa",
        badgeColor: "bg-purple-100 text-purple-800"
    },
    "Adiada": {
        color: "bg-amber-50 border-amber-200",
        textColor: "text-amber-800",
        icon: Clock,
        label: "Adiada",
        badgeColor: "bg-amber-100 text-amber-800"
    }
} as const;

export default function DetalhesSessao() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [sessao, setSessao] = useState<any>(null);

    useEffect(() => {
        carregarDetalhes();
    }, [id]);

    async function carregarDetalhes() {
        if (!id) {
            console.error("[DetalhesSessao] ❌ ID não fornecido na URL");
            toast({
                title: "Erro",
                description: "ID da sessão não fornecido na URL",
                variant: "destructive"
            });
            return;
        }

        console.log("[DetalhesSessao] 🔍 Carregando sessão com ID:", id);

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("sessoes")
                .select(`
          *,
          periodo:periodossessao(numero),
          presencas:sessaopresenca(
            id,
            status,
            agente_publico:agentespublicos(nome_completo)
          ),
          pauta:sessaopauta(
            id,
            ordem,
            tipo_item,
            documento:documentos(
              ano,
              protocolo:protocolos!documentos_protocolo_id_fkey(numero),
              tiposdedocumento(nome)
            )
          ),
          ata:atas(
            id,
            resumo_pauta,
            documento:documentos(id)
          )
        `)
                .eq("id", parseInt(id))
                .single();

            console.log("[DetalhesSessao] 📦 Resultado da consulta:", { data, error });

            if (error) {
                console.error("[DetalhesSessao] ❌ Erro na query Supabase:", error);
                toast({
                    title: "Erro ao carregar sessão",
                    description: error.message,
                    variant: "destructive"
                });
                setSessao(null);
                return;
            }

            if (!data) {
                console.warn("[DetalhesSessao] ⚠️ Nenhum dado retornado para ID:", id);
                toast({
                    title: "Sessão não encontrada",
                    description: `Nenhuma sessão encontrada com ID ${id}`,
                    variant: "destructive"
                });
                setSessao(null);
                return;
            }

            console.log("[DetalhesSessao] ✅ Sessão carregada com sucesso");
            setSessao(data);
        } catch (error: any) {
            console.error("[DetalhesSessao] ❌ Erro inesperado ao carregar sessão:", error);
            toast({
                title: "Erro inesperado",
                description: error?.message || "Falha ao carregar detalhes da sessão",
                variant: "destructive"
            });
            setSessao(null);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-blue-700"></div>
                </div>
            </AppLayout>
        );
    }

    if (!sessao) {
        return (
            <AppLayout>
                <div className="text-center py-12">
                    <p className="text-gray-500">Sessão não encontrada.</p>
                    <Button onClick={() => navigate("/atividade-legislativa/sessoes")} className="mt-4">
                        Voltar
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const status = sessao.status as StatusSessao;
    const config = STATUS_CONFIG[status] || STATUS_CONFIG["Agendada"];
    const StatusIcon = config.icon;

    const dataFormatada = sessao.data_abertura
        ? format(parseISO(sessao.data_abertura), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        : "Data não informada";

    const horaFormatada = sessao.hora_agendada?.slice(0, 5) || "16:00";

    return (
        <AppLayout>
            <div className="container mx-auto py-6 px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/atividade-legislativa/sessoes")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-800">
                                {sessao.numero ? `${sessao.numero}ª ` : ""}Sessão {sessao.tipo_sessao}
                            </h1>
                            <Badge className={config.badgeColor}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {config.label}
                            </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            {dataFormatada} às {horaFormatada}
                        </p>
                    </div>
                </div>

                {/* Status Card - Adaptativo */}
                <Card className={`border-2 ${config.color} mb-6`}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${config.badgeColor}`}>
                                <StatusIcon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                {status === "Não Realizada" && (
                                    <>
                                        <h3 className={`text-xl font-semibold ${config.textColor} mb-2`}>
                                            Esta sessão não foi realizada
                                        </h3>
                                        {sessao.motivo && (
                                            <div className="bg-white border border-orange-200 rounded-lg p-4 mt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-1">💡 Motivo:</p>
                                                <p className="text-gray-800">{sessao.motivo}</p>
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-600 mt-3">
                                            Esta sessão foi marcada como não realizada e não conta na sequência numérica oficial.
                                        </p>
                                    </>
                                )}

                                {status === "Adiada" && (
                                    <>
                                        <h3 className={`text-xl font-semibold ${config.textColor} mb-2`}>
                                            Esta sessão foi adiada
                                        </h3>
                                        {sessao.motivo && (
                                            <div className="bg-white border border-amber-200 rounded-lg p-4 mt-3">
                                                <p className="text-sm font-medium text-gray-700 mb-1">📌 Motivo:</p>
                                                <p className="text-gray-800">{sessao.motivo}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {status === "Agendada" && (
                                    <>
                                        <h3 className={`text-xl font-semibold ${config.textColor} mb-2`}>
                                            Sessão agendada
                                        </h3>
                                        <p className="text-gray-600">
                                            Esta sessão ainda não foi iniciada. Aguardando {dataFormatada} às {horaFormatada}.
                                        </p>
                                    </>
                                )}

                                {status === "Em Andamento" && (
                                    <>
                                        <h3 className={`text-xl font-semibold ${config.textColor} mb-2 flex items-center gap-2`}>
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                            Sessão em andamento
                                        </h3>
                                        <p className="text-gray-600">
                                            A sessão está acontecendo neste momento.
                                        </p>
                                    </>
                                )}

                                {status === "Realizada" && (
                                    <>
                                        <h3 className={`text-xl font-semibold ${config.textColor} mb-2`}>
                                            Sessão realizada com sucesso
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            <div className="bg-white rounded-lg p-3 border border-emerald-200">
                                                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                                                    <Users className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Presentes</span>
                                                </div>
                                                <p className="text-2xl font-bold text-emerald-800">
                                                    {sessao.presencas?.filter((p: any) => p.status === "Presente").length || 0}
                                                </p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-emerald-200">
                                                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                                                    <FileText className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Itens Pauta</span>
                                                </div>
                                                <p className="text-2xl font-bold text-emerald-800">
                                                    {sessao.pauta?.length || 0}
                                                </p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 border border-emerald-200">
                                                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                                                    <BarChart3 className="w-4 h-4" />
                                                    <span className="text-sm font-medium">Itens Deliberados</span>
                                                </div>
                                                <p className="text-2xl font-bold text-emerald-800">
                                                    {sessao.pauta?.length || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ordem do Dia - Apenas se Realizada */}
                {status === "Realizada" && sessao.pauta && sessao.pauta.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Ordem do Dia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {sessao.pauta
                                    .sort((a: any, b: any) => a.ordem - b.ordem)
                                    .map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gov-blue-100 text-gov-blue-700 flex items-center justify-center font-semibold text-sm">
                                                {item.ordem}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">
                                                    {item.documento?.tiposdedocumento?.nome} {item.documento?.protocolo?.numero}/{item.documento?.ano}
                                                </p>
                                                <p className="text-sm text-gray-600">{item.tipo_item}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Documentos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Documentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {sessao.ata?.[0] && (
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link to={`/documentos/atas/${sessao.ata[0].documento?.id}`}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ver Ata Oficial
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link to={`/atividade-legislativa/sessoes/${sessao.id}/pauta`}>
                                <FileText className="w-4 h-4 mr-2" />
                                Ver Pauta Completa
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
