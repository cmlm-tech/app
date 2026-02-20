-- ============================================
-- MIGRAÇÃO 2: CAMPOS COMPLEMENTARES DE VEREADORES
-- ============================================
-- Esta migração é TOTALMENTE SEGURA
-- Apenas ADICIONA colunas novas (todas nullable)
-- NÃO afeta nenhum dado ou funcionalidade existente
-- ============================================

-- Adicionar campos complementares à tabela vereadores
ALTER TABLE public.vereadores
  ADD COLUMN IF NOT EXISTS email_gabinete VARCHAR,
  ADD COLUMN IF NOT EXISTS telefone_gabinete VARCHAR,
  ADD COLUMN IF NOT EXISTS biografia_completa TEXT,
  ADD COLUMN IF NOT EXISTS site_pessoal VARCHAR,
  ADD COLUMN IF NOT EXISTS instagram VARCHAR,
  ADD COLUMN IF NOT EXISTS facebook VARCHAR,
  ADD COLUMN IF NOT EXISTS twitter VARCHAR,
  ADD COLUMN IF NOT EXISTS formacao_academica TEXT,
  ADD COLUMN IF NOT EXISTS profissao_anterior VARCHAR,
  ADD COLUMN IF NOT EXISTS areas_atuacao TEXT[];

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.vereadores.email_gabinete IS 'Email institucional do gabinete do vereador';
COMMENT ON COLUMN public.vereadores.telefone_gabinete IS 'Telefone de contato do gabinete';
COMMENT ON COLUMN public.vereadores.biografia_completa IS 'Biografia detalhada do vereador (campo perfil existente é resumo)';
COMMENT ON COLUMN public.vereadores.site_pessoal IS 'Website pessoal ou de campanha';
COMMENT ON COLUMN public.vereadores.instagram IS 'Username do Instagram (sem @)';
COMMENT ON COLUMN public.vereadores.facebook IS 'URL do perfil no Facebook';
COMMENT ON COLUMN public.vereadores.twitter IS 'Username do Twitter/X (sem @)';
COMMENT ON COLUMN public.vereadores.formacao_academica IS 'Formação acadêmica e cursos';
COMMENT ON COLUMN public.vereadores.profissao_anterior IS 'Profissão exercida antes do mandato';
COMMENT ON COLUMN public.vereadores.areas_atuacao IS 'Áreas de atuação parlamentar (ex: ["Saúde", "Educação"])';

-- ============================================
-- ROLLBACK (se necessário)
-- ============================================
-- Para reverter esta migração:
--
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS email_gabinete;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS telefone_gabinete;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS biografia_completa;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS site_pessoal;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS instagram;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS facebook;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS twitter;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS formacao_academica;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS profissao_anterior;
-- ALTER TABLE public.vereadores DROP COLUMN IF EXISTS areas_atuacao;
