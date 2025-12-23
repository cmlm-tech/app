import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documento_id, tipo, contexto, autor_nome, destinatario, protocolo_geral, tipo_mocao, homenageado } = await req.json()

    // 1. Verificar API Key
    const apiKey = Deno.env.get('GOOGLE_API_KEY')
    if (!apiKey) throw new Error("GOOGLE_API_KEY não configurada")

    console.log("✅ API Key encontrada")

    // 2. Construir prompt

    // 1. Definição do System Prompt (Instrução Mestra)
    // O segredo aqui é o "NÃO FAÇA": Proibimos a IA de fazer o trabalho do React.
    const promptSistema = `
Você é um Assistente Legislativo Sênior da Câmara Municipal de Lavras da Mangabeira.
Sua tarefa é redigir EXCLUSIVAMENTE o CORPO DO TEXTO de um Ofício.

REGRAS DE OURO (O QUE NÃO FAZER):
- NÃO gere cabeçalhos (Brasões, Títulos, "Câmara Municipal").
- NÃO gere datas ou locais ("Lavras da Mangabeira, ...").
- NÃO gere números de ofício ("Ofício nº ...").
- NÃO gere o bloco de endereçamento ("Ao Ilmo. Sr..."). O sistema já imprime isso.
- NÃO coloque a assinatura ou nome do vereador no final.

REGRAS DE REDAÇÃO (O QUE FAZER):
1. Inicie DIRETAMENTE com o Vocativo adequado (Ex: "Senhor Secretário," ou "Excelentíssimo Senhor Prefeito,").
2. Escreva o texto em 3 a 5 parágrafos (Norma Padrão, Formal e Impessoal).
3. Finalize com o Fecho oficial ("Atenciosamente," ou "Respeitosamente,").
`;

    // 2. Construção do Prompt do Usuário (Variáveis)
    let promptUsuario = "";

    // Verifica se é Ofício para aplicar a estrutura correta
    if (tipo === 'Ofício') {
      // Dados para contexto da IA (para ela saber com quem está falando)
      const cargoDestinatario = destinatario?.cargo || "Autoridade";
      const orgaoDestinatario = destinatario?.orgao || "";

      promptUsuario = `
    CONTEXTO DA SOLICITAÇÃO:
    ${contexto}

    DESTINATÁRIO (Apenas para ajustar o tom e vocativo):
    Cargo: ${cargoDestinatario}
    Órgão: ${orgaoDestinatario}

    TAREFA:
    Escreva o corpo do texto solicitando/informando o que foi descrito no contexto.
    Lembre-se: Comece com "Senhor [Cargo]," e termine com "Atenciosamente,".
    `;
    } else if (tipo === 'Projeto de Lei') {
      promptUsuario = `
        **IMPORTANTE**: Escreva APENAS os artigos do projeto. Comece DIRETAMENTE com "Art. 1º".
        
        Ementa: ${contexto}
        
        ESTRUTURA:
        1. Artigos (Art. 1º, Art. 2º...) 
        2. Artigo de vigência
        3. Justificativa
        
        ❌ NUNCA ESCREVA:
        - "PROJETO DE LEI Nº"
        - "Protocolo:"  
        - Nome do autor
        - Qualquer cabeçalho
        
        ✅ COMECE DIRETAMENTE COM: "Art. 1º..."
      `
    } else if (tipo === 'Moção') {
      // Moção tem estrutura padronizada - Art. 2 e 3 são fixos
      // tipo_mocao e homenageado já foram extraídos no início da função

      promptUsuario = `
        Você está redigindo uma MOÇÃO DE ${(tipo_mocao || 'APLAUSOS').toUpperCase()}.
        
        ESTRUTURA FIXA DE UMA MOÇÃO:
        - Art. 1º - Concessão da moção (ÚNICO ARTIGO QUE VARIA)
        - Art. 2º - Referência ao regimento (FIXO)
        - Art. 3º - Vigência (FIXO)
        
        TAREFA: Escreva APENAS o Art. 1º de forma completa e elegante.
        
        HOMENAGEADO/DESTINATÁRIO: ${homenageado || 'Não informado'}
        CONTEXTO/MOTIVO: ${contexto}
        TIPO: Moção de ${tipo_mocao || 'Aplausos'}
        
        FORMATO DO ART. 1º:
        "Art. 1º - Fica concedida Moção de [TIPO] a/ao [HOMENAGEADO], [MOTIVO ELABORADO]."
        
        EXEMPLO:
        "Art. 1º - Fica concedida Moção de Aplausos aos jovens Samara Rodrigues de Macêdo e Robson Gomes Fernando, pelo nascimento de seu filho, Átila Ivanildo de Macêdo Gomes, ocorrido em 01 de setembro de 2025."
        
        ❌ NÃO ESCREVA Art. 2º nem Art. 3º (são fixos no sistema)
        ❌ NÃO inclua cabeçalho, numeração ou autores
        ✅ ESCREVA APENAS O Art. 1º COMPLETO
      `
    } else {
      promptUsuario = `
        Escreva APENAS o corpo do documento ${tipo}.
        Assunto: ${contexto}
        
        ❌ NÃO inclua: cabeçalho, numeração, protocolo, nome do autor.
        ✅ Comece direto com o conteúdo.
      `
    }

    const fullPrompt = `${promptSistema}\n\n${promptUsuario}`

    // 3. PRIMEIRO: Listar modelos disponíveis
    console.log("🔍 Listando modelos disponíveis para esta API Key...")
    let modelosComGenerateContent = []

    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      const listResponse = await fetch(listUrl)

      if (listResponse.ok) {
        const listData = await listResponse.json()
        const modelosDisponiveis = listData.models?.map(m => m.name) || []
        console.log("✅ Modelos disponíveis:", JSON.stringify(modelosDisponiveis))

        // Extrair apenas os nomes dos modelos que suportam generateContent
        modelosComGenerateContent = listData.models
          ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          ?.map(m => m.name.replace('models/', '')) || []

        console.log("✅ Modelos com generateContent:", JSON.stringify(modelosComGenerateContent))
      } else {
        const erroList = await listResponse.text()
        console.log("⚠️ Não conseguiu listar modelos:", erroList)
      }
    } catch (erro: any) {
      console.log("⚠️ Erro ao listar modelos:", erro.message)
    }

    // 4. Usar os modelos disponíveis OU tentar os padrões
    const modelos = modelosComGenerateContent.length > 0
      ? modelosComGenerateContent
      : ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

    console.log("🔄 Modelos que serão testados:", JSON.stringify(modelos))

    let textoGerado: string | null = null
    let modeloUsado = ""
    const errosDetalhados: any[] = []

    for (const modelo of modelos) {
      try {
        console.log(`🔍 Tentando modelo: ${modelo}`)

        // URL da API v1 (não v1beta!)
        const url = `https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${apiKey}`

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: fullPrompt }]
            }]
          })
        })

        console.log(`   Status da resposta: ${response.status} ${response.statusText}`)

        if (!response.ok) {
          const erro = await response.text()
          console.log(`   ❌ Corpo do erro: ${erro}`)
          errosDetalhados.push({
            modelo,
            status: response.status,
            statusText: response.statusText,
            corpo: erro
          })
          continue
        }

        const data = await response.json()
        console.log(`   ✅ Resposta recebida:`, JSON.stringify(data).substring(0, 500))

        // DEBUG: Mostrar estrutura completa
        console.log(`   🔍 DEBUG - data.candidates:`, data.candidates ? 'existe' : 'NULL')
        if (data.candidates && data.candidates.length > 0) {
          console.log(`   🔍 DEBUG - candidates[0]:`, JSON.stringify(data.candidates[0]))
        }

        textoGerado = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log(`   🔍 DEBUG - textoGerado extraído:`, textoGerado ? `"${textoGerado.substring(0, 100)}..."` : 'NULL ou undefined')

        if (textoGerado) {
          console.log(`🧹 Refinando texto gerado...`);

          // Remove formatações Markdown (* ou #)
          textoGerado = textoGerado.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '');

          // Regex para cortar qualquer cabeçalho teimoso que a IA tente criar
          const padroesIndesejados = [
            /^OFÍCIO\s*N[ºª°]?.*$/gim,      // Remove linha "Ofício Nº..."
            /^MEMORANDO\s*N[ºª°]?.*$/gim,   // Remove linha "Memorando Nº..."
            /^ASSUNTO:.*$/gim,              // Remove linha "Assunto:..."
            /^DATA:.*$/gim,                 // Remove linha "Data:..."
            /^AO ILMO.*$/gim,               // Remove endereçamento duplicado se vazar
            /^Exmo\..*$/gim                 // Remove endereçamento duplicado se vazar
          ];

          padroesIndesejados.forEach(regex => {
            textoGerado = textoGerado!.replace(regex, '');
          });

          // Remove espaços em branco excessivos no início e fim
          textoGerado = textoGerado.trim();

          // Normaliza quebras de linha (no máximo 2 quebras)
          textoGerado = textoGerado.replace(/\n{3,}/g, '\n\n');

          console.log(`   ✅ Texto limpo. Tamanho final: ${textoGerado!.length} caracteres`)

          modeloUsado = modelo
          console.log(`   ✅✅ Modelo ${modelo} gerou texto!`)
          break
        } else {
          console.log(`   ⚠️ Resposta sem texto gerado`)
          errosDetalhados.push({
            modelo,
            status: response.status,
            problema: "Resposta sem texto",
            data: data
          })
        }

      } catch (erro: any) {
        console.log(`   ❌ Exceção ao testar modelo:`, erro.message)
        errosDetalhados.push({
          modelo,
          erro: erro.message,
          tipo: erro.constructor.name
        })
      }
    }

    console.log(`🔍 DEBUG FINAL - Após loop completo:`)
    console.log(`   - textoGerado existe?`, !!textoGerado)
    console.log(`   - textoGerado tipo:`, typeof textoGerado)
    console.log(`   - textoGerado tamanho:`, textoGerado?.length || 0)
    console.log(`   - modeloUsado:`, modeloUsado)

    if (!textoGerado) {
      console.error("❌ Todos os modelos falharam. Detalhes:", JSON.stringify(errosDetalhados, null, 2))
      throw new Error(JSON.stringify({
        mensagem: "Nenhum modelo funcionou",
        modelos_disponiveis_na_api_key: modelosComGenerateContent,
        modelos_testados: modelos,
        erros: errosDetalhados
      }, null, 2))
    }

    // 4. Salvar no Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let tabelaDestino = ''
    let colunaTexto = ''

    switch (tipo) {
      case 'Ofício':
        tabelaDestino = 'oficios'
        colunaTexto = 'corpo_texto'
        break
      case 'Projeto de Lei':
        tabelaDestino = 'projetosdelei'
        colunaTexto = 'corpo_texto'
        break
      case 'Requerimento':
        tabelaDestino = 'requerimentos'
        colunaTexto = 'corpo_texto'
        break
      case 'Moção':
        tabelaDestino = 'mocoes'
        colunaTexto = 'corpo_texto'
        break
      case 'Indicação':
        tabelaDestino = 'indicacoes'
        colunaTexto = 'justificativa'
        break
      default:
        tabelaDestino = 'oficios'
        colunaTexto = 'corpo_texto'
    }

    if (tabelaDestino && colunaTexto) {
      const { error: dbError } = await supabase
        .from(tabelaDestino)
        .update({ [colunaTexto]: textoGerado })
        .eq('documento_id', documento_id)

      if (dbError) throw dbError
    }

    // 5. Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        texto: textoGerado,
        modelo_usado: modeloUsado,
        mensagem: "Minuta gerada com Gemini!"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("❌ ERRO:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})