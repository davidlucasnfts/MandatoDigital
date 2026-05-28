-- ============================================================
-- MIGRATION 030: Garante colunas faltantes na tabela solicitacoes
-- Data: 27/05/2026
-- Descricao: Adiciona data_solicitacao, data_evento e local
-- caso a migration 008 nao tenha sido aplicada
-- ============================================================

-- Colunas de data (migration 008)
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_solicitacao DATE DEFAULT CURRENT_DATE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_evento DATE;

-- Coluna de local (migration 029)
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS local TEXT;
