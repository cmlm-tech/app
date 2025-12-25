/**
 * Serviço de Condução de Sessão
 * 
 * Gerencia presenças, pauta e votações durante uma sessão em andamento
 */

import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";

// Types
type StatusPresenca = Database["public"]["Enums"]["status_presenca"];
type VotoVereador = Database["public"]["Enums"]["voto_vereador"];

export interface Presenca {
    id: number;
    sessao_id: number;
    agente_publico_id: number;
    status: StatusPresenca;
    justificativa: string | null;
    vereador?: {
        id: number;
        nome_completo: string;
        nome_parlamentar?: string;
        foto_url?: string;
    };
}

export interface ItemPauta {
    id: number;
    sessao_id: number;
    documento_id: number;
    ordem: number;
    tipo_item: string;
    status_item: string;
    documento?: {
        id: number;
        numero_protocolo_geral: number;
        ano: number;
        status: string;
        tipo?: {
            nome: string;
            exige_parecer?: boolean;
        };
        pareceres?: {
            id: number;
            status: string;
            comissao: {
                nome: string;
            };
        }[];
    };
}

export interface VotoIndividual {
    id: number;
    sessao_id: number;
    documento_id: number;
    agente_publico_id: number;
    voto: VotoVereador;
    vereador?: {
        id: number;
        nome_completo: string;
        nome_parlamentar?: string;
    };
}

export interface ResultadoVotacao {
    id: number;
    sessao_id: number;
    documento_id: number;
    votos_sim: number;
    votos_nao: number;
    abstencoes: number;
    ausentes: number;
    resultado: string;
    voto_minerva_usado: boolean;
}

// ====================== PRESENÇAS ======================

/**
 * Buscar presenças de uma sessão com dados dos vereadores
 */
export async function getPresencas(sessaoId: number): Promise<Presenca[]> {
    const { data, error } = await supabase
        .from("sessaopresenca")
        .select(`
      *,
      vereador:agentespublicos (
        id,
        nome_completo,
        foto_url
      )
    `)
        .eq("sessao_id", sessaoId);

    if (error) throw error;

    // Buscar nome parlamentar separadamente
    const presencasComNomeParlamentar = await Promise.all(
        (data || []).map(async (p) => {
            const { data: vereadorData } = await supabase
                .from("vereadores")
                .select("nome_parlamentar")
                .eq("agente_publico_id", p.agente_publico_id)
                .single();

            return {
                ...p,
                vereador: {
                    ...p.vereador,
                    nome_parlamentar: vereadorData?.nome_parlamentar,
                },
            };
        })
    );

    return presencasComNomeParlamentar;
}

/**
 * Inicializar lista de presenças com todos os vereadores da legislatura
 */
export async function inicializarPresencas(sessaoId: number, periodoId: number): Promise<Presenca[]> {
    // Buscar legislatura do período
    const { data: periodo, error: periodoError } = await supabase
        .from("periodossessao")
        .select("legislatura_id")
        .eq("id", periodoId)
        .single();

    if (periodoError) throw periodoError;

    // Buscar vereadores da legislatura
    const { data: vereadores, error: vereadoresError } = await supabase
        .from("legislaturavereadores")
        .select(`
      agente_publico_id,
      agentespublicos:agente_publico_id (
        id,
        nome_completo
      )
    `)
        .eq("legislatura_id", periodo.legislatura_id);

    if (vereadoresError) throw vereadoresError;

    // Remover vereadores duplicados (mesmo agente_publico_id)
    const vereadoresUnicos = (vereadores || []).filter(
        (v, index, self) => self.findIndex((t) => t.agente_publico_id === v.agente_publico_id) === index
    );

    // Verificar se já existe presenças para esta sessão
    const { data: existentes } = await supabase
        .from("sessaopresenca")
        .select("agente_publico_id")
        .eq("sessao_id", sessaoId);

    const idsExistentes = new Set((existentes || []).map((e) => e.agente_publico_id));

    // Inserir apenas vereadores que ainda não têm registro
    const novosRegistros = vereadoresUnicos
        .filter((v) => !idsExistentes.has(v.agente_publico_id))
        .map((v) => ({
            sessao_id: sessaoId,
            agente_publico_id: v.agente_publico_id,
            status: "Ausente" as StatusPresenca,
        }));

    if (novosRegistros.length > 0) {
        const { error: insertError } = await supabase
            .from("sessaopresenca")
            .insert(novosRegistros);

        if (insertError) throw insertError;
    }

    return getPresencas(sessaoId);
}

/**
 * Atualizar presença de um vereador
 */
export async function atualizarPresenca(
    sessaoId: number,
    agentePublicoId: number,
    status: StatusPresenca,
    justificativa?: string
): Promise<void> {
    const { error } = await supabase
        .from("sessaopresenca")
        .update({
            status,
            justificativa: justificativa || null,
        })
        .eq("sessao_id", sessaoId)
        .eq("agente_publico_id", agentePublicoId);

    if (error) throw error;
}

/**
 * Calcular quorum da sessão
 */
export async function calcularQuorum(sessaoId: number): Promise<{
    totalVereadores: number;
    presentes: number;
    quorumMinimo: number;
    temQuorum: boolean;
}> {
    const presencas = await getPresencas(sessaoId);
    const totalVereadores = presencas.length;
    const presentes = presencas.filter((p) => p.status === "Presente").length;
    const quorumMinimo = Math.floor(totalVereadores / 2) + 1;
    const temQuorum = presentes >= quorumMinimo;

    return {
        totalVereadores,
        presentes,
        quorumMinimo,
        temQuorum,
    };
}

// ====================== PAUTA ======================

/**
 * Buscar itens da pauta de uma sessão
 */
export async function getItensPauta(sessaoId: number): Promise<ItemPauta[]> {
    const { data, error } = await supabase
        .from("sessaopauta")
        .select(`
      *,
      documento:documentos (
        id,
        numero_protocolo_geral,
        ano,
        status,
        tipo:tiposdedocumento (
          nome,
          exige_parecer
        ),
        projetosdelei ( numero_lei ),
        requerimentos ( numero_requerimento ),
        mocoes ( numero_mocao ),
        indicacoes ( numero_indicacao ),
        oficios ( numero_oficio ),
        projetosdedecretolegislativo ( numero_decreto ),
        pareceres:pareceres!pareceres_materia_documento_id_fkey (
          id,
          status,
          comissao:comissoes ( nome )
        )
      )
    `)
        .eq("sessao_id", sessaoId)
        .order("ordem", { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as ItemPauta[];
}

/**
 * Adicionar documento à pauta
 */
export async function adicionarItemPauta(
    sessaoId: number,
    documentoId: number,
    tipoItem: string = "Ordem do Dia"
): Promise<ItemPauta> {
    // Buscar próxima ordem
    const { data: ultimoItem } = await supabase
        .from("sessaopauta")
        .select("ordem")
        .eq("sessao_id", sessaoId)
        .order("ordem", { ascending: false })
        .limit(1)
        .single();

    const proximaOrdem = (ultimoItem?.ordem || 0) + 1;

    const { data, error } = await supabase
        .from("sessaopauta")
        .insert({
            sessao_id: sessaoId,
            documento_id: documentoId,
            ordem: proximaOrdem,
            // Campos adicionais (cast até regenerar types)
            ...({
                tipo_item: tipoItem,
                status_item: "Pendente",
            } as any),
        })
        .select()
        .single();

    if (error) throw error;
    return data as unknown as ItemPauta;
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
 * Atualizar status do item da pauta
 */
export async function atualizarStatusItem(
    itemId: number,
    statusItem: string
): Promise<void> {
    const { error } = await supabase
        .from("sessaopauta")
        .update({ status_item: statusItem } as any)
        .eq("id", itemId);

    if (error) throw error;
}

/**
 * Reordenar itens da pauta
 */
export async function reordenarPauta(
    sessaoId: number,
    itensOrdenados: { id: number; ordem: number }[]
): Promise<void> {
    for (const item of itensOrdenados) {
        const { error } = await supabase
            .from("sessaopauta")
            .update({ ordem: item.ordem })
            .eq("id", item.id)
            .eq("sessao_id", sessaoId);

        if (error) throw error;
    }
}

// ====================== VOTAÇÃO ======================

/**
 * Iniciar votação de um item da pauta
 */
export async function iniciarVotacao(
    sessaoId: number,
    itemPautaId: number
): Promise<void> {
    // Atualizar status do item para "Em Votação"
    await atualizarStatusItem(itemPautaId, "Em Votação");

    // Buscar o item para pegar o documento_id
    const { data: item, error: itemError } = await supabase
        .from("sessaopauta")
        .select("documento_id")
        .eq("id", itemPautaId)
        .single();

    if (itemError) throw itemError;

    // Buscar vereadores presentes
    const presencas = await getPresencas(sessaoId);
    const presentes = presencas.filter((p) => p.status === "Presente");
    const ausentes = presencas.filter((p) => p.status !== "Presente");

    // Criar registros de voto vazios para presentes
    const votosPresentes = presentes.map((p) => ({
        sessao_id: sessaoId,
        documento_id: item.documento_id,
        agente_publico_id: p.agente_publico_id,
        voto: null as unknown as VotoVereador, // Será preenchido na votação
    }));

    // Criar registros de voto "Ausente" para ausentes
    const votosAusentes = ausentes.map((p) => ({
        sessao_id: sessaoId,
        documento_id: item.documento_id,
        agente_publico_id: p.agente_publico_id,
        voto: "Ausente" as VotoVereador,
    }));

    // Limpar votos anteriores se existirem
    await supabase
        .from("sessaovotos")
        .delete()
        .eq("sessao_id", sessaoId)
        .eq("documento_id", item.documento_id);

    // Inserir novos registros
    const todosVotos = [...votosPresentes, ...votosAusentes].filter((v) => v.voto !== null);
    if (todosVotos.length > 0) {
        const { error: insertError } = await supabase
            .from("sessaovotos")
            .insert(todosVotos);

        if (insertError) throw insertError;
    }
}

/**
 * Registrar voto de um vereador
 */
export async function registrarVoto(
    sessaoId: number,
    documentoId: number,
    agentePublicoId: number,
    voto: VotoVereador
): Promise<void> {
    // Verificar se já existe registro
    const { data: existente } = await supabase
        .from("sessaovotos")
        .select("id")
        .eq("sessao_id", sessaoId)
        .eq("documento_id", documentoId)
        .eq("agente_publico_id", agentePublicoId)
        .single();

    if (existente) {
        // Atualizar
        const { error } = await supabase
            .from("sessaovotos")
            .update({ voto })
            .eq("id", existente.id);

        if (error) throw error;
    } else {
        // Inserir
        const { error } = await supabase
            .from("sessaovotos")
            .insert({
                sessao_id: sessaoId,
                documento_id: documentoId,
                agente_publico_id: agentePublicoId,
                voto,
            });

        if (error) throw error;
    }
}

/**
 * Buscar votos de uma votação
 */
export async function getVotos(sessaoId: number, documentoId: number): Promise<VotoIndividual[]> {
    const { data, error } = await supabase
        .from("sessaovotos")
        .select(`
      *,
      vereador:agentespublicos (
        id,
        nome_completo
      )
    `)
        .eq("sessao_id", sessaoId)
        .eq("documento_id", documentoId);

    if (error) throw error;
    return data || [];
}

/**
 * Calcular resultado parcial da votação
 */
export function calcularResultadoParcial(votos: VotoIndividual[]): {
    sim: number;
    nao: number;
    abstencao: number;
    ausente: number;
    pendentes: number;
} {
    const sim = votos.filter((v) => v.voto === "Sim").length;
    const nao = votos.filter((v) => v.voto === "Não").length;
    const abstencao = votos.filter((v) => v.voto === "Abstenção").length;
    const ausente = votos.filter((v) => v.voto === "Ausente").length;
    const pendentes = votos.filter((v) => v.voto === null).length;

    return { sim, nao, abstencao, ausente, pendentes };
}

/**
 * Encerrar votação e calcular resultado
 */
export async function encerrarVotacao(
    sessaoId: number,
    itemPautaId: number,
    presidenteId?: number
): Promise<ResultadoVotacao> {
    // Buscar o item para pegar o documento_id
    const { data: item, error: itemError } = await supabase
        .from("sessaopauta")
        .select("documento_id")
        .eq("id", itemPautaId)
        .single();

    if (itemError) throw itemError;

    const documentoId = item.documento_id;

    // Buscar todos os votos
    const votos = await getVotos(sessaoId, documentoId);
    const parcial = calcularResultadoParcial(votos);

    // Calcular resultado
    let resultado: string;
    let votoMinervaUsado = false;

    // Maioria simples: SIM > NÃO
    if (parcial.sim > parcial.nao) {
        resultado = "Aprovado";
    } else if (parcial.nao > parcial.sim) {
        resultado = "Rejeitado";
    } else {
        // Empate: Presidente tem voto de minerva
        if (presidenteId) {
            const votoPresidente = votos.find((v) => v.agente_publico_id === presidenteId);
            if (votoPresidente?.voto === "Sim") {
                resultado = "Aprovado";
                votoMinervaUsado = true;
            } else if (votoPresidente?.voto === "Não") {
                resultado = "Rejeitado";
                votoMinervaUsado = true;
            } else {
                // Presidente se absteve ou não votou - matéria rejeitada por empate
                resultado = "Rejeitado";
            }
        } else {
            // Sem identificação do presidente - empate rejeita
            resultado = "Rejeitado";
        }
    }

    // Salvar resultado (usando any pois a tabela ainda não foi gerada nos types)
    const { data: resultadoData, error: resultadoError } = await supabase
        .from("sessaovotacao_resultado" as any)
        .upsert(
            {
                sessao_id: sessaoId,
                documento_id: documentoId,
                item_pauta_id: itemPautaId,
                votos_sim: parcial.sim,
                votos_nao: parcial.nao,
                abstencoes: parcial.abstencao,
                ausentes: parcial.ausente,
                resultado,
                voto_minerva_usado: votoMinervaUsado,
            },
            { onConflict: "sessao_id,documento_id" }
        )
        .select()
        .single();

    if (resultadoError) throw resultadoError;

    // Atualizar status do item da pauta
    await atualizarStatusItem(itemPautaId, "Votado");

    // Criar entrada na tramitação do documento
    const statusTramitacao = resultado === "Aprovado"
        ? "Aprovado em Votação Única"
        : "Reprovado em Votação Única";

    const descricaoTramitacao = `Votação na sessão: ${parcial.sim} SIM, ${parcial.nao} NÃO, ${parcial.abstencao} ABSTENÇÕES${votoMinervaUsado ? " (voto de minerva utilizado)" : ""}`;

    // Buscar usuário logado
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        await supabase
            .from("tramitacoes")
            .insert({
                documento_id: documentoId,
                status: statusTramitacao,
                descricao: descricaoTramitacao,
                usuario_id: user.id,
            });
    }

    // Atualizar status do documento
    const novoStatusDoc = resultado === "Aprovado" ? "Aprovado" : "Rejeitado";
    await supabase.from("documentos").update({ status: novoStatusDoc } as any).eq("id", documentoId);

    return resultadoData as unknown as ResultadoVotacao;
}

/**
 * Buscar resultados de votações da sessão
 */
export async function getResultadosVotacao(sessaoId: number): Promise<ResultadoVotacao[]> {
    const { data, error } = await supabase
        .from("sessaovotacao_resultado" as any)
        .select("*")
        .eq("sessao_id", sessaoId);

    if (error) throw error;
    return (data || []) as unknown as ResultadoVotacao[];
}

/**
 * Marcar item da pauta como lido (para Ofícios, Indicações - sem votação)
 */
export async function marcarComoLido(
    sessaoId: number,
    documentoId: number,
    exigeParecer: boolean,
    isParecer: boolean = false
): Promise<void> {
    // Atualizar status do item na pauta
    const { error } = await supabase
        .from("sessaopauta")
        .update({ status_item: "Lido" } as any)
        .eq("sessao_id", sessaoId)
        .eq("documento_id", documentoId);

    if (error) throw error;

    // Atualizar status do documento
    // Sequência:
    // 1. Se for Parecer -> status: Lido
    // 2. Se exige parecer -> status: Em Comissão
    // 3. Padrão -> status: Pronto para Pauta

    let novoStatus = exigeParecer ? "Em Comissão" : "Pronto para Pauta";

    // Verificar se é um Parecer
    if (isParecer) {
        novoStatus = "Lido";
    }

    await supabase
        .from("documentos")
        .update({ status: novoStatus } as any)
        .eq("id", documentoId);

    // Registrar tramitação
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        await supabase
            .from("tramitacoes")
            .insert({
                documento_id: documentoId,
                status: "Lido em Plenário",
                descricao: `Matéria lida em plenário. Encaminhada para: ${novoStatus}`,
                usuario_id: user.id,
            } as any);
    }
}

/**
 * Presidente da Sessão com nome e cargo
 */
export interface PresidenteSessao {
    agentePublicoId: number;
    nome: string;
    cargo: string;
}

/**
 * Buscar o presidente da sessão com base na ordem de precedência da Mesa Diretora
 * Ordem: Presidente > Vice-Presidente > 1º Secretário > 2º Secretário > 1º Tesoureiro > 2º Tesoureiro
 * Retorna o primeiro cargo presente na sessão
 */
export async function getPresidenteSessao(
    sessaoId: number,
    periodoSessaoId: number,
    presencas: Presenca[]
): Promise<PresidenteSessao | null> {
    // Ordem de precedência da Mesa Diretora
    const precedenciaCargos = [
        "Presidente",
        "Vice-Presidente",
        "1º Secretário",
        "2º Secretário",
        "1º Tesoureiro",
        "2º Tesoureiro"
    ];

    // Buscar mesa diretora do período atual
    const { data: mesaDiretora } = await supabase
        .from("mesasdiretoras")
        .select("id")
        .eq("periodo_sessao_id", periodoSessaoId)
        .maybeSingle();

    if (!mesaDiretora) return null;

    // Buscar membros da mesa diretora
    const { data: membros } = await supabase
        .from("mesadiretoramembros")
        .select(`
            agente_publico_id,
            cargo,
            agente:agentespublicos ( nome_completo )
        `)
        .eq("mesa_diretora_id", mesaDiretora.id);

    if (!membros || membros.length === 0) return null;

    // IDs dos presentes na sessão
    const presentes = new Set(
        presencas
            .filter(p => p.status === "Presente")
            .map(p => p.agente_publico_id)
    );

    // Percorrer por ordem de precedência
    for (const cargo of precedenciaCargos) {
        const membro = membros.find((m: any) => m.cargo === cargo);
        if (membro && presentes.has(membro.agente_publico_id)) {
            const agente = membro.agente as any;
            return {
                agentePublicoId: membro.agente_publico_id,
                nome: agente?.nome_completo || "Nome não encontrado",
                cargo: cargo
            };
        }
    }

    return null;
}
