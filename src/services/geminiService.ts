import { supabase } from "@/lib/supabaseClient";

/**
 * Fazer pergunta ao Regimentus via Edge Function (SEGURO)
 * A chave da API fica protegida no servidor
 */
export async function askRegimentus(pergunta: string) {
    try {
        // Obter token de autenticação
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            throw new Error("Usuário não autenticado");
        }

        // Chamar Edge Function (nome em pt-BR)
        const { data, error } = await supabase.functions.invoke('perguntar-regimentus', {
            body: { pergunta }
        });

        if (error) {
            console.error("Erro na Edge Function:", error);
            throw new Error(error.message || "Erro ao processar pergunta");
        }

        if (data.erro) {
            throw new Error(data.erro);
        }

        return {
            resposta: data.resposta,
            chunks_usados: data.chunks_usados || [],
            conversa_salva: data.conversa_salva
        };

    } catch (error: any) {
        console.error("Erro ao perguntar ao Regimentus:", error);
        throw error;
    }
}
