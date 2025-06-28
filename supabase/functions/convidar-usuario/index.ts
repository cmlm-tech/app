// supabase/functions/convidar-usuario/index.ts (VERSÃO FINAL E CORRIGIDA)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Headers CORS para permitir que a função seja chamada pelo navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Lida com a requisição CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Cria um cliente admin seguro do Supabase.
    // As chaves são lidas das variáveis de ambiente, nunca expostas no frontend.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Extrai os dados enviados pelo frontend.
    const { agente_publico_id, email, permissao } = await req.json()

    // 3. Validação para garantir que um mesmo agente não seja convidado duas vezes.
    const { data: usuarioExistente } = await supabaseAdmin
      .from('Usuarios')
      .select('id')
      .eq('agente_publico_id', agente_publico_id)
      .single()

    if (usuarioExistente) {
      throw new Error('Este agente público já possui um usuário associado.')
    }

    // 4. Constrói a URL de redirecionamento de forma segura e recomendada.
    // Usa a variável de ambiente SITE_URL.
    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173' // Fallback para desenvolvimento local
    const redirectTo = `${siteUrl}/redefinir-senha`; 


    // 5. Convida o novo usuário. A função 'inviteUserByEmail' já trata internamente
    // o caso em que o e-mail já existe, retornando um erro.
    const { data: novoUsuario, error: erroConvite } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo,
    })

    if (erroConvite) {
      // Se o convite falhar (ex: e-mail já existe), lança o erro.
      throw erroConvite
    }

    // 6. Cria o registro na sua tabela 'Usuarios' para ligar o perfil ao login.
    const { error: erroCriacaoUsuario } = await supabaseAdmin
      .from('Usuarios')
      .insert({
        id: novoUsuario.user.id,
        email: email,
        agente_publico_id: parseInt(agente_publico_id),
        permissao: permissao,
      })

    if (erroCriacaoUsuario) {
      // Se a criação do perfil falhar, deleta o usuário da autenticação para não deixar órfãos.
      await supabaseAdmin.auth.admin.deleteUser(novoUsuario.user.id)
      throw new Error(`Erro ao criar perfil do usuário: ${erroCriacaoUsuario.message}`)
    }

    // 7. Retorna uma resposta de sucesso.
    return new Response(JSON.stringify({ success: true, message: 'Convite enviado com sucesso' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    // Captura qualquer erro do processo e retorna uma mensagem clara.
    console.error('Erro na função convidar-usuario:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
