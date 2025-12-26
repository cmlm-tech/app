// src/services/parecerService.ts
// Serviço para gerenciar pareceres e adicionar automaticamente à pauta

import { supabase } from "@/lib/supabaseClient";

/**
 * Adiciona parecer finalizado e sua matéria referenciada à Ordem do Dia da próxima sessão
 * @param parecerDocumentoId - ID do documento do parecer
 * @param materiaDocumentoId - ID do documento da matéria referenciada
 */
export async function adicionarParecerProximaSessao(
    parecerDocumentoId: number,
    materiaDocumentoId: number
): Promise<void> {
    try {
        // 1. Buscar próxima sessão agendada
        const { data: proximaSessao, error: sessaoError } = await supabase
            .from("sessoes")
            .select("id")
            .eq("status", "Agendada")
            .order("numero", { ascending: true })
            .limit(1)
            .single();

        if (sessaoError || !proximaSessao) {
            console.log("Nenhuma sessão agendada encontrada para vincular parecer");
            return;
        }

        // 2. Verificar se já existe na pauta
        const { data: jaExiste } = await supabase
            .from("sessaopauta")
            .select("id")
            .eq("sessao_id", proximaSessao.id)
            .in("documento_id", [parecerDocumentoId, materiaDocumentoId]);

        if (jaExiste && jaExiste.length > 0) {
            console.log("Parecer ou matéria já está na pauta");
            return;
        }

        // 3. Buscar última ordem na Ordem do Dia
        const { data: ultimaOrdem } = await supabase
            .from("sessaopauta")
            .select("ordem")
            .eq("sessao_id", proximaSessao.id)
            .eq("tipo_item", "Ordem do Dia")
            .order("ordem", { ascending: false })
            .limit(1)
            .single();

        const proximaOrdem = (ultimaOrdem?.ordem || 0) + 1;

        // 4. Adicionar parecer e matéria sequencialmente
        const itensParaAdicionar = [
            {
                sessao_id: proximaSessao.id,
                documento_id: parecerDocumentoId,
                tipo_item: "Ordem do Dia",
                ordem: proximaOrdem,
                status_item: "Pendente",
            },
            {
                sessao_id: proximaSessao.id,
                documento_id: materiaDocumentoId,
                tipo_item: "Ordem do Dia",
                ordem: proximaOrdem + 1,
                status_item: "Pendente",
            }
        ];

        const { error: insertError } = await supabase
            .from("sessaopauta")
            .insert(itensParaAdicionar as any);

        if (insertError) {
            console.error("Erro ao adicionar parecer à pauta:", insertError);
        } else {
            console.log(`Parecer e matéria adicionados à sessão ${proximaSessao.id} (ordens ${proximaOrdem} e ${proximaOrdem + 1})`);
        }
    } catch (error) {
        console.error("Erro em adicionarParecerProximaSessao:", error);
    }
}
