import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
    ArrowLeft,
    Users,
    FileText,
    Vote,
    Square,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";

import { getSessaoById, encerrarSessao, Sessao } from "@/services/sessoesService";
import {
    getPresencas,
    inicializarPresencas,
    atualizarPresenca,
    calcularQuorum,
    getItensPauta,
    iniciarVotacao,
    getVotos,
    registrarVoto,
    encerrarVotacao,
    Presenca,
    ItemPauta,
    VotoIndividual,
} from "@/services/sessaoConduzirService";
import { getCurrentPeriodo } from "@/services/legislaturaService";

import PainelPresencas from "@/components/sessoes/conduzir/PainelPresencas";
import PainelPauta from "@/components/sessoes/conduzir/PainelPauta";
import PainelVotacao from "@/components/sessoes/conduzir/PainelVotacao";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConduzirSessao() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [sessao, setSessao] = useState<Sessao | null>(null);
    const [presencas, setPresencas] = useState<Presenca[]>([]);
    const [itensPauta, setItensPauta] = useState<ItemPauta[]>([]);
    const [quorum, setQuorum] = useState<{
        totalVereadores: number;
        presentes: number;
        quorumMinimo: number;
        temQuorum: boolean;
    } | null>(null);

    const [votacaoAtual, setVotacaoAtual] = useState<ItemPauta | null>(null);
    const [votos, setVotos] = useState<VotoIndividual[]>([]);

    const [confirmEncerrar, setConfirmEncerrar] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState("presencas");

    // Carregar dados da sessão
    const fetchSessao = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const sessaoData = await getSessaoById(parseInt(id));

            if (!sessaoData) {
                toast({ title: "Sessão não encontrada", variant: "destructive" });
                navigate("/atividade-legislativa/sessoes");
                return;
            }

            if (sessaoData.status !== "Em Andamento") {
                toast({
                    title: "Sessão não está em andamento",
                    description: "Só é possível conduzir sessões com status 'Em Andamento'",
                    variant: "destructive"
                });
                navigate("/atividade-legislativa/sessoes");
                return;
            }

            setSessao(sessaoData);
        } catch (error: any) {
            toast({ title: "Erro ao carregar sessão", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [id, navigate, toast]);

    // Carregar presenças
    const fetchPresencas = useCallback(async () => {
        if (!id || !sessao) return;

        try {
            // Inicializar presenças se necessário
            const periodo = await getCurrentPeriodo();
            if (periodo) {
                await inicializarPresencas(parseInt(id), periodo.id);
            }

            const presencasData = await getPresencas(parseInt(id));
            setPresencas(presencasData);

            const quorumData = await calcularQuorum(parseInt(id));
            setQuorum(quorumData);
        } catch (error: any) {
            toast({ title: "Erro ao carregar presenças", description: error.message, variant: "destructive" });
        }
    }, [id, sessao, toast]);

    // Carregar pauta
    const fetchPauta = useCallback(async () => {
        if (!id) return;

        try {
            const pautaData = await getItensPauta(parseInt(id));
            setItensPauta(pautaData);

            // Verificar se há votação em andamento
            const emVotacao = pautaData.find((item) => item.status_item === "Em Votação");
            if (emVotacao) {
                setVotacaoAtual(emVotacao);
                setAbaAtiva("votacao");
                await fetchVotos(emVotacao.documento_id);
            }
        } catch (error: any) {
            toast({ title: "Erro ao carregar pauta", description: error.message, variant: "destructive" });
        }
    }, [id, toast]);

    // Carregar votos
    const fetchVotos = async (documentoId: number) => {
        if (!id) return;

        try {
            const votosData = await getVotos(parseInt(id), documentoId);
            setVotos(votosData);
        } catch (error: any) {
            toast({ title: "Erro ao carregar votos", description: error.message, variant: "destructive" });
        }
    };

    useEffect(() => {
        fetchSessao();
    }, [fetchSessao]);

    useEffect(() => {
        if (sessao) {
            fetchPresencas();
            fetchPauta();
        }
    }, [sessao, fetchPresencas, fetchPauta]);

    // Handlers
    const handleAtualizarPresenca = async (agentePublicoId: number, status: "Presente" | "Ausente" | "Ausente com Justificativa", justificativa?: string) => {
        if (!id) return;

        try {
            await atualizarPresenca(parseInt(id), agentePublicoId, status, justificativa);
            await fetchPresencas();
            toast({ title: "Presença atualizada" });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };

    const handleIniciarVotacao = async (item: ItemPauta) => {
        if (!id || !quorum?.temQuorum) {
            toast({
                title: "Sem quorum",
                description: "Não há quorum suficiente para iniciar a votação",
                variant: "destructive"
            });
            return;
        }

        try {
            await iniciarVotacao(parseInt(id), item.id);
            setVotacaoAtual(item);
            await fetchVotos(item.documento_id);
            await fetchPauta();
            setAbaAtiva("votacao");
            toast({ title: "Votação iniciada" });
        } catch (error: any) {
            toast({ title: "Erro ao iniciar votação", description: error.message, variant: "destructive" });
        }
    };

    const handleRegistrarVoto = async (agentePublicoId: number, voto: "Sim" | "Não" | "Abstenção") => {
        if (!id || !votacaoAtual) return;

        try {
            await registrarVoto(parseInt(id), votacaoAtual.documento_id, agentePublicoId, voto);
            await fetchVotos(votacaoAtual.documento_id);
        } catch (error: any) {
            toast({ title: "Erro ao registrar voto", description: error.message, variant: "destructive" });
        }
    };

    const handleEncerrarVotacao = async () => {
        if (!id || !votacaoAtual) return;

        try {
            // TODO: Identificar o presidente da mesa para voto de minerva
            const resultado = await encerrarVotacao(parseInt(id), votacaoAtual.id);

            toast({
                title: `Votação encerrada: ${resultado.resultado}`,
                description: `${resultado.votos_sim} SIM, ${resultado.votos_nao} NÃO, ${resultado.abstencoes} ABSTENÇÕES`
            });

            setVotacaoAtual(null);
            setVotos([]);
            await fetchPauta();
            setAbaAtiva("pauta");
        } catch (error: any) {
            toast({ title: "Erro ao encerrar votação", description: error.message, variant: "destructive" });
        }
    };

    const handleEncerrarSessao = async () => {
        if (!id) return;

        try {
            await encerrarSessao(parseInt(id));
            toast({ title: "Sessão encerrada com sucesso!" });
            navigate("/atividade-legislativa/sessoes");
        } catch (error: any) {
            toast({ title: "Erro ao encerrar sessão", description: error.message, variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-gov-blue-700" />
                    <span className="ml-3">Carregando sessão...</span>
                </div>
            </AppLayout>
        );
    }

    if (!sessao) {
        return null;
    }

    return (
        <AppLayout>
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/atividade-legislativa/sessoes">Sessões</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Conduzir Sessão</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gov-blue-800">
                            {sessao.numero ? `${sessao.numero}ª ` : ""}Sessão {sessao.tipo_sessao}
                        </h1>
                        <Badge className="bg-amber-100 text-amber-700 animate-pulse">
                            Em Andamento
                        </Badge>
                    </div>
                    <p className="text-gray-600">
                        {sessao.data_abertura && format(parseISO(sessao.data_abertura), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {" • "}
                        {sessao.hora_agendada?.slice(0, 5) || "16:00"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/atividade-legislativa/sessoes")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setConfirmEncerrar(true)}
                        disabled={votacaoAtual !== null}
                    >
                        <Square className="w-4 h-4 mr-2" /> Encerrar Sessão
                    </Button>
                </div>
            </div>

            {/* Quorum Info */}
            {quorum && (
                <Card className={`mb-6 ${quorum.temQuorum ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                    <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {quorum.temQuorum ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span className="font-medium">
                                    Quorum: {quorum.presentes}/{quorum.totalVereadores} presentes
                                </span>
                                <span className="text-sm text-gray-600">
                                    (mínimo: {quorum.quorumMinimo} - maioria absoluta)
                                </span>
                            </div>
                            <Badge variant={quorum.temQuorum ? "default" : "destructive"}>
                                {quorum.temQuorum ? "Quorum OK" : "Sem Quorum"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <Card>
                <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
                    <CardHeader className="pb-0">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="presencas" className="gap-2">
                                <Users className="w-4 h-4" /> Presenças
                            </TabsTrigger>
                            <TabsTrigger value="pauta" className="gap-2">
                                <FileText className="w-4 h-4" /> Pauta
                            </TabsTrigger>
                            <TabsTrigger value="votacao" className="gap-2" disabled={!votacaoAtual}>
                                <Vote className="w-4 h-4" />
                                Votação
                                {votacaoAtual && <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">Ativa</Badge>}
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <TabsContent value="presencas" className="mt-0">
                            <PainelPresencas
                                presencas={presencas}
                                onAtualizarPresenca={handleAtualizarPresenca}
                            />
                        </TabsContent>

                        <TabsContent value="pauta" className="mt-0">
                            <PainelPauta
                                itens={itensPauta}
                                onIniciarVotacao={handleIniciarVotacao}
                                votacaoEmAndamento={votacaoAtual !== null}
                                temQuorum={quorum?.temQuorum || false}
                            />
                        </TabsContent>

                        <TabsContent value="votacao" className="mt-0">
                            {votacaoAtual ? (
                                <PainelVotacao
                                    item={votacaoAtual}
                                    votos={votos}
                                    presencas={presencas}
                                    onRegistrarVoto={handleRegistrarVoto}
                                    onEncerrarVotacao={handleEncerrarVotacao}
                                />
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Vote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Nenhuma votação em andamento</p>
                                    <p className="text-sm">Selecione um item da pauta para iniciar a votação</p>
                                </div>
                            )}
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>

            {/* Dialog Encerrar Sessão */}
            <AlertDialog open={confirmEncerrar} onOpenChange={setConfirmEncerrar}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Encerrar Sessão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja encerrar esta sessão? Esta ação finalizará oficialmente a sessão legislativa.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleEncerrarSessao}>
                            Encerrar Sessão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
