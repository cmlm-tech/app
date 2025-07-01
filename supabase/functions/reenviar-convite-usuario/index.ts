import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Headers CORS para permitir que a função seja chamada pelo navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { agente_publico_id } = await req.json();

    if (!agente_publico_id) {
      return new Response(JSON.stringify({ error: 'agente_publico_id é obrigatório' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Passo A: Encontrar o usuário antigo e seus dados
    const { data: perfilAntigo, error: perfilError } = await supabaseAdmin
      .from('usuarios')
      .select('id, email, permissao')
      .eq('agente_publico_id', agente_publico_id)
      .single();

    if (perfilError || !perfilAntigo) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const { id: oldUserId, email, permissao } = perfilAntigo;

    // Passo B: Apagar o usuário antigo
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(oldUserId);

    if (deleteError) {
      // Se o usuário já foi deletado ou não existe mais, podemos continuar para criar um novo.
      if (deleteError.message !== 'User not found') {
        return new Response(JSON.stringify({ error: `Erro ao apagar usuário antigo: ${deleteError.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    // Passo C: Enviar novo convite
    const { data: novoConvite, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${Deno.env.get('SITE_URL')}/redefinir-senha`,
    });

    if (inviteError) {
      return new Response(JSON.stringify({ error: `Erro ao enviar novo convite: ${inviteError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Passo D: Recriar o perfil
    const { error: createError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: novoConvite.user.id,
        agente_publico_id: agente_publico_id,
        permissao: permissao,
        email: email,
      });

    if (createError) {
      return new Response(JSON.stringify({ error: `Erro ao recriar perfil: ${createError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Convite reenviado com sucesso!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});