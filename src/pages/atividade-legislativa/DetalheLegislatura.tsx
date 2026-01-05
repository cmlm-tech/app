import { AppLayout } from "@/components/AppLayout";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PeriodoCard } from "@/components/legislaturas/PeriodoCard";
import { ModalGerenciarPeriodo } from "@/components/legislaturas/ModalGerenciarPeriodo";
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Database } from "@/lib/database.types";
import { useAuth } from '@/contexts/AuthContext';
import { CorpoLegislativo } from "@/components/legislaturas/CorpoLegislativo";
import { ModalAdicionarVereador } from "@/components/legislaturas/ModalAdicionarVereador";
import { ModalEditarLideranca } from "@/components/legislaturas/ModalEditarLideranca";
import { ModalConfirmarRemocaoVereador } from '@/components/legislaturas/ModalConfirmarRemocaoVereador';
import { ComposicaoAtual } from "@/components/legislaturas/ComposicaoAtual";
import { VereadorComCondicao, LegislaturaComPeriodos, PeriodoRow, AgentePublicoRow } from "@/components/legislaturas/types";
import ModalVisualizarMesa from "@/components/mesa-diretora/ModalVisualizarMesa";
import ModalMesaDiretora from "@/components/mesa-diretora/ModalMesaDiretora";
import ModalVisualizarComissoes from "@/components/comissoes/ModalVisualizarComissoes";
import ModalMembrosComissao from "@/components/comissoes/ModalMembrosComissao";
import ModalLicencaVereador from "@/components/legislaturas/ModalLicencaVereador";
import ModalEncerrarLicenca from "@/components/legislaturas/ModalEncerrarLicenca";
import { getMesaByPeriodo, updateMesaMembros } from "@/services/mesaDiretoraService";
import { getVereadores } from "@/services/vereadoresService";
import { getComissoesByPeriodo, updateMembrosComissao, Comissao } from "@/services/comissoesService";
import { createLicenca, encerrarLicenca, getTitularesDisponiveis, getSuplentesDisponiveis } from "@/services/licencasService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast as sonnerToast } from "sonner";

export default function DetalheLegislatura() {
    const { legislaturaNumero } = useParams<{ legislaturaNumero: string }>();
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [legislatura, setLegislatura] = useState<LegislaturaComPeriodos | null>(null);
    const [vereadores, setVereadores] = useState<VereadorComCondicao[]>([]);
    const [liderancasMap, setLiderancasMap] = useState<Record<number, 'governo' | 'oposicao'>>({});
    const [loading, setLoading] = useState(true);
    const [modalPeriodoOpen, setModalPeriodoOpen] = useState(false);
    const [modalVereadorOpen, setModalVereadorOpen] = useState(false);
    const [modalRemocaoOpen, setModalRemocaoOpen] = useState(false);
    const [vereadorSelecionado, setVereadorSelecionado] = useState<VereadorComCondicao | null>(null);
    const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoRow | null>(null);
    const [modalLiderancaOpen, setModalLiderancaOpen] = useState(false);
    const [vereadorParaLideranca, setVereadorParaLideranca] = useState<VereadorComCondicao | null>(null);
    const [permissaoLogado, setPermissaoLogado] = useState<string | null>(null);

    // Novos states para modals de Mesa e Comissões
    const [modalVisualizarMesaOpen, setModalVisualizarMesaOpen] = useState(false);
    const [modalEditarMesaOpen, setModalEditarMesaOpen] = useState(false);
    const [periodoMesaSelecionado, setPeriodoMesaSelecionado] = useState<number | null>(null);

    // States para modals de Comissões
    const [modalVisualizarComissoesOpen, setModalVisualizarComissoesOpen] = useState(false);
    const [modalEditarComissaoOpen, setModalEditarComissaoOpen] = useState(false);
    const [periodoComissoesSelecionado, setPeriodoComissoesSelecionado] = useState<number | null>(null);
    const [comissaoParaEditar, setComissaoParaEditar] = useState<Comissao | null>(null);

    // States para modal de Licença
    const [modalLicencaOpen, setModalLicencaOpen] = useState(false);
    const [modalEncerrarLicencaOpen, setModalEncerrarLicencaOpen] = useState(false);
    const [vereadorParaEncerrarLicenca, setVereadorParaEncerrarLicenca] = useState<VereadorComCondicao | null>(null);

    const isAdmin = permissaoLogado?.toLowerCase() === 'admin';

    // Buscar mesa do período selecionado
    const { data: mesaSelecionada, isLoading: loadingMesa } = useQuery({
        queryKey: ["mesa", periodoMesaSelecionado],
        queryFn: () => getMesaByPeriodo(periodoMesaSelecionado!),
        enabled: !!periodoMesaSelecionado && modalVisualizarMesaOpen,
        retry: false
    });

    // Buscar vereadores para o modal de edição
    const { data: vereadoresLista = [] } = useQuery({
        queryKey: ["vereadores"],
        queryFn: getVereadores,
        enabled: modalEditarMesaOpen
    });

    // Mutation para atualizar mesa
    const updateMesaMutation = useMutation({
        mutationFn: ({ periodoId, membros }: { periodoId: number, membros: { cargo: string; agente_publico_id: number }[] }) =>
            updateMesaMembros(periodoId, membros),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["mesa"] });
            sonnerToast.success("Mesa Diretora atualizada!");
            setModalEditarMesaOpen(false);
        },
        onError: (error: any) => {
            sonnerToast.error(error.message || "Erro ao atualizar Mesa Diretora");
        }
    });

    // Buscar comissões do período selecionado
    const { data: comissoesSelecionadas = [], isLoading: loadingComissoes } = useQuery({
        queryKey: ["comissoes", periodoComissoesSelecionado],
        queryFn: () => getComissoesByPeriodo(periodoComissoesSelecionado!),
        enabled: !!periodoComissoesSelecionado && modalVisualizarComissoesOpen,
        retry: false
    });

    // Mutation para atualizar membros de comissão
    const updateComissaoMutation = useMutation({
        mutationFn: ({ comissaoId, membros }: { comissaoId: number, membros: { cargo: any, agente_publico_id: number }[] }) =>
            updateMembrosComissao(comissaoId, membros),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comissoes"] });
            sonnerToast.success("Membros da comissão atualizados!");
            setModalEditarComissaoOpen(false);
            setComissaoParaEditar(null);
        },
        onError: (error: any) => {
            sonnerToast.error(error.message || "Erro ao atualizar comissão");
        }
    });

    // Buscar titulares e suplentes para modal de licença
    const { data: titularesDisponiveis = [] } = useQuery({
        queryKey: ["titulares-disponiveis", legislatura?.id],
        queryFn: () => getTitularesDisponiveis(legislatura!.id),
        enabled: !!legislatura?.id && modalLicencaOpen
    });

    const { data: suplentesDisponiveis = [] } = useQuery({
        queryKey: ["suplentes-disponiveis", legislatura?.id],
        queryFn: () => getSuplentesDisponiveis(legislatura!.id),
        enabled: !!legislatura?.id && modalLicencaOpen
    });

    // Mutation para criar licença
    const createLicencaMutation = useMutation({
        mutationFn: ({ titularId, suplenteId, dataInicio }: { titularId: number, suplenteId: number, dataInicio: string }) =>
            createLicenca(legislatura!.id, titularId, suplenteId, dataInicio),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vereadores"] });
            sonnerToast.success("Licença registrada com sucesso!");
            setModalLicencaOpen(false);
            // Recarregar dados da legislatura
            if (legislaturaNumero) {
                fetchData(parseInt(legislaturaNumero));
            }
        },
        onError: (error: any) => {
            sonnerToast.error(error.message || "Erro ao registrar licença");
        }
    });

    // Mutation para encerrar licença
    const encerrarLicencaMutation = useMutation({
        mutationFn: ({ licenciadoId, dataRetorno }: { licenciadoId: number, dataRetorno: string }) => {
            // Precisamos encontrar o suplente que está substituindo este titular
            const titular = vereadores.find(v => v.agente_publico_id === licenciadoId);
            if (!titular) throw new Error("Titular não encontrado");

            // Encontrar o suplente que está em exercício (tem data_posse e não tem data_afastamento)
            const suplenteSubstituto = vereadores.find(v =>
                v.condicao === 'Suplente' &&
                v.data_posse &&
                !v.data_afastamento
            );

            if (!suplenteSubstituto) throw new Error("Suplente substituto não encontrado");

            return encerrarLicenca(
                legislatura!.id,
                licenciadoId,
                suplenteSubstituto.agente_publico_id!,
                dataRetorno
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vereadores"] });
            sonnerToast.success("Licença encerrada com sucesso!");
            setModalEncerrarLicencaOpen(false);
            setVereadorParaEncerrarLicenca(null);
            if (legislaturaNumero) {
                fetchData(parseInt(legislaturaNumero));
            }
        },
        onError: (error: any) => {
            sonnerToast.error(error.message || "Erro ao encerrar licença");
        }
    });

    const fetchData = useCallback(async (numero: number) => {
        try {
            const { data: legData, error: legError } = await supabase.from('legislaturas').select('*').eq('numero', numero).single();
            if (legError) throw new Error(`Legislatura de ${numero} não encontrada.`);

            const legislaturaId = legData.id;

            const [periodosResult, verResult] = await Promise.all([
                supabase.from('periodossessao').select('*').eq('legislatura_id', legislaturaId),
                supabase.from('legislaturavereadores').select('id, condicao, partido, data_posse, data_afastamento, data_retorno, agentespublicos:agente_publico_id (*, vereadores:vereadores!inner(nome_parlamentar))').eq('legislatura_id', legislaturaId).order('nome_completo', { referencedTable: 'agentespublicos', ascending: true })
            ]);

            if (periodosResult.error) throw periodosResult.error;
            if (verResult.error) throw verResult.error;

            const dadosVereadores = verResult.data
                .filter((item: any) => item.agentespublicos) // Garante que temos dados do agente
                .map((item: any) => ({
                    ...(item.agentespublicos as AgentePublicoRow),
                    id: item.id,
                    agente_publico_id: item.agentespublicos.id,
                    condicao: item.condicao,
                    partido: item.partido,
                    data_posse: item.data_posse,
                    data_afastamento: item.data_afastamento,
                    data_retorno: item.data_retorno,
                    nome_parlamentar: item.agentespublicos?.vereadores?.nome_parlamentar || null,
                    vereadores: item.agentespublicos as AgentePublicoRow
                }));

            setLegislatura({ ...legData, periodos: periodosResult.data || [] });


            // Garante a ordenação no front-end após receber os dados.
            const vereadoresOrdenados = dadosVereadores.sort((a, b) => {
                const nomeA = a.nome_parlamentar || a.nome_completo || '';
                const nomeB = b.nome_parlamentar || b.nome_completo || '';
                return nomeA.localeCompare(nomeB);
            });
            setVereadores(vereadoresOrdenados);

            // Buscar lideranças da legislatura
            const { data: liderancasData } = await supabase
                .from('liderancaslegislativas' as any)
                .select('agente_publico_id, tipo')
                .eq('legislatura_id', legislaturaId)
                .is('data_fim', null);

            if (liderancasData) {
                const map: Record<number, 'governo' | 'oposicao'> = {};
                liderancasData.forEach((lideranca: any) => {
                    map[lideranca.agente_publico_id] = lideranca.tipo;
                });
                setLiderancasMap(map);
            }

        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
            setLegislatura(null);
        }
    }, [toast]);

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);

            if (user) {
                const { data: perfil } = await supabase
                    .from('usuarios')
                    .select('permissao')
                    .eq('id', user.id)
                    .single();
                setPermissaoLogado(perfil?.permissao || null);
            } else {
                setPermissaoLogado(null);
            }

            const numeroAsNumber = legislaturaNumero ? parseInt(legislaturaNumero, 10) : null;
            if (numeroAsNumber && !isNaN(numeroAsNumber)) {
                await fetchData(numeroAsNumber);
            }
            setLoading(false);
        };

        carregarDados();
    }, [legislaturaNumero, fetchData, user]);

    const handleGerenciarClick = (periodo: PeriodoRow) => {
        setPeriodoSelecionado(periodo);
        setModalPeriodoOpen(true);
    };

    const handleSavePeriodo = async (data: { presidenteId: string }) => {
        if (!periodoSelecionado || !legislatura) return;
        try {
            toast({
                title: "Funcionalidade não disponível",
                description: "A atribuição de presidente ao período requer atualização do banco de dados.",
                variant: "destructive"
            });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
        setModalPeriodoOpen(false);
    };

    const handleOpenModalRemocao = (vereador: AgentePublicoRow) => {
        setVereadorSelecionado(vereador as VereadorComCondicao);
        setModalRemocaoOpen(true);
    };

    const handleConfirmarRemocao = async () => {
        if (!vereadorSelecionado || !legislatura) return;

        try {
            const { error } = await supabase
                .from('legislaturavereadores')
                .delete()
                .eq('id', vereadorSelecionado.id);

            if (error) throw error;

            setVereadores(prev => prev.filter(v => v.id !== vereadorSelecionado.id));
            toast({ title: "Sucesso", description: `Vínculo de ${vereadorSelecionado.nome_completo} removido com sucesso.` });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }

        setModalRemocaoOpen(false);
        setVereadorSelecionado(null);
    };

    const handleEditVereador = (vereador: VereadorComCondicao) => {
        setVereadorParaLideranca(vereador);
        setModalLiderancaOpen(true);
    };

    // Handlers para Mesa Diretora
    const handleMesaDiretoraClick = (periodoId: number) => {
        setPeriodoMesaSelecionado(periodoId);
        setModalVisualizarMesaOpen(true);
    };

    const handleEditarMesaClick = () => {
        setModalVisualizarMesaOpen(false);
        setModalEditarMesaOpen(true);
    };

    const handleSaveMesa = (membros: { cargo: string; agente_publico_id: number }[]) => {
        if (periodoMesaSelecionado) {
            updateMesaMutation.mutate({ periodoId: periodoMesaSelecionado, membros });
        }
    };

    // Handlers para Comissões
    const handleComissoesClick = (periodoId: number) => {
        setPeriodoComissoesSelecionado(periodoId);
        setModalVisualizarComissoesOpen(true);
    };

    const handleEditarComissaoClick = (comissao: Comissao) => {
        setComissaoParaEditar(comissao);
        setModalEditarComissaoOpen(true);
    };

    const handleSaveComissao = (membros: { cargo: string, agente_publico_id: number }[]) => {
        if (comissaoParaEditar) {
            updateComissaoMutation.mutate({
                comissaoId: comissaoParaEditar.id,
                membros: membros as any
            });
        }
    };

    // Handler para Licença
    const handleSaveLicenca = (titularId: number, suplenteId: number, dataInicio: string) => {
        createLicencaMutation.mutate({ titularId, suplenteId, dataInicio });
    };

    // Handler para encerrar licença
    const handleEndLicenca = (vereador: VereadorComCondicao) => {
        setVereadorParaEncerrarLicenca(vereador);
        setModalEncerrarLicencaOpen(true);
    };

    const handleConfirmEndLicenca = (dataRetorno: string) => {
        if (!vereadorParaEncerrarLicenca) return;
        encerrarLicencaMutation.mutate({
            licenciadoId: vereadorParaEncerrarLicenca.agente_publico_id!,
            dataRetorno
        });
    };

    if (loading) return <AppLayout><div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
    if (!legislatura) return <AppLayout><div className="text-center py-10"><h1>Legislatura não encontrada</h1></div></AppLayout>;

    const anoInicio = new Date(legislatura.data_inicio).getFullYear();
    const anoFim = new Date(legislatura.data_fim).getFullYear();

    const now = new Date();
    // Ajuste seguro para obter YYYY-MM-DD local
    const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const emExercicio = vereadores.filter(v => {
        const dataAfastamento = v.data_afastamento;
        const dataPosse = v.data_posse;

        if (v.condicao === 'Titular') {
            // Titular está ok se não tem afastamento ou se o afastamento é futuro
            return !dataAfastamento || dataAfastamento > todayStr;
        }
        if (v.condicao === 'Suplente') {
            // Suplente precisa ter tomado posse (<= hoje) e não estar afastado (ou afastamento futuro)
            return dataPosse && dataPosse <= todayStr && (!dataAfastamento || dataAfastamento > todayStr);
        }
        return false;
    });

    const licenciados = vereadores.filter(v => {
        const dataAfastamento = v.data_afastamento;
        return v.condicao === 'Titular' && dataAfastamento && dataAfastamento <= todayStr;
    });

    return (
        <AppLayout>
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem><Link to="/atividade-legislativa/legislaturas">Legislaturas</Link></BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem><BreadcrumbPage>Legislatura {anoInicio} - {anoFim}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Legislatura {anoInicio} - {anoFim}</h1>
                <p className="text-gray-600">
                    {isAdmin
                        ? "Gerencie os períodos anuais e suas respectivas composições."
                        : "Consulte os detalhes de cada período legislativo anual."
                    }
                </p>
            </div>

            <CorpoLegislativo
                vereadores={vereadores}
                isAdmin={isAdmin}
                onAdicionarClick={() => setModalVereadorOpen(true)}
                onRemove={handleOpenModalRemocao}
                onEdit={handleEditVereador}
                liderancasMap={liderancasMap}
            />

            <ComposicaoAtual
                emExercicio={emExercicio}
                licenciados={licenciados}
                liderancasMap={liderancasMap}
                onLicencaClick={isAdmin ? () => setModalLicencaOpen(true) : undefined}
                onEndLicenca={isAdmin ? handleEndLicenca : undefined}
            />

            <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl font-semibold justify-start gap-2">Período Legislativo por Ano</AccordionTrigger>
                    <AccordionContent>
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mt-8">
                            {legislatura.periodos.map(periodo => {
                                const presidente = undefined;
                                return (
                                    <PeriodoCard
                                        key={periodo.id}
                                        periodo={periodo}
                                        presidente={presidente}
                                        onGerenciar={isAdmin ? () => handleGerenciarClick(periodo) : undefined}
                                        legislaturaNumero={legislatura.numero}
                                        onMesaDiretoraClick={() => handleMesaDiretoraClick(periodo.id)}
                                        onComissoesClick={() => handleComissoesClick(periodo.id)}
                                    />
                                );
                            })}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {isAdmin && (
                <>
                    <ModalGerenciarPeriodo
                        open={modalPeriodoOpen}
                        onOpenChange={setModalPeriodoOpen}
                        periodo={periodoSelecionado}
                        vereadores={vereadores}
                        onSave={handleSavePeriodo}
                    />
                    {legislatura && (
                        <>
                            <ModalAdicionarVereador
                                open={modalVereadorOpen}
                                onOpenChange={setModalVereadorOpen}
                                legislaturaId={legislatura.id}
                                vereadoresAtuais={vereadores}
                                onSuccess={() => fetchData(parseInt(legislaturaNumero!, 10))}
                            />
                            <ModalConfirmarRemocaoVereador
                                isOpen={modalRemocaoOpen}
                                onOpenChange={setModalRemocaoOpen}
                                onConfirm={handleConfirmarRemocao}
                                vereadorNome={vereadorSelecionado?.nome_completo || ''}
                            />
                            {vereadorParaLideranca && (
                                <ModalEditarLideranca
                                    open={modalLiderancaOpen}
                                    onOpenChange={(open) => {
                                        setModalLiderancaOpen(open);
                                        if (!open) setVereadorParaLideranca(null);
                                    }}
                                    legislaturaId={legislatura.id}
                                    vereador={vereadorParaLideranca}
                                    liderancaAtual={liderancasMap[vereadorParaLideranca.agente_publico_id] || null}
                                    onSuccess={() => fetchData(parseInt(legislaturaNumero!, 10))}
                                />
                            )}
                        </>
                    )}
                </>
            )}

            {/* Modals de Mesa Diretora */}
            <ModalVisualizarMesa
                open={modalVisualizarMesaOpen}
                onOpenChange={setModalVisualizarMesaOpen}
                membros={mesaSelecionada?.membros || []}
                isLoading={loadingMesa}
                onEditClick={handleEditarMesaClick}
                isAdmin={isAdmin}
            />

            <ModalMesaDiretora
                open={modalEditarMesaOpen}
                onOpenChange={setModalEditarMesaOpen}
                membrosAtuais={mesaSelecionada?.membros || []}
                vereadores={vereadoresLista.map(v => ({
                    id: v.id,
                    nome: v.nome_parlamentar || v.nome_completo,
                    foto: v.foto_url
                }))}
                onSave={handleSaveMesa}
            />

            {/* Modals de Comissões */}
            <ModalVisualizarComissoes
                open={modalVisualizarComissoesOpen}
                onOpenChange={setModalVisualizarComissoesOpen}
                comissoes={comissoesSelecionadas}
                isLoading={loadingComissoes}
                onEditClick={handleEditarComissaoClick}
                isAdmin={isAdmin}
            />

            <ModalMembrosComissao
                open={modalEditarComissaoOpen}
                onOpenChange={setModalEditarComissaoOpen}
                comissao={comissaoParaEditar!}
                vereadores={vereadoresLista}
                onSave={handleSaveComissao}
            />

            <ModalLicencaVereador
                open={modalLicencaOpen}
                onOpenChange={setModalLicencaOpen}
                titulares={titularesDisponiveis as any}
                suplentes={suplentesDisponiveis as any}
                onSave={handleSaveLicenca}
            />

            <ModalEncerrarLicenca
                open={modalEncerrarLicencaOpen}
                onOpenChange={setModalEncerrarLicencaOpen}
                vereadorNome={vereadorParaEncerrarLicenca?.nome_parlamentar || vereadorParaEncerrarLicenca?.nome_completo || ''}
                onConfirm={handleConfirmEndLicenca}
            />
        </AppLayout>
    );
}