-- 27/05/2026: Política RLS para cep_cache — permite leitura/escrita para usuários autenticados

ALTER TABLE cep_cache ENABLE ROW LEVEL SECURITY;

-- Política: usuários autenticados podem ler
CREATE POLICY "cep_cache_select_authenticated"
  ON cep_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: usuários autenticados podem inserir/atualizar
CREATE POLICY "cep_cache_upsert_authenticated"
  ON cep_cache
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
