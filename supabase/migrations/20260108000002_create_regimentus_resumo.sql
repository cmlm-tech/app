-- Criar tabela para resumos automáticos de histórico
CREATE TABLE IF NOT EXISTS regimentus_resumo_historico (
  id SERIAL PRIMARY KEY,
  resumo TEXT NOT NULL,
  periodo_inicio TIMESTAMPTZ NOT NULL,
  periodo_fim TIMESTAMPTZ NOT NULL,
  num_conversas_comprimidas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar resumos por período
CREATE INDEX idx_resumo_historico_periodo ON regimentus_resumo_historico(periodo_inicio, periodo_fim);

-- Comentários
COMMENT ON TABLE regimentus_resumo_historico IS 'Resumos automáticos de conversas antigas comprimidas';
COMMENT ON COLUMN regimentus_resumo_historico.resumo IS 'Resumo gerado pela IA das conversas antigas';
COMMENT ON COLUMN regimentus_resumo_historico.periodo_inicio IS 'Data/hora da conversa mais antiga incluída no resumo';
COMMENT ON COLUMN regimentus_resumo_historico.periodo_fim IS 'Data/hora da conversa mais recente incluída no resumo';
COMMENT ON COLUMN regimentus_resumo_historico.num_conversas_comprimidas IS 'Quantidade de conversas que foram comprimidas neste resumo';
