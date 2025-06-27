
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConviteRequest {
  agente_publico_id: string;
  email: string;
  permissao: 'Vereador' | 'Assessoria' | 'Secretaria' | 'Admin';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente admin do Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { agente_publico_id, email, permissao }: ConviteRequest = await req.json();

    console.log('Recebendo convite para:', { agente_publico_id, email, permissao });

    // Validar se o agente já possui usuário associado
    const { data: usuarioExistente, error: erroVerificacao } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('agente_publico_id', agente_publico_id)
      .single();

    if (erroVerificacao && erroVerificacao.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar usuário existente: ${erroVerificacao.message}`);
    }

    if (usuarioExistente) {
      throw new Error('Este agente público já possui um usuário associado.');
    }

    // Verificar se o email já está sendo usado
    const { data: emailExistente, error: erroEmail } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (emailExistente?.user && !erroEmail) {
      throw new Error('Este email já está sendo usado por outro usuário.');
    }

    // Criar convite usando o cliente admin
    const redirectTo = `${Deno.env.get('SUPABASE_URL')?.replace('//', '//').split('/')[0]}//${Deno.env.get('SUPABASE_URL')?.split('//')[1]?.split('.')[0]}.lovable.app/definir-senha`;
    
    console.log('URL de redirecionamento:', redirectTo);

    const { data: novoUsuario, error: erroConvite } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo,
      data: {
        agente_publico_id: agente_publico_id,
        permissao: permissao
      }
    });

    if (erroConvite || !novoUsuario.user) {
      console.error('Erro ao criar convite:', erroConvite);
      throw new Error(`Erro ao enviar convite: ${erroConvite?.message}`);
    }

    console.log('Usuário criado com sucesso:', novoUsuario.user.id);

    // Criar registro na tabela usuarios
    const { error: erroCriacaoUsuario } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: novoUsuario.user.id,
        email: email,
        agente_publico_id: parseInt(agente_publico_id),
        permissao: permissao
      });

    if (erroCriacaoUsuario) {
      console.error('Erro ao criar perfil do usuário:', erroCriacaoUsuario);
      
      // Se falhar, deletar o usuário criado para não deixar órfão
      await supabaseAdmin.auth.admin.deleteUser(novoUsuario.user.id);
      
      throw new Error(`Erro ao criar perfil do usuário: ${erroCriacaoUsuario.message}`);
    }

    console.log('Convite enviado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Convite enviado com sucesso',
        user_id: novoUsuario.user.id
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Erro na função convidar-usuario:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
