import { supabase } from "@/lib/supabaseClient";

export interface Fala {
    vereadorId: number;
    nomeVereador: string;
    texto: string;
}

export interface DadosAta {
    sessao: {
        id: number;
        numero: number;
        tipo: string;
        data: string;
        hora: string;
        local: string;
    };
    presencas: {
        presentes: string[];
        ausentes: string[];
    };
    materias: {
        tipo: string;
        numero: string;
        autor: string;
        ementa: string;
        resultado: string;
    }[];
    presidente: string;
    secretario: string;
}

/**
 * Busca todos os dados necessários para gerar a ata
 */
export async function getDadosParaAta(sessaoId: number): Promise<DadosAta> {
    // 1. Buscar dados da sessão
    const { data: sessao, error: sessaoError } = await supabase
        .from("sessoes")
        .select(`
            id,
            numero,
            tipo_sessao,
            data_abertura,
            hora_agendada,
            periodo_sessao_id,
            periodossessao (
                numero,
                legislaturas ( numero )
            )
        `)
        .eq("id", sessaoId)
        .single();

    if (sessaoError) throw sessaoError;

    // 2. Buscar presenças
    const { data: presencasData, error: presencasError } = await supabase
        .from("sessaopresenca")
        .select(`
            status,
            agentespublicos ( nome_completo )
        `)
        .eq("sessao_id", sessaoId);

    if (presencasError) throw presencasError;

    const presentes = presencasData
        ?.filter(p => p.status === "Presente")
        .map(p => p.agentespublicos?.nome_completo || "")
        .filter(Boolean) || [];

    const ausentes = presencasData
        ?.filter(p => p.status === "Ausente" || p.status === "Ausente com Justificativa")
        .map(p => p.agentespublicos?.nome_completo || "")
        .filter(Boolean) || [];

    // 3. Buscar itens da pauta
    const { data: pautaData, error: pautaError } = await supabase
        .from("sessaopauta")
        .select(`
            ordem,
            sessaovotacao_resultado!sessaovotacao_resultado_item_pauta_id_fkey (
                resultado
            ),
            documentos (
                numero_protocolo_geral,
                ano,
                tiposdedocumento ( nome ),
                documentoautores (
                    autor_id,
                    autor_type
                ),
                projetosdelei ( ementa ),
                oficios ( assunto ),
                requerimentos ( justificativa ),
                mocoes ( ementa ),
                indicacoes ( ementa ),
                projetosdedecretolegislativo ( ementa ),
                projetosderesolucao ( ementa ),
                projetosdeemendaorganica ( ementa ),
                pareceres!pareceres_materia_documento_id_fkey ( comissoes ( nome ) )
            )
        `)
        .eq("sessao_id", sessaoId)
        .order("ordem");

    if (pautaError) throw pautaError;

    // 4. Processar matérias
    const materias = await Promise.all(
        (pautaData || []).map(async (item: any) => {
            const doc = item.documentos;
            const tipo = doc?.tiposdedocumento?.nome || "Documento";
            const numero = `${doc?.numero_protocolo_geral || "S/N"}/${doc?.ano || ""}`;

            // Buscar autor
            let autor = "Não informado";
            if (doc?.documentoautores?.[0]?.autor_id) {
                const autorId = doc.documentoautores[0].autor_id;
                const autorType = doc.documentoautores[0].autor_type;

                if (autorType === "agente_publico") {
                    const { data: agente } = await supabase
                        .from("agentespublicos")
                        .select("nome_completo")
                        .eq("id", autorId)
                        .single();
                    autor = agente?.nome_completo || "Não informado";
                } else if (autorType === "comissao") {
                    const { data: comissao } = await supabase
                        .from("comissoes")
                        .select("nome")
                        .eq("id", autorId)
                        .single();
                    autor = comissao?.nome || "Não informado";
                }
            } else if (doc?.pareceres?.[0]?.comissoes?.nome) {
                // Para pareceres, buscar comissão
                autor = doc.pareceres[0].comissoes.nome;
            }

            // Buscar ementa
            const ementa =
                doc?.projetosdelei?.[0]?.ementa ||
                doc?.oficios?.[0]?.assunto ||
                doc?.requerimentos?.[0]?.justificativa ||
                doc?.mocoes?.[0]?.ementa ||
                doc?.indicacoes?.[0]?.ementa ||
                doc?.projetosdedecretolegislativo?.[0]?.ementa ||
                doc?.projetosderesolucao?.[0]?.ementa ||
                doc?.projetosdeemendaorganica?.[0]?.ementa ||
                "Sem descrição";

            const resultado = item.sessaovotacao_resultado?.[0]?.resultado || "Lido";

            return {
                tipo,
                numero,
                autor,
                ementa,
                resultado,
            };
        })
    );

    // 5. Buscar presidente e secretário
    const { data: presidenteData } = await (supabase as any)
        .from("sessaopresenca")
        .select(`
            agentespublicos!inner (
                nome_completo,
                mesadiretoramembros!inner (
                    cargo
                )
            )
        `)
        .eq("sessao_id", sessaoId)
        .eq("presidindo", true)
        .single();

    const presidente = presidenteData?.agentespublicos?.nome_completo || "Presidente";

    // Buscar secretário (1º ou 2º) através da mesa diretora do período
    const { data: secretarioData } = await (supabase as any)
        .from("mesadiretoramembros")
        .select(`
            agentespublicos ( nome_completo ),
            mesasdiretoras!inner ( periodo_sessao_id )
        `)
        .eq("mesasdiretoras.periodo_sessao_id", sessao?.periodo_sessao_id)
        .in("cargo", ["1º Secretário", "2º Secretário"])
        .order("cargo")
        .limit(1)
        .single();

    const secretario = secretarioData?.agentespublicos?.nome_completo || "Secretário";

    return {
        sessao: {
            id: sessao.id,
            numero: sessao.numero,
            tipo: sessao.tipo_sessao,
            data: sessao.data_abertura,
            hora: sessao.hora_agendada || "00:00",
            local: "Paço da Câmara Municipal",
        },
        presencas: {
            presentes,
            ausentes,
        },
        materias,
        presidente,
        secretario,
    };
}

/**
 * Gera o texto da ata usando IA
 */
export async function gerarTextoAta(
    sessaoId: number,
    falas: Fala[]
): Promise<string> {
    const dados = await getDadosParaAta(sessaoId);

    // Construir texto de presenças
    const presencasTexto = `
Presentes: ${dados.presencas.presentes.join(", ")}.
${dados.presencas.ausentes.length > 0 ? `Ausentes: ${dados.presencas.ausentes.join(", ")}.` : ""}
    `.trim();

    // Construir texto de matérias
    const materiasTexto = dados.materias
        .map((m, index) => `
${index + 1}. ${m.tipo} Nº ${m.numero}
   Autor: ${m.autor}
   Ementa: ${m.ementa}
   Resultado: ${m.resultado}
        `.trim())
        .join("\n\n");

    // Construir texto de falas
    const falasTexto = falas
        .map((f) => `
- ${f.nomeVereador}:
  ${f.texto}
        `.trim())
        .join("\n\n");

    // Construir contexto para IA
    const contexto = `
Gere uma ATA FORMAL de sessão legislativa seguindo EXATAMENTE esta estrutura narrativa:

DADOS DA SESSÃO:
- Número: ${dados.sessao.numero}ª
- Tipo: ${dados.sessao.tipo}
- Data: ${new Date(dados.sessao.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
- Hora: ${dados.sessao.hora}
- Local: ${dados.sessao.local}
- Presidente: ${dados.presidente}

${presencasTexto}

MATÉRIAS DELIBERADAS (ORDEM DO DIA):
${materiasTexto}

FALAS DOS VEREADORES (PEQUENO EXPEDIENTE):
${falasTexto}

ESTRUTURA DA ATA (TEXTO NARRATIVO, SEM TÍTULOS OU SEÇÕES):
1. Parágrafo de abertura informando a sessão, data, hora, local e presidente
2. Parágrafo listando os vereadores presentes${dados.presencas.ausentes.length > 0 ? " e ausentes" : ""}
3. Descrição narrativa da Ordem do Dia (cada matéria e sua deliberação)
4. Resumo narrativo das falas dos vereadores no pequeno expediente
5. Encerramento: "Em seguida o presidente ${dados.presidente}, agradeceu a todos e encerrou a sessão. Eu, ${dados.secretario}, lavrei a presente ata que após lida e aprovada vai por todos assinada."

REGRAS IMPORTANTES:
- Use linguagem FORMAL e TÉCNICA legislativa
- Conecte as informações de forma NARRATIVA (texto corrido, SEM listas numeradas ou marcadores)
- Use números por extenso para ordinais (21ª = Vigésima Primeira)
- NÃO adicione cabeçalhos, títulos, seções marcadas ou formatação markdown
- Gere APENAS o texto corrido da ata
- Mantenha a ordem cronológica dos eventos
    `.trim();

    // Chamar Edge Function
    const { data, error } = await supabase.functions.invoke("gerar-minuta", {
        body: {
            documento_id: sessaoId,
            tipo: "Ata",
            contexto,
            protocolo_geral: `${dados.sessao.numero}/${new Date(dados.sessao.data).getFullYear()}`,
            autor_nome: dados.presidente,
        },
    });

    if (error) throw error;
    if (!data?.texto) throw new Error("IA não retornou texto");

    return data.texto;
}

/**
 * Salva a ata no banco de dados
 * Segue o padrão: primeiro cria documento, depois cria ata vinculada
 */
export async function salvarAta(
    sessaoId: number,
    texto: string,
    resumoPauta?: string
): Promise<void> {
    // Gerar resumo automaticamente se não fornecido (primeiros 150 caracteres limpos)
    const resumoFinal = resumoPauta || texto.replace(/<[^>]*>/g, "").substring(0, 150) + "...";
    // 1. Buscar dados da sessão
    const { data: sessaoData, error: sessaoError } = await supabase
        .from("sessoes")
        .select("numero, tipo_sessao, data_abertura, periodossessao(numero)")
        .eq("id", sessaoId)
        .single();

    if (sessaoError) throw sessaoError;

    // 2. Buscar tipo de documento "Ata"
    const { data: tipoDoc, error: tipoError } = await supabase
        .from("tiposdedocumento")
        .select("id")
        .eq("nome", "Ata")
        .single();

    if (tipoError) throw new Error("Tipo de documento 'Ata' não encontrado. Execute o script SQL primeiro.");

    // 3. Verificar se já existe documento de ata para esta sessão
    const { data: ataExistente } = await supabase
        .from("atas")
        .select("documento_id")
        .eq("sessao_id", sessaoId)
        .single();

    let documentoId: number;

    if (ataExistente) {
        // Ata já existe, apenas atualizar
        documentoId = ataExistente.documento_id;

        const { error: updateError } = await supabase
            .from("atas")
            .update({ texto, resumo_pauta: resumoFinal })
            .eq("documento_id", documentoId);

        if (updateError) throw updateError;

        // Atualizar status do documento para "Rascunho"
        await supabase
            .from("documentos")
            .update({ status: "Rascunho" } as any)
            .eq("id", documentoId);
    } else {
        // 4. Criar novo documento
        const ano = new Date(sessaoData.data_abertura).getFullYear();

        // Obter ID do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data: novoDoc, error: docError } = await supabase
            .from("documentos")
            .insert({
                tipo_documento_id: tipoDoc.id,
                numero_protocolo_geral: null, // Atas não têm protocolo geral
                ano: ano,
                data_protocolo: sessaoData.data_abertura,
                status: "Rascunho",
                criado_por_usuario_id: user.id,
            } as any)
            .select("id")
            .single();

        if (docError) throw docError;
        if (!novoDoc) throw new Error("Erro ao criar documento");

        documentoId = novoDoc.id;

        // 5. Criar registro de ata vinculado ao documento
        const { error: ataError } = await supabase
            .from("atas")
            .insert({
                documento_id: documentoId,
                sessao_id: sessaoId,
                texto,
                resumo_pauta: resumoFinal,
            } as any);

        if (ataError) throw ataError;
    }

    // 6. Adicionar ata ao Expediente da próxima sessão agendada
    await adicionarAtaProximaSessao(documentoId, sessaoId);
}

/**
 * Adiciona a ata finalizada ao Expediente da próxima sessão agendada
 * A ata será o primeiro item a ser votado no Expediente
 */
async function adicionarAtaProximaSessao(
    documentoId: number,
    sessaoAtualId: number
): Promise<void> {
    // Buscar dados da sessão atual
    const { data: sessaoAtual } = await supabase
        .from("sessoes")
        .select("numero, periodo_sessao_id")
        .eq("id", sessaoAtualId)
        .single();

    if (!sessaoAtual) return;

    // Buscar próxima sessão agendada do mesmo período (por número, não por data)
    const { data: proximaSessao, error } = await supabase
        .from("sessoes")
        .select("id, numero")
        .eq("status", "Agendada")
        .eq("periodo_sessao_id", sessaoAtual.periodo_sessao_id)
        .gt("numero", sessaoAtual.numero)
        .order("numero", { ascending: true })
        .limit(1)
        .single();

    if (error || !proximaSessao) {
        console.log("Nenhuma sessão agendada encontrada para vincular a ata");
        return;
    }

    // Verificar se já existe essa ata no expediente da próxima sessão
    const { data: jaExiste } = await supabase
        .from("sessaopauta")
        .select("id")
        .eq("sessao_id", proximaSessao.id)
        .eq("documento_id", documentoId)
        .single();

    if (jaExiste) {
        console.log("Ata já está no expediente da próxima sessão");
        return;
    }

    // Adicionar ata ao Expediente como primeiro item
    const { error: pautaError } = await supabase
        .from("sessaopauta")
        .insert({
            sessao_id: proximaSessao.id,
            documento_id: documentoId,
            tipo_item: "Expediente",
            ordem: 1,
            status_item: "Pendente",
        } as any);

    if (pautaError) {
        console.error("Erro ao adicionar ata ao expediente:", pautaError);
    } else {
        console.log(`Ata adicionada ao expediente da sessão ${proximaSessao.id}`);
    }
}
