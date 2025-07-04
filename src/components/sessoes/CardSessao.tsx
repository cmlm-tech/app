
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, X, MoreVertical } from "lucide-react";
import { Sessao } from "@/pages/atividade-legislativa/Sessoes";
import TagStatusSessao from "./TagStatusSessao";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CardSessaoProps {
  sessao: Sessao;
  onEdit: (sessao: Sessao) => void;
  onCancel: (sessao: Sessao) => void;
}

function corTipo(tipo: string) {
    switch(tipo) {
      case "Ordinária": return "bg-gov-blue-100 text-gov-blue-700";
      case "Extraordinária": return "bg-orange-100 text-orange-700";
      case "Solene": return "bg-yellow-100 text-yellow-700";
      default: return "";
    }
}

export const CardSessao = ({ sessao, onEdit, onCancel }: CardSessaoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gov-blue-700">
          {sessao.titulo}
        </CardTitle>
        <div className="text-sm text-gray-500">
          {format(parseISO(sessao.data), "dd/MM/yyyy")} às {sessao.hora}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded ${corTipo(sessao.tipo)} text-xs font-semibold`}>
                {sessao.tipo}
            </span>
            <TagStatusSessao status={sessao.status}/>
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
                <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Visualizar</DropdownMenuItem>
                {sessao.status === "Agendada" && (
                    <>
                        <DropdownMenuItem onClick={() => onEdit(sessao)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCancel(sessao)}><X className="mr-2 h-4 w-4 text-red-500" /> Cancelar</DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
