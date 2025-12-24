import { Eye as EyeIcon, Pencil as PencilIcon, X as XIcon, Play, Square, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import TagStatusSessao from "./TagStatusSessao";
import { StatusSessao } from "@/services/sessoesService";

// Tipo local para compatibilidade
type SessaoPopoverType = {
  id?: string;
  tipo: "Ordinária" | "Extraordinária" | "Solene";
  titulo: string;
  hora: string;
  status: StatusSessao;
  local?: string;
};

type Props = {
  sessao: SessaoPopoverType;
  onEdit?: () => void;
  onCancelar?: () => void;
  onIniciar?: () => void;
  onEncerrar?: () => void;
  onSuspender?: () => void;
  onRetomar?: () => void;
};

export default function SessaoPopover({
  sessao,
  onEdit,
  onCancelar,
  onIniciar,
  onEncerrar,
  onSuspender,
  onRetomar
}: Props) {
  return (
    <div className="space-y-2">
      <div className="font-semibold text-gov-blue-800">{sessao.titulo}</div>
      <div className="text-sm text-gray-700">{sessao.tipo}</div>
      <div className="text-xs text-gray-500">Horário: {sessao.hora || "16:00"}</div>
      {sessao.local && (
        <div className="text-xs text-gray-500">Local: {sessao.local}</div>
      )}
      <TagStatusSessao status={sessao.status} />

      <div className="flex gap-2 mt-3 flex-wrap">
        {/* Visualizar - sempre disponível */}
        <Button size="icon" variant="ghost" title="Visualizar">
          <EyeIcon className="w-4 h-4" />
        </Button>

        {/* Ações para Agendada */}
        {sessao.status === "Agendada" && (
          <>
            {onIniciar && (
              <Button size="icon" variant="ghost" onClick={onIniciar} title="Iniciar Sessão">
                <Play className="w-4 h-4 text-green-600" />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={onEdit} title="Editar">
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onCancelar} title="Cancelar">
              <XIcon className="w-4 h-4 text-red-500" />
            </Button>
          </>
        )}

        {/* Ações para Em Andamento */}
        {sessao.status === "Em Andamento" && (
          <>
            {onSuspender && (
              <Button size="icon" variant="ghost" onClick={onSuspender} title="Suspender">
                <Pause className="w-4 h-4 text-purple-600" />
              </Button>
            )}
            {onEncerrar && (
              <Button size="icon" variant="ghost" onClick={onEncerrar} title="Encerrar">
                <Square className="w-4 h-4 text-emerald-600" />
              </Button>
            )}
          </>
        )}

        {/* Ações para Suspensa */}
        {sessao.status === "Suspensa" && (
          <>
            {onRetomar && (
              <Button size="icon" variant="ghost" onClick={onRetomar} title="Retomar">
                <RotateCcw className="w-4 h-4 text-green-600" />
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={onCancelar} title="Cancelar">
              <XIcon className="w-4 h-4 text-red-500" />
            </Button>
          </>
        )}

        {/* Ações para Adiada */}
        {sessao.status === "Adiada" && (
          <>
            <Button size="icon" variant="ghost" onClick={onEdit} title="Reagendar">
              <PencilIcon className="w-4 h-4 text-orange-600" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onCancelar} title="Cancelar">
              <XIcon className="w-4 h-4 text-red-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
