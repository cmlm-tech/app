// 1. IMPORTAR OS NOVOS ÍCONES
import { Download, Eye, Gavel, Users } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ata } from "./types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TabelaAtasProps {
  atas: Ata[];
}

export default function TabelaAtas({ atas }: TabelaAtasProps) {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessão</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resumo da Pauta</th>
              {/* ALTERAÇÃO: Ocultamos a coluna em telas menores que 'lg' para dar mais espaço. */}
              <th className="hidden lg:table-cell px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {atas.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  Nenhuma ata encontrada.
                </td>
              </tr>
            ) : (
              atas.map((ata) => (
                <tr key={ata.id}>
                  {/* ... Células de Sessão, Data e Status (sem mudanças significativas) ... */}
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{`${ata.numeroSessao}ª Sessão`}</div><div className="text-sm text-gray-500">{ata.tipoSessao}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"><Tooltip><TooltipTrigger asChild><span className="cursor-help underline decoration-dotted">{format(ata.dataRealizacao, "dd/MM")}</span></TooltipTrigger><TooltipContent><p>{format(ata.dataRealizacao, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p></TooltipContent></Tooltip></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ ata.status === 'Realizada' ? 'bg-green-100 text-green-800' : ata.status === 'Agendada' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800' }`}>{ata.status}</span></td>
                  <td className="px-6 py-4 max-w-sm"><Tooltip><TooltipTrigger asChild><p className="text-sm text-gray-800 truncate cursor-help">{ata.resumoPauta}</p></TooltipTrigger><TooltipContent><p className="max-w-xs">{ata.resumoPauta}</p></TooltipContent></Tooltip></td>

                  {/* 2. ALTERAÇÃO NA CÉLULA INFO: AGORA COM ÍCONES */}
                  <td className="hidden lg:table-cell px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1.5 text-sm text-gray-600 cursor-help">
                          <Gavel className="w-4 h-4" />
                          <span>{ata.materiasDeliberadas}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ata.materiasDeliberadas} Matérias Deliberadas</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1.5 text-sm text-gray-600 cursor-help">
                          <Users className="w-4 h-4" />
                          <span>{ata.presentes}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ata.presentes} Vereadores Presentes</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>

                  {/* 3. ALTERAÇÃO NA CÉLULA AÇÕES: DIVIDIDA EM DOIS ÍCONES */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {ata.linkPDF && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => window.open(ata.linkPDF, '_blank')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Visualizar PDF</p></TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* O link <a> com o atributo 'download' força o download */}
                              <a href={ata.linkPDF} download={`${ata.tipoSessao}_${ata.numeroSessao}_${format(ata.dataRealizacao, "yyyy-MM-dd")}.pdf`}>
                                <Button variant="ghost" size="icon" asChild>
                                  <div><Download className="w-4 h-4" /></div>
                                </Button>
                              </a>
                            </TooltipTrigger>
                            <TooltipContent><p>Baixar PDF</p></TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}