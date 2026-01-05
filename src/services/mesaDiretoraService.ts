
import { supabase } from "@/lib/supabaseClient";

export interface MesaDiretora {
  id: number;
  periodo_sessao_id: number;
  nome: string;
  membros?: MembroMesa[];
}

export interface MembroMesa {
  id?: number;
  mesa_diretora_id: number;
  agente_publico_id: number;
  cargo: "Presidente" | "Vice-Presidente" | "1º Secretário" | "2º Secretário" | "1º Tesoureiro" | "2º Tesoureiro";
}

export async function getMesaByPeriodo(periodoId: number) {
  const { data, error } = await supabase
    .from("mesasdiretoras")
    .select(`
      id,
      nome,
      periodo_sessao_id,
      membros:mesadiretoramembros (
        id,
        mesa_diretora_id,
        cargo,
        agente_publico_id,
        agente:agentespublicos (
          nome_completo,
          foto_url
        )
      )
    `)
    .eq("periodo_sessao_id", periodoId)
    .single();

  if (error && error.code !== "PGRST116") { // Ignore "not found" error for now
    throw error;
  }

  return data;
}

export async function createMesa(periodoId: number, nome: string) {
  const { data, error } = await supabase
    .from("mesasdiretoras")
    .insert({ periodo_sessao_id: periodoId, nome })
    .select()
    .single();

  if (error) throw error;
  return { ...data, membros: [] };
}

export async function updateMembrosMesa(mesaId: number, membros: { cargo: MembroMesa['cargo']; agente_publico_id: number }[]) {
  // First, remove existing members for this mesa (simplest approach for full update)
  const { error: deleteError } = await supabase
    .from("mesadiretoramembros")
    .delete()
    .eq("mesa_diretora_id", mesaId);

  if (deleteError) throw deleteError;

  // Insert new members
  const membrosToInsert = membros.map(m => ({
    mesa_diretora_id: mesaId,
    agente_publico_id: m.agente_publico_id,
    cargo: m.cargo
  }));

  const { data, error } = await supabase
    .from("mesadiretoramembros")
    .insert(membrosToInsert as any)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Busca vereadores APTOS para compor a Mesa Diretora
 * 
 * REGRAS DE NEGÓCIO:
 * - Apenas TITULARES (não suplentes)
 * - Da legislatura do período
 * - Em exercício (sem data_afastamento ou afastamento futuro)
 * - Se afastado, vaga fica vazia até retorno
 */
export async function getVereadoresAptosParaMesa(legislaturaId: number) {
  // 1. Buscar legislaturavereadores (titulares em exercício)
  const { data: legislaturaVereadores, error } = await supabase
    .from('legislaturavereadores')
    .select(`
      agente_publico_id,
      partido_id,
      partido,
      condicao,
      data_posse,
      data_afastamento
    `)
    .eq('legislatura_id', legislaturaId)
    .eq('condicao', 'Titular') // APENAS TITULARES
    .is('data_afastamento', null); // EM EXERCÍCIO

  if (error) throw error;
  if (!legislaturaVereadores || legislaturaVereadores.length === 0) return [];

  const agenteIds = legislaturaVereadores.map(lv => lv.agente_publico_id);

  // 2. Buscar dados dos agentes públicos
  const { data: agentes, error: agentesError } = await supabase
    .from('agentespublicos')
    .select('id, nome_completo, foto_url')
    .in('id', agenteIds);

  if (agentesError) throw agentesError;

  // 3. Buscar dados complementares dos vereadores
  const { data: vereadores, error: vereadoresError } = await supabase
    .from('vereadores')
    .select('agente_publico_id, nome_parlamentar, perfil, email_gabinete, telefone_gabinete')
    .in('agente_publico_id', agenteIds);

  if (vereadoresError) throw vereadoresError;

  // 4. Buscar dados dos partidos (incluindo logos)
  const partidoIds = legislaturaVereadores
    .map(lv => lv.partido_id)
    .filter((id): id is number => id !== null);

  let partidos: any[] = [];
  if (partidoIds.length > 0) {
    const { data: partidosData, error: partidosError } = await supabase
      .from('partidos')
      .select('id, sigla, nome_completo, logo_url, cor_principal')
      .in('id', partidoIds);

    if (partidosError) {
      console.error('Erro ao buscar partidos:', partidosError);
    } else {
      partidos = partidosData || [];
    }
  }

  // 5. Combinar todos os dados
  return legislaturaVereadores.map(lv => {
    const agente = agentes?.find(a => a.id === lv.agente_publico_id);
    const vereador = vereadores?.find(v => v.agente_publico_id === lv.agente_publico_id);
    const partido = partidos.find(p => p.id === lv.partido_id);

    return {
      id: lv.agente_publico_id,
      agente_publico_id: lv.agente_publico_id,
      nome: vereador?.nome_parlamentar || agente?.nome_completo || 'Sem nome',
      nome_completo: agente?.nome_completo || 'Sem nome',
      nome_parlamentar: vereador?.nome_parlamentar,
      foto: agente?.foto_url,
      partido: partido?.sigla || lv.partido || 'Sem Partido',
      partido_id: lv.partido_id,
      partido_completo: partido ? {
        id: partido.id,
        sigla: partido.sigla,
        nome_completo: partido.nome_completo,
        logo_url: partido.logo_url,
        cor_principal: partido.cor_principal,
      } : null,
      email_gabinete: vereador?.email_gabinete,
      telefone_gabinete: vereador?.telefone_gabinete,
      perfil: vereador?.perfil,
    };
  });
}

/**
 * Atualizar membros da mesa por período (cria mesa se não existir)
 */
export async function updateMesaMembros(
  periodoId: number,
  membros: { cargo: string; agente_publico_id: number }[]
) {
  // 1. Verificar se mesa existe para o período
  let mesa = await getMesaByPeriodo(periodoId);

  // 2. Se não existe, criar
  if (!mesa) {
    mesa = await createMesa(periodoId, "Mesa Diretora");
  }

  // 3. Atualizar membros
  return updateMembrosMesa(mesa.id, membros as any);
}
