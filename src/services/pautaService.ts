/**
 * Serviço de Gerenciamento de Pautas
 * 
 * Gerencia a montagem e organização da pauta de uma sessão legislativa
 */

import { supabase } from "@/lib/supabaseClient";

// Types
export interface MateriaDisponivel {
    id: number;
    protocolo: string;
    tipo: string;
    ementa: string;
    autor: string;
    status: string;
    dataProtocolo: string;
}

export interface ItemPauta {
    id: number;
    sessao_id: number;
    documento_id: number;
    ordem: number;
    tipo_item: TipoItemPauta;
    status_item: string;
    documento?: {
        id: number;
        protocolo: string;
        tipo: string;
        ementa: string;
        autor: string;
    };
}

export type TipoItemPauta = "Expediente" | "Ordem do Dia" | "Explicações Pessoais";

export interface ItemPautaInput {
    documento_id: number;
    ordem: number;
    tipo_item: TipoItemPauta;
}

// Status elegíveis para entrar em pauta (valores do enum status_documento)
const STATUS_ELEGIVEIS: ("Protocolado" | "Tramitando")[] = ["Protocolado", "Tramitando"];

/**
 * Buscar matérias disponíveis para adicionar à pauta
 * Exclui matérias já em pautas de sessões ativas
 */
export async function getMateriasDisponiveis(sessaoId: number): Promise<MateriaDisponivel[]> {
    // 1. Buscar IDs de documentos já em pautas de sessões ativas
    const { data: pautasAtivas } = await supabase
        .from("sessaopauta")
        .select(`
            documento_id,
            sessoes!inner (
                id,
                status
            )
        `)
        .in("sessoes.status", ["Agendada", "Em Andamento"]);

    const idsEmPauta = new Set(
        (pautasAtivas || [])
            .filter((p: any) => p.sessoes?.id !== sessaoId) // Permite editar pauta da própria sessão
            .map((p: any) => p.documento_id)
    );

    // 2. Buscar Agentes e Comissões para resolver autores
    const { data: agentes } = await supabase.from("agentespublicos").select("id, nome_completo");
    const { data: comissoes } = await supabase.from("comissoes").select("id, nome");

    const agentesMap = new Map((agentes || []).map((a: any) => [a.id, a.nome_completo]));
    const comissoesMap = new Map((comissoes || []).map((c: any) => [c.id, c.nome]));

    // 3. Buscar documentos elegíveis
    const { data: documentos, error } = await supabase
        .from("documentos")
        .select(`
            id,
            ano,
            numero_protocolo_geral,
            data_protocolo,
            status,
            tiposdedocumento ( nome ),
            documentoautores ( autor_id, papel ),
            oficios ( numero_oficio, assunto ),
            projetosdelei ( numero_lei, ementa ),
            requerimentos ( numero_requerimento, justificativa ),
            mocoes ( numero_mocao, ementa ),
            indicacoes ( numero_indicacao, ementa ),
            projetosdedecretolegislativo ( numero_decreto, ementa )
        `)
        .in("status", STATUS_ELEGIVEIS)
        .order("data_protocolo", { ascending: false });

    if (error) throw error;

    // 4. Filtrar e mapear
    const materias: MateriaDisponivel[] = (documentos || [])
        .filter((doc: any) => !idsEmPauta.has(doc.id))
        .map((doc: any) => {
            // Determinar ementa/resumo e número baseado no tipo
            let ementa = "";
            let numeroMateria: number | null = null;

            if (doc.oficios?.[0]) {
                ementa = doc.oficios[0].assunto;
                numeroMateria = doc.oficios[0].numero_oficio;
            } else if (doc.projetosdelei?.[0]) {
                ementa = doc.projetosdelei[0].ementa;
                numeroMateria = doc.projetosdelei[0].numero_lei;
            } else if (doc.requerimentos?.[0]) {
                ementa = doc.requerimentos[0].justificativa;
                numeroMateria = doc.requerimentos[0].numero_requerimento;
            } else if (doc.mocoes?.[0]) {
                ementa = doc.mocoes[0].ementa;
                numeroMateria = doc.mocoes[0].numero_mocao;
            } else if (doc.indicacoes?.[0]) {
                ementa = doc.indicacoes[0].ementa;
                numeroMateria = doc.indicacoes[0].numero_indicacao;
            } else if (doc.projetosdedecretolegislativo?.[0]) {
                ementa = doc.projetosdedecretolegislativo[0].ementa;
                numeroMateria = doc.projetosdedecretolegislativo[0].numero_decreto;
            }

            // Nome do Autor
            const autorRel = doc.documentoautores?.[0];
            let nomeAutor = "Sem Autor";
            if (autorRel) {
                const { autor_id } = autorRel;
                if (comissoesMap.has(autor_id)) {
                    nomeAutor = comissoesMap.get(autor_id)!;
                } else if (agentesMap.has(autor_id)) {
                    nomeAutor = agentesMap.get(autor_id)!;
                }
            }

            // Nome do Tipo
            const tipo = doc.tiposdedocumento?.nome || "Documento";

            // Formatar identificador da matéria (usar número específico ou protocolo como fallback)
            const numero = numeroMateria || doc.numero_protocolo_geral;
            const numeroFormatado = String(numero).padStart(3, '0');
            const protocolo = `${tipo} ${numeroFormatado}/${doc.ano}`;

            return {
                id: doc.id,
                protocolo,
                tipo,
                ementa: ementa || "",
                autor: nomeAutor,
                status: doc.status,
                dataProtocolo: doc.data_protocolo,
            };
        });

    return materias;
}

/**
 * Buscar itens da pauta de uma sessão
 */
export async function getItensPauta(sessaoId: number): Promise<ItemPauta[]> {
    // Buscar Agentes e Comissões para resolver autores
    const { data: agentes } = await supabase.from("agentespublicos").select("id, nome_completo");
    const { data: comissoes } = await supabase.from("comissoes").select("id, nome");

    const agentesMap = new Map((agentes || []).map((a: any) => [a.id, a.nome_completo]));
    const comissoesMap = new Map((comissoes || []).map((c: any) => [c.id, c.nome]));

    const { data, error } = await supabase
        .from("sessaopauta")
        .select(`
            *,
            documentos (
                id,
                ano,
                numero_protocolo_geral,
                status,
                tiposdedocumento ( nome ),
                documentoautores ( autor_id ),
                oficios ( assunto ),
                projetosdelei ( ementa ),
                requerimentos ( justificativa ),
                mocoes ( ementa ),
                indicacoes ( ementa ),
                projetosdedecretolegislativo ( ementa )
            )
        `)
        .eq("sessao_id", sessaoId)
        .order("ordem", { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => {
        const doc = item.documentos;

        // Determinar ementa
        let ementa = "";
        if (doc?.oficios?.[0]) ementa = doc.oficios[0].assunto;
        else if (doc?.projetosdelei?.[0]) ementa = doc.projetosdelei[0].ementa;
        else if (doc?.requerimentos?.[0]) ementa = doc.requerimentos[0].justificativa;
        else if (doc?.mocoes?.[0]) ementa = doc.mocoes[0].ementa;
        else if (doc?.indicacoes?.[0]) ementa = doc.indicacoes[0].ementa;
        else if (doc?.projetosdedecretolegislativo?.[0]) ementa = doc.projetosdedecretolegislativo[0].ementa;

        // Nome do Autor
        const autorRel = doc?.documentoautores?.[0];
        let nomeAutor = "Sem Autor";
        if (autorRel) {
            const { autor_id } = autorRel;
            if (comissoesMap.has(autor_id)) {
                nomeAutor = comissoesMap.get(autor_id)!;
            } else if (agentesMap.has(autor_id)) {
                nomeAutor = agentesMap.get(autor_id)!;
            }
        }

        const tipo = doc?.tiposdedocumento?.nome || "Documento";
        const protocolo = doc ? `${tipo} ${doc.numero_protocolo_geral}/${doc.ano}` : "Documento";

        return {
            id: item.id,
            sessao_id: item.sessao_id,
            documento_id: item.documento_id,
            ordem: item.ordem || 0,
            tipo_item: item.tipo_item || "Ordem do Dia",
            status_item: item.status_item || "Pendente",
            documento: doc ? {
                id: doc.id,
                protocolo,
                tipo,
                ementa: ementa || "",
                autor: nomeAutor,
            } : undefined,
        };
    });
}

/**
 * Adicionar documento à pauta
 */
export async function adicionarItemPauta(
    sessaoId: number,
    item: ItemPautaInput
): Promise<ItemPauta> {
    const { data, error } = await supabase
        .from("sessaopauta")
        .insert({
            sessao_id: sessaoId,
            documento_id: item.documento_id,
            ordem: item.ordem,
            tipo_item: item.tipo_item,
            status_item: "Pendente",
        })
        .select()
        .single();

    if (error) throw error;
    return data as ItemPauta;
}

/**
 * Remover item da pauta
 */
export async function removerItemPauta(itemId: number): Promise<void> {
    const { error } = await supabase
        .from("sessaopauta")
        .delete()
        .eq("id", itemId);

    if (error) throw error;
}

/**
 * Reordenar itens da pauta
 */
export async function reordenarPauta(
    sessaoId: number,
    itens: { id: number; ordem: number }[]
): Promise<void> {
    for (const item of itens) {
        const { error } = await supabase
            .from("sessaopauta")
            .update({ ordem: item.ordem })
            .eq("id", item.id)
            .eq("sessao_id", sessaoId);

        if (error) throw error;
    }
}

/**
 * Atualizar tipo de item (mudar de seção)
 */
export async function atualizarTipoItem(
    itemId: number,
    tipoItem: TipoItemPauta
): Promise<void> {
    const { error } = await supabase
        .from("sessaopauta")
        .update({ tipo_item: tipoItem })
        .eq("id", itemId);

    if (error) throw error;
}

/**
 * Salvar toda a pauta de uma vez (limpa e recria)
 * Útil quando o usuário faz muitas alterações e salva de uma vez
 */
export async function salvarPautaCompleta(
    sessaoId: number,
    itens: ItemPautaInput[]
): Promise<void> {
    // 1. Remover itens antigos
    const { error: deleteError } = await supabase
        .from("sessaopauta")
        .delete()
        .eq("sessao_id", sessaoId);

    if (deleteError) throw deleteError;

    // 2. Inserir novos itens
    if (itens.length > 0) {
        const novosItens = itens.map((item) => ({
            sessao_id: sessaoId,
            documento_id: item.documento_id,
            ordem: item.ordem,
            tipo_item: item.tipo_item,
            status_item: "Pendente",
        }));

        const { error: insertError } = await supabase
            .from("sessaopauta")
            .insert(novosItens);

        if (insertError) throw insertError;
    }
}

/**
 * Verificar se sessão permite edição de pauta
 * Só sessões "Agendada" e com pauta não publicada podem ser editadas
 */
export async function podeEditarPauta(sessaoId: number): Promise<boolean> {
    const { data, error } = await supabase
        .from("sessoes")
        .select("status, pauta_publicada")
        .eq("id", sessaoId)
        .single();

    if (error) return false;
    const sessao = data as any;
    // Pode editar se está agendada E pauta não foi publicada
    return sessao?.status === "Agendada" && !sessao?.pauta_publicada;
}

/**
 * Verificar se a pauta foi publicada
 */
export async function isPautaPublicada(sessaoId: number): Promise<{
    publicada: boolean;
    dataPublicacao?: string;
}> {
    const { data, error } = await supabase
        .from("sessoes")
        .select("pauta_publicada, data_publicacao_pauta")
        .eq("id", sessaoId)
        .single();

    if (error) return { publicada: false };
    const sessao = data as any;
    return {
        publicada: sessao?.pauta_publicada || false,
        dataPublicacao: sessao?.data_publicacao_pauta || undefined,
    };
}

/**
 * Publicar pauta da sessão
 * Marca a pauta como publicada e registra a data
 */
export async function publicarPauta(sessaoId: number): Promise<void> {
    // 1. Verificar se há itens na pauta
    const { count, error: countError } = await supabase
        .from("sessaopauta")
        .select("*", { count: "exact", head: true })
        .eq("sessao_id", sessaoId);

    if (countError) throw countError;
    if (!count || count === 0) {
        throw new Error("A pauta precisa ter pelo menos um item para ser publicada.");
    }

    // 2. Verificar se sessão está agendada
    const { data, error: sessaoError } = await supabase
        .from("sessoes")
        .select("status, pauta_publicada")
        .eq("id", sessaoId)
        .single();

    if (sessaoError) throw sessaoError;
    const sessao = data as any;
    if (sessao?.status !== "Agendada") {
        throw new Error("Só é possível publicar a pauta de sessões com status 'Agendada'.");
    }
    if (sessao?.pauta_publicada) {
        throw new Error("A pauta já foi publicada anteriormente.");
    }

    // 3. Publicar (usando type assertion para campos novos)
    const { error: updateError } = await supabase
        .from("sessoes")
        .update({
            pauta_publicada: true,
            data_publicacao_pauta: new Date().toISOString(),
        } as any)
        .eq("id", sessaoId);

    if (updateError) throw updateError;
}

/**
 * Despublicar pauta (permitir edição novamente)
 * Útil para correções antes da sessão iniciar
 */
export async function despublicarPauta(sessaoId: number): Promise<void> {
    const { error } = await supabase
        .from("sessoes")
        .update({
            pauta_publicada: false,
            data_publicacao_pauta: null,
        } as any)
        .eq("id", sessaoId);

    if (error) throw error;
}

