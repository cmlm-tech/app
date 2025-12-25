-- Migration: Status de Documentos Expandido (Milestone 5)
-- Descrição: Expande a lista de status permitidos para documentos para refletir o ciclo de vida legislativo completo.

-- 1. Alterar a Check Constraint existente (se houver) ou recriar
-- Nota: Supabase / Postgres não permite alterar CHECK constraints facilmente, geralmente dropamos e recriamos.
-- Assumindo que a constraint se chama "documentos_status_check" (valide o nome no seu banco se der erro)

ALTER TABLE documentos DROP CONSTRAINT IF EXISTS documentos_status_check;

-- 2. Migrar dados antigos ANTES de aplicar nova constraint
-- Converter "Tramitando" para "Protocolado" (estado inicial)
-- Converter "Pendente" (se houver, de legado) para "Protocolado"
UPDATE documentos SET status = 'Protocolado' WHERE status IN ('Tramitando', 'Pendente');

-- 3. Aplicar nova constrain com Status Expandidos
ALTER TABLE documentos ADD CONSTRAINT documentos_status_check CHECK (
  status IN (
    'Rascunho',         -- Em elaboração, não visível publicamente
    'Protocolado',      -- Recebido e numerado (Estado inicial público)
    'Leitura',          -- Aguardando leitura no expediente (Opcional, pode ser usado para pauta)
    'Em Comissão',      -- Em análise pelas comissões (tem parecer pendente)
    'Pronto para Pauta',-- Comissões concluídas, pronto para votação
    'Aprovado',         -- Votado e aprovado
    'Rejeitado',        -- Votado e rejeitado
    'Arquivado'         -- Finalizado sem votação ou após trâmite
  )
);

-- Comentário explicativo
COMMENT ON COLUMN documentos.status IS 'Ciclo de vida: Rascunho -> Protocolado -> (Leitura) -> Em Comissão -> Pronto para Pauta -> Aprovado/Rejeitado/Arquivado';
