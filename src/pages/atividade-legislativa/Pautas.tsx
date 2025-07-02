import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TagStatusPauta from "@/components/pautas/TagStatusPauta";
import { Plus, Pencil, Printer, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

type PautaStatus = "Em Elaboração" | "Publicada" | "Concluída";

type Pauta = {
  id: string;
  sessao: {
    id: string;
    titulo: string;
    data: string;
  };
  numeroItens: number;
  status: PautaStatus;
  dataPublicacao?: string;
};

const PAUTAS_MOCK: Pauta[] = [
  {
    id: "pauta1",
    sessao: {
      id: "sessao1",
      titulo: "Sessão Ordinária de 16/06/2025",
      data: "2025-06-16",
    },
    numeroItens: 12,
    status: "Publicada",
    dataPublicacao: "14/06/2025",
  },
  {
    id: "pauta2",
    sessao: {
      id: "sessao2",
      titulo: "Sessão Extraordinária de 18/06/2025",
      data: "2025-06-18",
    },
    numeroItens: 5,
    status: "Em Elaboração",
  },
  {
    id: "pauta3",
    sessao: {
      id: "sessao3",
      titulo: "Sessão Solene de 25/06/2025",
      data: "2025-06-25",
    },
    numeroItens: 8,
    status: "Concluída",
    dataPublicacao: "20/06/2025",
  },
];

const Pautas = () => {
  const [pautas, setPautas] = useState<Pauta[]>(PAUTAS_MOCK);

  // Lógica de filtro viria aqui
  const pautasFiltradas = pautas;

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold text-gov-blue-800">Pautas das Sessões</h1>
        <p className="text-gray-600 text-lg">Crie, gerencie e publique a ordem do dia para cada sessão plenária.</p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-6 mb-6 gap-4">
        <Link to="/atividade-legislativa/pautas/nova">
          <Button className="bg-gov-blue-700 hover:bg-gov-blue-800 text-white font-bold">
            <Plus className="mr-2 h-5 w-5" />
            Criar Nova Pauta
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input 
            placeholder="Buscar por Sessão ou Título..." 
            className="w-full md:w-64"
          />
          <Select defaultValue="todos">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="elaboracao">Em Elaboração</SelectItem>
              <SelectItem value="publicada">Publicada</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sessão de Referência</TableHead>
                <TableHead className="text-center">Nº de Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Publicação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pautasFiltradas.length > 0 ? pautasFiltradas.map(pauta => (
                <TableRow key={pauta.id}>
                  <TableCell className="font-medium">
                    <Link to={`/atividade-legislativa/sessoes`} className="hover:underline text-gov-blue-700">
                      {pauta.sessao.titulo}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">{pauta.numeroItens} itens</TableCell>
                  <TableCell>
                    <TagStatusPauta status={pauta.status} />
                  </TableCell>
                  <TableCell>{pauta.dataPublicacao ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link to={`/atividade-legislativa/pautas/${pauta.id}`}>
                              <Button size="icon" variant="ghost">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent><p>Ver / Editar Pauta</p></TooltipContent>
                        </Tooltip>
                        
                        {pauta.status !== "Em Elaboração" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => alert("Gerando PDF...")}>
                                <Printer className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Gerar PDF</p></TooltipContent>
                          </Tooltip>
                        )}

                        {pauta.status === "Em Elaboração" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" onClick={() => confirm("Deseja realmente excluir esta pauta?")}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Excluir Pauta</p></TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    Nenhuma pauta encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Pautas;
