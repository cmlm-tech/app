-- Migration: Adicionar campos comissao_id e status à tabela pareceres
-- Data: 2024-12-24
-- Descrição: Adiciona vinculação com comissão e status do parecer

-- Adicionar coluna comissao_id
ALTER TABLE pareceres 
ADD COLUMN IF NOT EXISTS comissao_id INTEGER REFERENCES comissoes(id);

-- Adicionar coluna status com valores permitidos
ALTER TABLE pareceres 
ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Pendente' 
CHECK (status IN ('Pendente', 'Em Análise', 'Finalizado'));

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_pareceres_comissao_id ON pareceres(comissao_id);
CREATE INDEX IF NOT EXISTS idx_pareceres_status ON pareceres(status);
CREATE INDEX IF NOT EXISTS idx_pareceres_materia_documento_id ON pareceres(materia_documento_id);

-- Comentários para documentação
COMMENT ON COLUMN pareceres.comissao_id IS 'Comissão responsável por emitir o parecer';
COMMENT ON COLUMN pareceres.status IS 'Status do parecer: Pendente, Em Análise, ou Finalizado';
