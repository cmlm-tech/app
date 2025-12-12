import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// Importando o SDK do Google via CDN (esm.sh) para funcionar no Deno
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratamento de CORS (Pre-flight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documento_id, tipo, contexto, autor_nome, destinatario, protocolo_geral } = await req.json()

    // 1. Configuração do Gemini
    const apiKey = Deno.env.get('GOOGLE_API_KEY')
    if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada")
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) // ou "gemini-1.5-pro"

    // 2. Construção do Prompt
    // O Gemini aceita System Instruction separada, mas para simplificar via SDK, 
    // vamos montar um prompt estruturado que funciona muito bem.
    
    const promptSistema = `
      Você é um Assistente Legislativo Sênior especialista em Redação Oficial Brasileira.
      Sua tarefa é redigir a MINUTA INICIAL de um documento legislativo.
      
      REGRAS DE OURO:
      - Use linguagem formal, impessoal e culta (Padrão Presidência da República).
      - Protocolo Geral de referência: ${protocolo_geral}.
      - NÃO INVENTE NÚMEROS DE LEI OU OFÍCIO. Use o termo "____/2025" ou "[AGUARDANDO NUMERAÇÃO]".
      - Retorne APENAS o corpo do texto formatado em HTML simples (<p>, <b>, <br>). Não use Markdown (ex: **negrito**), use tags HTML.
    `

    let promptUsuario = ""
    
    if (tipo === 'Ofício') {
      promptUsuario = `
        ESCREVA UM OFÍCIO.
        Autor: ${autor_nome}
        Destinatário: ${destinatario?.nome}, Cargo: ${destinatario?.cargo}, Órgão: ${destinatario?.orgao}.
        Assunto/Comando do Vereador: "${contexto}".
        
        Estrutura sugerida:
        - Cabeçalho (Local e Data automática pelo sistema, não precisa por).
        - Vocativo adequado ao cargo.
        - Corpo do texto expandindo o assunto de forma polida.
        - Fecho de cortesia.
      `
    } else if (tipo === 'Projeto de Lei') {
      promptUsuario = `
        ESCREVA UM PROJETO DE LEI.
        Autor: ${autor_nome}.
        Ementa/Objetivo: "${contexto}".
        
        Estrutura obrigatória:
        - Artigos (Art. 1º, Art. 2º...) claros e concisos.
        - Parágrafos quando necessário.
        - Artigo de vigência ("Esta Lei entra em vigor...").
        - Justificativa ao final (separada por <hr> ou título).
      `
    } else {
      promptUsuario = `
        ESCREVA UM DOCUMENTO TIPO: ${tipo.toUpperCase()}.
        Autor: ${autor_nome}.
        Contexto/Pedido: "${contexto}".
      `
    }

    // Unindo as instruções
    const fullPrompt = `${promptSistema}\n\n---\n\nPEDIDO ATUAL:\n${promptUsuario}`

    // 3. Chamada à API do Google
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const textoGerado = response.text()

    // 4. Salvar no Supabase (Isso continua igual)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let tabelaDestino = ''
    let colunaTexto = '' 

    switch (tipo) {
      case 'Ofício': 
        tabelaDestino = 'Oficios'; 
        colunaTexto = 'corpo_texto';
        break;
      case 'Projeto de Lei': 
        tabelaDestino = 'ProjetosDeLei'; 
        colunaTexto = 'corpo_texto'; 
        break;
      case 'Requerimento': 
        tabelaDestino = 'Requerimentos'; 
        colunaTexto = 'justificativa'; // Ajuste conforme seu banco
        break;
      case 'Moção': 
        tabelaDestino = 'Mocoes'; 
        colunaTexto = 'justificativa'; 
        break;
      default:
        // Fallback genérico se tiver outros tipos
        tabelaDestino = 'Oficios'; 
        colunaTexto = 'corpo_texto';
    }

    // Verifica se a tabela/coluna foi definida antes de tentar update
    if (tabelaDestino && colunaTexto) {
        const { error: dbError } = await supabase
        .from(tabelaDestino)
        .update({ [colunaTexto]: textoGerado }) 
        .eq('documento_id', documento_id)

        if (dbError) throw dbError
    }

    // 5. Retorno
    return new Response(
      JSON.stringify({ 
        success: true, 
        texto: textoGerado,
        mensagem: "Minuta gerada com Gemini!" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("Erro Edge Function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})