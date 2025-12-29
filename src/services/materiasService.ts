import { supabase } from "@/lib/supabaseClient";

/**
 * Verifica se o usuário pode retirar uma matéria
 * Retorna permissão e se é admin (para mostrar opções diferentes)
 */
export async function podeRetirarMateria(
    materiaId: number,
    usuarioId: string
): Promise<{ pode: boolean; ehAdmin: boolean; motivo?: string }> {
    try {
        // 1. Buscar matéria e verificar se está em pauta publicada
        const { data: materia, error: materiaError } = await supabase
            .from('documentos')
            .select(`
        id,
        status,
        documentoautores (autor_id, papel),
        sessaopauta (
          sessoes (pauta_publicada)
        )
      `)
            .eq('id', materiaId)
            .single();

        if (materiaError) throw materiaError;

        // 2. Verificar se está em pauta publicada
        const estEmPautaPublicada = materia?.sessaopauta?.some(
            (sp: any) => sp.sessoes?.pauta_publicada === true
        );

        if (estEmPautaPublicada) {
            return {
                pode: false,
                ehAdmin: false,
                motivo: 'Matéria já está em pauta publicada'
            };
        }

        // 3. Buscar agente público do usuário através da tabela usuarios
        const { data: usuario, error: usuarioError } = await supabase
            .from('usuarios')
            .select('agente_publico_id, permissao')
            .eq('id', usuarioId)
            .maybeSingle();

        if (usuarioError) throw usuarioError;
        if (!usuario || !usuario.agente_publico_id) {
            return {
                pode: false,
                ehAdmin: false,
                motivo: 'Agente público não encontrado'
            };
        }

        const agentePublicoId = usuario.agente_publico_id;

        // 4. Verificar se é admin (já temos permissao da query anterior)
        const ehAdmin = usuario?.permissao === 'Admin';

        // 5. Admin sempre pode (escolhe em nome de quem)
        if (ehAdmin) {
            return { pode: true, ehAdmin: true };
        }

        // 6. Verificar se usuário é autor
        const ehAutor = materia?.documentoautores?.some(
            (da: any) => da.autor_id === agentePublicoId
        );

        if (ehAutor) {
            return { pode: true, ehAdmin: false };
        }

        // 7. Verificar se é Líder do Executivo e matéria do Executivo
        // TODO: Precisamos do legislatura_id para consultar líder atual
        // Por enquanto, buscar líder ativo em qualquer legislatura
        const { data: liderAtual } = await supabase
            .from('liderancaslegislativas' as any)
            .select('agente_publico_id')
            .eq('tipo', 'governo')
            .is('data_fim', null)
            .maybeSingle();

        const ehLiderGoverno = (liderAtual as any)?.agente_publico_id === agentePublicoId;
        const ehMateriaExecutivo = materia?.documentoautores?.some(
            (da: any) => da.papel === 'Executivo'
        );

        if (ehLiderGoverno && ehMateriaExecutivo) {
            return { pode: true, ehAdmin: false };
        }

        return {
            pode: false,
            ehAdmin: false,
            motivo: 'Apenas o autor ou líder do governo (para matérias do Executivo) podem retirar esta matéria'
        };
    } catch (error: any) {
        console.error('Erro ao verificar permissão:', error);
        return {
            pode: false,
            ehAdmin: false,
            motivo: 'Erro ao verificar permissões'
        };
    }
}

/**
 * Verifica se o usuário pode declarar matéria como prejudicada
 * Apenas membros da Mesa Diretora podem
 */
export async function podePrejudicarMateria(
    usuarioId: string
): Promise<boolean> {
    try {
        // Buscar agente público através da tabela usuarios
        const { data: usuario } = await supabase
            .from('usuarios')
            .select('agente_publico_id')
            .eq('id', usuarioId)
            .maybeSingle();

        if (!usuario || !usuario.agente_publico_id) return false;

        const agentePublicoId = usuario.agente_publico_id;

        // Verificar se é membro da Mesa atual
        const membroQuery: any = await supabase
            .from('mesadiretoramembros')
            .select('id')
            .eq('agente_publico_id', agentePublicoId)
            .maybeSingle();
        const { data: membro } = membroQuery;

        return !!membro;
    } catch (error) {
        console.error('Erro ao verificar permissão Mesa:', error);
        return false;
    }
}

/**
 * Retira uma matéria (arquiva como retirada)
 * Admin pode retirar em nome do autor ou líder do governo
 */
export async function retirarMateria(
    materiaId: number,
    motivo: string | null,
    usuarioId: string,
    emNomeDe?: 'autor' | 'lider_governo'
): Promise<void> {
    // 1. Validar permissão
    const { pode, ehAdmin, motivo: motivoNegacao } = await podeRetirarMateria(materiaId, usuarioId);
    if (!pode) throw new Error(motivoNegacao);

    // 2. Admin deve especificar em nome de quem
    if (ehAdmin && !emNomeDe) {
        throw new Error('Admin deve especificar em nome de quem está retirando');
    }

    let tipoArquivamento: string;
    let descricao: string;

    if (ehAdmin && emNomeDe) {
        // Admin retirando em nome de alguém
        tipoArquivamento = emNomeDe === 'autor'
            ? 'retirada_autor'
            : 'retirada_lider_governo';

        const papel = emNomeDe === 'autor' ? 'autor' : 'Líder do Governo';
        descricao = `Retirado pelo ${papel} (via administrador)${motivo ? `. Motivo: ${motivo}` : ''}`;
    } else {
        // Autor retirando diretamente
        tipoArquivamento = 'retirada_autor';
        descricao = `Retirado pelo autor${motivo ? `. Motivo: ${motivo}` : ''}`;
    }

    // 3. Atualizar documento
    const { error: updateError } = await supabase
        .from('documentos')
        .update({
            status: 'Retirado' as any, // Type assertion temporária até types serem atualizados
            tipo_arquivamento: tipoArquivamento,
            motivo_arquivamento: motivo,
            data_arquivamento: new Date().toISOString(),
            arquivado_por_id: usuarioId,
        })
        .eq('id', materiaId);

    if (updateError) throw updateError;

    // 4. Registrar tramitação
    const { error: tramitacaoError } = await supabase
        .from('tramitacoes')
        .insert({
            documento_id: materiaId,
            status: 'Arquivado',
            descricao,
            usuario_id: usuarioId,
            data_hora: new Date().toISOString(),
        });

    if (tramitacaoError) throw tramitacaoError;
}

/**
 * Declara uma matéria como prejudicada
 * Apenas membros da Mesa podem executar
 */
export async function prejudicarMateria(
    materiaId: number,
    justificativa: string,
    materiaSimilarId: number | null,
    usuarioId: string
): Promise<void> {
    // 1. Validar permissão
    const pode = await podePrejudicarMateria(usuarioId);
    if (!pode) throw new Error('Sem permissão para declarar matéria prejudicada');

    // 2. Validar justificativa
    if (!justificativa || justificativa.trim() === '') {
        throw new Error('Justificativa é obrigatória');
    }

    // 3. Montar descrição
    let descricao = `Declarado prejudicado pela Mesa. ${justificativa}`;

    if (materiaSimilarId) {
        descricao += ` (Referência: matéria #${materiaSimilarId})`;
    }

    // 4. Atualizar documento
    const { error: updateError } = await supabase
        .from('documentos')
        .update({
            status: 'Prejudicado' as any, // Type assertion temporária até types serem atualizados
            tipo_arquivamento: 'prejudicado',
            motivo_arquivamento: justificativa,
            data_arquivamento: new Date().toISOString(),
            arquivado_por_id: usuarioId,
        })
        .eq('id', materiaId);

    if (updateError) throw updateError;

    // 5. Registrar tramitação
    const { error: tramitacaoError } = await supabase
        .from('tramitacoes')
        .insert({
            documento_id: materiaId,
            status: 'Arquivado',
            descricao,
            usuario_id: usuarioId,
            data_hora: new Date().toISOString(),
        });

    if (tramitacaoError) throw tramitacaoError;
}
