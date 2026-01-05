import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { CardMembroComissao } from "@/components/comissoes/CardMembroComissao";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Membro {
  id: number;
  cargo: string;
  agente_publico_id: number;
  data_inicio?: string;
  data_fim?: string;
  agente?: {
    nome_completo: string;
    foto_url?: string;
  };
  periodo?: {
    numero: number;
    descricao?: string;
    data_inicio: string;
    data_fim: string;
  };
}

interface Comissao {
  id: number;
  nome: string;
  descricao?: string;
  membros_atuais: Membro[];
  membros_historico: Membro[];
}

export default function DetalheComissao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const comissaoId = id ? Number(id) : 0;

  // Buscar comissão com membros atuais e histórico
  const { data: comissao, isLoading } = useQuery({
    queryKey: ["comissao-detalhe", comissaoId],
    queryFn: async () => {
      // 1. Buscar período vigente
      const { data: periodoAtual } = await supabase
        .from("periodossessao")
        .select("id")
        .gte("data_fim", new Date().toISOString())
        .order("data_inicio", { ascending: true })
        .limit(1)
        .single();

      // 2. Buscar comissão
      const { data: comissaoData, error: comissaoError } = await supabase
        .from("comissoes")
        .select("id, nome, descricao, periodo_sessao_id")
        .eq("id", comissaoId)
        .single();

      if (comissaoError) throw comissaoError;

      // 3. Buscar membros ATUAIS (da comissão no período vigente)
      const membrosAtuaisQuery = comissaoData.periodo_sessao_id === periodoAtual?.id
        ? await supabase
          .from("comissaomembros")
          .select(`
              id,
              cargo,
              agente_publico_id,
              agente:agentespublicos(nome_completo, foto_url)
            `)
          .eq("comissao_id", comissaoId)
        : { data: [] };

      // 4. Buscar TODAS as comissões com mesmo nome (histórico)
      const { data: comissoesHistorico } = await supabase
        .from("comissoes")
        .select(`
          id,
          periodo_sessao_id,
          periodo:periodossessao(numero, descricao, data_inicio, data_fim),
          membros:comissaomembros(
            id,
            cargo,
            agente_publico_id,
            agente:agentespublicos(nome_completo, foto_url)
          )
        `)
        .eq("nome", comissaoData.nome)
        .order("periodo_sessao_id", { ascending: false });

      // Flatten membros históricos
      const membrosHistorico = (comissoesHistorico || []).flatMap((com: any) =>
        (com.membros || []).map((m: any) => ({
          ...m,
          periodo: com.periodo
        }))
      );

      return {
        id: comissaoData.id,
        nome: comissaoData.nome,
        descricao: comissaoData.descricao,
        membros_atuais: membrosAtuaisQuery.data || [],
        membros_historico: membrosHistorico
      } as Comissao;
    },
    enabled: !!comissaoId
  });

  // Helpers
  const getMembro = (cargo: string) => {
    return comissao?.membros_atuais?.find(m => m.cargo === cargo);
  };

  // Todos os membros que não são Presidente ou Relator
  const outrosMembros = comissao?.membros_atuais?.filter(
    m => m.cargo !== "Presidente" && m.cargo !== "Relator"
  ) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-40 w-full mb-6" />
        <Skeleton className="h-60 w-full" />
      </AppLayout>
    );
  }

  if (!comissao) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">Comissão não encontrada.</p>
          <Button onClick={() => navigate("/plenario/comissoes")}>
            Voltar para Comissões
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate("/plenario/comissoes")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Comissões
      </Button>

      {/* Título */}
      <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-6">
        {comissao.nome}
      </h1>

      {/* Competências */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gov-blue-700 mb-3">
          Competências da Comissão
        </h2>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-gray-700 whitespace-pre-line">
          {comissao.descricao || "Sem descrição definida."}
        </div>
      </section>

      {/* Membros Atuais */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gov-blue-700 mb-4">
          Composição Atual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Presidente */}
          <CardMembroComissao
            papel="Presidente"
            vereador={
              getMembro("Presidente")
                ? {
                  id: String(getMembro("Presidente")!.agente_publico_id),
                  nome: getMembro("Presidente")!.agente?.nome_completo || "",
                  foto: getMembro("Presidente")!.agente?.foto_url || "",
                  partido: "",
                }
                : undefined
            }
          />

          {/* Relator */}
          <CardMembroComissao
            papel="Relator"
            vereador={
              getMembro("Relator")
                ? {
                  id: String(getMembro("Relator")!.agente_publico_id),
                  nome: getMembro("Relator")!.agente?.nome_completo || "",
                  foto: getMembro("Relator")!.agente?.foto_url || "",
                  partido: "",
                }
                : undefined
            }
          />

          {/* Membros */}
          {outrosMembros.length === 0 ? (
            <div className="sm:col-span-2 text-gray-500 flex items-center">
              Nenhum membro titular definido.
            </div>
          ) : (
            outrosMembros.map((membro) => (
              <CardMembroComissao
                key={membro.id}
                papel="Membro"
                vereador={{
                  id: String(membro.agente_publico_id),
                  nome: membro.agente?.nome_completo || "",
                  foto: membro.agente?.foto_url || "",
                  partido: "",
                }}
              />
            ))
          )}
        </div>
      </section>

      {/* Histórico de Membros */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gov-blue-700 mb-4">
          Histórico de Membros
        </h2>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Vigência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comissao.membros_historico.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Nenhum registro histórico encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                comissao.membros_historico.map((membro) => (
                  <TableRow key={membro.id}>
                    <TableCell className="font-medium">
                      {membro.agente?.nome_completo || "—"}
                    </TableCell>
                    <TableCell>{membro.cargo}</TableCell>
                    <TableCell>
                      {membro.periodo?.descricao || `Período ${membro.periodo?.numero}` || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {membro.periodo
                        ? `${new Date(membro.periodo.data_inicio).getFullYear()} - ${new Date(membro.periodo.data_fim).getFullYear()}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </AppLayout>
  );
}
