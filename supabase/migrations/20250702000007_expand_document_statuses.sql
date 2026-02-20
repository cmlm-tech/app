-- Migration Corrigida v7: Expansão de Status (A Batalha Final das Policies)

-- 1. Dropar TODAS as 6 Policies que dependem da coluna/tipo antigo
-- Tabela documentos
DROP POLICY IF EXISTS "Leitura de documentos" ON "public"."documentos";
DROP POLICY IF EXISTS "Modificação de documentos" ON "public"."documentos"; 
DROP POLICY IF EXISTS "Exclusão de documentos" ON "public"."documentos";

-- Tabela documentoautores
DROP POLICY IF EXISTS "Leitura segura de DocumentoAutores" ON "public"."documentoautores";
DROP POLICY IF EXISTS "Modificação segura de DocumentoAutores" ON "public"."documentoautores";
DROP POLICY IF EXISTS "Acesso geral a DocumentoAutores" ON "public"."documentoautores";

-- Tabela documentotags
DROP POLICY IF EXISTS "Acesso a ligações Documento-Tags" ON "public"."documentotags";

-- 2. Converte e Migra
ALTER TABLE documentos ALTER COLUMN status DROP DEFAULT;
ALTER TABLE documentos ALTER COLUMN status TYPE text;
UPDATE documentos SET status = 'Protocolado' WHERE status IN ('Tramitando', 'Pendente');

-- 3. Recria ENUM
DROP TYPE IF EXISTS status_documento CASCADE;
CREATE TYPE status_documento AS ENUM (
    'Rascunho', 'Protocolado', 'Leitura',
    'Em Comissão', 'Pronto para Pauta',
    'Aprovado', 'Rejeitado', 'Arquivado'
);
ALTER TABLE documentos ALTER COLUMN status TYPE status_documento USING status::status_documento;
ALTER TABLE documentos ALTER COLUMN status SET DEFAULT 'Rascunho'::status_documento;

-- 4. Restaura TODAS as 6 Policies

-- 4.1 Documentos - Leitura
CREATE POLICY "Leitura de documentos" ON "public"."documentos" 
FOR SELECT USING (
  (
    (SELECT "public"."is_staff"()) 
    OR ("status" <> 'Rascunho'::"public"."status_documento") 
    OR ("criado_por_usuario_id" = "auth"."uid"())
  )
);

-- 4.2 Documentos - Modificação
CREATE POLICY "Modificação de documentos" ON "public"."documentos" 
FOR UPDATE USING (
  (
    ("status" = 'Rascunho'::"public"."status_documento") 
    AND (
      ("criado_por_usuario_id" = (SELECT "auth"."uid"())) 
      OR (SELECT "public"."is_staff"())
    )
  )
);

-- 4.3 Documentos - Exclusão
CREATE POLICY "Exclusão de documentos" ON "public"."documentos" 
FOR DELETE USING (
  (
    ("status" = 'Rascunho'::"public"."status_documento") 
    AND (
      ("criado_por_usuario_id" = (SELECT "auth"."uid"())) 
      OR (SELECT "public"."is_staff"())
    )
  )
);

-- 4.4 Autores - Leitura
CREATE POLICY "Leitura segura de DocumentoAutores" ON "public"."documentoautores" 
FOR SELECT USING (
  ("documento_id" IN ( 
    SELECT "documentos"."id"
    FROM "public"."documentos"
    WHERE (
      ("documentos"."status" = 'Rascunho'::"public"."status_documento") 
      AND (("documentos"."criado_por_usuario_id" = "auth"."uid"()) OR "public"."is_staff"())
    )
  ))
);

-- 4.5 Autores - Modificação
CREATE POLICY "Modificação segura de DocumentoAutores" ON "public"."documentoautores" 
USING (
  ("documento_id" IN ( 
    SELECT "documentos"."id"
    FROM "public"."documentos"
    WHERE (
      ("documentos"."status" = 'Rascunho'::"public"."status_documento") 
      AND (("documentos"."criado_por_usuario_id" = "auth"."uid"()) OR "public"."is_staff"())
    )
  ))
)
WITH CHECK (
  ("documento_id" IN ( 
    SELECT "documentos"."id"
    FROM "public"."documentos"
    WHERE (
      ("documentos"."status" = 'Rascunho'::"public"."status_documento") 
      AND (("documentos"."criado_por_usuario_id" = "auth"."uid"()) OR "public"."is_staff"())
    )
  ))
);

-- 4.5b Autores - Acesso Geral
CREATE POLICY "Acesso geral a DocumentoAutores" ON "public"."documentoautores" 
USING (
  (EXISTS ( 
    SELECT 1
    FROM "public"."documentos"
    WHERE ("documentos"."id" = "documentoautores"."documento_id")
  ))
)
WITH CHECK (
  (EXISTS ( 
    SELECT 1
    FROM "public"."documentos"
    WHERE (
      ("documentos"."id" = "documentoautores"."documento_id") 
      AND ("documentos"."status" = 'Rascunho'::"public"."status_documento") 
      AND (("documentos"."criado_por_usuario_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_staff"() AS "is_staff"))
    )
  ))
);

-- 4.6 Tags - Acesso
CREATE POLICY "Acesso a ligações Documento-Tags" ON "public"."documentotags" 
USING (
  (EXISTS ( 
    SELECT 1
    FROM "public"."documentos"
    WHERE ("documentos"."id" = "documentotags"."documento_id")
  ))
)
WITH CHECK (
  (EXISTS ( 
    SELECT 1
    FROM "public"."documentos"
    WHERE (
      ("documentos"."id" = "documentotags"."documento_id") 
      AND ("documentos"."status" = 'Rascunho'::"public"."status_documento") 
      AND (("documentos"."criado_por_usuario_id" = (SELECT "auth"."uid"())) OR (SELECT "public"."is_staff"()))
    )
  ))
);

-- Comentário explicativo
COMMENT ON COLUMN documentos.status IS 'Ciclo de vida: Rascunho -> Protocolado -> Leitura -> Em Comissão -> Pronto para Pauta -> Aprovado/Rejeitado/Arquivado';
