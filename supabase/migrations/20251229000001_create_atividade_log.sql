-- Migration: create_atividade_log_table
-- Descrição: Tabela para armazenar atividades recentes do sistema

-- Tabela para armazenar atividades recentes do sistema
CREATE TABLE atividade_log (
  id SERIAL PRIMARY KEY,
  
  -- Tipo e descrição da atividade
  tipo TEXT NOT NULL,              -- 'protocolo', 'parecer', 'sessao', 'comissao', 'votacao', 'lideranca'
  descricao TEXT NOT NULL,         -- Human-readable: "protocolou o Ofício nº 130/2025"
  
  -- Referência à entidade relacionada
  entidade_tipo TEXT,              -- 'documento', 'sessao', 'comissao', 'legislatura'
  entidade_id INTEGER,             -- ID da entidade relacionada
  
  -- SUJEITO da atividade (vereador/agente relacionado)
  agente_publico_id INTEGER REFERENCES agentespublicos(id),  -- Quem é o SUJEITO (ex: "Joaquim Silva protocolou...")
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_atividade_log_created_at ON atividade_log(created_at DESC);
CREATE INDEX idx_atividade_log_agente ON atividade_log(agente_publico_id);

-- Comentários para documentação
COMMENT ON TABLE atividade_log IS 'Registro de atividades recentes do sistema para exibição no painel';
COMMENT ON COLUMN atividade_log.agente_publico_id IS 'O vereador/agente que é SUJEITO da atividade (não quem executou)';

-- Dados de exemplo para testar
INSERT INTO atividade_log (tipo, descricao, entidade_tipo, entidade_id, agente_publico_id, created_at) VALUES
('protocolo', 'protocolou o Ofício nº 130/2025.', 'documento', 130, (SELECT id FROM agentespublicos WHERE nome_completo ILIKE '%Joaquim%' LIMIT 1), NOW() - INTERVAL '1 hour'),
('parecer', 'A Comissão de Justiça emitiu parecer sobre o PL nº 14/2025.', 'documento', 14, NULL, NOW() - INTERVAL '2 hours'),
('sessao', 'A Pauta da próxima sessão foi publicada.', 'sessao', 1, NULL, NOW() - INTERVAL '3 hours'),
('comissao', 'foi adicionada à Comissão de Cultura, Educação e Assistência Social.', 'comissao', 1, (SELECT id FROM agentespublicos WHERE nome_completo ILIKE '%Maria%' LIMIT 1), NOW() - INTERVAL '4 hours'),
('sessao', 'Sessão extraordinária agendada para o dia 20/06/2025.', 'sessao', 2, NULL, NOW() - INTERVAL '5 hours');
