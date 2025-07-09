import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const {
      numero,
      descricao,
      data_inicio,
      data_fim,
      numero_vagas_vereadores,
    } = await req.json()

    if (numero === undefined || !data_inicio || !data_fim || numero_vagas_vereadores === undefined) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: numero, data_inicio, data_fim, numero_vagas_vereadores' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const { data, error } = await supabaseClient.rpc('create_legislatura_with_periods', {
      p_numero: numero,
      p_descricao: descricao,
      p_data_inicio: data_inicio,
      p_data_fim: data_fim,
      p_numero_vagas_vereadores: numero_vagas_vereadores,
    })

    if (error) {
      console.error('Erro na chamada RPC "create_legislatura_with_periods":', error)
      return new Response(JSON.stringify({ error: `Erro do banco de dados: ${error.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ id: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })
  } catch (err) {
    console.error('Erro inesperado na Edge Function:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})