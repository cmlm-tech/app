
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
      periodo:periodossessao!inner (
        legislatura_id
      ),
      membros:comissaomembros (
        id,
        comissao_id,
        cargo,
        agente_publico_id,
        agente:agentespublicos (
          nome_completo,
          foto_url
        )
      )
    `)
        .eq("periodo_sessao_id", periodoId);

    if (error) throw error;
    if (!data) return [];

    // Buscar datas do período para verificar se é vigente
    const { data: periodoData } = await supabase
        .from("periodossessao")
        .select("data_inicio, data_fim")
        .eq("id", periodoId)
        .single();

    const isPeriodoVigente = periodoData &&
        new Date(periodoData.data_inicio) <= new Date() &&
        new Date(periodoData.data_fim) >= new Date();

    // APENAS aplicar substituição se for período vigente
    if (!isPeriodoVigente) {
        return data; // Retornar dados originais para períodos históricos
    }

    // Para cada comissão, verificar se algum membro está de licença e encontrar substituto
    const comissoesComSubstituicoes = await Promise.all(
        data.map(async (comissao) => {
            const agenteIds = comissao.membros?.map(m => m.agente_publico_id) || [];

            if (agenteIds.length === 0) return comissao;

            // Buscar informações de licença dos membros
            const { data: vereadoresInfo } = await supabase
                .from("legislaturavereadores")
                .select("agente_publico_id, data_afastamento, condicao, data_posse")
                .eq("legislatura_id", (comissao.periodo as any).legislatura_id);

            if (!vereadoresInfo) return comissao;

            // Processar cada membro
            const membrosProcessados = await Promise.all(
                (comissao.membros || []).map(async (membro) => {
                    const membroInfo = vereadoresInfo.find(v => v.agente_publico_id === membro.agente_publico_id);
                    const estaEmLicenca = membroInfo?.condicao === 'Titular' &&
                        membroInfo?.data_afastamento &&
                        new Date(membroInfo.data_afastamento) <= new Date();

                    if (estaEmLicenca) {
                        // Encontrar suplente em exercício (substituindo)
                        const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                        const suplenteSubstituto = vereadoresInfo.find(v =>
                            v.condicao === 'Suplente' &&
                            v.data_posse &&
                            v.data_posse <= todayStr &&
                            (!v.data_afastamento || v.data_afastamento > todayStr)
                        );

                        if (suplenteSubstituto) {
                            // Buscar dados do suplente
                            const { data: suplenteAgente } = await supabase
                                .from("agentespublicos")
                                .select("nome_completo, foto_url")
                                .eq("id", suplenteSubstituto.agente_publico_id)
                                .single();

                            return {
                                ...membro,
                                agente_publico_id: suplenteSubstituto.agente_publico_id,
                                agente: suplenteAgente || membro.agente,
                                substituindo: {
                                    agente_publico_id: membro.agente_publico_id,
                                    nome: membro.agente?.nome_completo
                                }
                            };
                        }
                    }

                    return membro;
                })
            );

            return {
                ...comissao,
                membros: membrosProcessados
            };
        })
    );

    return comissoesComSubstituicoes;
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
