-- Migration: Create destinatarios VIEW for backward compatibility
-- Description: Provides a view that mimics the old destinatarios table structure

CREATE OR REPLACE VIEW destinatarios AS
SELECT 
    oc.id,
    p.nome,
    c.nome as cargo,
    o.nome as orgao,
    oc.ativo,
    oc.criado_em as created_at
FROM ocupacao_cargo oc
JOIN pessoa p ON p.id = oc.pessoa_id
JOIN cargo c ON c.id = oc.cargo_id
JOIN orgao o ON o.id = c.orgao_id
WHERE oc.ativo = true 
  AND (oc.data_fim IS NULL OR oc.data_fim > CURRENT_DATE);

-- Grant permissions
GRANT SELECT ON destinatarios TO authenticated;

COMMENT ON VIEW destinatarios IS 'VIEW de compatibilidade - mantém interface da tabela antiga para código legado';

-- Optional: Create materialized view for better performance (if needed)
-- CREATE MATERIALIZED VIEW destinatarios_materialized AS
-- SELECT * FROM destinatarios;
-- CREATE UNIQUE INDEX ON destinatarios_materialized (id);
-- GRANT SELECT ON destinatarios_materialized TO authenticated;
