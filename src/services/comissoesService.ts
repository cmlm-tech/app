
import { supabase } from "@/lib/supabaseClient";

export interface Comissao {
    id: number;
    periodo_sessao_id: number;
    nome: string;
    descricao?: string;
    membros?: MembroComissao[];
}

export interface MembroComissao {
    id?: number;
    comissao_id: number;
    agente_publico_id: number;
    cargo: "Presidente" | "Relator" | "Membro";
    agente?: { // Optional for UI display
        nome_completo: string;
        foto_url: string;
    };
}

export async function getComissoesByPeriodo(periodoId: number) {
    const { data, error } = await supabase
        .from("comissoes")
        .select(`
      id,
      nome,
      descricao,
      periodo_sessao_id,
      membros:comissaomembros (
        id,
        comissao_id,
        cargo,
        agente_publico_id
      )
    `)
        .eq("periodo_sessao_id", periodoId);

    if (error) throw error;
    return data;
}

export async function createComissao(periodoId: number, nome: string, descricao: string) {
    const { data, error } = await supabase
        .from("comissoes")
        .insert({ periodo_sessao_id: periodoId, nome, descricao })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateComissao(id: number, nome: string, descricao: string) {
    const { data, error } = await supabase
        .from("comissoes")
        .update({ nome, descricao })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteComissao(id: number) {
    const { error } = await supabase
        .from("comissoes")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function updateMembrosComissao(comissaoId: number, membros: { cargo: MembroComissao['cargo']; agente_publico_id: number }[]) {
    // First, remove existing members
    const { error: deleteError } = await supabase
        .from("comissaomembros")
        .delete()
        .eq("comissao_id", comissaoId);

    if (deleteError) throw deleteError;

    // Insert new members
    const membrosToInsert = membros.map(m => ({
        comissao_id: comissaoId,
        agente_publico_id: m.agente_publico_id,
        cargo: m.cargo
    }));

    const { data, error } = await supabase
        .from("comissaomembros")
        .insert(membrosToInsert as any)
        .select();

    if (error) throw error;
    return data;
}
