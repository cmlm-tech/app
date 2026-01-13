-- Criar tabela para chat compartilhado do Regimentus
CREATE TABLE IF NOT EXISTS regimentus_chat (
  id SERIAL PRIMARY KEY,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  chunks_usados INTEGER[], -- IDs dos chunks relevantes (para futura implementação de RAG)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar conversas recentes rapidamente
CREATE INDEX idx_regimentus_chat_created_at ON regimentus_chat(created_at DESC);

-- Comentários para documentação
COMMENT ON TABLE regimentus_chat IS 'Histórico compartilhado de perguntas e respostas sobre o regimento interno';
COMMENT ON COLUMN regimentus_chat.pergunta IS 'Pergunta feita por algum usuário';
COMMENT ON COLUMN regimentus_chat.resposta IS 'Resposta gerada pelo Regimentus (Gemini AI)';
COMMENT ON COLUMN regimentus_chat.chunks_usados IS 'Array de IDs dos chunks do regimento utilizados para gerar a resposta (RAG)';
