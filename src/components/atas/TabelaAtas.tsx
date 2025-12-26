// src/components/atas/TabelaAtas.tsx
import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Eye, Gavel, Users, Loader2 } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import AtaPDF from "@/components/documentos/pdf/templates/AtaPDF";

interface TabelaAtasProps {
  atas: Ata[];
}

// Converter número para ordinal
function numToOrdinal(num: number): string {
  const ordinals = ["", "Primeira", "Segunda", "Terceira", "Quarta", "Quinta", "Sexta", "Sétima", "Oitava", "Nona", "Décima"];
  if (num <= 10) return ordinals[num];
  if (num === 11) return "Décima Primeira";
  if (num === 12) return "Décima Segunda";
  if (num === 13) return "Décima Terceira";
  return `${num}ª`;
}

export default function TabelaAtas({ atas }: TabelaAtasProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleVisualizarPDF(ata: Ata) {
    // Se já tem linkPDF salvo, abrir direto
    if (ata.linkPDF) {
      window.open(ata.linkPDF, "_blank");
      return;
    }

    // Gerar PDF dinamicamente
    setLoadingId(ata.id);
    try {
      // Buscar dados da ata no banco
      const { data: ataData, error } = await (supabase as any)
        .from("atas")
        .select(`
          texto,
          sessoes (
            numero,
            tipo_sessao,
            data_abertura
          )
        `)
        .eq("id", parseInt(ata.id))
        .single();

      if (error) throw error;

      const sessaoNumero = numToOrdinal(ataData.sessoes?.numero || ata.numeroSessao);
      const dataFormatada = format(new Date(ataData.sessoes?.data_abertura || ata.dataRealizacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

      const blob = await pdf(
        <AtaPDF
          sessaoNumero={sessaoNumero}
          sessaoTipo={ataData.sessoes?.tipo_sessao || ata.tipoSessao}
          data={dataFormatada}
          textoAta={ataData.texto || "Ata sem conteúdo"}
          presidente="Presidente"
          secretario="Secretário"
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      toast({
        title: "Erro ao gerar PDF",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  }

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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{`${ata.numeroSessao}ª Sessão`}</div>
                    <div className="text-sm text-gray-500">{ata.tipoSessao}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help underline decoration-dotted">
                          {format(ata.dataRealizacao, "dd/MM/yyyy")}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{format(ata.dataRealizacao, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ata.status === "Realizada" ? "bg-green-100 text-green-800" :
                        ata.status === "Agendada" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                      }`}>
                      {ata.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-sm text-gray-800 truncate cursor-help">{ata.resumoPauta}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{ata.resumoPauta}</p>
                      </TooltipContent>
                    </Tooltip>
                  </td>

                  {/* Info */}
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

                  {/* Ações - agora sempre visíveis */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVisualizarPDF(ata)}
                            disabled={loadingId === ata.id}
                          >
                            {loadingId === ata.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Visualizar PDF</p></TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVisualizarPDF(ata)}
                            disabled={loadingId === ata.id}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Baixar PDF</p></TooltipContent>
                      </Tooltip>
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