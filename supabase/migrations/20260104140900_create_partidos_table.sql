-- ============================================
-- MIGRAÇÃO 1: CRIAR TABELA DE PARTIDOS
-- ============================================
-- Esta migração é SEGURA e NÃO QUEBRA nada existente
-- Apenas cria nova tabela e adiciona nova coluna (mantém coluna antiga)
-- ============================================

-- 1. CRIAR TABELA DE PARTIDOS
CREATE TABLE IF NOT EXISTS public.partidos (
  id SERIAL PRIMARY KEY,
  sigla VARCHAR(30) UNIQUE NOT NULL,  -- Aumentado para 30 (era 10)
  nome_completo VARCHAR(255) NOT NULL,
  logo_url VARCHAR,
  cor_principal VARCHAR(7),  -- Hex color: '#FF0000'
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.partidos IS 'Partidos políticos cadastrados no sistema';
COMMENT ON COLUMN public.partidos.sigla IS 'Sigla oficial do partido (ex: MDB, PT, PSOL)';
COMMENT ON COLUMN public.partidos.nome_completo IS 'Nome completo oficial do partido';
COMMENT ON COLUMN public.partidos.logo_url IS 'URL do logo do partido';
COMMENT ON COLUMN public.partidos.cor_principal IS 'Cor primária do partido em hexadecimal';
COMMENT ON COLUMN public.partidos.ativo IS 'Indica se o partido ainda está ativo (para partidos extintos)';

-- ============================================
-- 2. POPULAR COM PARTIDOS BRASILEIROS
-- ============================================
INSERT INTO public.partidos (sigla, nome_completo, cor_principal) VALUES
  ('MDB', 'Movimento Democrático Brasileiro', '#00A859'),
  ('PT', 'Partido dos Trabalhadores', '#ED1C24'),
  ('PSDB', 'Partido da Social Democracia Brasileira', '#0080FF'),
  ('PP', 'Progressistas', '#1034A6'),
  ('PDT', 'Partido Democrático Trabalhista', '#FF6600'),
  ('PSD', 'Partido Social Democrático', '#FFD700'),
  ('REPUBLICANOS', 'Republicanos', '#4169E1'),
  ('PL', 'Partido Liberal', '#0047AB'),
  ('PSB', 'Partido Socialista Brasileiro', '#FFD700'),
  ('PSOL', 'Partido Socialismo e Liberdade', '#FF0000'),
  ('UNIÃO', 'União Brasil', '#00529B'),
  ('PODE', 'Podemos', '#FF8C00'),
  ('PCdoB', 'Partido Comunista do Brasil', '#FF0000'),
  ('CIDADANIA', 'Cidadania', '#9932CC'),
  ('PV', 'Partido Verde', '#008000'),
  ('AVANTE', 'Avante', '#FF4500'),
  ('SOLIDARIEDADE', 'Solidariedade', '#FF8C00'),
  ('NOVO', 'Partido Novo', '#FF7F00')
ON CONFLICT (sigla) DO NOTHING;

-- ============================================
-- 3. ADICIONAR NOVA COLUNA partido_id (MANTÉM partido STRING)
-- ============================================
-- IMPORTANTE: NÃO removemos a coluna 'partido' antiga ainda!
-- Isso garante que o sistema continue funcionando

ALTER TABLE public.legislaturavereadores 
  ADD COLUMN IF NOT EXISTS partido_id INTEGER;

-- ============================================
-- 4. POPULAR PARTIDOS QUE JÁ EXISTEM NOS DADOS
-- ============================================
-- Inserir partidos que estão nos dados mas não no seed
INSERT INTO public.partidos (sigla, nome_completo)
SELECT DISTINCT 
  partido as sigla, 
  partido as nome_completo
FROM public.legislaturavereadores
WHERE partido IS NOT NULL 
  AND partido <> ''
  AND partido NOT IN (SELECT sigla FROM public.partidos)
ON CONFLICT (sigla) DO NOTHING;

-- ============================================
-- 5. MIGRAR DADOS EXISTENTES PARA partido_id
-- ============================================
-- Atualizar registros existentes com o partido_id correto
UPDATE public.legislaturavereadores lv
SET partido_id = p.id
FROM public.partidos p
WHERE lv.partido = p.sigla
  AND lv.partido_id IS NULL;

-- ============================================
-- 6. ADICIONAR FOREIGN KEY (sem NOT NULL ainda)
-- ============================================
-- FK permite NULL temporariamente para não quebrar nada
ALTER TABLE public.legislaturavereadores
  ADD CONSTRAINT fk_legislaturavereadores_partido 
  FOREIGN KEY (partido_id) REFERENCES public.partidos(id);

-- ============================================
-- 7. CRIAR ÍNDICE PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_legislaturavereadores_partido 
  ON public.legislaturavereadores(partido_id);

-- ============================================
-- ROLLBACK (se necessário)
-- ============================================
-- Para reverter esta migração:
--
-- ALTER TABLE public.legislaturavereadores DROP CONSTRAINT IF EXISTS fk_legislaturavereadores_partido;
-- ALTER TABLE public.legislaturavereadores DROP COLUMN IF EXISTS partido_id;
-- DROP TABLE IF EXISTS public.partidos CASCADE;
