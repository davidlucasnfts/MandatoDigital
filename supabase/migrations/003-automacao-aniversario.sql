-- ============================================================
-- MIGRATION 003: Automacao de Aniversario
-- Data: 04/05/2026
-- Descricao: Tabelas para template de mensagem e registro
-- de envios de aniversario via WhatsApp
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS envios_aniversario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eleitor_id UUID REFERENCES eleitores(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  data_envio TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_aniversario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracoes_own" ON configuracoes;
DROP POLICY IF EXISTS "envios_aniversario_own" ON envios_aniversario;

CREATE POLICY "configuracoes_own" ON configuracoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "envios_aniversario_own" ON envios_aniversario FOR ALL USING (user_has_access(owner_id));
