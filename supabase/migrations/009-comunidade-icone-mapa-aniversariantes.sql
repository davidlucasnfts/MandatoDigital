-- ============================================================
-- MIGRATION 009: Comunidade Icone, Mapa Bounds, Aniversariantes
-- Data: 07/05/2026
-- Descricao: Adiciona icone em comunidades; schema ja possui
-- data_solicitacao/data_evento (migration 008)
-- ============================================================

-- Comunidades: icone personalizado
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT 'Users';

-- Atualizar comunidades existentes
UPDATE comunidades SET icone = 'Users' WHERE icone IS NULL;
