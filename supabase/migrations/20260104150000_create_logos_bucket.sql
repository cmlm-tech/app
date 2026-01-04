-- ============================================
-- CRIAR BUCKET PARA LOGOS DE PARTIDOS
-- ============================================

-- Criar bucket público para logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Definir política de leitura pública (qualquer um pode ver)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Política de upload (apenas usuários autenticados)
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos' 
  AND auth.role() = 'authenticated'
);

-- Política de atualização (apenas usuários autenticados)
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos' 
  AND auth.role() = 'authenticated'
);

-- Política de exclusão (apenas usuários autenticados)
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- ROLLBACK (se necessário)
-- ============================================
-- Para reverter:
-- DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'logos';
