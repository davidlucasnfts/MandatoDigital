-- ============================================================
-- MIGRATION 007: Storage Bucket Documentos
-- Data: baseline (antes do versionamento)
-- Descricao: Cria bucket para armazenamento de documentos
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "storage_own" ON storage.objects;

CREATE POLICY "storage_own" ON storage.objects
  FOR ALL USING (bucket_id = 'documentos' AND auth.uid() = owner);
