-- Migration 013: Vinculo comunidade-cidade + icone
-- Data: 11/05/2026
-- Descricao: Adiciona cidade e icone nas comunidades para vinculo geografico e visual no mapa

ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT 'Users';

COMMENT ON COLUMN comunidades.cidade IS 'Cidade onde a comunidade esta localizada. Usada para posicionar no mapa.';
COMMENT ON COLUMN comunidades.icone IS 'Nome do icone Lucide para exibir no mapa e na lista.';
