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
import { pdf } from "@react-pdf/renderer";
import { uploadMateriaPDF } from "@/services/storageService";
import RelatorioVotacaoPDF, { VotoVereador } from "@/components/documentos/pdf/templates/RelatorioVotacaoPDF";
import AtaPDF from "@/components/documentos/pdf/templates/AtaPDF";
import PainelAta from "@/components/sessoes/PainelAta";
import { getDadosParaAta } from "@/services/ataService";
import { supabase } from "@/lib/supabaseClient";

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
    getPresidenteSessao,
    marcarComoLido,
    Presenca,
    ItemPauta,
    VotoIndividual,
    PresidenteSessao,
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
    const [presidenteSessao, setPresidenteSessao] = useState<PresidenteSessao | null>(null);
    const [periodoAtual, setPeriodoAtual] = useState<number | null>(null);

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

            // Permitir apenas sessões "Em Andamento" ou "Realizada" (para acessar a Ata)
            if (sessaoData.status !== "Em Andamento" && sessaoData.status !== "Realizada") {
                toast({
                    title: "Sessão indisponível",
                    description: "Só é possível visualizar sessões com status 'Em Andamento' ou 'Realizada'",
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
                setPeriodoAtual(periodo.id);
            }

            const presencasData = await getPresencas(parseInt(id));
            setPresencas(presencasData);

            const quorumData = await calcularQuorum(parseInt(id));
            setQuorum(quorumData);

            // Buscar presidente da sessão com base na precedência da Mesa Diretora
            if (periodo) {
                const presidente = await getPresidenteSessao(parseInt(id), periodo.id, presencasData);
                setPresidenteSessao(presidente);
            }
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

            // Atualizar dados da sessão para refletir o novo status
            const sessaoAtualizada = await getSessaoById(parseInt(id));
            if (sessaoAtualizada) {
                setSessao(sessaoAtualizada);
            }

            toast({
                title: "Sessão encerrada com sucesso!",
                description: "A aba 'Ata' está disponível para gerar o documento."
            });

            // Mudar automaticamente para a aba "Ata"
            setAbaAtiva("ata");
        } catch (error: any) {
            toast({ title: "Erro ao encerrar sessão", description: error.message, variant: "destructive" });
        }
    };

    // Marcar item como lido (para Ofícios, Indicações - sem votação)
    const handleMarcarLido = async (item: ItemPauta) => {
        if (!id || !item.documento) return;

        try {
            const documentoId = (item.documento as any).id;
            const tipoNome = (item.documento as any).tipo?.nome;
            const exigeParecer = (item.documento as any).tipo?.exige_parecer || false;
            const isParecer = tipoNome === "Parecer";

            await marcarComoLido(parseInt(id), documentoId, exigeParecer, isParecer);

            toast({
                title: "Item marcado como lido!",
                description: `${(item.documento as any).tipo?.nome || "Documento"} lido com sucesso. Status atualizado.`,
            });

            await fetchPauta();
        } catch (error: any) {
            toast({ title: "Erro ao marcar como lido", description: error.message, variant: "destructive" });
        }
    };

    // Gerar relatório de votação em PDF
    const handleGerarRelatorioVotacao = async (item: ItemPauta) => {
        if (!sessao || !item.documento) return;

        try {
            // Buscar votos do item
            const votosItem = await getVotos(sessao.id, item.documento_id);

            // Mapear votos para o formato do PDF
            const votosDetalhados: VotoVereador[] = votosItem.map(v => ({
                nome: v.vereador?.nome_parlamentar || v.vereador?.nome_completo || "Desconhecido",
                voto: v.voto === "Sim" ? "Favorável" : v.voto === "Não" ? "Contrário" : "Abstenção",
            }));

            // Calcular contagem
            const favoraveis = votosItem.filter(v => v.voto === "Sim").length;
            const contrarios = votosItem.filter(v => v.voto === "Não").length;
            const abstencoes = votosItem.filter(v => v.voto === "Abstenção").length;
            const resultado = favoraveis > contrarios ? "Aprovado" : "Rejeitado";

            // Usar presidente da sessão calculado pela precedência da Mesa Diretora
            const presidenteNome = presidenteSessao?.nome || "Presidente da Sessão";

            // Buscar autor do documento (mesma abordagem do pautaService)
            let autorNome = "Autor não informado";

            // Buscar documentoautores
            const { data: autorData } = await supabase
                .from("documentoautores")
                .select("autor_id")
                .eq("documento_id", item.documento_id)
                .maybeSingle();

            if (autorData?.autor_id) {
                // Buscar em agentespublicos
                const { data: agente } = await supabase
                    .from("agentespublicos")
                    .select("nome_completo")
                    .eq("id", autorData.autor_id)
                    .maybeSingle();

                if (agente?.nome_completo) {
                    autorNome = agente.nome_completo;
                } else {
                    // Tentar em comissoes
                    const { data: comissao } = await supabase
                        .from("comissoes")
                        .select("nome")
                        .eq("id", autorData.autor_id)
                        .maybeSingle();

                    if (comissao?.nome) {
                        autorNome = comissao.nome;
                    }
                }
            }

            // Buscar ementa do documento (tabelas específicas)
            let ementa = "Sem ementa";
            const { data: docCompleto } = await supabase
                .from("documentos")
                .select(`
                    projetosdelei(ementa),
                    requerimentos(justificativa),
                    mocoes(ementa),
                    indicacoes(ementa),
                    oficios(assunto)
                `)
                .eq("id", item.documento_id)
                .single();

            if (docCompleto) {
                const d = docCompleto as any;
                ementa = d.projetosdelei?.[0]?.ementa
                    || d.requerimentos?.[0]?.justificativa
                    || d.mocoes?.[0]?.ementa
                    || d.indicacoes?.[0]?.ementa
                    || d.oficios?.[0]?.assunto
                    || "Sem ementa";
            }

            // Gerar PDF Blob
            const blob = await pdf(
                <RelatorioVotacaoPDF
                    materia={{
                        tipo: item.documento.tipo?.nome || "Documento",
                        numero: String(item.documento.protocolos?.numero || 0).padStart(3, '0'),
                        ano: item.documento.ano,
                        ementa: ementa,
                        autor: autorNome,
                    }}
                    sessao={{
                        titulo: sessao.titulo,
                        data: sessao.data_abertura || new Date().toISOString(),
                    }}
                    resultado={resultado}
                    votos={{
                        favoraveis,
                        contrarios,
                        abstencoes,
                    }}
                    votosDetalhados={votosDetalhados}
                    presidenteNome={presidenteNome}
                />
            ).toBlob();

            // Definir nome/caminho único (Tipo + DocNum + SessaoID)
            const numeroDoc = item.documento.protocolos?.numero || "SemNumero";

            // Fazer upload para bucket 'relatorios-votacao'
            // Assinatura: pdfBlob, tipo, numero, ano, id
            const { url: pdfUrl } = await uploadMateriaPDF(
                blob,
                "RelatorioVotacao",
                `${numeroDoc}-Sessao${sessao.id}`, // Número composto para unicidade
                sessao.data_abertura ? new Date(sessao.data_abertura).getFullYear() : new Date().getFullYear(),
                item.documento_id
            );

            // Salvar URL na tabela sessaopauta
            const { error: updateError } = await supabase
                .from('sessaopauta')
                .update({ url_relatorio_votacao: pdfUrl } as any)
                .eq('id', item.id); // Usa o ID do ITEM DE PAUTA, não o documento

            if (updateError) {
                console.error("Erro ao salvar URL do relatório:", updateError);
            } else {
                toast({ title: "Relatório Salvo", description: "PDF salvo e vinculado ao item de pauta." });
            }

            // Abrir em nova aba (usando a URL pública salva)
            window.open(pdfUrl, '_blank');

        } catch (error: any) {
            console.error(error);
            toast({ title: "Erro ao gerar relatório", description: error.message, variant: "destructive" });
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
                        <Badge className={sessao.status === "Em Andamento" ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-green-100 text-green-700"}>
                            {sessao.status}
                        </Badge>
                    </div>
                    <p className="text-gray-600">
                        {sessao.data_abertura && format(parseISO(sessao.data_abertura), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        {" • "}
                        {sessao.hora_agendada?.slice(0, 5) || "16:00"}
                    </p>
                    {presidenteSessao && (
                        <p className="text-sm text-gov-blue-600 font-medium">
                            🪑 Presidindo: {presidenteSessao.nome}
                            {presidenteSessao.cargo !== "Presidente" && (
                                <span className="text-gray-500 font-normal"> ({presidenteSessao.cargo})</span>
                            )}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/atividade-legislativa/sessoes")}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setConfirmEncerrar(true)}
                        disabled={votacaoAtual !== null || sessao.status === "Realizada"}
                    >
                        <Square className="w-4 h-4 mr-2" />
                        {sessao.status === "Realizada" ? "Sessão Encerrada" : "Encerrar Sessão"}
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
                        <TabsList className="grid w-full grid-cols-4">
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
                            <TabsTrigger value="ata" className="gap-2" disabled={sessao.status !== "Realizada"}>
                                <FileText className="w-4 h-4" /> Ata
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
                                onMarcarLido={handleMarcarLido}
                                onGerarRelatorioVotacao={handleGerarRelatorioVotacao}
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

                        {/* Tab: Ata */}
                        <TabsContent value="ata">
                            {sessao.status === "Realizada" ? (
                                <PainelAta
                                    sessaoId={parseInt(id!)}
                                    presencas={presencas}
                                />
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Ata disponível após encerramento da sessão</p>
                                    <p className="text-sm">Encerre a sessão para gerar a ata</p>
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
