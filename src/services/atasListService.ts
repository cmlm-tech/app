// src/services/atasListService.ts
// Service para buscar atas existentes para listagem

import { supabase } from "@/lib/supabaseClient";
import { Ata } from "@/components/atas/types";

/**
 * Busca todas as atas para exibição na TabelaAtas
 * Retorna dados formatados para o tipo Ata
 */
export async function getAtasParaListagem(): Promise<Ata[]> {
    // Buscar atas com dados da sessão relacionada
    const { data: atasData, error } = await (supabase as any)
        .from("atas")
        .select(`
            id,
            texto,
            resumo_pauta,
            sessao_id,
            documento_id,
            sessoes!inner (
                id,
                numero,
                tipo_sessao,
                data_abertura,
                status
            ),
            documentos (
                arquivo_pdf_url
            )
        `)
        .order("sessoes(data_abertura)", { ascending: false });

    if (error) {
        console.error("Erro ao buscar atas:", error);
        throw error;
    }

    if (!atasData || atasData.length === 0) {
        return [];
    }

    // Para cada ata, buscar contagens de presenças e matérias deliberadas
    const atasFormatadas: Ata[] = await Promise.all(
        atasData.map(async (ata: any) => {
            const sessao = ata.sessoes;
            const sessaoId = ata.sessao_id;

            // Contar presentes
            const { count: presentes } = await supabase
                .from("sessaopresenca")
                .select("*", { count: "exact", head: true })
                .eq("sessao_id", sessaoId)
                .eq("status", "Presente");

            // Contar matérias na pauta (itens da ordem do dia)
            const { count: materiasDeliberadas } = await supabase
                .from("sessaopauta")
                .select("*", { count: "exact", head: true })
                .eq("sessao_id", sessaoId);

            // Usar resumo_pauta do banco (já salvo) ou gerar fallback
            const resumoPauta = ata.resumo_pauta ||
                (ata.texto ? ata.texto.substring(0, 150).replace(/<[^>]*>/g, "") + "..." : "Ata sem conteúdo");

            const extractedUrl = (Array.isArray(ata.documentos) ? ata.documentos[0]?.arquivo_pdf_url : ata.documentos?.arquivo_pdf_url) || undefined;

            console.log(`[AtasList] Ata ID ${ata.id}:`, {
                documentos: ata.documentos,
                extractedUrl,
                isArray: Array.isArray(ata.documentos)
            });

            return {
                id: ata.id.toString(),
                numeroSessao: sessao.numero || 0,
                tipoSessao: sessao.tipo_sessao || "Ordinária",
                dataRealizacao: new Date(sessao.data_abertura),
                status: sessao.status || "Realizada",
                resumoPauta,
                materiasDeliberadas: materiasDeliberadas || 0,
                presentes: presentes || 0,
                linkPDF: extractedUrl,
            } as Ata;
        })
    );

    return atasFormatadas;
}
