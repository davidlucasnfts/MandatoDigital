-- 10/05/2026 - Adiciona coordenadas geograficas (lat/lng) aos eleitores para posicionamento preciso no mapa

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

COMMENT ON COLUMN eleitores.latitude IS 'Latitude do endereco do eleitor (geocodificado via Nominatim/OpenStreetMap)';
COMMENT ON COLUMN eleitores.longitude IS 'Longitude do endereco do eleitor (geocodificado via Nominatim/OpenStreetMap)';
