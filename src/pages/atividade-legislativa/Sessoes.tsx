import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  Plus as PlusIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  X as XIcon,
  Play as PlayIcon,
  Square as StopIcon,
  Pause as PauseIcon,
  RotateCcw as ResumeIcon,
  Clock as ClockIcon,
  RefreshCw as RefreshIcon,
  FileText as FileTextIcon
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import ModalSessao from "@/components/sessoes/ModalSessao";
import ModalCancelarSessao from "@/components/sessoes/ModalCancelarSessao";
import SessaoPopover from "@/components/sessoes/SessaoPopover";
import TagStatusSessao from "@/components/sessoes/TagStatusSessao";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isSameDay, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CardSessao } from "@/components/sessoes/CardSessao";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPeriodo } from "@/services/legislaturaService";
import {
  Sessao,
  TipoSessao,
  StatusSessao,
  getSessoes,
  criarSessao,
  atualizarSessao,
  marcarNaoRealizada,
  iniciarSessao,
  encerrarSessao,
  suspenderSessao,
  retomarSessao,
  adiarSessao,
  gerarSessoesDoMes
} from "@/services/sessoesService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

// Mantém compatibilidade com o tipo anterior enquanto migramos
export type { Sessao, TipoSessao as SessaoTipo, StatusSessao as SessaoStatus };

export default function SessoesLeg() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [visualizacao, setVisualizacao] = useState<"calendario" | "lista">("calendario");
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoAtual, setPeriodoAtual] = useState<any>(null);

  // Modal states
  const [modal, setModal] = useState<{ aberta: boolean, edicao?: Sessao | null }>({ aberta: false, edicao: null });
  const [modalNaoRealizada, setModalNaoRealizada] = useState<{ aberta: boolean, sessao?: Sessao }>({ aberta: false, sessao: undefined });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({ open: false, title: "", description: "", action: async () => { } });

  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);

  // Fetch sessions and current period
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Get current period
      const periodo = await getCurrentPeriodo();
      setPeriodoAtual(periodo);

      if (periodo) {
        // Get sessions for current period
        const data = await getSessoes({ periodoId: periodo.id });
        setSessoes(data);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar sessões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle save session (create or update)
  const handleSalvarSessao = async (sessaoData: any, isEdit: boolean) => {
    try {
      if (isEdit && sessaoData.id) {
        await atualizarSessao(sessaoData.id, {
          tipoSessao: sessaoData.tipo,
          dataAbertura: sessaoData.data,
          horaAgendada: sessaoData.hora,
          local: sessaoData.local,
          observacoes: sessaoData.observacoes,
        });
        toast({ title: "Sessão atualizada com sucesso!" });
      } else {
        if (!periodoAtual) {
          toast({
            title: "Erro",
            description: "Nenhum período ativo encontrado",
            variant: "destructive"
          });
          return;
        }
        await criarSessao({
          periodoId: periodoAtual.id,
          tipoSessao: sessaoData.tipo,
          dataAbertura: sessaoData.data,
          horaAgendada: sessaoData.hora,
          local: sessaoData.local,
          observacoes: sessaoData.observacoes,
        });
        toast({ title: "Sessão agendada com sucesso!" });
      }

      setModal({ aberta: false, edicao: null });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar sessão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle marcar sessão como não realizada
  const handleMarcarNaoRealizada = async (sessaoId: number, motivo: string) => {
    try {
      await marcarNaoRealizada(sessaoId, motivo);
      toast({ title: "Sessão marcada como não realizada" });
      setModalNaoRealizada({ aberta: false, sessao: undefined });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro ao marcar sessão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Status transition handlers
  const handleIniciarSessao = async (sessao: Sessao) => {
    // Verificar se a pauta está montada
    try {
      const { count, error } = await supabase
        .from("sessaopauta")
        .select("*", { count: "exact", head: true })
        .eq("sessao_id", sessao.id);

      if (error) throw error;

      if (!count || count === 0) {
        toast({
          title: "Pauta não montada",
          description: "Para iniciar a sessão, é necessário montar a pauta primeiro. Clique em 'Montar Pauta' para adicionar itens.",
          variant: "destructive",
        });
        return;
      }

      // Pauta OK, prosseguir com confirmação
      setConfirmDialog({
        open: true,
        title: "Iniciar Sessão",
        description: `Deseja iniciar a sessão "${sessao.titulo}"? Isso marcará o início oficial da sessão.`,
        action: async () => {
          try {
            await iniciarSessao(sessao.id);
            toast({ title: "Sessão iniciada!" });
            fetchData();
          } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
          }
        },
      });
    } catch (error: any) {
      toast({
        title: "Erro ao verificar pauta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEncerrarSessao = async (sessao: Sessao) => {
    setConfirmDialog({
      open: true,
      title: "Encerrar Sessão",
      description: `Deseja encerrar a sessão "${sessao.titulo}"? Isso finalizará oficialmente a sessão.`,
      action: async () => {
        try {
          await encerrarSessao(sessao.id);
          toast({ title: "Sessão encerrada!" });
          fetchData();
        } catch (error: any) {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
      },
    });
  };

  const handleSuspenderSessao = async (sessao: Sessao) => {
    setConfirmDialog({
      open: true,
      title: "Suspender Sessão",
      description: `Deseja suspender a sessão "${sessao.titulo}"?`,
      action: async () => {
        try {
          await suspenderSessao(sessao.id);
          toast({ title: "Sessão suspensa" });
          fetchData();
        } catch (error: any) {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
      },
    });
  };

  const handleRetomarSessao = async (sessao: Sessao) => {
    setConfirmDialog({
      open: true,
      title: "Retomar Sessão",
      description: `Deseja retomar a sessão "${sessao.titulo}"?`,
      action: async () => {
        try {
          await retomarSessao(sessao.id);
          toast({ title: "Sessão retomada!" });
          fetchData();
        } catch (error: any) {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
      },
    });
  };

  // Auto-generate sessions for current month
  const handleGerarSessoesMes = async () => {
    if (!periodoAtual) {
      toast({ title: "Erro", description: "Nenhum período ativo", variant: "destructive" });
      return;
    }

    try {
      const hoje = new Date();
      const geradas = await gerarSessoesDoMes(periodoAtual.id, hoje.getFullYear(), hoje.getMonth());

      if (geradas.length === 0) {
        toast({
          title: "Nenhuma sessão gerada",
          description: "Todas as terças-feiras do mês já possuem sessão agendada ou é mês de recesso."
        });
      } else {
        toast({
          title: `${geradas.length} sessão(ões) gerada(s)!`,
          description: "Sessões ordinárias criadas para todas as terças-feiras do mês."
        });
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao gerar sessões",
        description: error.message,
        variant: "destructive",
      });
    }
  };



  // Utility functions
  function sessoesNoDia(day: Date) {
    return sessoes.filter(s => {
      const dataSessao = s.data_abertura ? parseISO(s.data_abertura) : null;
      return dataSessao && isSameDay(dataSessao, day);
    });
  }

  function corTipo(tipo: TipoSessao | null) {
    switch (tipo) {
      case "Ordinária": return "bg-gov-blue-100 text-gov-blue-700";
      case "Extraordinária": return "bg-orange-100 text-orange-700";
      case "Solene": return "bg-yellow-100 text-yellow-700";
      default: return "";
    }
  }

  // Render action buttons based on status
  const renderAcoes = (sessao: Sessao) => {
    const status = sessao.status as StatusSessao;

    return (
      <TooltipProvider>
        <div className="flex gap-1">
          {/* Visualizar - sempre disponível */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate(`/atividade-legislativa/sessoes/${sessao.id}`)}
              >
                <EyeIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Visualizar Detalhes</TooltipContent>
          </Tooltip>

          {/* Ações para sessão Agendada */}
          {status === "Agendada" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => window.location.href = `/atividade-legislativa/sessoes/${sessao.id}/pauta`}>
                    <FileTextIcon className="w-4 h-4 text-blue-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Montar Pauta</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => handleIniciarSessao(sessao)}>
                    <PlayIcon className="w-4 h-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Iniciar Sessão</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => setModal({ aberta: true, edicao: sessao })}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => setModalNaoRealizada({ aberta: true, sessao })}>
                    <XIcon className="w-4 h-4 text-orange-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Marcar como Não Realizada</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Ações para sessão Em Andamento */}
          {status === "Em Andamento" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => window.location.href = `/atividade-legislativa/sessoes/${sessao.id}/conduzir`}
                  >
                    Conduzir
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Abrir painel de condução da sessão</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => handleSuspenderSessao(sessao)}>
                    <PauseIcon className="w-4 h-4 text-purple-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Suspender</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => handleEncerrarSessao(sessao)}>
                    <StopIcon className="w-4 h-4 text-emerald-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Encerrar</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Ações para sessão Suspensa */}
          {status === "Suspensa" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => handleRetomarSessao(sessao)}>
                    <ResumeIcon className="w-4 h-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Retomar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => setModalNaoRealizada({ aberta: true, sessao })}>
                    <XIcon className="w-4 h-4 text-orange-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Marcar como Não Realizada</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Ações para sessão Adiada */}
          {status === "Adiada" && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => setModal({ aberta: true, edicao: sessao })}>
                    <ClockIcon className="w-4 h-4 text-orange-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reagendar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => setModalNaoRealizada({ aberta: true, sessao })}>
                    <XIcon className="w-4 h-4 text-orange-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Marcar como Não Realizada</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>
    );
  };

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold text-gov-blue-800">Sessões Legislativas</h1>
        <p className="text-gray-600 text-lg">Agende, consulte e gerencie as sessões plenárias da Câmara.</p>
        {periodoAtual && (
          <p className="text-sm text-gray-500 mt-1">
            Período atual: {periodoAtual.numero}º Período
            ({format(parseISO(periodoAtual.data_inicio), "dd/MM/yyyy")} a {format(parseISO(periodoAtual.data_fim), "dd/MM/yyyy")})
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 mb-6 gap-2">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setModal({ aberta: true, edicao: null })}
            className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold gap-2"
          >
            <PlusIcon className="w-5 h-5" /> Agendar Nova Sessão
          </Button>
          <Button
            onClick={handleGerarSessoesMes}
            variant="outline"
            className="gap-2"
          >
            <RefreshIcon className="w-5 h-5" /> Gerar Sessões do Mês
          </Button>

        </div>
        <div className="flex gap-2 ml-auto mt-2 md:mt-0">
          <Button
            variant={visualizacao === "calendario" ? "default" : "outline"}
            className={visualizacao === "calendario" ? "bg-gov-blue-700 text-white" : ""}
            onClick={() => setVisualizacao("calendario")}
          >
            <CalendarIcon className="w-5 h-5 mr-1" /> Calendário
          </Button>
          <Button
            variant={visualizacao === "lista" ? "default" : "outline"}
            className={visualizacao === "lista" ? "bg-gov-blue-700 text-white" : ""}
            onClick={() => setVisualizacao("lista")}
          >
            <ListIcon className="w-5 h-5 mr-1" /> Lista
          </Button>
        </div>
      </div>

      <div className="bg-white rounded shadow px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gov-blue-700"></div>
            <span className="ml-3 text-gray-600">Carregando sessões...</span>
          </div>
        ) : (
          <>
            {visualizacao === "calendario" && (
              <Calendar
                mode="single"
                selected={dataSelecionada}
                onSelect={setDataSelecionada}
                month={dataSelecionada}
                onMonthChange={setDataSelecionada}
                locale={ptBR}
                modifiers={{
                  comSessao: (date) =>
                    sessoes.some(
                      s => s.data_abertura &&
                        isSameDay(parseISO(s.data_abertura), date) &&
                        isSameMonth(parseISO(s.data_abertura), date)
                    ),
                }}
                modifiersClassNames={{
                  comSessao: "border-2 border-gov-blue-500"
                }}
                footer={
                  dataSelecionada && sessoesNoDia(dataSelecionada).length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {sessoesNoDia(dataSelecionada).map(sessao => (
                        <Popover key={sessao.id}>
                          <PopoverTrigger asChild>
                            <button
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded shadow ${corTipo(sessao.tipo_sessao)} hover:bg-gray-50`}
                            >
                              <span className="font-semibold">{sessao.titulo}</span>
                              <span className="text-xs">{sessao.hora_agendada?.slice(0, 5) || "16:00"}</span>
                              <TagStatusSessao status={sessao.status as StatusSessao} />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72">
                            <div>
                              <div className="font-semibold">{sessao.titulo}</div>
                              <div className="text-sm text-gray-700 mb-2">{sessao.tipo_sessao}</div>
                              <div className="text-xs text-gray-500 mb-2">
                                Horário: {sessao.hora_agendada?.slice(0, 5) || "16:00"}
                              </div>
                              <TagStatusSessao status={sessao.status as StatusSessao} />
                              <div className="mt-3">
                                {renderAcoes(sessao)}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  ) : dataSelecionada ? (
                    <p className="text-gray-500 text-sm text-center mt-2">Nenhuma sessão agendada para este dia.</p>
                  ) : (
                    <p className="text-gray-400 italic text-center">Selecione um dia para ver as sessões.</p>
                  )
                }
                className="pointer-events-auto"
              />
            )}

            {visualizacao === "lista" && (
              <div>
                {sessoes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhuma sessão encontrada.</p>
                    <p className="text-sm">Clique em "Gerar Sessões do Mês" para criar automaticamente.</p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Nº</TableHead>
                            <TableHead className="min-w-[130px]">Data e Hora</TableHead>
                            <TableHead>Título/Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sessoes.map(sessao => (
                            <TableRow key={sessao.id}>
                              <TableCell className="font-medium">{sessao.numero || "S/N"}</TableCell>
                              <TableCell>
                                {sessao.data_abertura ? format(parseISO(sessao.data_abertura), "dd/MM/yyyy") : "-"}
                                <br />               <br />
                                <span className="text-xs text-gray-500">
                                  {sessao.hora_agendada?.slice(0, 5) || "16:00"}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium">{sessao.titulo}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded ${corTipo(sessao.tipo_sessao)} text-xs font-semibold`}>
                                  {sessao.tipo_sessao}
                                </span>
                              </TableCell>
                              <TableCell>
                                <TagStatusSessao status={sessao.status as StatusSessao} />
                              </TableCell>
                              <TableCell>
                                {renderAcoes(sessao)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {sessoes.map(sessao => (
                        <CardSessao
                          key={sessao.id}
                          sessao={{
                            id: String(sessao.id),
                            tipo: sessao.tipo_sessao || "Ordinária",
                            data: sessao.data_abertura || "",
                            hora: sessao.hora_agendada?.slice(0, 5) || "16:00",
                            titulo: sessao.titulo,
                            status: sessao.status as any,
                          }}
                          onEdit={() => setModal({ aberta: true, edicao: sessao })}
                          onCancel={() => setModalNaoRealizada({ aberta: true, sessao })}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Criar/Editar Sessão */}
      {modal.aberta && (
        <ModalSessao
          open={modal.aberta}
          onClose={() => setModal({ aberta: false, edicao: null })}
          onSave={handleSalvarSessao}
          sessao={modal.edicao ? {
            id: String(modal.edicao.id),
            tipo: modal.edicao.tipo_sessao || "Ordinária",
            data: modal.edicao.data_abertura || "",
            hora: modal.edicao.hora_agendada?.slice(0, 5) || "16:00",
            titulo: modal.edicao.titulo,
            status: modal.edicao.status as any,
          } : null}
        />
      )}

      {/* Modal de Marcar como Não Realizada */}
      {modalNaoRealizada.aberta && modalNaoRealizada.sessao && (
        <ModalCancelarSessao
          open={modalNaoRealizada.aberta}
          onClose={() => setModalNaoRealizada({ aberta: false, sessao: undefined })}
          onConfirm={(motivo) => handleMarcarNaoRealizada(modalNaoRealizada.sessao!.id, motivo || "Não informado")}
          dataSessao={modalNaoRealizada.sessao.data_abertura || ""}
        />
      )}

      {/* Diálogo de Confirmação Genérico */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              await confirmDialog.action();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
