-- Migration: Adicionar campos de publicação de pauta na tabela sessoes
-- Permite controlar se a pauta foi publicada e quando

ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS pauta_publicada BOOLEAN DEFAULT FALSE;
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS data_publicacao_pauta TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessoes ADD COLUMN IF NOT EXISTS pauta_pdf_url TEXT;

-- Comentários para documentação
COMMENT ON COLUMN sessoes.pauta_publicada IS 'Indica se a pauta da sessão foi publicada oficialmente';
COMMENT ON COLUMN sessoes.data_publicacao_pauta IS 'Data e hora em que a pauta foi publicada';
COMMENT ON COLUMN sessoes.pauta_pdf_url IS 'URL do PDF da pauta armazenado no storage (opcional)';
