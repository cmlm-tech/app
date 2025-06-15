
import { Eye as EyeIcon, Pencil as PencilIcon, X as XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TagStatusSessao from "./TagStatusSessao";
import { Sessao } from "@/pages/atividade-legislativa/Sessoes";

type Props = {
  sessao: Sessao;
  onEdit?: () => void;
  onCancelar?: () => void;
};

export default function SessaoPopover({ sessao, onEdit, onCancelar }: Props) {
  return (
    <div>
      <div className="font-semibold">{sessao.titulo}</div>
      <div className="text-sm text-gray-700 mb-2">{sessao.tipo}</div>
      <div className="text-xs text-gray-500 mb-2">Horário: {sessao.hora}</div>
      <TagStatusSessao status={sessao.status} />
      <div className="flex gap-2 mt-3">
        <Button size="icon" variant="ghost">
          <EyeIcon className="w-4 h-4" />
        </Button>
        {sessao.status === "Agendada" && (
          <>
            <Button size="icon" variant="ghost" onClick={onEdit}>
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onCancelar}>
              <XIcon className="w-4 h-4 text-red-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
