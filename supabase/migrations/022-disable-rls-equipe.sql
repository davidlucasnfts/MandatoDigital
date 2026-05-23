-- ============================================================
-- MIGRATION 022: Desabilita RLS na tabela equipe para API
-- Data: 22/05/2026
-- Descricao: A API usa service_role_key, mas o Drizzle ORM
--            estava respeitando RLS e bloqueando queries.
--            Desabilitamos RLS na equipe para permitir
--            que a API gerencie registros livremente.
-- ============================================================

ALTER TABLE equipe DISABLE ROW LEVEL SECURITY;
