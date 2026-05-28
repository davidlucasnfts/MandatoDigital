-- ============================================================
-- MIGRATION 031: Garante schema completo da tabela solicitacoes
-- Data: 27/05/2026
-- Descricao: Adiciona todas as colunas que podem estar faltando
-- ============================================================

-- Coluna owner_id (migration 002)
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE solicitacoes SET owner_id = user_id WHERE owner_id IS NULL;

-- Colunas de data (migration 008)
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_solicitacao DATE DEFAULT CURRENT_DATE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_evento DATE;

-- Coluna local (migration 029/030)
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS local TEXT;
