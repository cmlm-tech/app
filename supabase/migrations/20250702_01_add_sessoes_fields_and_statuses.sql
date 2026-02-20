-- Migration: Add new fields and statuses to sessoes table
-- Date: 2024-12-23
-- Description: Adds hora_agendada, local, motivo_cancelamento, data_original, observacoes fields
--              and new statuses 'Adiada', 'Suspensa' to the status_sessao enum

-- 1. Adicionar novos status ao enum status_sessao
ALTER TYPE status_sessao ADD VALUE IF NOT EXISTS 'Adiada';
ALTER TYPE status_sessao ADD VALUE IF NOT EXISTS 'Suspensa';

-- 2. Adicionar novos campos à tabela sessoes
ALTER TABLE sessoes 
ADD COLUMN IF NOT EXISTS hora_agendada TIME DEFAULT '16:00:00',
ADD COLUMN IF NOT EXISTS local VARCHAR DEFAULT 'Plenário da Câmara Municipal',
ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
ADD COLUMN IF NOT EXISTS data_original DATE,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 3. Comentários nas colunas para documentação
COMMENT ON COLUMN sessoes.hora_agendada IS 'Horário agendado para início da sessão (padrão 16:00)';
COMMENT ON COLUMN sessoes.local IS 'Local de realização da sessão';
COMMENT ON COLUMN sessoes.motivo_cancelamento IS 'Motivo do cancelamento ou adiamento, se aplicável';
COMMENT ON COLUMN sessoes.data_original IS 'Data original antes de adiamento';
COMMENT ON COLUMN sessoes.observacoes IS 'Observações gerais sobre a sessão';
