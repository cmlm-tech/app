
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Download, History, MoreVertical } from "lucide-react";
import { Materia } from "./types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CardMateriaProps {
  materia: Materia;
}

const statusColors: Record<string, string> = {
  "Aprovado": "bg-green-100 text-green-700",
  "Em análise": "bg-yellow-100 text-yellow-900",
  "Aguardando votação": "bg-blue-100 text-blue-700",
  "Rejeitado": "bg-red-100 text-red-700",
  "Arquivado": "bg-gray-200 text-gray-500",
  "Protocolado": "bg-gray-100 text-gray-800",
  "Rascunho": "bg-purple-100 text-purple-700"
};

export const CardMateria = ({ materia }: CardMateriaProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gov-blue-700 hover:underline">
          <a href={`/documentos/materias/${materia.id}/editar`}>{materia.protocolo}</a>
        </CardTitle>
        <div className="text-sm text-gray-500">{materia.tipo}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-800 line-clamp-3">{materia.ementa}</p>
        <div className="text-xs text-gray-500 mt-2">Autor: {materia.autor}</div>
        <div className="text-xs text-gray-500">Data: {materia.dataProtocolo.toLocaleDateString()}</div>
        <div className="mt-4">
          <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", statusColors[materia.status] || "bg-gray-200 text-gray-600")}>
            {materia.status}
          </span>
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
            <DropdownMenuItem asChild><a href={`/documentos/materias/${materia.id}/editar`} className="flex items-center cursor-pointer"><Pencil className="mr-2 h-4 w-4" /> Editar</a></DropdownMenuItem>
            <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Baixar</DropdownMenuItem>
            <DropdownMenuItem><History className="mr-2 h-4 w-4" /> Histórico</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
