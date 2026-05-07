-- ============================================================
-- MIGRATION 006: Melhorias no Cadastro de Eleitores
-- Data: 07/05/2026
-- Descricao: Adiciona nome_mae, indicador_id, e cria tabela
-- convites_eleitores para afiliacao por lideres
-- ============================================================

-- 1. Novos campos na tabela eleitores
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS nome_mae TEXT;
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS indicador_id UUID REFERENCES eleitores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_eleitores_indicador ON eleitores(indicador_id);
CREATE INDEX IF NOT EXISTS idx_eleitores_nome_mae ON eleitores(nome_mae);

-- 2. Tabela de convites para afiliacao
CREATE TABLE IF NOT EXISTS convites_eleitores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  indicador_id UUID REFERENCES eleitores(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado','expirado')),
  data_expiracao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_convites_token ON convites_eleitores(token);
CREATE INDEX IF NOT EXISTS idx_convites_indicador ON convites_eleitores(indicador_id);
CREATE INDEX IF NOT EXISTS idx_convites_status ON convites_eleitores(status);

-- 3. RLS para convites
ALTER TABLE convites_eleitores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "convites_eleitores_own" ON convites_eleitores;
CREATE POLICY "convites_eleitores_own" ON convites_eleitores FOR ALL USING (user_has_access(owner_id));
