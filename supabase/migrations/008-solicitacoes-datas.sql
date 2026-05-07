-- ============================================================
-- MIGRATION 008: Melhorias em Solicitacoes
-- Data: 07/05/2026
-- Descricao: Adiciona data_solicitacao e data_evento na tabela
-- solicitacoes para vinculo com agenda
-- ============================================================

ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_solicitacao DATE DEFAULT CURRENT_DATE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_evento DATE;
