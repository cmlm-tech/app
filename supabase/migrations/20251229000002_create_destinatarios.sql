-- Create table for frequent recipients
CREATE TABLE IF NOT EXISTS destinatarios (
    id bigint generated always as identity primary key,
    nome text not null,
    cargo text not null,
    orgao text not null,
    ativo boolean default true,
    created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE destinatarios ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Permitir leitura para usuários autenticados" ON destinatarios
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados" ON destinatarios
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados" ON destinatarios
    FOR UPDATE
    TO authenticated
    USING (true);

-- Seed initial data
INSERT INTO destinatarios (nome, cargo, orgao) VALUES
    ('Gabinete do Prefeito', 'Prefeito Municipal', 'Prefeitura Municipal'),
    ('Secretaria de Saúde', 'Secretário(a) Municipal de Saúde', 'Secretaria Municipal de Saúde'),
    ('Secretaria de Educação', 'Secretário(a) Municipal de Educação', 'Secretaria Municipal de Educação'),
    ('Secretaria de Obras', 'Secretário(a) Municipal de Obras', 'Secretaria Municipal de Obras e Serviços'),
    ('Secretaria de Assistência Social', 'Secretário(a) de Assistência Social', 'Secretaria de Assistência Social'),
    ('Câmara Municipal', 'Presidente', 'Câmara Municipal');
