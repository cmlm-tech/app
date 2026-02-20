-- Migration: Add fields to sessaopauta for item tracking
-- Date: 2024-12-24
-- Description: Adds tipo_item and status_item to track agenda item status during session conduct

-- 1. Adicionar campos à sessaopauta
ALTER TABLE sessaopauta 
ADD COLUMN IF NOT EXISTS tipo_item VARCHAR DEFAULT 'Ordem do Dia',
ADD COLUMN IF NOT EXISTS status_item VARCHAR DEFAULT 'Pendente';

-- 2. Comentários
COMMENT ON COLUMN sessaopauta.tipo_item IS 'Tipo do item: Expediente, Ordem do Dia, Explicações Pessoais';
COMMENT ON COLUMN sessaopauta.status_item IS 'Status do item: Pendente, Em Votação, Votado, Adiado, Retirado';

-- 3. Tabela para consolidar resultado de votação
CREATE TABLE IF NOT EXISTS sessaovotacao_resultado (
  id SERIAL PRIMARY KEY,
  sessao_id INTEGER REFERENCES sessoes(id) ON DELETE CASCADE,
  documento_id INTEGER REFERENCES documentos(id) ON DELETE CASCADE,
  item_pauta_id INTEGER REFERENCES sessaopauta(id) ON DELETE CASCADE,
  votos_sim INTEGER DEFAULT 0,
  votos_nao INTEGER DEFAULT 0,
  abstencoes INTEGER DEFAULT 0,
  ausentes INTEGER DEFAULT 0,
  resultado VARCHAR, -- 'Aprovado', 'Rejeitado', 'Adiado', 'Retirado'
  voto_minerva_usado BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sessao_id, documento_id)
);

COMMENT ON TABLE sessaovotacao_resultado IS 'Resultado consolidado de cada votação por documento/sessão';
