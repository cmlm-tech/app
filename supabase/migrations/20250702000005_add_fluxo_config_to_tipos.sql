-- Migration: Adicionar colunas de configuração de fluxo em tiposdedocumento
-- Descrição: Adiciona flags para controlar regras de negócio por tipo de documento

-- Adicionar coluna exige_parecer (Default false para não quebrar fluxo existente, mas idealmente deve ser configurado)
ALTER TABLE tiposdedocumento 
ADD COLUMN IF NOT EXISTS exige_parecer BOOLEAN DEFAULT FALSE;

-- Adicionar coluna exige_leitura (Default true, maioria é lido)
ALTER TABLE tiposdedocumento 
ADD COLUMN IF NOT EXISTS exige_leitura BOOLEAN DEFAULT TRUE;

-- Adicionar coluna votacao_turnos (Default 1 turno)
ALTER TABLE tiposdedocumento 
ADD COLUMN IF NOT EXISTS votacao_turnos INTEGER DEFAULT 1;

-- Comentários para documentação
COMMENT ON COLUMN tiposdedocumento.exige_parecer IS 'Define se o documento exige parecer de comissão para ser votado';
COMMENT ON COLUMN tiposdedocumento.exige_leitura IS 'Define se o documento deve ser lido no expediente';
COMMENT ON COLUMN tiposdedocumento.votacao_turnos IS 'Número de turnos de votação necessários (1 ou 2)';

-- Atualizar alguns tipos padrões (Exemplo)
UPDATE tiposdedocumento SET exige_parecer = TRUE WHERE nome IN ('Projeto de Lei', 'Projeto de Decreto Legislativo', 'Proposta de Emenda à Lei Orgânica');
UPDATE tiposdedocumento SET exige_parecer = FALSE WHERE nome IN ('Requerimento', 'Moção', 'Indicação', 'Ofício');

UPDATE tiposdedocumento SET votacao_turnos = 2 WHERE nome IN ('Proposta de Emenda à Lei Orgânica', 'Lei de Diretrizes Orçamentárias', 'Lei Orçamentária Anual');
