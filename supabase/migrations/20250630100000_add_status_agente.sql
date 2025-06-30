-- Adicionar coluna de status do agente na tabela agentespublicos
ALTER TABLE public.agentespublicos
ADD COLUMN status_agente TEXT DEFAULT 'Ativo' NOT NULL;

-- Atualizar a função para priorizar o status_agente E MANTER OS TIPOS CORRETOS
CREATE OR REPLACE FUNCTION public.get_agentes_publicos_com_status()
RETURNS TABLE (
  id bigint,
  nome_completo character varying,
  cpf character varying,
  foto_url character varying,
  -- Usando o tipo ENUM original e correto
  tipo public.tipo_agente_publico,
  status_usuario text,
  nome_parlamentar character varying,
  perfil text,
  cargo character varying,
  -- Usando o tipo ENUM original e correto
  tipo_vinculo public.tipo_vinculo_funcionario,
  data_admissao date,
  data_exoneracao date
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT
    ap.id,
    ap.nome_completo,
    ap.cpf,
    ap.foto_url,
    ap.tipo, -- Não é mais necessário converter para texto
    CASE
      WHEN ap.status_agente = 'Inativo' THEN 'Inativo'
      WHEN u.id IS NULL THEN 'Sem Acesso'
      WHEN au.last_sign_in_at IS NULL THEN 'Convite Pendente'
      ELSE 'Ativo'
    END::text as status_usuario,
    v.nome_parlamentar,
    v.perfil,
    f.cargo,
    f.tipo_vinculo, -- Não é mais necessário converter para texto
    f.data_admissao,
    f.data_exoneracao
  FROM public.agentespublicos ap
  LEFT JOIN public.usuarios u ON u.agente_publico_id = ap.id
  LEFT JOIN auth.users au ON au.id = u.id
  LEFT JOIN public.vereadores v ON v.agente_publico_id = ap.id
  LEFT JOIN public.funcionarios f ON f.agente_publico_id = ap.id
  ORDER BY ap.nome_completo;
$$;