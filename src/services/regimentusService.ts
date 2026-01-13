import { supabase } from "@/lib/supabaseClient";

// Interface para mensagens do chat
export interface RegimentusMessage {
    id: number;
    pergunta: string;
    resposta: string;
    chunks_usados: number[] | null;
    created_at: string;
}

// Interface para resumo de histórico
export interface RegimentusResumo {
    id: number;
    resumo: string;
    periodo_inicio: string;
    periodo_fim: string;
    num_conversas_comprimidas: number;
    created_at: string;
}

// Interface para chunks do regimento
export interface RegimentoChunk {
    id: number;
    titulo: string | null;
    conteudo: string;
    secao: string | null;
    artigo: string | null;
    metadata: any;
    created_at: string;
    updated_at: string;
}

/**
 * Buscar as últimas N conversas do chat
 */
export async function getRecentConversations(limit: number = 10) {
    const { data, error } = await supabase
        .from('regimentus_chat' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Erro ao buscar conversas:', error);
        throw error;
    }

    return (data as RegimentusMessage[]).reverse(); // Reverter para mostrar mais antiga primeiro
}

/**
 * Buscar resumo do histórico anterior
 */
export async function getLatestResumo() {
    const { data, error } = await supabase
        .from('regimentus_resumo_historico' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Erro ao buscar resumo:', error);
        throw error;
    }

    return data as RegimentusResumo | null;
}

/**
 * Salvar uma nova conversa
 */
export async function saveConversation(
    pergunta: string,
    resposta: string,
    chunksUsados: number[] = []
) {
    const { data, error } = await supabase
        .from('regimentus_chat' as any)
        .insert({
            pergunta,
            resposta,
            chunks_usados: chunksUsados.length > 0 ? chunksUsados : null
        } as any)
        .select()
        .single();

    if (error) {
        console.error('Erro ao salvar conversa:', error);
        throw error;
    }

    return data as RegimentusMessage;
}

/**
 * Contar total de conversas no histórico
 */
export async function countConversations() {
    const { count, error } = await supabase
        .from('regimentus_chat' as any)
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Erro ao contar conversas:', error);
        throw error;
    }

    return count || 0;
}

/**
 * Comprimir conversas antigas (quando passar de 10)
 * TODO: Implementar geração de resumo com Gemini
 */
export async function compressOldConversations() {
    const count = await countConversations();

    if (count <= 10) {
        return; // Ainda não precisa comprimir
    }

    // Buscar as conversas mais antigas (além das 10 recentes)
    const { data: oldConversations, error: fetchError } = await supabase
        .from('regimentus_chat' as any)
        .select('*')
        .order('created_at', { ascending: true })
        .limit(count - 10);

    if (fetchError || !oldConversations || oldConversations.length === 0) {
        return;
    }

    const conversations = oldConversations as RegimentusMessage[];

    // TODO: Gerar resumo com Gemini API
    const resumoTexto = `Resumo automático de ${conversations.length} conversas antigas.`;

    // Salvar resumo
    const { error: resumoError } = await supabase
        .from('regimentus_resumo_historico' as any)
        .insert({
            resumo: resumoTexto,
            periodo_inicio: conversations[0].created_at,
            periodo_fim: conversations[conversations.length - 1].created_at,
            num_conversas_comprimidas: conversations.length
        } as any);

    if (resumoError) {
        console.error('Erro ao salvar resumo:', resumoError);
        return;
    }

    // Deletar conversas antigas
    const idsToDelete = conversations.map(c => c.id);
    const { error: deleteError } = await supabase
        .from('regimentus_chat' as any)
        .delete()
        .in('id', idsToDelete);

    if (deleteError) {
        console.error('Erro ao deletar conversas antigas:', deleteError);
    }
}

/**
 * Buscar chunks do regimento por busca textual
 * (será usado quando implementarmos RAG)
 */
export async function searchRegimentoChunks(query: string, limit: number = 5) {
    const { data, error } = await supabase
        .from('regimento_chunks' as any)
        .select('*')
        .textSearch('conteudo', query, {
            type: 'websearch',
            config: 'portuguese'
        })
        .limit(limit);

    if (error) {
        console.error('Erro ao buscar chunks:', error);
        throw error;
    }

    return data as RegimentoChunk[];
}

/**
 * Adicionar chunk do regimento
 */
export async function addRegimentoChunk(chunk: Omit<RegimentoChunk, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('regimento_chunks' as any)
        .insert(chunk as any)
        .select()
        .single();

    if (error) {
        console.error('Erro ao adicionar chunk:', error);
        throw error;
    }

    return data as RegimentoChunk;
}

/**
 * Limpar todos os chunks do regimento (para reprocessar)
 */
export async function clearRegimentoChunks() {
    const { error } = await supabase
        .from('regimento_chunks' as any)
        .delete()
        .neq('id', 0); // Deletar todos

    if (error) {
        console.error('Erro ao limpar chunks:', error);
        throw error;
    }
}

/**
 * Contar chunks do regimento
 */
export async function countRegimentoChunks() {
    const { count, error } = await supabase
        .from('regimento_chunks' as any)
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Erro ao contar chunks:', error);
        throw error;
    }

    return count || 0;
}
