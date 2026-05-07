-- ============================================================
-- MIGRATION 004: Logs de Auditoria LGPD
-- Data: 07/05/2026
-- Descricao: Cria tabela de auditoria para rastrear acessos
-- e modificacoes em dados de cidadaos
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create','read','update','delete','login','logout','export')),
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_own" ON audit_logs;
CREATE POLICY "audit_logs_own" ON audit_logs FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
