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
    requer_votacao_secreta?: boolean;
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
const STATUS_ELEGIVEIS: ("Protocolado" | "Tramitando" | "Emitido")[] = ["Protocolado", "Tramitando", "Emitido"];

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
            data_protocolo,
            status,
            tiposdedocumento ( nome ),
            protocolos!documentos_protocolo_id_fkey ( numero ),
            documentoautores ( autor_id, papel ),
            oficios ( numero_oficio, assunto ),
            projetosdelei ( numero_lei, ementa ),
            requerimentos ( numero_requerimento, justificativa ),
            mocoes ( numero_mocao, ementa ),
            indicacoes ( numero_indicacao, ementa ),
            projetosdedecretolegislativo ( numero_decreto, ementa ),
            pareceres:pareceres!pareceres_documento_id_fkey ( id, corpo_texto, comissoes ( nome ) ),
            requer_votacao_secreta
        `)
        .in("status", STATUS_ELEGIVEIS as any)
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
            } else if (doc.pareceres?.[0]) {
                // Para pareceres, usamos um trecho do corpo do texto como ementa
                const corpo = doc.pareceres[0].corpo_texto || "";
                ementa = corpo.substring(0, 100) + (corpo.length > 100 ? "..." : "");
                numeroMateria = doc.pareceres[0].id; // Parecer usa ID interno
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
            } else if (doc?.pareceres?.[0]?.comissoes?.nome) {
                nomeAutor = doc.pareceres[0].comissoes.nome;
            }

            // Nome do Tipo
            const tipo = doc.tiposdedocumento?.nome || "Documento";

            // Formatar identificador da matéria (usar número específico ou protocolo como fallback)
            const numero = numeroMateria || ((doc as any).protocolos?.numero || 'Rascunho');
            const numeroFormatado = typeof numero === 'number' ? String(numero).padStart(3, '0') : numero;
            const protocolo = `${tipo} ${numeroFormatado}/${doc.ano}`;

            return {
                id: doc.id,
                protocolo,
                tipo,
                ementa: ementa || "",
                autor: nomeAutor,
                status: doc.status,
                dataProtocolo: doc.data_protocolo,
                requer_votacao_secreta: doc.requer_votacao_secreta,
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
                status,
                tiposdedocumento ( nome ),
                protocolos!documentos_protocolo_id_fkey ( numero ),
                documentoautores ( autor_id ),
                oficios ( assunto ),
                projetosdelei ( ementa ),
                requerimentos ( justificativa ),
                mocoes ( ementa ),
                indicacoes ( ementa ),
                projetosdedecretolegislativo ( ementa ),
                pareceres:pareceres!pareceres_documento_id_fkey ( id, corpo_texto, comissoes ( nome ) ),
                atas:atas!atas_documento_id_fkey ( resumo_pauta, texto, sessao_id, sessoes:sessoes!atas_sessao_id_fkey ( numero, tipo_sessao ) )
            )
        `)
        .eq("sessao_id", sessaoId)
        .order("ordem", { ascending: true });

    if (error) throw error;

    // Buscar membros da mesa diretora para Atas (ordem de prioridade)
    // Ordem: 1º Secretário > 2º Secretário > 1º Tesoureiro > 2º Tesoureiro
    const CARGOS_PRIORIDADE = [
        "1º Secretário",
        "2º Secretário",
        "1º Tesoureiro",
        "2º Tesoureiro"
    ];

    const { data: membrosMesa } = await (supabase as any)
        .from("mesadiretoramembros")
        .select(`
            cargo,
            agentespublicos ( id, nome_completo ),
            mesasdiretoras!inner ( periodo_sessao_id )
        `)
        .in("cargo", CARGOS_PRIORIDADE);

    // Função para encontrar membro por prioridade de cargo
    function encontrarMembroPorPrioridade(membros: any[]): string {
        for (const cargoAlvo of CARGOS_PRIORIDADE) {
            const membro = membros.find((m: any) => m.cargo === cargoAlvo);
            if (membro?.agentespublicos?.nome_completo) {
                return membro.agentespublicos.nome_completo;
            }
        }
        return "Secretário";
    }


    return (data || []).map((item: any) => {
        const doc = item.documentos;
        const tipo = doc?.tiposdedocumento?.nome || "Documento";

        // Tratamento especial para Atas

        if (tipo === "Ata" && doc?.atas) {
            const ataData = doc.atas; // É objeto único, não array!
            const sessaoAta = ataData.sessoes;
            const numeroSessao = sessaoAta?.numero || "?";
            const tipoSessao = sessaoAta?.tipo_sessao || "Ordinária";

            // Buscar membro da mesa por ordem de prioridade
            const nomeAutor = encontrarMembroPorPrioridade(membrosMesa || []);

            return {
                id: item.id,
                sessao_id: item.sessao_id,
                documento_id: item.documento_id,
                ordem: item.ordem || 0,
                tipo_item: item.tipo_item || "Expediente",
                status_item: item.status_item || "Pendente",
                documento: {
                    id: doc.id,
                    protocolo: `Ata da ${numeroSessao}ª Sessão ${tipoSessao}/${doc.ano}`,
                    tipo: "Ata",
                    ementa: ataData.resumo_pauta || "Ata da sessão anterior",
                    autor: nomeAutor,
                },
            };
        }

        // Tratamento para outros tipos de documento
        let ementa = "";
        let numeroMateria: number | null = null;
        if (doc?.oficios?.[0]) {
            ementa = doc.oficios[0].assunto;
            numeroMateria = doc.oficios[0].numero_oficio;
        } else if (doc?.projetosdelei?.[0]) {
            ementa = doc.projetosdelei[0].ementa;
            numeroMateria = doc.projetosdelei[0].numero_lei;
        } else if (doc?.requerimentos?.[0]) {
            ementa = doc.requerimentos[0].justificativa;
            numeroMateria = doc.requerimentos[0].numero_requerimento;
        } else if (doc?.mocoes?.[0]) {
            ementa = doc.mocoes[0].ementa;
            numeroMateria = doc.mocoes[0].numero_mocao;
        } else if (doc?.indicacoes?.[0]) {
            ementa = doc.indicacoes[0].ementa;
            numeroMateria = doc.indicacoes[0].numero_indicacao;
        } else if (doc?.projetosdedecretolegislativo?.[0]) {
            ementa = doc.projetosdedecretolegislativo[0].ementa;
            numeroMateria = doc.projetosdedecretolegislativo[0].numero_decreto;
        } else if (doc?.pareceres?.[0]) {
            const corpo = doc.pareceres[0].corpo_texto || "";
            ementa = corpo.substring(0, 100) + (corpo.length > 100 ? "..." : "");
            numeroMateria = doc.pareceres[0].id;
        }

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
        } else if (doc?.pareceres?.[0]?.comissoes?.nome) {
            nomeAutor = doc.pareceres[0].comissoes.nome;
        }

        // Formatar identificador da matéria (usar número específico ou protocolo como fallback)
        const numero = numeroMateria || ((doc as any)?.protocolos?.numero || 'Rascunho');
        const numeroFormatado = typeof numero === 'number' ? String(numero).padStart(3, '0') : numero;
        const protocolo = doc ? `${tipo} ${numeroFormatado}/${doc.ano}` : "Documento";

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
 * Remover item da pauta (com cascata para parecer/matéria relacionados)
 * Se remover um parecer, remove também a matéria relacionada
 * Se remover uma matéria que tem parecer na pauta, remove também o parecer
 */
export async function removerItemPauta(itemId: number): Promise<void> {
    // 1. Buscar dados do item a ser removido
    const { data: itemRemover, error: fetchError } = await supabase
        .from("sessaopauta")
        .select(`
            id,
            sessao_id,
            documento_id,
            documentos (
                id,
                tiposdedocumento ( nome )
            )
        `)
        .eq("id", itemId)
        .single();

    if (fetchError) throw fetchError;
    if (!itemRemover) throw new Error("Item não encontrado");

    const sessaoId = itemRemover.sessao_id;
    const docId = itemRemover.documento_id;
    const tipoDoc = (itemRemover as any).documentos?.tiposdedocumento?.nome;

    // 2. Verificar se é parecer ou matéria com parecer relacionado
    let idsParaRemover = [itemId];

    if (tipoDoc === "Parecer") {
        // É um parecer - buscar a matéria relacionada
        const { data: parecer } = await supabase
            .from("pareceres")
            .select("materia_documento_id")
            .eq("documento_id", docId)
            .maybeSingle();

        if (parecer?.materia_documento_id) {
            // Buscar item da pauta que contém a matéria relacionada
            const { data: itemMateria } = await supabase
                .from("sessaopauta")
                .select("id")
                .eq("sessao_id", sessaoId)
                .eq("documento_id", parecer.materia_documento_id)
                .maybeSingle();

            if (itemMateria) {
                idsParaRemover.push(itemMateria.id);
            }
        }
    } else {
        // Não é parecer - verificar se existe parecer relacionado a esta matéria
        const { data: parecer } = await supabase
            .from("pareceres")
            .select("documento_id")
            .eq("materia_documento_id", docId)
            .maybeSingle();

        if (parecer?.documento_id) {
            // Buscar item da pauta que contém o parecer relacionado
            const { data: itemParecer } = await supabase
                .from("sessaopauta")
                .select("id")
                .eq("sessao_id", sessaoId)
                .eq("documento_id", parecer.documento_id)
                .maybeSingle();

            if (itemParecer) {
                idsParaRemover.push(itemParecer.id);
            }
        }
    }

    // 3. Remover todos os itens identificados
    const { error } = await supabase
        .from("sessaopauta")
        .delete()
        .in("id", idsParaRemover);

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

/**
 * Adicionar automaticamente a ata da sessão anterior ao Expediente
 * Chamado quando a pauta é acessada pela primeira vez
 */
export async function adicionarAtaSessaoAnterior(sessaoId: number): Promise<boolean> {
    try {
        // 1. Verificar se já existe item no Expediente
        const { data: itensExpediente } = await supabase
            .from("sessaopauta")
            .select("id")
            .eq("sessao_id", sessaoId)
            .eq("tipo_item", "Expediente");

        // Se já tem itens, não adicionar
        if (itensExpediente && itensExpediente.length > 0) {
            return false;
        }

        // 2. Buscar dados da sessão atual
        const { data: sessaoAtual } = await supabase
            .from("sessoes")
            .select("data_abertura, periodossessao!inner(legislatura_id)")
            .eq("id", sessaoId)
            .single();

        if (!sessaoAtual) return false;

        const legislaturaId = (sessaoAtual as any).periodossessao?.legislatura_id;
        if (!legislaturaId) return false;

        // 3. Buscar sessão anterior (mesma legislatura, status Realizada, data anterior)
        const { data: sessaoAnterior } = await supabase
            .from("sessoes")
            .select(`
                id,
                periodossessao!inner(legislatura_id)
            `)
            .eq("periodossessao.legislatura_id", legislaturaId)
            .eq("status", "Realizada")
            .lt("data_abertura", sessaoAtual.data_abertura)
            .order("data_abertura", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!sessaoAnterior) return false;

        // 4. Buscar ata da sessão anterior
        const { data: ata } = await supabase
            .from("atas")
            .select("documento_id")
            .eq("sessao_id", sessaoAnterior.id)
            .maybeSingle();

        if (!ata?.documento_id) return false;

        // 5. Adicionar ata ao Expediente (ordem 1)
        const { error } = await supabase
            .from("sessaopauta")
            .insert({
                sessao_id: sessaoId,
                documento_id: ata.documento_id,
                ordem: 1,
                tipo_item: "Expediente",
                status_item: "Pendente",
            });

        if (error) throw error;

        return true; // Ata adicionada com sucesso

    } catch (error) {
        console.error("Erro ao adicionar ata da sessão anterior:", error);
        return false;
    }
}

/**
 * Adicionar automaticamente pareceres emitidos e suas matérias relacionadas à Ordem do Dia
 * Chamado quando a pauta é acessada pela primeira vez
 * Retorna o número de itens adicionados
 */
export async function adicionarPareceresEmitidos(sessaoId: number): Promise<number> {
    try {
        // 1. Buscar IDs de documentos já em qualquer pauta ativa
        const { data: pautasAtivas } = await supabase
            .from("sessaopauta")
            .select(`
                documento_id,
                sessoes!inner (id, status)
            `)
            .in("sessoes.status", ["Agendada", "Em Andamento"]);

        const idsEmPauta = new Set(
            (pautasAtivas || []).map((p: any) => p.documento_id)
        );

        // 2. Buscar pareceres com status "Emitido" que ainda não estão em pauta
        const { data: pareceresEmitidos, error } = await supabase
            .from("pareceres")
            .select(`
                id,
                documento_id,
                materia_documento_id,
                resultado,
                documentos!pareceres_documento_id_fkey (
                    status
                )
            `)
            .eq("documentos.status", "Emitido");

        if (error) throw error;
        if (!pareceresEmitidos || pareceresEmitidos.length === 0) return 0;

        // 3. Filtrar apenas os que ainda não estão em pauta
        const pareceresParaAdicionar = pareceresEmitidos.filter(
            (p: any) => !idsEmPauta.has(p.documento_id) && !idsEmPauta.has(p.materia_documento_id)
        );

        if (pareceresParaAdicionar.length === 0) return 0;

        // 4. Buscar maior ordem atual na pauta
        const { data: ultimoItem } = await supabase
            .from("sessaopauta")
            .select("ordem")
            .eq("sessao_id", sessaoId)
            .order("ordem", { ascending: false })
            .limit(1)
            .maybeSingle();

        let ordemAtual = (ultimoItem?.ordem || 0) + 1;

        // 5. Adicionar parecer + matéria relacionada para cada um
        const itensParaInserir: any[] = [];

        for (const parecer of pareceresParaAdicionar) {
            // Adicionar parecer
            itensParaInserir.push({
                sessao_id: sessaoId,
                documento_id: (parecer as any).documento_id,
                ordem: ordemAtual++,
                tipo_item: "Ordem do Dia",
                status_item: "Pendente",
            });

            // Adicionar matéria relacionada logo abaixo
            itensParaInserir.push({
                sessao_id: sessaoId,
                documento_id: (parecer as any).materia_documento_id,
                ordem: ordemAtual++,
                tipo_item: "Ordem do Dia",
                status_item: "Pendente",
            });
        }

        // 6. Inserir todos os itens
        const { error: insertError } = await supabase
            .from("sessaopauta")
            .insert(itensParaInserir);

        if (insertError) throw insertError;

        return itensParaInserir.length;

    } catch (error) {
        console.error("Erro ao adicionar pareceres emitidos:", error);
        return 0;
    }
}
