-- Migration: Adicionar tipo "Projeto de Resolução"
-- Data: 2026-01-05

-- Inserir o novo tipo de documento
INSERT INTO tiposdedocumento (id, nome, exige_parecer, exige_leitura, votacao_turnos)
VALUES (7, 'Projeto de Resolução', true, true, 2)
ON CONFLICT (id) DO UPDATE 
SET 
  nome = EXCLUDED.nome,
  exige_parecer = EXCLUDED.exige_parecer,
  exige_leitura = EXCLUDED.exige_leitura,
  votacao_turnos = EXCLUDED.votacao_turnos;

-- Comentário explicativo
COMMENT ON TABLE tiposdedocumento IS 'Tipos de documentos legislativos com suas configurações de fluxo';

-- Verificação
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM tiposdedocumento WHERE nome = 'Projeto de Resolução' AND id = 7) THEN
    RAISE NOTICE 'Tipo "Projeto de Resolução" criado com sucesso (ID: 7)';
  END IF;
END$$;
