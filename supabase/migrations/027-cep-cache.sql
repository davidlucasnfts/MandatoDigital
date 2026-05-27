-- 27/05/2026: Cache de coordenadas por CEP para reduzir chamadas Here API

CREATE TABLE IF NOT EXISTS cep_cache (
  id SERIAL PRIMARY KEY,
  cep VARCHAR(8) NOT NULL UNIQUE,
  logradouro VARCHAR(200),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'here',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cep_cache_cep ON cep_cache(cep);

COMMENT ON TABLE cep_cache IS 'Cache de coordenadas geocodificadas por CEP para evitar chamadas repetidas à Here API';
