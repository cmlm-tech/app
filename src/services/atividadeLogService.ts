import { supabase } from "@/lib/supabaseClient";

export type TipoAtividade =
    | 'protocolo'
    | 'parecer'
    | 'sessao'
    | 'comissao'
    | 'votacao'
    | 'lideranca'
    | 'legislatura'
    | 'pauta';

export interface RegistrarAtividadeParams {
    tipo: TipoAtividade;
    descricao: string;
    entidadeTipo?: string;
    entidadeId?: number;
    agentePublicoId?: number; // O vereador/agente SUJEITO da ação
}

/**
 * Registra uma atividade no log do sistema
 * Usado para rastrear ações importantes realizadas no sistema
 */
export async function registrarAtividade(params: RegistrarAtividadeParams): Promise<void> {
    try {
        const { error } = await supabase
            .from('atividade_log' as any)
            .insert({
                tipo: params.tipo,
                descricao: params.descricao,
                entidade_tipo: params.entidadeTipo || null,
                entidade_id: params.entidadeId || null,
                agente_publico_id: params.agentePublicoId || null,
            });

        if (error) {
            console.error('[AtividadeLog] Erro ao registrar atividade:', error);
        }
    } catch (error) {
        // Não lançar erro para não interromper o fluxo principal
        console.error('[AtividadeLog] Erro ao registrar atividade:', error);
    }
}

/**
 * Registra protocolo de documento
 */
export async function registrarProtocolo(
    documentoId: number,
    tipoDocumento: string,
    numeroProtocolo: string | number,
    ano: number,
    agentePublicoId?: number
): Promise<void> {
    await registrarAtividade({
        tipo: 'protocolo',
        descricao: `protocolou ${tipoDocumento} nº ${numeroProtocolo}/${ano}.`,
        entidadeTipo: 'documento',
        entidadeId: documentoId,
        agentePublicoId,
    });
}

/**
 * Registra emissão de parecer
 */
export async function registrarParecer(
    documentoId: number,
    nomeComissao: string,
    numeroMateria: string | number,
    ano: number,
    tipoMateria: string = "Matéria"
): Promise<void> {
    await registrarAtividade({
        tipo: 'parecer',
        descricao: `A ${nomeComissao} emitiu parecer sobre o(a) ${tipoMateria} nº ${numeroMateria}/${ano}.`,
        entidadeTipo: 'documento',
        entidadeId: documentoId,
    });
}

/**
 * Registra publicação de pauta
 */
export async function registrarPublicacaoPauta(
    sessaoId: number,
    numeroSessao: number
): Promise<void> {
    await registrarAtividade({
        tipo: 'pauta',
        descricao: `A pauta da ${numeroSessao}ª sessão foi publicada.`,
        entidadeTipo: 'sessao',
        entidadeId: sessaoId,
    });
}

/**
 * Registra agendamento de sessão
 */
export async function registrarAgendamentoSessao(
    sessaoId: number,
    tipoSessao: string,
    data: string
): Promise<void> {
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
    await registrarAtividade({
        tipo: 'sessao',
        descricao: `Sessão ${tipoSessao.toLowerCase()} agendada para ${dataFormatada}.`,
        entidadeTipo: 'sessao',
        entidadeId: sessaoId,
    });
}

/**
 * Registra adição de membro à comissão
 */
export async function registrarMembroComissao(
    comissaoId: number,
    nomeComissao: string,
    agentePublicoId: number
): Promise<void> {
    await registrarAtividade({
        tipo: 'comissao',
        descricao: `foi adicionado(a) à ${nomeComissao}.`,
        entidadeTipo: 'comissao',
        entidadeId: comissaoId,
        agentePublicoId,
    });
}

/**
 * Registra mudança de liderança
 */
export async function registrarLideranca(
    tipoLideranca: string,
    agentePublicoId: number
): Promise<void> {
    await registrarAtividade({
        tipo: 'lideranca',
        descricao: `assumiu a ${tipoLideranca}.`,
        entidadeTipo: 'legislatura',
        agentePublicoId,
    });
}
