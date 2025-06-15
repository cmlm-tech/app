import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, List as ListIcon, Plus as PlusIcon, Eye as EyeIcon, Pencil as PencilIcon, X as XIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import ModalSessao from "@/components/sessoes/ModalSessao";
import ModalCancelarSessao from "@/components/sessoes/ModalCancelarSessao";
import SessaoPopover from "@/components/sessoes/SessaoPopover";
import TagStatusSessao from "@/components/sessoes/TagStatusSessao";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isSameDay, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type SessaoTipo = "Ordinária" | "Extraordinária" | "Solene";
export type SessaoStatus = "Agendada" | "Realizada" | "Cancelada";

export type Sessao = {
  id: string;
  tipo: SessaoTipo;
  data: string;      // ISO
  hora: string;      // "19:00"
  titulo: string;
  status: SessaoStatus;
};

const SESSOES_MOCK: Sessao[] = [
  {
    id: "1",
    tipo: "Ordinária",
    data: "2024-06-18",
    hora: "19:00",
    titulo: "Sessão Ordinária da 1ª Quinzena de Junho",
    status: "Agendada"
  },
  {
    id: "2",
    tipo: "Extraordinária",
    data: "2024-06-20",
    hora: "10:00",
    titulo: "Sessão Extraordinária para Votação do Orçamento",
    status: "Realizada"
  },
  {
    id: "3",
    tipo: "Solene",
    data: "2024-06-25",
    hora: "17:00",
    titulo: "Sessão Solene de Entrega de Medalhas",
    status: "Cancelada"
  },
];

export default function SessoesLeg() {
  const [visualizacao, setVisualizacao] = useState<"calendario" | "lista">("calendario");
  const [sessoes, setSessoes] = useState<Sessao[]>(SESSOES_MOCK);
  const [modal, setModal] = useState<{aberta: boolean, edicao?: Sessao | null}>({aberta: false, edicao: null});
  const [modalCancelar, setModalCancelar] = useState<{aberta: boolean, sessao?: Sessao}>({aberta: false, sessao: undefined});

  // Controle calendario:
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);

  // Funções CRUD:
  const handleSalvarSessao = (sessao: Sessao, isEdit: boolean) => {
    setSessoes(old => {
      if (isEdit) {
        return old.map(s => s.id === sessao.id ? sessao : s);
      } else {
        return [...old, {...sessao, id: String(Date.now()) }];
      }
    });
    setModal({aberta:false, edicao:null});
  };

  const handleCancelarSessao = (sessaoId: string) => {
    setSessoes(old => old.map(s => s.id === sessaoId ? {...s, status:"Cancelada"} : s));
    setModalCancelar({aberta:false, sessao: undefined});
  };

  // Agrupa sessões por dia
  function sessoesNoDia(day: Date) {
    return sessoes.filter(s =>
      isSameDay(parseISO(s.data), day)
    );
  }

  // Para cada sessão: cor por tipo
  function corTipo(tipo: SessaoTipo) {
    switch(tipo) {
      case "Ordinária": return "bg-gov-blue-100 text-gov-blue-700";
      case "Extraordinária": return "bg-orange-100 text-orange-700";
      case "Solene": return "bg-yellow-100 text-yellow-700";
      default: return "";
    }
  }

  return (
    <AppLayout>
      {/* Cabeçalho da página */}
      <div>
        <h1 className="text-3xl font-bold text-gov-blue-800">Sessões Legislativas</h1>
        <p className="text-gray-600 text-lg">Agende, consulte e gerencie as sessões plenárias da Câmara.</p>
      </div>
      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 mb-6 gap-2">
        <Button onClick={()=>setModal({aberta:true, edicao:null})} className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold gap-2">
          <PlusIcon className="w-5 h-5" /> Agendar Nova Sessão
        </Button>
        <div className="flex gap-2 ml-auto mt-2 md:mt-0">
          <Button
            variant={visualizacao==="calendario" ? "default":"outline"}
            className={visualizacao==="calendario" ? "bg-gov-blue-700 text-white": ""}
            onClick={()=>setVisualizacao("calendario")}
          >
            <CalendarIcon className="w-5 h-5 mr-1" /> Calendário
          </Button>
          <Button
            variant={visualizacao==="lista" ? "default":"outline"}
            className={visualizacao==="lista" ? "bg-gov-blue-700 text-white": ""}
            onClick={()=>setVisualizacao("lista")}
          >
            <ListIcon className="w-5 h-5 mr-1" /> Lista
          </Button>
        </div>
      </div>
      {/* Visualização principal */}
      <div className="bg-white rounded shadow px-4 py-6">
        {visualizacao==="calendario" && (
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
                  s =>
                    isSameDay(parseISO(s.data), date) &&
                    isSameMonth(parseISO(s.data), date)
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
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded shadow ${corTipo(sessao.tipo)} hover:bg-gray-50`}
                        >
                          <span className="font-semibold">{sessao.titulo}</span>
                          <span className="text-xs">{sessao.hora}</span>
                          <TagStatusSessao status={sessao.status} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <SessaoPopover sessao={sessao} onEdit={() => setModal({aberta:true, edicao:sessao})} onCancelar={() => setModalCancelar({aberta:true, sessao:sessao})} />
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              ): dataSelecionada ? (
                <p className="text-gray-500 text-sm text-center mt-2">Nenhuma sessão agendada para este dia.</p>
              ) : (
                <p className="text-gray-400 italic text-center">Selecione um dia para ver as sessões.</p>
              )
            }
            className="pointer-events-auto"
          />
        )}

        {visualizacao==="lista" && (
          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell>{format(parseISO(sessao.data), "dd/MM/yyyy")}<br/><span className="text-xs text-gray-500">{sessao.hora}</span></TableCell>
                    <TableCell className="font-medium">{sessao.titulo}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded ${corTipo(sessao.tipo)} text-xs font-semibold`}>
                        {sessao.tipo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <TagStatusSessao status={sessao.status}/>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost">
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        {sessao.status === "Agendada" && (
                          <>
                            <Button size="icon" variant="ghost" onClick={()=>setModal({aberta:true, edicao:sessao})}>
                              <PencilIcon className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={()=>setModalCancelar({aberta:true, sessao:sessao})}>
                              <XIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal Agendar/Editar */}
      {modal.aberta && (
        <ModalSessao
          open={modal.aberta}
          onClose={() => setModal({aberta:false, edicao:null})}
          onSave={handleSalvarSessao}
          sessao={modal.edicao}
        />
      )}

      {/* Modal Cancelar */}
      {modalCancelar.aberta && modalCancelar.sessao && (
        <ModalCancelarSessao
          open={modalCancelar.aberta}
          onClose={() => setModalCancelar({aberta:false, sessao: undefined})}
          onConfirm={() => handleCancelarSessao(modalCancelar.sessao!.id)}
          dataSessao={modalCancelar.sessao.data}
        />
      )}
    </AppLayout>
  );
}
