import { supabase } from "@/lib/supabaseClient";

export interface Licenca {
    titular_id: number;
    suplente_id: number;
    data_inicio: string;
    data_retorno?: string;
}

/**
 * Cria uma licença:
 * - Afasta o titular (data_afastamento)
 * - Marca suplente como em exercício temporário
 */
export async function createLicenca(
    legislaturaId: number,
    titularId: number,
    suplenteId: number,
    dataInicio: string
) {
    try {


        // 1. Atualizar titular - marcar como afastado
        const { data: titularUpdated, error: errorTitular } = await supabase
            .from("legislaturavereadores")
            .update({
                data_afastamento: dataInicio,
                data_retorno: null // Fica em aberto
            })
            .eq("legislatura_id", legislaturaId)
            .eq("agente_publico_id", titularId)
            .select();

        if (errorTitular) throw errorTitular;
        if (!titularUpdated || titularUpdated.length === 0) {
            throw new Error(`Titular não encontrado para atualização (Leg: ${legislaturaId}, Agente: ${titularId})`);
        }

        // 2. Atualizar suplente - marcar como em exercício
        const { data: suplenteData } = await supabase
            .from("legislaturavereadores")
            .select("data_posse")
            .eq("legislatura_id", legislaturaId)
            .eq("agente_publico_id", suplenteId)
            .single();

        const updates: any = {
            data_afastamento: null, // Ativa o suplente
            data_retorno: null
        };

        // Se nunca tomou posse, define posse agora
        if (!suplenteData?.data_posse) {
            updates.data_posse = dataInicio;
        }

        const { data: suplenteUpdated, error: errorSuplente } = await supabase
            .from("legislaturavereadores")
            .update(updates)
            .eq("legislatura_id", legislaturaId)
            .eq("agente_publico_id", suplenteId)
            .select();

        if (errorSuplente) throw errorSuplente;
        if (!suplenteUpdated || suplenteUpdated.length === 0) {
            throw new Error(`Suplente não encontrado para atualização (Leg: ${legislaturaId}, Agente: ${suplenteId})`);
        }

        return { success: true };
    } catch (error) {
        console.error("Erro ao criar licença:", error);
        throw error;
    }
}

/**
 * Encerra uma licença:
 * - Define data_retorno do titular
 * - Retorna suplente para condição original
 */
export async function encerrarLicenca(
    legislaturaId: number,
    titularId: number,
    suplenteId: number,
    dataRetorno: string
) {
    try {
        // 1. Atualizar titular - definir data de retorno
        const { error: errorTitular } = await supabase
            .from("legislaturavereadores")
            .update({
                data_retorno: dataRetorno,
                data_afastamento: null // Volta ao exercício
            })
            .eq("legislatura_id", legislaturaId)
            .eq("agente_publico_id", titularId);

        if (errorTitular) throw errorTitular;

        // 2. Atualizar suplente - volta para suplência
        const { error: errorSuplente } = await supabase
            .from("legislaturavereadores")
            .update({
                data_afastamento: dataRetorno // Marca quando deixou o exercício
            })
            .eq("legislatura_id", legislaturaId)
            .eq("agente_publico_id", suplenteId);

        if (errorSuplente) throw errorSuplente;

        return { success: true };
    } catch (error) {
        console.error("Erro ao encerrar licença:", error);
        throw error;
    }
}

/**
 * Busca titulares disponíveis para licença
 * (titulares em exercício que não estão afastados)
 */
export async function getTitularesDisponiveis(legislaturaId: number) {
    console.log("Buscando titulares para legislatura:", legislaturaId);

    const { data, error } = await supabase
        .from("legislaturavereadores")
        .select(`
      agente_publico_id,
      condicao,
      data_afastamento,
      agente:agentespublicos (
        nome_completo,
        foto_url
      )
    `)
        .eq("legislatura_id", legislaturaId)
        .eq("condicao", "Titular");

    if (error) {
        console.error("Erro query titulares:", error);
        throw error;
    }

    // Filtar no cliente para garantir lógica igual ao frontend
    // Titular está disponível se data_afastamento for null ou futura
    const docNow = new Date().toISOString().split('T')[0];

    const disponiveis = data?.filter(v => {
        if (!v.data_afastamento) return true; // Sem data = Ativo
        return v.data_afastamento > docNow; // Data futura = Ainda ativo
    }) || [];

    console.log("Todos titulares:", data);
    console.log("Titulares disponíveis:", disponiveis);

    return disponiveis;
}

/**
 * Busca suplentes disponíveis para assumir
 * (suplentes que não estão em exercício)
 */
export async function getSuplentesDisponiveis(legislaturaId: number) {
    console.log("Buscando suplentes para legislatura:", legislaturaId);

    const { data, error } = await supabase
        .from("legislaturavereadores")
        .select(`
      agente_publico_id,
      condicao,
      data_afastamento,
      data_posse,
      agente:agentespublicos (
        nome_completo,
        foto_url
      )
    `)
        .eq("legislatura_id", legislaturaId)
        .eq("condicao", "Suplente");

    if (error) {
        console.error("Erro query suplentes:", error);
        throw error;
    }

    // Filtar no cliente para garantir lógica igual ao frontend
    // Suplente está disponível se NÃO estiver em exercício
    // Em Exercicio = data_posse <= hoje AND (data_afastamento null ou futura)
    const docNow = new Date().toISOString().split('T')[0];

    const disponiveis = data?.filter(v => {
        const isEmExercicio =
            (v.data_posse && v.data_posse <= docNow) &&
            (!v.data_afastamento || v.data_afastamento > docNow);

        return !isEmExercicio;
    }) || [];

    console.log("Todos suplentes:", data);
    console.log("Suplentes disponíveis:", disponiveis);

    return disponiveis;
}
