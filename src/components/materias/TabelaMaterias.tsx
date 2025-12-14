
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
  "Aprovado": "bg-green-100 text-green-700",
  "Em análise": "bg-yellow-100 text-yellow-900",
  "Aguardando votação": "bg-blue-100 text-blue-700",
  "Rejeitado": "bg-red-100 text-red-700",
  "Arquivado": "bg-gray-200 text-gray-500",
  "Protocolado": "bg-gray-100 text-gray-800"
};

function linkToMateria(id: string) {
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
        tabelaFilha = "requerimentos"; colunaTexto = "corpo_texto"; colunaNumero = "numero_requerimento"; // Check actual column later if fails
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

      // Generate PDF
      const blob = await pdf(
        <DocumentoPDF
          tipo={mat.tipo}
          ano={Number(anoStr)}
          numero={numeroOficial}
          protocolo={Number(numStr)}
          dataProtocolo={mat.dataProtocolo.toISOString()}
          texto={childData[colunaTexto] || ""}
          autor={mat.autor}
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
                  <a href={linkToMateria(mat.id)} className="font-semibold text-gov-blue-700 hover:underline">{mat.protocolo}</a>
                </TableCell>
                <TableCell>{mat.tipo}</TableCell>
                <TableCell>{mat.ementa}</TableCell>
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
                  <a href={linkToMateria(mat.id)} title="Editar" className="hover:text-yellow-700 text-gray-600"><Pencil size={18} /></a>
                  <button title="Baixar anexo" className="hover:text-green-700"><Download size={18} /></button>
                  <button title="Histórico" className="hover:text-gray-700"><History size={18} /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {materias.map((materia) => (
          <CardMateria key={materia.id} materia={materia} />
        ))}
      </div>
    </div>
  );
}
