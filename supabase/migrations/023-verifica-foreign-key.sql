-- ============================================================
-- MIGRATION 023: Remove foreign key constraints da equipe
-- Data: 22/05/2026
-- Descricao: A API cria usuarios via Supabase Auth, mas as
--            foreign keys para auth.users podem falhar se
--            houver inconsistencia. Removemos as FKs para
--            garantir que a query funcione.
-- ============================================================

-- Remove foreign keys da tabela equipe
ALTER TABLE equipe DROP CONSTRAINT IF EXISTS equipe_user_id_fkey;
ALTER TABLE equipe DROP CONSTRAINT IF EXISTS equipe_owner_id_fkey;
