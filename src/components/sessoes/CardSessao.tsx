import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, X, MoreVertical, Play, Square, Pause, RotateCcw } from "lucide-react";
import TagStatusSessao from "./TagStatusSessao";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Tipo local para compatibilidade
type SessaoCard = {
  id: string;
  tipo: "Ordinária" | "Extraordinária" | "Solene";
  data: string;
  hora: string;
  titulo: string;
  status: "Agendada" | "Em Andamento" | "Realizada" | "Cancelada" | "Adiada" | "Suspensa";
};

interface CardSessaoProps {
  sessao: SessaoCard;
  onEdit: (sessao: SessaoCard) => void;
  onCancel: (sessao: SessaoCard) => void;
  onIniciar?: (sessao: SessaoCard) => void;
  onEncerrar?: (sessao: SessaoCard) => void;
  onSuspender?: (sessao: SessaoCard) => void;
  onRetomar?: (sessao: SessaoCard) => void;
}

function corTipo(tipo: string) {
  switch (tipo) {
    case "Ordinária": return "bg-gov-blue-100 text-gov-blue-700";
    case "Extraordinária": return "bg-orange-100 text-orange-700";
    case "Solene": return "bg-yellow-100 text-yellow-700";
    default: return "";
  }
}

export const CardSessao = ({
  sessao,
  onEdit,
  onCancel,
  onIniciar,
  onEncerrar,
  onSuspender,
  onRetomar
}: CardSessaoProps) => {
  // Handle invalid date gracefully
  let dataFormatada = "Data inválida";
  try {
    if (sessao.data) {
      dataFormatada = format(parseISO(sessao.data), "dd/MM/yyyy");
    }
  } catch {
    dataFormatada = sessao.data || "Data não informada";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gov-blue-700">
          {sessao.titulo}
        </CardTitle>
        <div className="text-sm text-gray-500">
          {dataFormatada} às {sessao.hora || "16:00"}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded ${corTipo(sessao.tipo)} text-xs font-semibold`}>
            {sessao.tipo}
          </span>
          <TagStatusSessao status={sessao.status} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" /> Visualizar
            </DropdownMenuItem>

            {/* Ações para Agendada */}
            {sessao.status === "Agendada" && (
              <>
                <DropdownMenuSeparator />
                {onIniciar && (
                  <DropdownMenuItem onClick={() => onIniciar(sessao)}>
                    <Play className="mr-2 h-4 w-4 text-green-600" /> Iniciar Sessão
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(sessao)}>
                  <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCancel(sessao)}>
                  <X className="mr-2 h-4 w-4 text-red-500" /> Cancelar
                </DropdownMenuItem>
              </>
            )}

            {/* Ações para Em Andamento */}
            {sessao.status === "Em Andamento" && (
              <>
                <DropdownMenuSeparator />
                {onSuspender && (
                  <DropdownMenuItem onClick={() => onSuspender(sessao)}>
                    <Pause className="mr-2 h-4 w-4 text-purple-600" /> Suspender
                  </DropdownMenuItem>
                )}
                {onEncerrar && (
                  <DropdownMenuItem onClick={() => onEncerrar(sessao)}>
                    <Square className="mr-2 h-4 w-4 text-emerald-600" /> Encerrar
                  </DropdownMenuItem>
                )}
              </>
            )}

            {/* Ações para Suspensa */}
            {sessao.status === "Suspensa" && (
              <>
                <DropdownMenuSeparator />
                {onRetomar && (
                  <DropdownMenuItem onClick={() => onRetomar(sessao)}>
                    <RotateCcw className="mr-2 h-4 w-4 text-green-600" /> Retomar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onCancel(sessao)}>
                  <X className="mr-2 h-4 w-4 text-red-500" /> Cancelar
                </DropdownMenuItem>
              </>
            )}

            {/* Ações para Adiada */}
            {sessao.status === "Adiada" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(sessao)}>
                  <Pencil className="mr-2 h-4 w-4 text-orange-600" /> Reagendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCancel(sessao)}>
                  <X className="mr-2 h-4 w-4 text-red-500" /> Cancelar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
