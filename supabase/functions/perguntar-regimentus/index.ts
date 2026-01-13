import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Obter chave da API do Gemini
        const apiKey = Deno.env.get('GOOGLE_API_KEY')
        if (!apiKey) {
            throw new Error("GOOGLE_API_KEY não configurada")
        }

        // Criar cliente Supabase
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Validar autenticação
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(
                JSON.stringify({ erro: 'Usuário não autenticado' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Parsear body
        const { pergunta } = await req.json()

        if (!pergunta || pergunta.trim() === '') {
            return new Response(
                JSON.stringify({ erro: 'Pergunta não fornecida' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('🤔 Pergunta recebida:', pergunta)

        // 1. Buscar chunks relevantes usando busca textual
        const { data: chunks, error: chunksError } = await supabaseClient
            .from('regimento_chunks')
            .select('*')
            .textSearch('conteudo', pergunta, {
                type: 'websearch',
                config: 'portuguese'
            })
            .limit(3)

        if (chunksError) {
            console.error('Erro ao buscar chunks:', chunksError)
            throw new Error('Erro ao buscar informações no regimento')
        }

        console.log(`📚 Encontrados ${chunks?.length || 0} chunks relevantes`)

        // Se não encontrou chunks, tentar busca mais ampla
        let chunksRelevantes = chunks || []
        if (chunksRelevantes.length === 0) {
            console.log('⚠️ Busca textual não retornou resultados, fazendo busca ampla...')
            const { data: allChunks } = await supabaseClient
                .from('regimento_chunks')
                .select('*')
                .limit(3)

            chunksRelevantes = allChunks || []
        }

        if (chunksRelevantes.length === 0) {
            return new Response(
                JSON.stringify({
                    erro: 'Não encontrei informações sobre isso no regimento. Por favor, adicione mais conteúdo em /regimentus/upload',
                    resposta: '',
                    chunks_usados: []
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Montar contexto para o Gemini
        const contexto = chunksRelevantes
            .map((chunk: any, idx: number) => {
                const ref = chunk.artigo || chunk.secao || `Trecho ${idx + 1}`
                return `[${ref}]\n${chunk.conteudo}\n`
            })
            .join('\n---\n\n')

        // 3. Criar prompt para Gemini
        const prompt = `Você é o Regimentus, um assistente especializado no Regimento Interno da Câmara Municipal de Lavras da Mangabeira/CE.

CONTEXTO DO REGIMENTO INTERNO:
${contexto}

PERGUNTA DO USUÁRIO:
${pergunta}

INSTRUÇÕES:
1. Responda APENAS perguntas relacionadas ao Regimento Interno
2. Se a pergunta NÃO for sobre o regimento, responda EXATAMENTE:
   "Desculpe, sou o Regimentus e estou especializado exclusivamente no Regimento Interno da Câmara Municipal de Lavras da Mangabeira/CE. Por favor, faça perguntas relacionadas ao regimento que terei prazer em ajudar!"
3. Para perguntas sobre o regimento: responda de forma clara e objetiva
4. Cite sempre os artigos e parágrafos relevantes
5. Use linguagem acessível mas técnica quando necessário
6. Se a pergunta não puder ser respondida com o contexto fornecido, seja honesto e informe quais artigos você conhece
7. Formate a resposta de forma organizada

RESPOSTA:`

        console.log('🤖 Chamando Gemini API...')

        // 4. Listar modelos disponíveis e tentar com fallback (igual gerar-minuta)
        let modelosDisponiveis = []
        try {
            const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
            const listResponse = await fetch(listUrl)
            if (listResponse.ok) {
                const listData = await listResponse.json()
                modelosDisponiveis = listData.models
                    ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
                    ?.map((m: any) => m.name.replace('models/', '')) || []
                console.log('✅ Modelos disponíveis:', modelosDisponiveis)
            }
        } catch (erro: any) {
            console.log('⚠️ Erro ao listar modelos:', erro.message)
        }

        // Usar modelos disponíveis ou fallback padrão
        const modelos = modelosDisponiveis.length > 0
            ? modelosDisponiveis
            : ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

        console.log('🔄 Modelos a testar:', modelos)

        let resposta = ''
        let modeloUsado = ''

        // Tentar cada modelo até funcionar
        for (const modelo of modelos) {
            try {
                console.log(`🔍 Tentando modelo: ${modelo}`)

                const url = `https://generativelanguage.googleapis.com/v1/models/${modelo}:generateContent?key=${apiKey}`

                const geminiResponse = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        }
                    })
                })

                if (!geminiResponse.ok) {
                    const erro = await geminiResponse.text()
                    console.log(`   ❌ Erro: ${erro}`)
                    continue
                }

                const geminiData = await geminiResponse.json()
                resposta = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

                if (resposta) {
                    modeloUsado = modelo
                    console.log(`   ✅ Modelo ${modelo} funcionou!`)
                    break
                }
            } catch (erro: any) {
                console.log(`   ❌ Exceção: ${erro.message}`)
                continue
            }
        }

        if (!resposta) {
            throw new Error('Nenhum modelo do Gemini funcionou')
        }

        console.log('✅ Resposta gerada com sucesso')

        // 5. Salvar conversa no banco
        const { data: savedConversation, error: saveError } = await supabaseClient
            .from('regimentus_chat')
            .insert({
                pergunta,
                resposta,
                chunks_usados: chunksRelevantes.map((c: any) => c.id)
            })
            .select()
            .single()

        if (saveError) {
            console.error('Erro ao salvar conversa:', saveError)
            // Não vamos falhar a request por isso
        }

        // 6. Verificar se precisa comprimir histórico
        const { count } = await supabaseClient
            .from('regimentus_chat')
            .select('*', { count: 'exact', head: true })

        if (count && count > 10) {
            console.log('📦 Comprimindo histórico antigo...')
            // TODO: Implementar compressão em background
        }

        // 7. Retornar resposta
        return new Response(
            JSON.stringify({
                resposta,
                chunks_usados: chunksRelevantes.map((c: any) => c.id),
                conversa_salva: savedConversation || null
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error: any) {
        console.error('❌ Erro:', error)
        return new Response(
            JSON.stringify({
                erro: error.message || 'Erro interno do servidor',
                resposta: '',
                chunks_usados: []
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
