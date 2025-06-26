
-- Criar bucket para fotos dos agentes públicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos-agentes',
  'fotos-agentes',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Criar política para permitir upload de imagens (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem fazer upload de fotos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'fotos-agentes' AND auth.role() = 'authenticated');

-- Criar política para permitir leitura pública das fotos
CREATE POLICY "Fotos dos agentes são públicas"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'fotos-agentes');

-- Criar política para permitir atualização de fotos (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem atualizar fotos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'fotos-agentes' AND auth.role() = 'authenticated');

-- Criar política para permitir exclusão de fotos (apenas usuários autenticados)
CREATE POLICY "Usuários autenticados podem deletar fotos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'fotos-agentes' AND auth.role() = 'authenticated');
