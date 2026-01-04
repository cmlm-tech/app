import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

type Partido = Database['public']['Tables']['partidos']['Row'];
type PartidoInsert = Database['public']['Tables']['partidos']['Insert'];

export interface PartidoCompleto extends Partido {
    // Campos adicionais se necessário
}

/**
 * Busca todos os partidos ativos
 */
export async function getPartidos(apenasAtivos = true) {
    let query = supabase
        .from('partidos')
        .select('*')
        .order('sigla', { ascending: true });

    if (apenasAtivos) {
        query = query.eq('ativo', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Erro ao buscar partidos:', error);
        throw error;
    }

    return data;
}

/**
 * Busca um partido específico por ID
 */
export async function getPartidoById(id: number) {
    const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Erro ao buscar partido ${id}:`, error);
        throw error;
    }

    return data;
}

/**
 * Busca um partido específico por sigla
 */
export async function getPartidoBySigla(sigla: string) {
    const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .eq('sigla', sigla.toUpperCase())
        .single();

    if (error) {
        console.error(`Erro ao buscar partido ${sigla}:`, error);
        throw error;
    }

    return data;
}

/**
 * Criar um novo partido (apenas admin)
 */
export async function createPartido(partido: PartidoInsert) {
    const { data, error } = await supabase
        .from('partidos')
        .insert({
            ...partido,
            sigla: partido.sigla.toUpperCase(), // Garantir que sigla é maiúscula
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar partido:', error);
        throw error;
    }

    return data;
}

/**
 * Atualizar um partido existente (apenas admin)
 */
export async function updatePartido(id: number, updates: Partial<PartidoInsert>) {
    const { data, error } = await supabase
        .from('partidos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`Erro ao atualizar partido ${id}:`, error);
        throw error;
    }

    return data;
}

/**
 * Desativar um partido (soft delete - não remove do banco)
 */
export async function deactivatePartido(id: number) {
    return updatePartido(id, { ativo: false });
}

/**
 * Reativar um partido
 */
export async function reactivatePartido(id: number) {
    return updatePartido(id, { ativo: true });
}
