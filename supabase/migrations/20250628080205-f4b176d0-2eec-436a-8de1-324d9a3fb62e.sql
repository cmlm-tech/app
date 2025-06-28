
-- Primeiro, criar os tipos customizados que estão sendo usados nas tabelas
CREATE TYPE public.tipo_agente AS ENUM ('Vereador', 'Funcionario');
CREATE TYPE public.tipo_vinculo AS ENUM ('Efetivo', 'Comissionado', 'Terceirizado');

-- Agora criar a função para buscar agentes públicos com status calculado
CREATE OR REPLACE FUNCTION public.get_agentes_publicos_com_status()
RETURNS TABLE (
  id bigint,
  nome_completo character varying,
  cpf character varying,
  foto_url character varying,
  tipo text,
  status_usuario text,
  -- Campos específicos para Vereadores
  nome_parlamentar character varying,
  perfil text,
  -- Campos específicos para Funcionários
  cargo character varying,
  tipo_vinculo text,
  data_admissao date,
  data_exoneracao date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    ap.id,
    ap.nome_completo,
    ap.cpf,
    ap.foto_url,
    ap.tipo::text,
    CASE 
      WHEN u.id IS NULL THEN 'Sem Acesso'
      WHEN au.last_sign_in_at IS NULL THEN 'Convite Pendente'
      ELSE 'Ativo'
    END::text as status_usuario,
    -- Campos de vereadores
    v.nome_parlamentar,
    v.perfil,
    -- Campos de funcionários
    f.cargo,
    f.tipo_vinculo::text,
    f.data_admissao,
    f.data_exoneracao
  FROM public.agentespublicos ap
  LEFT JOIN public.usuarios u ON u.agente_publico_id = ap.id
  LEFT JOIN auth.users au ON au.id = u.id
  LEFT JOIN public.vereadores v ON v.agente_publico_id = ap.id
  LEFT JOIN public.funcionarios f ON f.agente_publico_id = ap.id
  ORDER BY ap.nome_completo;
$$;
