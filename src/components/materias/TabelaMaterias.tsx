import { useToast } from "@/components/ui/use-toast";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Eye, Pencil, History } from "lucide-react";
import { Materia } from "./types";
import { cn } from "@/lib/utils";
import { CardMateria } from "./CardMateria";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface Props {
  materias: Materia[];
}

const statusColors: Record<string, string> = {
  "Rascunho": "bg-gray-100 text-gray-600 border border-gray-200",
  "Protocolado": "bg-blue-100 text-blue-800 border border-blue-200",
  "Leitura": "bg-purple-100 text-purple-800 border border-purple-200",
  "Em Comissão": "bg-orange-100 text-orange-800 border border-orange-200",
  "Pronto para Pauta": "bg-indigo-100 text-indigo-800 border border-indigo-200",
  "Aprovado": "bg-green-100 text-green-800 border border-green-200",
  "Rejeitado": "bg-red-100 text-red-800 border border-red-200",
  "Arquivado": "bg-gray-200 text-gray-600 border border-gray-300",
  "Emitido": "bg-sky-100 text-sky-800 border border-sky-200",
  "Lido": "bg-purple-100 text-purple-800 border border-purple-200",
};

function linkToMateria(id: string, tipo: string) {
  if (tipo === "Parecer") {
    return `/documentos/pareceres/${id}/editar`;
  }
  return `/documentos/materias/${id}/editar`;
}



export default function TabelaMaterias({ materias }: Props) {
  const { toast } = useToast();

  function handleVisualizarPDF(mat: Materia) {
    if (mat.arquivo_url) {
      console.log('[Visualizar PDF] Abrindo do Storage:', mat.arquivo_url);
      window.open(mat.arquivo_url, '_blank');
    }
  }

  return (
    <div>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ementa/Assunto</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Data do Protocolo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materias.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                  Nenhuma matéria encontrada.
                </TableCell>
              </TableRow>
            )}
            {materias.map((mat) => (
              <TableRow key={mat.id}>
                <TableCell>
                  <a href={linkToMateria(mat.id, mat.tipo)} className="font-semibold text-gov-blue-700 hover:underline">{mat.protocolo}</a>
                </TableCell>
                <TableCell>{mat.tipo}</TableCell>
                <TableCell>{mat.ementa || '—'}</TableCell>
                <TableCell>{mat.autor}</TableCell>
                <TableCell>{mat.dataProtocolo.toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", statusColors[mat.status] || "bg-gray-200 text-gray-600")}>
                    {mat.status}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2 justify-end items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:text-gov-blue-900 disabled:opacity-30"
                            onClick={() => handleVisualizarPDF(mat)}
                            disabled={!mat.arquivo_url}
                          >
                            <Eye size={18} />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{mat.arquivo_url ? "Visualizar PDF oficial" : "PDF disponível após protocolar"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <a href={linkToMateria(mat.id, mat.tipo)} title="Editar" className="hover:text-yellow-700 text-gray-600 p-2"><Pencil size={18} /></a>
                  <a
                    href={`/documentos/materias/${mat.id}/historico`}
                    title="Histórico de Tramitação"
                    className="hover:text-indigo-700 text-gray-600 p-2"
                  >
                    <History size={18} />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div >
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {materias.map((materia) => (
          <CardMateria key={materia.id} materia={materia} />
        ))}
      </div>
    </div >
  );
}
