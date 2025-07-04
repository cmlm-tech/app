
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Printer, Trash2, MoreVertical } from "lucide-react";
import { Pauta } from "@/pages/atividade-legislativa/Pautas";
import TagStatusPauta from "./TagStatusPauta";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CardPautaProps {
  pauta: Pauta;
}

export const CardPauta = ({ pauta }: CardPautaProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gov-blue-700 hover:underline">
          <Link to={`/atividade-legislativa/sessoes`}>{pauta.sessao.titulo}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">{pauta.numeroItens} itens</div>
        <div className="mt-4">
            <TagStatusPauta status={pauta.status} />
        </div>
        <div className="text-xs text-gray-500 mt-2">
            Data de Publicação: {pauta.dataPublicacao ?? "—"}
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
                <DropdownMenuItem asChild>
                    <Link to={`/atividade-legislativa/pautas/${pauta.id}`} className="flex items-center">
                        <Pencil className="mr-2 h-4 w-4" /> Ver / Editar
                    </Link>
                </DropdownMenuItem>
                {pauta.status !== "Em Elaboração" && (
                    <DropdownMenuItem onClick={() => alert("Gerando PDF...")}>
                        <Printer className="mr-2 h-4 w-4" /> Gerar PDF
                    </DropdownMenuItem>
                )}
                {pauta.status === "Em Elaboração" && (
                    <DropdownMenuItem onClick={() => confirm("Deseja realmente excluir esta pauta?")}>
                        <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Excluir
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};
