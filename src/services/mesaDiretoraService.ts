
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
        agente_publico_id
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
  return data;
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
