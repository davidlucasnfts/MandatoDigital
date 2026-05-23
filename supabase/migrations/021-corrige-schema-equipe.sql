-- ============================================================
-- MIGRATION 021: Corrige schema da tabela equipe
-- Data: 22/05/2026
-- Descricao: Recria tabela equipe com UUID (compativel com Drizzle)
--            A tabela original (migration 002) usava UUID, mas o
--            schema.ts estava desatualizado com serial.
-- ============================================================

-- Remove tabela antiga se existir com schema incorreto
DROP TABLE IF EXISTS equipe CASCADE;

-- Recria com UUID (igual migration 002 original)
CREATE TABLE equipe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  role TEXT DEFAULT 'visualizador' CHECK (role IN ('admin','editor','visualizador')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

-- Policy (recria a funcao se nao existir)
CREATE OR REPLACE FUNCTION public.user_has_access(target_owner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = target_owner_id
    OR EXISTS (
      SELECT 1 FROM equipe
      WHERE user_id = auth.uid()
        AND owner_id = target_owner_id
        AND status = 'ativo'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "equipe_own" ON equipe;
CREATE POLICY "equipe_own" ON equipe FOR ALL USING (user_has_access(owner_id));
