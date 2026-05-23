-- ============================================================
-- MIGRATION 024: RLS na equipe compativel com service_role
-- Data: 22/05/2026
-- Descricao: Reativa RLS com policy que permite acesso
--            via service_role (API backend) e autenticacao
--            normal via JWT (frontend direto no Supabase).
-- ============================================================

-- Reativa RLS
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

-- Remove policy antiga se existir
DROP POLICY IF EXISTS "equipe_own" ON equipe;
DROP POLICY IF EXISTS "equipe_service_role" ON equipe;
DROP POLICY IF EXISTS "equipe_authenticated" ON equipe;

-- Policy para service_role (API backend) - acesso total
CREATE POLICY "equipe_service_role" ON equipe
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy para usuarios autenticados (frontend direto)
-- Permite ver/editar apenas registros do mesmo owner
CREATE POLICY "equipe_authenticated" ON equipe
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy para anonimo - nega tudo
DROP POLICY IF EXISTS "equipe_anon" ON equipe;
CREATE POLICY "equipe_anon" ON equipe
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
