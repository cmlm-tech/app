-- Migration: Create orgao table
-- Description: Stores organizations (government bodies, departments, etc.)

CREATE TABLE orgao (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_orgao VARCHAR(100), -- 'Prefeitura', 'Secretaria', 'Camara', etc.
    endereco_logradouro VARCHAR(255),
    endereco_cidade VARCHAR(100),
    endereco_uf VARCHAR(2),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orgao_nome ON orgao(nome);
CREATE INDEX idx_orgao_tipo ON orgao(tipo_orgao) WHERE tipo_orgao IS NOT NULL;

-- RLS Policies
ALTER TABLE orgao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar órgãos"
    ON orgao FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem criar órgãos"
    ON orgao FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar órgãos"
    ON orgao FOR UPDATE
    TO authenticated
    USING (true);

COMMENT ON TABLE orgao IS 'Armazena órgãos públicos e entidades que possuem cargos';
COMMENT ON COLUMN orgao.tipo_orgao IS 'Classificação do órgão: Prefeitura, Secretaria, Camara, etc.';
