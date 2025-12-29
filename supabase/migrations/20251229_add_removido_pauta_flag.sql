-- Migration: add_removido_pauta_manualmente_to_pareceres
-- Descrição: Flag para indicar que o parecer foi removido manualmente da pauta

-- Adicionar coluna para marcar pareceres removidos manualmente
ALTER TABLE pareceres 
ADD COLUMN IF NOT EXISTS removido_pauta_manualmente BOOLEAN DEFAULT false;

-- Comentário documentando a coluna
COMMENT ON COLUMN pareceres.removido_pauta_manualmente IS 'Indica que o parecer foi removido manualmente de uma pauta e não deve ser auto-adicionado novamente';
