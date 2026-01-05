import { AppLayout } from "@/components/AppLayout";
import { CardComissao } from "@/components/comissoes/CardComissao";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

interface Membro {
  agente_publico_id: number;
  cargo: string;
  foto_url?: string;
  nome_completo?: string;
}

interface Comissao {
  id: number;
  nome: string;
  descricao?: string;
  membros: Membro[];
}

export default function ComissoesPlenario() {
  // Buscar TODAS as comissões permanentes (com ou sem membros)
  const { data: comissoes = [], isLoading } = useQuery({
    queryKey: ["comissoes-permanentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comissoes")
        .select(`
          id, 
          nome, 
          descricao,
          membros:comissaomembros(
            agente_publico_id,
            cargo,
            agente:agentespublicos(foto_url, nome_completo)
          )
        `)
        .order("nome", { ascending: true });

      if (error) throw error;

      // Transformar dados
      return (data || []).map(c => ({
        id: c.id,
        nome: c.nome,
        descricao: c.descricao,
        membros: (c.membros || []).map((m: any) => ({
          agente_publico_id: m.agente_publico_id,
          cargo: m.cargo,
          foto_url: m.agente?.foto_url,
          nome_completo: m.agente?.nome_completo
        }))
      })) as Comissao[];
    }
  });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
          Comissões Permanentes {comissoes.length > 0 && `(${comissoes.length})`}
        </h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : comissoes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comissoes.map((comissao) => (
            <CardComissao
              key={comissao.id}
              comissao={{
                id: String(comissao.id),
                nome: comissao.nome,
                competencias: comissao.descricao || "Sem descrição definida.",
                membros: comissao.membros
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Nenhuma comissão cadastrada.
        </div>
      )}
    </AppLayout>
  );
}
