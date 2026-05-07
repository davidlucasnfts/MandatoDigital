-- ============================================================
-- MIGRATION 002: Multi-usuario com Permissoes (RBAC)
-- Data: 04/05/2026
-- Descricao: Cria tabela equipe, adiciona owner_id em todas
-- as tabelas, atualiza RLS para compartilhamento
-- ============================================================

-- Tabela equipe
CREATE TABLE IF NOT EXISTS equipe (
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

-- Adicionar owner_id em todas as tabelas de negocio
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE comunicacoes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Popular owner_id com user_id existente
UPDATE comunidades SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE eleitores SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE solicitacoes SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE tarefas SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE eventos SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE documentos SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE comunicacoes SET owner_id = user_id WHERE owner_id IS NULL;

-- Funcao auxiliar
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

-- Atualizar policies para usar user_has_access
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comunidades_own" ON comunidades;
DROP POLICY IF EXISTS "eleitores_own" ON eleitores;
DROP POLICY IF EXISTS "solicitacoes_own" ON solicitacoes;
DROP POLICY IF EXISTS "tarefas_own" ON tarefas;
DROP POLICY IF EXISTS "eventos_own" ON eventos;
DROP POLICY IF EXISTS "documentos_own" ON documentos;
DROP POLICY IF EXISTS "comunicacoes_own" ON comunicacoes;
DROP POLICY IF EXISTS "equipe_own" ON equipe;

CREATE POLICY "comunidades_own" ON comunidades FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "eleitores_own" ON eleitores FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "solicitacoes_own" ON solicitacoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "tarefas_own" ON tarefas FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "eventos_own" ON eventos FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "documentos_own" ON documentos FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "comunicacoes_own" ON comunicacoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "equipe_own" ON equipe FOR ALL USING (user_has_access(owner_id));
