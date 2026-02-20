// supabase/functions/convidar-usuario/index.ts (VERSÃO FINAL E CORRIGIDA)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Headers CORS para permitir que a função seja chamada pelo navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Lida com a requisição CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Recebida requisição convidar-usuario');

    // 1. Verifica se há corpo na requisição
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Erro: Content-Type inválido', contentType);
      throw new Error('Content-Type deve ser application/json')
    }

    // 2. Lê o corpo da requisição
    let body
    try {
      body = await req.json()
      console.log('Corpo da requisição:', JSON.stringify(body));
    } catch (e) {
      console.error('Erro ao fazer parse do corpo:', e);
      throw new Error('Corpo da requisição inválido ou vazio')
    }

    const { agente_publico_id, email, permissao } = body

    // Validação dos campos obrigatórios
    if (!agente_publico_id || !email || !permissao) {
      console.error('Erro: Campos obrigatórios faltando', { agente_publico_id, email, permissao });
      throw new Error('agente_publico_id, email e permissao são obrigatórios')
    }

    // 3. Cria um cliente admin seguro do Supabase.
    // As chaves são lidas das variáveis de ambiente, nunca expostas no frontend.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Validação para garantir que um mesmo agente não seja convidado duas vezes.
    // Utiliza maybeSingle() para evitar erros no log caso o usuário não exista.
    console.log('Verificando usuário existente para agente:', agente_publico_id);
    const { data: usuarioExistente, error: erroVerificacao } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('agente_publico_id', agente_publico_id)
      .maybeSingle()

    if (erroVerificacao) {
      console.error('Erro ao consultar usuarios:', erroVerificacao);
      throw new Error(`Erro ao verificar usuário existente: ${erroVerificacao.message}`)
    }

    console.log('Usuário existente:', usuarioExistente);

    if (usuarioExistente) {
      console.warn('Agente já possui usuário');
      throw new Error('Este agente público já possui um usuário associado.')
    }

    // 4. Validação para garantir que o e-mail não esteja já cadastrado para outro usuário.
    console.log('Verificando se o email já existe:', email);
    const { data: emailExistente, error: erroEmailVerificacao } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (erroEmailVerificacao) {
      console.error('Erro ao consultar email:', erroEmailVerificacao);
      throw new Error(`Erro ao verificar e-mail: ${erroEmailVerificacao.message}`)
    }

    if (emailExistente) {
      console.warn('Email já cadastrado para outro usuário');
      throw new Error('Este e-mail já está cadastrado para outro usuário.')
    }

    // 4. Constrói a URL de redirecionamento de forma segura e recomendada.
    // Usa a variável de ambiente SITE_URL.
    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173' // Fallback para desenvolvimento local
    const redirectTo = `${siteUrl}/redefinir-senha`;
    console.log('RedirectTo:', redirectTo);


    // 5. Convida o novo usuário. A função 'inviteUserByEmail' já trata internamente
    // o caso em que o e-mail já existe, retornando um erro.
    console.log('Convidando usuário:', email);
    const { data: novoUsuario, error: erroConvite } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo,
    })

    if (erroConvite) {
      console.error('Erro no inviteUserByEmail:', erroConvite);
      // Se o convite falhar (ex: e-mail já existe), lança o erro.
      throw erroConvite
    }

    console.log('Usuário convidado com sucesso:', novoUsuario.user.id);

    // 6. Cria o registro na sua tabela 'Usuarios' para ligar o perfil ao login.
    console.log('Criando perfil na tabela usuarios...');
    const { error: erroCriacaoUsuario } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: novoUsuario.user.id,
        email: email,
        agente_publico_id: parseInt(agente_publico_id),
        permissao: permissao,
      })

    if (erroCriacaoUsuario) {
      console.error('Erro ao criar perfil:', erroCriacaoUsuario);
      // Se a criação do perfil falhar, deleta o usuário da autenticação para não deixar órfãos.
      await supabaseAdmin.auth.admin.deleteUser(novoUsuario.user.id)
      throw new Error(`Erro ao criar perfil do usuário: ${erroCriacaoUsuario.message}`)
    }

    console.log('Perfil criado com sucesso. Finalizando.');

    // 7. Retorna uma resposta de sucesso.
    return new Response(JSON.stringify({ success: true, message: 'Convite enviado com sucesso' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error) {
    // Captura qualquer erro do processo e retorna uma mensagem clara.
    // Retornamos 200 para que o SDK do Supabase inclua o JSON em `data` (não em `error`).
    console.error('Erro na função convidar-usuario (CATCH):', error)
    return new Response(JSON.stringify({ success: false, error: (error as Error).message || 'Erro desconhecido' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
