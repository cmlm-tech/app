-- Criar tabela para chunks do regimento (preparação para RAG futuro)
-- Por enquanto, pode ficar vazia até termos o documento do regimento
CREATE TABLE IF NOT EXISTS regimento_chunks (
  id SERIAL PRIMARY KEY,
  titulo TEXT,
  conteudo TEXT NOT NULL,
  secao TEXT, -- Ex: "Capítulo I", "Artigo 5º", etc.
  artigo TEXT, -- Número do artigo para referência
  metadata JSONB, -- Informações adicionais (ex: página, parágrafo, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca textual
CREATE INDEX idx_regimento_chunks_conteudo ON regimento_chunks USING gin(to_tsvector('portuguese', conteudo));
CREATE INDEX idx_regimento_chunks_secao ON regimento_chunks(secao);
CREATE INDEX idx_regimento_chunks_artigo ON regimento_chunks(artigo);

-- Comentários
COMMENT ON TABLE regimento_chunks IS 'Chunks (fragmentos) do regimento interno para busca e RAG';
COMMENT ON COLUMN regimento_chunks.titulo IS 'Título ou assunto do chunk';
COMMENT ON COLUMN regimento_chunks.conteudo IS 'Texto completo do fragmento do regimento';
COMMENT ON COLUMN regimento_chunks.secao IS 'Seção/capítulo do regimento (ex: Capítulo I, Título II)';
COMMENT ON COLUMN regimento_chunks.artigo IS 'Número do artigo (ex: Art. 5º)';
COMMENT ON COLUMN regimento_chunks.metadata IS 'Metadados adicionais em formato JSON';
