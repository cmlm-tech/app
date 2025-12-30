import { supabase } from "@/lib/supabaseClient";

export interface Destinatario {
    id: number;
    nome: string;
    cargo: string;
    orgao: string;
    ativo: boolean;
}

/**
 * Busca destinatários pelo termo digitado (nome, cargo ou órgão)
 */
export async function buscarDestinatarios(termo: string): Promise<Destinatario[]> {
    if (!termo || termo.length < 2) return [];

    const { data, error } = await supabase
        .from('destinatarios')
        .select('*')
        .eq('ativo', true)
        .or(`nome.ilike.%${termo}%,cargo.ilike.%${termo}%,orgao.ilike.%${termo}%`)
        .limit(10);

    if (error) {
        console.error('Erro ao buscar destinatários:', error);
        return [];
    }

    return data || [];
}

/**
 * Cria um novo destinatário
 */
export async function criarDestinatario(nome: string, cargo: string, orgao: string): Promise<Destinatario | null> {
    const { data, error } = await supabase
        .from('destinatarios')
        .insert({ nome, cargo, orgao })
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar destinatário:', error);
        return null;
    }

    return data;
}

/**
 * Lista todos destinatários ativos (para exibir opções padrão)
 */
export async function listarDestinatariosPadrao(): Promise<Destinatario[]> {
    const { data, error } = await supabase
        .from('destinatarios')
        .select('*')
        .eq('ativo', true)
        .limit(20);

    if (error) {
        console.error('Erro ao listar destinatários:', error);
        return [];
    }

    return data || [];
}

/**
 * Lista TODOS os destinatários (ativos e inativos) para o painel de gestão
 */
export async function listarTodosDestinatarios(): Promise<Destinatario[]> {
    const { data, error } = await supabase
        .from('destinatarios')
        .select('*')
        .order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao listar todos destinatários:', error);
        return [];
    }

    return data || [];
}

/**
 * Atualiza um destinatário existente
 */
export async function atualizarDestinatario(id: number, dados: Partial<Destinatario>): Promise<Destinatario | null> {
    // Remove ID do objeto de atualização para evitar conflito com tipagem do Supabase (id: never)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...dadosUpdate } = dados;

    const { data, error } = await supabase
        .from('destinatarios')
        .update(dadosUpdate)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar destinatário:', error);
        return null;
    }

    return data;
}

/**
 * Alterna o status (ativo/inativo)
 */
export async function toggleAtivoDestinatario(id: number, ativo: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('destinatarios')
        .update({ ativo })
        .eq('id', id);

    if (error) {
        console.error('Erro ao alterar status:', error);
        return false;
    }

    return true;
}
