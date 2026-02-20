-- Migration: Migrate data from destinatarios to new normalized tables
-- Description: Transfers existing recipient data to pessoa, orgao, cargo, and ocupacao_cargo

-- Step 1: Backup original table
CREATE TABLE destinatarios_backup AS SELECT * FROM destinatarios;

-- Step 2: Migrate unique Órgãos
INSERT INTO orgao (nome, tipo_orgao)
SELECT DISTINCT 
    orgao,
    CASE 
        WHEN orgao ILIKE '%secretaria%' THEN 'Secretaria'
        WHEN orgao ILIKE '%prefeitura%' OR orgao ILIKE '%gabinete%' THEN 'Prefeitura'
        WHEN orgao ILIKE '%câmara%' OR orgao ILIKE '%camara%' THEN 'Camara'
        ELSE 'Outros'
    END as tipo_orgao
FROM destinatarios_backup
WHERE orgao IS NOT NULL AND orgao != '';

-- Step 3: Migrate unique Pessoas (assuming nome is unique for now)
INSERT INTO pessoa (nome, tipo_pessoa)
SELECT DISTINCT nome, 'fisica'
FROM destinatarios_backup
WHERE nome IS NOT NULL AND nome != '';

-- Step 4: Migrate Cargos linked to Órgãos
INSERT INTO cargo (nome, orgao_id, permite_generico)
SELECT DISTINCT 
    d.cargo,
    o.id,
    true -- Permite envio genérico para cargo
FROM destinatarios_backup d
JOIN orgao o ON o.nome = d.orgao
WHERE d.cargo IS NOT NULL AND d.cargo != '';

-- Step 5: Create active Ocupações
INSERT INTO ocupacao_cargo (pessoa_id, cargo_id, ativo, data_inicio)
SELECT 
    p.id,
    c.id,
    COALESCE(d.ativo, true),
    CURRENT_DATE
FROM destinatarios_backup d
JOIN pessoa p ON p.nome = d.nome
JOIN orgao o ON o.nome = d.orgao
JOIN cargo c ON c.nome = d.cargo AND c.orgao_id = o.id;

-- Step 6: Rename original table (keep for rollback)
ALTER TABLE destinatarios RENAME TO destinatarios_deprecated;

-- Verification queries (commented out, uncomment to check)
-- SELECT 'Pessoas migradas:' as info, COUNT(*) as total FROM pessoa;
-- SELECT 'Órgãos migrados:' as info, COUNT(*) as total FROM orgao;
-- SELECT 'Cargos migrados:' as info, COUNT(*) as total FROM cargo;
-- SELECT 'Ocupações criadas:' as info, COUNT(*) as total FROM ocupacao_cargo;

COMMENT ON TABLE destinatarios_backup IS 'Backup da tabela original destinatarios antes da migração';
COMMENT ON TABLE destinatarios_deprecated IS 'Tabela original renomeada - manter para rollback se necessário';
