-- Migration 015: Vinculo comunidade → lider real
-- Data: 11/05/2026
-- Descricao: Substitui campo texto 'lider' por FK 'lider_id' para eleitores.id
-- Garante integridade: so pode vincular eleitor cadastrado com nivel = 'lider'

-- 1. Adiciona nova coluna FK
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS lider_id UUID REFERENCES eleitores(id) ON DELETE SET NULL;

-- 2. Remove coluna texto antiga (dados serao perdidos — aceitavel pois era livre)
ALTER TABLE comunidades DROP COLUMN IF EXISTS lider;

-- 3. Comentario
COMMENT ON COLUMN comunidades.lider_id IS 'Referencia ao eleitor que e lider desta comunidade. Deve ter nivel = lider.';
