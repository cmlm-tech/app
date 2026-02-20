-- Migration: Create ocupacao_cargo table
-- Description: Stores the relationship between people and positions (with temporal tracking)

CREATE TABLE ocupacao_cargo (
    id BIGSERIAL PRIMARY KEY,
    pessoa_id BIGINT REFERENCES pessoa(id) ON DELETE CASCADE,
    cargo_id BIGINT REFERENCES cargo(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE, -- NULL = ainda ocupa o cargo
    ativo BOOLEAN DEFAULT true, -- Facilita queries / licenças temporárias
    criado_em TIMESTAMP DEFAULT NOW(),
    CONSTRAINT ocupacao_unica UNIQUE (pessoa_id, cargo_id, data_inicio)
);

-- Indexes for performance
CREATE INDEX idx_ocupacao_pessoa ON ocupacao_cargo(pessoa_id);
CREATE INDEX idx_ocupacao_cargo ON ocupacao_cargo(cargo_id);
CREATE INDEX idx_ocupacao_ativo ON ocupacao_cargo(ativo) WHERE ativo = true;
CREATE INDEX idx_ocupacao_data_fim ON ocupacao_cargo(data_fim) WHERE data_fim IS NULL;

-- RLS Policies
ALTER TABLE ocupacao_cargo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar ocupações"
    ON ocupacao_cargo FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem criar ocupações"
    ON ocupacao_cargo FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar ocupações"
    ON ocupacao_cargo FOR UPDATE
    TO authenticated
    USING (true);

COMMENT ON TABLE ocupacao_cargo IS 'Registra quando uma pessoa ocupa um cargo, com histórico temporal';
COMMENT ON COLUMN ocupacao_cargo.data_fim IS 'NULL indica que a pessoa ainda ocupa o cargo';
COMMENT ON COLUMN ocupacao_cargo.ativo IS 'Permite desativar temporariamente sem definir data_fim';
