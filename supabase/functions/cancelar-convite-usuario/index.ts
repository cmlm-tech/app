import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { agente_publico_id } = await req.json()

    if (!agente_publico_id) {
      return new Response(JSON.stringify({ error: 'agente_publico_id é obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Passo A: Encontrar o utilizador
    const { data: usuario, error: findError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('agente_publico_id', agente_publico_id)
      .single()

    if (findError || !usuario) {
      return new Response(JSON.stringify({ error: 'Não há um convite pendente para este agente.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const userId = usuario.id

    // Passo B: Apagar o utilizador
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    // Passo C: Retornar Sucesso
    return new Response(JSON.stringify({ message: 'Convite cancelado com sucesso.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
