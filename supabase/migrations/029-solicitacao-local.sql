-- ============================================================
-- MIGRATION 029: Adiciona campo local na tabela solicitacoes
-- Data: 27/05/2026
-- Descricao: Campo para endereco/local da demanda solicitada
-- ============================================================

ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS local TEXT;
