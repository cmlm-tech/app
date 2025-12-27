
import { useState } from "react";
import { pdf } from '@react-pdf/renderer';
import { DocumentoPDF } from "@/components/documentos/DocumentoPDF";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Eye, Pencil, Download, History, Loader2 } from "lucide-react";
import { Materia } from "./types";
import { cn } from "@/lib/utils";
import { CardMateria } from "./CardMateria";

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
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleVisualizarPDF(mat: Materia) {
    setLoadingId(mat.id);
    try {
      // 1. Fetch details (Text + Official Number)
      let tabelaFilha = "";
      let colunaTexto = "";
      let colunaNumero = "";

      if (mat.tipo === "Ofício") {
        tabelaFilha = "oficios"; colunaTexto = "corpo_texto"; colunaNumero = "numero_oficio";
      } else if (mat.tipo === "Projeto de Lei") {
        tabelaFilha = "projetosdelei"; colunaTexto = "corpo_texto"; colunaNumero = "numero_lei";
      } else if (mat.tipo === "Requerimento") {
        tabelaFilha = "requerimentos"; colunaTexto = "corpo_texto"; colunaNumero = "numero_requerimento";
      } else if (mat.tipo === "Projeto de Decreto Legislativo") {
        tabelaFilha = "projetosdedecretolegislativo"; colunaTexto = "justificativa"; colunaNumero = "numero_decreto_legislativo";
      } else if (mat.tipo === "Moção") {
        tabelaFilha = "mocoes"; colunaTexto = "corpo_texto"; colunaNumero = "numero_mocao";
      } else if (mat.tipo === "Indicação") {
        tabelaFilha = "indicacoes"; colunaTexto = "justificativa"; colunaNumero = "numero_indicacao";
      } else if (mat.tipo === "Parecer") {
        tabelaFilha = "pareceres"; colunaTexto = "corpo_texto"; colunaNumero = "id"; // Pareceres usam ID interno como número por enquanto
      }

      if (!tabelaFilha) {
        toast({ title: "Erro", description: "Tipo de documento não suporta visualização.", variant: "destructive" });
        setLoadingId(null);
        return;
      }

      // Fetch child data
      const { data: childData, error } = await supabase
        .from(tabelaFilha as any)
        .select('*')
        .eq('documento_id', Number(mat.id))
        .single();

      if (error) throw error;

      // Fetch Main doc for Protocol General Number and Year (if needed more precision than 'mat')
      // We use 'mat' for speed, but 'ano' and exact protocol number might be safer from DB.
      // Assuming 'mat.protocolo' string format is "ANO.NUMERO".
      const [anoStr, numStr] = mat.protocolo.split('.');

      const numeroOficial = childData[colunaNumero]
        ? `${mat.tipo} nº ${childData[colunaNumero].toString().padStart(3, '0')}/${anoStr}`
        : "Sem Numeração Oficial";

      let membrosComissao: any[] = [];

      // Se for Projeto de Decreto Legislativo, verificar se menciona Finanças
      if (mat.tipo === 'Projeto de Decreto Legislativo') {
        // Normalizar texto para ignorar acentos
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const textoCompleto = normalize((childData[colunaTexto] || '') + ' ' + (mat.ementa || ''));
        const mencionaFinancas = textoCompleto.includes('financas') || textoCompleto.includes('comissao');

        console.log('[PDF DEBUG] Tipo:', mat.tipo);
        console.log('[PDF DEBUG] Texto normalizado contém financas?', mencionaFinancas);

        if (mencionaFinancas) {
          console.log('[PDF] Documento pode ser de Comissão - buscando comissão de finanças...');

          // Buscar a comissão de finanças diretamente
          const { data: comissao } = await supabase
            .from('comissoes')
            .select('id')
            .or('nome.ilike.%finanças%,nome.ilike.%financas%')
            .limit(1)
            .single();

          if (comissao) {
            console.log(`[PDF] Comissão encontrada ID: ${comissao.id}`);

            // Buscar membros
            const { data: membrosRef } = await supabase
              .from('comissaomembros')
              .select('cargo, agente_publico_id')
              .eq('comissao_id', comissao.id);

            if (membrosRef && membrosRef.length > 0) {
              console.log(`[PDF] Membros encontrados: ${membrosRef.length}`);

              const agenteIds = membrosRef.map(m => m.agente_publico_id);
              const { data: agentes } = await supabase
                .from('agentespublicos')
                .select('id, nome_completo')
                .in('id', agenteIds);

              if (agentes) {
                const agentesMap = new Map(agentes.map(a => [a.id, a.nome_completo]));
                membrosComissao = membrosRef.map(m => ({
                  nome: agentesMap.get(m.agente_publico_id) || "Nome não encontrado",
                  cargo: m.cargo
                }));
                console.log(`[PDF] Membros processados:`, membrosComissao);
              }
            } else {
              console.warn('[PDF] Nenhum membro cadastrado para esta comissão');
            }
          } else {
            console.warn('[PDF] Comissão de Finanças não encontrada no banco');
          }
        }
      }

      // Generate PDF
      const blob = await pdf(
        <DocumentoPDF
          tipo={mat.tipo}
          numero={numeroOficial}
          dataProtocolo={mat.dataProtocolo.toISOString()}
          texto={childData[colunaTexto] || ""}
          autor={mat.autor}
          autorCargo={membrosComissao.length > 0 ? "Comissão Permanente" : undefined}
          autores={membrosComissao.length > 0 ? membrosComissao : undefined}
          membrosComissao={membrosComissao}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');

    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao gerar PDF. Tente editar e salvar novamente.", variant: "destructive" });
    } finally {
      setLoadingId(null);
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
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
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
                <TableCell className="flex gap-2 justify-end">
                  <button
                    title="Visualizar PDF"
                    className="hover:text-gov-blue-900 disabled:opacity-50"
                    onClick={() => handleVisualizarPDF(mat)}
                    disabled={loadingId === mat.id}
                  >
                    {loadingId === mat.id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                  </button>
                  <a href={linkToMateria(mat.id, mat.tipo)} title="Editar" className="hover:text-yellow-700 text-gray-600"><Pencil size={18} /></a>
                  <button title="Baixar anexo" className="hover:text-green-700"><Download size={18} /></button>
                  <a
                    href={`/documentos/materias/${mat.id}/historico`}
                    title="Histórico de Tramitação"
                    className="hover:text-indigo-700 text-gray-600"
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
