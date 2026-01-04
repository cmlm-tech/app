import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

// Tipos do banco (após aplicar as migrações)
type VereadorRow = Database['public']['Tables']['vereadores']['Row'];
type VereadorInsert = Database['public']['Tables']['vereadores']['Insert'];
type VereadorUpdate = Database['public']['Tables']['vereadores']['Update'];
type AgentePublico = Database['public']['Tables']['agentespublicos']['Row'];
type LegislaturaVereador = Database['public']['Tables']['legislaturavereadores']['Row'];
type Legislatura = Database['public']['Tables']['legislaturas']['Row'];

/**
 * Interface completa de um vereador para o acervo histórico
 */
export interface VereadorAcervo {
  id: number;
  agente_publico_id: number;
  nome_completo: string;
  nome_parlamentar: string | null;
  foto_url: string | null;
  cpf: string | null;

  // Dados complementares
  perfil: string | null;
  biografia_completa: string | null;
  email_gabinete: string | null;
  telefone_gabinete: string | null;
  site_pessoal: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  formacao_academica: string | null;
  profissao_anterior: string | null;
  areas_atuacao: string[] | null;

  // Histórico de legislaturas
  legislaturas: {
    legislatura_id: number;
    legislatura_numero: number;
    legislatura_periodo: string; // "2021-2024"
    partido: string; // Sigla do partido
    partido_id: number | null;
    data_posse: string | null;
    data_afastamento: string | null;
    condicao: 'Titular' | 'Suplente' | null;
    ativo: boolean; // true se ainda está em exercício (sem data_afastamento)
  }[];
}

/**
 * Buscar todos os vereadores do acervo histórico
 * Retorna vereadores de TODAS as legislaturas
 */
export async function getVereadoresAcervo(filtros?: {
  legislaturaId?: number;
  partido?: string;
  busca?: string;
}) {
  try {
    // Query base: buscar vereadores com seus dados de agente público
    const { data: vereadoresData, error: vereadoresError } = await supabase
      .from('vereadores')
      .select(`
        *,
        agente:agentespublicos(*)
      `);

    if (vereadoresError) throw vereadoresError;

    // Buscar todas as participações em legislaturas
    let legislaturasQuery = supabase
      .from('legislaturavereadores')
      .select(`
        *,
        legislatura:legislaturas(*)
      `);

    // Aplicar filtro de legislatura se fornecido
    if (filtros?.legislaturaId) {
      legislaturasQuery = legislaturasQuery.eq('legislatura_id', filtros.legislaturaId);
    }

    const { data: legislaturasData, error: legislaturasError } = await legislaturasQuery;

    if (legislaturasError) throw legislaturasError;

    // Agrupar legislaturas por vereador
    const legislaturasPorVereador = new Map<number, any[]>();

    legislaturasData?.forEach(lv => {
      const agenteId = lv.agente_publico_id;
      if (!legislaturasPorVereador.has(agenteId)) {
        legislaturasPorVereador.set(agenteId, []);
      }

      const leg = lv.legislatura as any;
      legislaturasPorVereador.get(agenteId)!.push({
        legislatura_id: lv.legislatura_id,
        legislatura_numero: leg?.numero,
        legislatura_periodo: leg ? `${new Date(leg.data_inicio).getFullYear()}-${new Date(leg.data_fim).getFullYear()}` : '',
        partido: lv.partido || '', // String antiga (temporário)
        partido_id: lv.partido_id || null, // Nova FK
        data_posse: lv.data_posse,
        data_afastamento: lv.data_afastamento,
        condicao: lv.condicao,
        ativo: !lv.data_afastamento
      });
    });

    // Montar resultado final
    let resultado: VereadorAcervo[] = vereadoresData?.map((v: any) => ({
      id: v.agente_publico_id,
      agente_publico_id: v.agente_publico_id,
      nome_completo: v.agente.nome_completo,
      nome_parlamentar: v.nome_parlamentar,
      foto_url: v.agente.foto_url,
      cpf: v.agente.cpf,

      // Dados complementares (novos campos)
      perfil: v.perfil,
      biografia_completa: v.biografia_completa,
      email_gabinete: v.email_gabinete,
      telefone_gabinete: v.telefone_gabinete,
      site_pessoal: v.site_pessoal,
      instagram: v.instagram,
      facebook: v.facebook,
      twitter: v.twitter,
      formacao_academica: v.formacao_academica,
      profissao_anterior: v.profissao_anterior,
      areas_atuacao: v.areas_atuacao,

      legislaturas: legislaturasPorVereador.get(v.agente_publico_id) || []
    })) || [];

    // Filtrar por partido se fornecido
    if (filtros?.partido && filtros.partido !== 'Todos') {
      resultado = resultado.filter(v =>
        v.legislaturas.some(l => l.partido === filtros.partido)
      );
    }

    // Filtrar por busca se fornecido
    if (filtros?.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      resultado = resultado.filter(v =>
        v.nome_completo.toLowerCase().includes(buscaLower) ||
        v.nome_parlamentar?.toLowerCase().includes(buscaLower)
      );
    }

    return resultado;
  } catch (error) {
    console.error('Erro ao buscar vereadores do acervo:', error);
    throw error;
  }
}

/**
 * Buscar detalhes completos de um vereador específico
 */
export async function getVereadorDetalhes(agentePublicoId: number): Promise<VereadorAcervo | null> {
  const resultado = await getVereadoresAcervo();
  return resultado.find(v => v.agente_publico_id === agentePublicoId) || null;
}

/**
 * Atualizar dados complementares de um vereador
 */
export async function updateVereadorComplemento(
  agentePublicoId: number,
  dados: VereadorUpdate
) {
  const { data, error } = await supabase
    .from('vereadores')
    .update(dados)
    .eq('agente_publico_id', agentePublicoId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar dados complementares:', error);
    throw error;
  }

  return data;
}

/**
 * Criar ou atualizar registro de vereador (upsert)
 */
export async function upsertVereador(dados: VereadorInsert) {
  const { data, error } = await supabase
    .from('vereadores')
    .upsert(dados, {
      onConflict: 'agente_publico_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar/atualizar vereador:', error);
    throw error;
  }

  return data;
}

/**
 * Buscar lista de legislaturas para filtro
 */
export async function getLegislaturas() {
  const { data, error } = await supabase
    .from('legislaturas')
    .select('*')
    .order('numero', { ascending: false });

  if (error) {
    console.error('Erro ao buscar legislaturas:', error);
    throw error;
  }

  return data;
}

// ============================================
// FUNÇÕES LEGADAS (manter compatibilidade)
// ============================================

/**
 * @deprecated Use getVereadoresAcervo() ao invés
 */
export async function getVereadores() {
  console.warn('getVereadores() está deprecated. Use getVereadoresAcervo()');
  return getVereadoresAcervo();
}
