import { supabase } from "@/lib/supabaseClient";

export interface Destinatario {
    id: number;
    nome: string;
    cargo: string;
    orgao: string;
    ativo: boolean;
}

export interface Pessoa {
    id: number;
    nome: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    tipo_pessoa: 'fisica' | 'juridica';
}

export interface Orgao {
    id: number;
    nome: string;
    tipo_orgao?: string;
    endereco_logradouro?: string;
    endereco_cidade?: string;
    endereco_uf?: string;
}

export interface Cargo {
    id: number;
    nome: string;
    orgao_id: number;
    permite_generico: boolean;
}

export interface OcupacaoCargo {
    id: number;
    pessoa_id: number;
    cargo_id: number;
    data_inicio: string;
    data_fim?: string;
    ativo: boolean;
}

/**
 * Busca destinatários pelo termo digitado (nome, cargo ou órgão)
 * Mantém compatibilidade com interface antiga
 */
export async function buscarDestinatarios(termo: string): Promise<Destinatario[]> {
    if (!termo || termo.length < 2) return [];

    const { data, error } = await supabase
        .from('ocupacao_cargo')
        .select(`
            id,
            ativo,
            pessoa:pessoa_id (nome, email, telefone),
            cargo:cargo_id (
                nome,
                orgao:orgao_id (nome)
            )
        `)
        .eq('ativo', true)
        .is('data_fim', null)
        .limit(50); // Buscar mais para filtrar client-side

    if (error) {
        console.error('Erro ao buscar destinatários:', error);
        return [];
    }

    // Filtrar client-side por nome, cargo ou órgão
    const termoLower = termo.toLowerCase();
    const filtered = (data || []).filter((oc: any) => {
        const nomePessoa = oc.pessoa?.nome?.toLowerCase() || '';
        const nomeCargo = oc.cargo?.nome?.toLowerCase() || '';
        const nomeOrgao = oc.cargo?.orgao?.nome?.toLowerCase() || '';

        return nomePessoa.includes(termoLower) ||
            nomeCargo.includes(termoLower) ||
            nomeOrgao.includes(termoLower);
    });

    // Transformar para formato esperado pelo frontend e limitar a 10
    return filtered.slice(0, 10).map((oc: any) => ({
        id: oc.id,
        nome: oc.pessoa.nome,
        cargo: oc.cargo.nome,
        orgao: oc.cargo.orgao.nome,
        ativo: oc.ativo
    }));
}

/**
 * Cria um novo destinatário (pessoa + cargo + ocupação)
 * Mantém compatibilidade com interface antiga
 */
export async function criarDestinatario(nome: string, cargo: string, orgao: string): Promise<Destinatario | null> {
    try {
        // 1. Verificar se órgão existe, senão criar
        let { data: orgaoData, error: orgaoError } = await supabase
            .from('orgao')
            .select('id')
            .eq('nome', orgao)
            .single();

        if (orgaoError || !orgaoData) {
            const { data: novoOrgao, error: erroNovoOrgao } = await supabase
                .from('orgao')
                .insert({ nome: orgao })
                .select()
                .single();

            if (erroNovoOrgao) throw erroNovoOrgao;
            orgaoData = novoOrgao;
        }

        // 2. Verificar se cargo existe nesse órgão, senão criar
        let { data: cargoData, error: cargoError } = await supabase
            .from('cargo')
            .select('id')
            .eq('nome', cargo)
            .eq('orgao_id', orgaoData.id)
            .single();

        if (cargoError || !cargoData) {
            const { data: novoCargo, error: erroNovoCargo } = await supabase
                .from('cargo')
                .insert({ nome: cargo, orgao_id: orgaoData.id, permite_generico: true })
                .select()
                .single();

            if (erroNovoCargo) throw erroNovoCargo;
            cargoData = novoCargo;
        }

        // 3. Verificar se pessoa existe, senão criar
        let { data: pessoaData, error: pessoaError } = await supabase
            .from('pessoa')
            .select('id')
            .eq('nome', nome)
            .single();

        if (pessoaError || !pessoaData) {
            const { data: novaPessoa, error: erroNovaPessoa } = await supabase
                .from('pessoa')
                .insert({ nome, tipo_pessoa: 'fisica' })
                .select()
                .single();

            if (erroNovaPessoa) throw erroNovaPessoa;
            pessoaData = novaPessoa;
        }

        // 4. Verificar se já existe ocupação ativa para essa pessoa nesse cargo
        const { data: ocupacaoExistente } = await supabase
            .from('ocupacao_cargo')
            .select('id')
            .eq('pessoa_id', pessoaData.id)
            .eq('cargo_id', cargoData.id)
            .eq('ativo', true)
            .is('data_fim', null)
            .single();

        // Se já existe ocupação ativa, retornar ela ao invés de criar duplicata
        if (ocupacaoExistente) {
            console.log('Ocupação já existe, retornando existente');
            return {
                id: ocupacaoExistente.id,
                nome,
                cargo,
                orgao,
                ativo: true
            };
        }

        // 5. Criar ocupação
        const { data: ocupacaoData, error: ocupacaoError } = await supabase
            .from('ocupacao_cargo')
            .insert({
                pessoa_id: pessoaData.id,
                cargo_id: cargoData.id,
                ativo: true
            })
            .select()
            .single();

        if (ocupacaoError) throw ocupacaoError;

        return {
            id: ocupacaoData.id,
            nome,
            cargo,
            orgao,
            ativo: true
        };

    } catch (error) {
        console.error('Erro ao criar destinatário:', error);
        return null;
    }
}

/**
 * Lista todos destinatários ativos (para exibir opções padrão)
 */
export async function listarDestinatariosPadrao(): Promise<Destinatario[]> {
    const { data, error } = await supabase
        .from('ocupacao_cargo')
        .select(`
            id,
            ativo,
            pessoa:pessoa_id (nome),
            cargo:cargo_id (
                nome,
                orgao:orgao_id (nome)
            )
        `)
        .eq('ativo', true)
        .is('data_fim', null)
        .limit(20);

    if (error) {
        console.error('Erro ao listar destinatários:', error);
        return [];
    }

    return (data || []).map((oc: any) => ({
        id: oc.id,
        nome: oc.pessoa.nome,
        cargo: oc.cargo.nome,
        orgao: oc.cargo.orgao.nome,
        ativo: oc.ativo
    }));
}

/**
 * Lista TODOS os destinatários (ativos e inativos) para o painel de gestão
 */
export async function listarTodosDestinatarios(): Promise<Destinatario[]> {
    const { data, error } = await supabase
        .from('ocupacao_cargo')
        .select(`
            id,
            ativo,
            data_fim,
            pessoa:pessoa_id (nome),
            cargo:cargo_id (
                nome,
                orgao:orgao_id (nome)
            )
        `)
        .order('ativo', { ascending: false });

    if (error) {
        console.error('Erro ao listar todos destinatários:', error);
        return [];
    }

    return (data || []).map((oc: any) => ({
        id: oc.id,
        nome: oc.pessoa.nome,
        cargo: oc.cargo.nome,
        orgao: oc.cargo.orgao.nome,
        ativo: oc.ativo && !oc.data_fim
    }));
}

/**
 * Atualiza um destinatário existente (ocupação)
 */
export async function atualizarDestinatario(id: number, dados: Partial<Destinatario>): Promise<Destinatario | null> {
    // Para manter compatibilidade, só atualizamos o status ativo
    const { error } = await supabase
        .from('ocupacao_cargo')
        .update({ ativo: dados.ativo })
        .eq('id', id);

    if (error) {
        console.error('Erro ao atualizar destinatário:', error);
        return null;
    }

    // Retornar dados atualizados
    const { data } = await supabase
        .from('ocupacao_cargo')
        .select(`
            id,
            ativo,
            pessoa:pessoa_id (nome),
            cargo:cargo_id (
                nome,
                orgao:orgao_id (nome)
            )
        `)
        .eq('id', id)
        .single();

    if (!data) return null;

    return {
        id: data.id,
        nome: (data as any).pessoa.nome,
        cargo: (data as any).cargo.nome,
        orgao: (data as any).cargo.orgao.nome,
        ativo: data.ativo
    };
}

/**
 * Alterna o status (ativo/inativo)
 */
export async function toggleAtivoDestinatario(id: number, ativo: boolean): Promise<boolean> {
    const { error } = await supabase
        .from('ocupacao_cargo')
        .update({ ativo })
        .eq('id', id);

    if (error) {
        console.error('Erro ao alterar status:', error);
        return false;
    }

    return true;
}

// ============= NOVAS FUNÇÕES PARA CRUD COMPLETO =============

/**
 * CRUD de Pessoas
 */
export async function listarPessoas(): Promise<Pessoa[]> {
    const { data, error } = await supabase
        .from('pessoa')
        .select('*')
        .order('nome');

    if (error) {
        console.error('Erro ao listar pessoas:', error);
        return [];
    }

    return (data || []) as Pessoa[];
}

export async function criarPessoa(pessoa: Omit<Pessoa, 'id'>): Promise<Pessoa | null> {
    const { data, error } = await supabase
        .from('pessoa')
        .insert(pessoa)
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar pessoa:', error);
        return null;
    }

    return data as Pessoa;
}

export async function atualizarPessoa(id: number, pessoa: Partial<Pessoa>): Promise<Pessoa | null> {
    const { data, error } = await supabase
        .from('pessoa')
        .update(pessoa)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar pessoa:', error);
        return null;
    }

    return data as Pessoa;
}

export async function verificarPessoaDuplicada(nome: string, cpf?: string, excludeId?: number): Promise<Pessoa | null> {
    let query = supabase
        .from('pessoa')
        .select('*')
        .ilike('nome', nome);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data } = await query.limit(1).single();

    // Se não encontrou por nome, tentar por CPF
    if (!data && cpf) {
        const { data: dataCpf } = await supabase
            .from('pessoa')
            .select('*')
            .eq('cpf', cpf)
            .limit(1)
            .single();
        return dataCpf as Pessoa | null;
    }

    return data as Pessoa | null;
}

export async function excluirPessoa(id: number): Promise<{ success: boolean; message: string }> {
    // Verificar se tem ocupações vinculadas
    const { data: ocupacoes } = await supabase
        .from('ocupacao_cargo')
        .select('id')
        .eq('pessoa_id', id)
        .limit(1);

    if (ocupacoes && ocupacoes.length > 0) {
        return {
            success: false,
            message: 'Não é possível excluir. Esta pessoa possui ocupações vinculadas.'
        };
    }

    const { error } = await supabase
        .from('pessoa')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao excluir pessoa:', error);
        return { success: false, message: 'Erro ao excluir pessoa.' };
    }

    return { success: true, message: 'Pessoa excluída com sucesso!' };
}

/**
 * CRUD de Órgãos
 */
export async function listarOrgaos(): Promise<Orgao[]> {
    const { data, error } = await supabase
        .from('orgao')
        .select('*')
        .order('nome');

    if (error) {
        console.error('Erro ao listar órgãos:', error);
        return [];
    }

    return data || [];
}

export async function criarOrgao(orgao: Omit<Orgao, 'id'>): Promise<Orgao | null> {
    const { data, error } = await supabase
        .from('orgao')
        .insert(orgao)
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar órgão:', error);
        return null;
    }

    return data;
}

export async function atualizarOrgao(id: number, orgao: Partial<Orgao>): Promise<Orgao | null> {
    const { data, error } = await supabase
        .from('orgao')
        .update(orgao)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar órgão:', error);
        return null;
    }

    return data;
}

export async function verificarOrgaoDuplicado(nome: string, excludeId?: number): Promise<Orgao | null> {
    let query = supabase
        .from('orgao')
        .select('*')
        .ilike('nome', nome);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data } = await query.limit(1).single();
    return data as Orgao | null;
}

export async function excluirOrgao(id: number): Promise<{ success: boolean; message: string }> {
    const { data: cargos } = await supabase
        .from('cargo')
        .select('id')
        .eq('orgao_id', id)
        .limit(1);

    if (cargos && cargos.length > 0) {
        return {
            success: false,
            message: 'Não é possível excluir. Este órgão possui cargos vinculados.'
        };
    }

    const { error } = await supabase
        .from('orgao')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao excluir órgão:', error);
        return { success: false, message: 'Erro ao excluir órgão.' };
    }

    return { success: true, message: 'Órgão excluído com sucesso!' };
}

/**
 * CRUD de Cargos
 */
export async function listarCargos(): Promise<Cargo[]> {
    const { data, error } = await supabase
        .from('cargo')
        .select('*')
        .order('nome');

    if (error) {
        console.error('Erro ao listar cargos:', error);
        return [];
    }

    return data || [];
}

export async function criarCargo(cargo: Omit<Cargo, 'id'>): Promise<Cargo | null> {
    const { data, error } = await supabase
        .from('cargo')
        .insert(cargo)
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar cargo:', error);
        return null;
    }

    return data;
}

export async function atualizarCargo(id: number, cargo: Partial<Cargo>): Promise<Cargo | null> {
    const { data, error } = await supabase
        .from('cargo')
        .update(cargo)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar cargo:', error);
        return null;
    }

    return data;
}

export async function excluirCargo(id: number): Promise<{ success: boolean; message: string }> {
    const { data: ocupacoes } = await supabase
        .from('ocupacao_cargo')
        .select('id')
        .eq('cargo_id', id)
        .limit(1);

    if (ocupacoes && ocupacoes.length > 0) {
        return {
            success: false,
            message: 'Não é possível excluir. Este cargo possui ocupações vinculadas.'
        };
    }

    const { error } = await supabase
        .from('cargo')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erro ao excluir cargo:', error);
        return { success: false, message: 'Erro ao excluir cargo.' };
    }

    return { success: true, message: 'Cargo excluído com sucesso!' };
}

/**
 * CRUD de Ocupações
 */
export async function listarOcupacoes(): Promise<OcupacaoCargo[]> {
    const { data, error } = await supabase
        .from('ocupacao_cargo')
        .select('*')
        .order('data_inicio', { ascending: false });

    if (error) {
        console.error('Erro ao listar ocupações:', error);
        return [];
    }

    return data || [];
}

export async function criarOcupacao(ocupacao: Omit<OcupacaoCargo, 'id'>): Promise<OcupacaoCargo | null> {
    const { data, error } = await supabase
        .from('ocupacao_cargo')
        .insert(ocupacao)
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar ocupação:', error);
        return null;
    }

    return data;
}

export async function atualizarOcupacao(id: number, ocupacao: Partial<OcupacaoCargo>): Promise<OcupacaoCargo | null> {
    const { data, error } = await supabase
        .from('ocupacao_cargo')
        .update(ocupacao)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar ocupação:', error);
        return null;
    }

    return data;
}

export async function encerrarOcupacao(id: number, dataFim: string): Promise<boolean> {
    const { error } = await supabase
        .from('ocupacao_cargo')
        .update({ data_fim: dataFim, ativo: false })
        .eq('id', id);

    if (error) {
        console.error('Erro ao encerrar ocupação:', error);
        return false;
    }

    return true;
}
