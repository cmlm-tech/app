-- Migration: Create cargo table
-- Description: Stores positions/roles within organizations

CREATE TABLE cargo (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    orgao_id BIGINT REFERENCES orgao(id) ON DELETE CASCADE,
    permite_generico BOOLEAN DEFAULT false, -- Se permite enviar "À Secretaria" sem pessoa específica
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cargo_nome ON cargo(nome);
CREATE INDEX idx_cargo_orgao ON cargo(orgao_id);

-- RLS Policies
ALTER TABLE cargo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar cargos"
    ON cargo FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem criar cargos"
    ON cargo FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar cargos"
    ON cargo FOR UPDATE
    TO authenticated
    USING (true);

COMMENT ON TABLE cargo IS 'Armazena cargos/funções dentro de órgãos';
COMMENT ON COLUMN cargo.permite_generico IS 'Se true, permite enviar documentos ao cargo sem especificar pessoa';
