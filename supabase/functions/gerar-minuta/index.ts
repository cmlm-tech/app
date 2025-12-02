import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Configuração do CORS para seu Front-end poder chamar
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratamento de pré-flight request (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documento_id, tipo, contexto, autor_nome, destinatario, protocolo_geral } = await req.json()

    // 1. Definição do Prompt do Sistema (A "Persona" da IA)
    const systemPrompt = `
      Você é um Assistente Legislativo Sênior especialista em Redação Oficial Brasileira (Manual da Presidência da República).
      Sua tarefa é redigir a MINUTA INICIAL de um documento legislativo.
      
      REGRAS DE OURO:
      - Use linguagem formal, impessoal e culta.
      - NÃO INVENTE NÚMEROS DE LEI OU OFÍCIO. Use o termo "[AGUARDANDO NUMERAÇÃO]" onde o número seria citado.
      - Cite o Protocolo Geral ${protocolo_geral} apenas como referência administrativa no cabeçalho ou rodapé.
      - Se for Ofício: Use pronomes de tratamento adequados (Vossa Excelência/Vossa Senhoria).
      - Se for Lei: Estruture em Artigos (Art. 1º, Art. 2º...).
      
      Retorne APENAS o corpo do texto formatado em HTML simples (uso de <p>, <b>, <br>).
    `

    // 2. Definição do Prompt do Usuário (O pedido específico)
    let userPrompt = ""

    if (tipo === 'Ofício') {
      userPrompt = `
        Redija um OFÍCIO.
        Autor: ${autor_nome}
        Destinatário: ${destinatario?.nome}, Cargo: ${destinatario?.cargo}, Órgão: ${destinatario?.orgao}.
        Assunto/Comando: ${contexto}.
      `
    } else if (tipo === 'Projeto de Lei') {
      userPrompt = `
        Redija um PROJETO DE LEI.
        Autor: ${autor_nome}.
        Ementa/Objetivo: ${contexto}.
        Crie artigos, parágrafos e justificativa ao final.
      `
    } else {
      // Genérico para Moções, Requerimentos, etc.
      userPrompt = `
        Redija um documento do tipo ${tipo.toUpperCase()}.
        Autor: ${autor_nome}.
        Contexto/Pedido: ${contexto}.
      `
    }

    // 3. Chamada à API da OpenAI (GPT-4o ou gpt-3.5-turbo)
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // ou 'gpt-3.5-turbo' para economizar
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7, // Criatividade controlada
      }),
    })

    const aiData = await openAiResponse.json()
    const textoGerado = aiData.choices[0].message.content

    // 4. Salvar o resultado no Supabase (Persistência)
    // Precisamos saber em qual tabela salvar baseado no tipo
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Usa a Service Key para poder escrever sem restrição RLS
    )

    let tabelaDestino = ''
    let colunaTexto = '' // Algumas tabelas usam 'corpo_texto', outras 'justificativa'

    switch (tipo) {
      case 'Ofício':
        tabelaDestino = 'Oficios';
        colunaTexto = 'corpo_texto'; // Ajuste conforme seu schema real (se for 'assunto' ou campo novo)
        break;
      case 'Projeto de Lei':
        tabelaDestino = 'ProjetosDeLei';
        colunaTexto = 'corpo_texto';
        break;
      case 'Requerimento':
        tabelaDestino = 'Requerimentos';
        colunaTexto = 'justificativa'; // Requerimento geralmente o texto é a justificativa ou corpo
        break;
      case 'Moção':
        tabelaDestino = 'Mocoes';
        colunaTexto = 'justificativa';
        break;
      default:
        throw new Error('Tipo de documento não suportado para gravação automática.')
    }

    // Atualiza a tabela filha com o texto gerado
    // Importante: O update é feito pelo documento_id que é a FK nas tabelas filhas
    const { error: dbError } = await supabase
      .from(tabelaDestino)
      .update({ [colunaTexto]: textoGerado })
      .eq('documento_id', documento_id)

    if (dbError) throw dbError

    // 5. Retorna sucesso para o Frontend
    return new Response(
      JSON.stringify({
        success: true,
        texto: textoGerado,
        mensagem: "Minuta gerada e salva com sucesso!"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})