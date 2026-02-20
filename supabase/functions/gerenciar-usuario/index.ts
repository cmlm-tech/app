// supabase/functions/gerenciar-usuario/index.ts
// Edge function para ativar/inativar usuários — usa service role para bypassar RLS.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const contentType = req.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Content-Type deve ser application/json')
        }

        const body = await req.json()
        const { agente_publico_id, acao, nova_permissao } = body

        // Validação dos campos obrigatórios
        if (!agente_publico_id || !acao) {
            throw new Error('agente_publico_id e acao são obrigatórios')
        }

        if (!['inativar', 'reativar'].includes(acao)) {
            throw new Error("acao deve ser 'inativar' ou 'reativar'")
        }

        if (acao === 'reativar' && !nova_permissao) {
            throw new Error("nova_permissao é obrigatório para reativação")
        }

        // Cliente admin com service role — bypassa o RLS
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Busca o usuário pelo agente_publico_id (sem RLS)
        const { data: usuarioData, error: fetchError } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('agente_publico_id', agente_publico_id)
            .maybeSingle()

        if (fetchError) {
            throw new Error(`Erro ao buscar usuário: ${fetchError.message}`)
        }

        if (!usuarioData) {
            throw new Error('Este agente ainda não possui um usuário de acesso cadastrado.')
        }

        // Aplica a ação desejada
        const permissao = acao === 'inativar' ? 'Inativo' : nova_permissao
        const { error: updateError } = await supabaseAdmin
            .from('usuarios')
            .update({ permissao })
            .eq('id', usuarioData.id)

        if (updateError) {
            throw new Error(`Erro ao atualizar permissão: ${updateError.message}`)
        }

        const mensagemSucesso = acao === 'inativar'
            ? 'Usuário inativado com sucesso.'
            : 'Usuário reativado com sucesso.'

        return new Response(JSON.stringify({ success: true, message: mensagemSucesso }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })

    } catch (error) {
        console.error('Erro na função gerenciar-usuario:', error)
        return new Response(JSON.stringify({ success: false, error: (error as Error).message || 'Erro desconhecido' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
    }
})
