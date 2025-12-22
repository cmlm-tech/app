
import { supabase } from "@/lib/supabaseClient";

export interface Vereador {
  id: number;
  nome: string;
  partido: string;
  foto: string;
  agente_publico_id: number;
}

export async function getVereadores() {
  const { data, error } = await supabase
    .from("vereadores")
    .select(`
      agente_publico_id,
      nome_parlamentar,
      agente:agentespublicos (
        id,
        nome_completo,
        foto_url
      )
    `);

  if (error) throw error;

  // Map to a friendlier structure if needed, or return raw
  return data.map((v: any) => ({
    id: v.agente_publico_id, // Using agente_publico_id as the main ID for joining
    nome: v.nome_parlamentar || v.agente.nome_completo,
    foto: v.agente.foto_url,
    partido: "Sem Partido", // Placeholder as I didn't verify partido table yet
    agente_publico_id: v.agente_publico_id
  }));
}
