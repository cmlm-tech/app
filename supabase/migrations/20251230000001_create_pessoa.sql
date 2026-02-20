-- Migration: Create pessoa table
-- Description: Stores individual people (physical or legal entities)

CREATE TABLE pessoa (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    tipo_pessoa VARCHAR(20) DEFAULT 'fisica' CHECK (tipo_pessoa IN ('fisica', 'juridica')),
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pessoa_nome ON pessoa(nome);
CREATE INDEX idx_pessoa_cpf ON pessoa(cpf) WHERE cpf IS NOT NULL;

-- RLS Policies
ALTER TABLE pessoa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar pessoas"
    ON pessoa FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem criar pessoas"
    ON pessoa FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pessoas"
    ON pessoa FOR UPDATE
    TO authenticated
    USING (true);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pessoa_atualizado_em
    BEFORE UPDATE ON pessoa
    FOR EACH ROW
    EXECUTE FUNCTION update_atualizado_em();

COMMENT ON TABLE pessoa IS 'Armazena pessoas físicas ou jurídicas que podem ocupar cargos ou receber documentos';
COMMENT ON COLUMN pessoa.tipo_pessoa IS 'Tipo: fisica (CPF) ou juridica (CNPJ)';
