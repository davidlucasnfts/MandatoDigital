-- ============================================================
-- MIGRATION 016: Bairro relacional + coordenadas da comunidade
-- Data: 12/05/2026
-- Descricao: Troca bairros[] por bairro unico relacional e
-- adiciona lat/lng para posicionar comunidade no mapa
-- ============================================================

-- Adiciona colunas novas
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Migra dados: pega o primeiro bairro do array (se existir)
UPDATE comunidades
SET bairro = bairros[1]
WHERE bairros IS NOT NULL AND array_length(bairros, 1) > 0;

-- Remove coluna antiga (array)
ALTER TABLE comunidades DROP COLUMN IF EXISTS bairros;
