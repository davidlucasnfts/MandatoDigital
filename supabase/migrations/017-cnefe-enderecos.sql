-- 14/05/2026 - Tabela CNEFE (Cadastro Nacional de Enderecos para Fins Estatisticos - IBGE)
-- Base de endereços georreferenciados do Censo 2022 para geocodificacao local
-- Fonte: ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/

CREATE TABLE IF NOT EXISTS cnefe_enderecos (
  id SERIAL PRIMARY KEY,
  uf VARCHAR(2) NOT NULL,
  codigo_municipio VARCHAR(20),
  municipio VARCHAR(100),
  bairro VARCHAR(100),
  tipo_logradouro VARCHAR(50),
  nome_logradouro VARCHAR(200) NOT NULL,
  numero VARCHAR(20),
  cep VARCHAR(8),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  nivel_geocodificacao INTEGER DEFAULT 3,
  codigo_unico VARCHAR(50) UNIQUE
);

-- Index para busca rapida por CEP
CREATE INDEX IF NOT EXISTS idx_cnefe_cep ON cnefe_enderecos(cep);

-- Index para busca por municipio + logradouro
CREATE INDEX IF NOT EXISTS idx_cnefe_municipio_logradouro ON cnefe_enderecos(municipio, nome_logradouro);

-- Index para busca por UF (para importacao parcial)
CREATE INDEX IF NOT EXISTS idx_cnefe_uf ON cnefe_enderecos(uf);

-- Index espacial para buscas proximas (opcional, pode ser ativado depois)
-- CREATE INDEX IF NOT EXISTS idx_cnefe_coords ON cnefe_enderecos USING btree(latitude, longitude);

COMMENT ON TABLE cnefe_enderecos IS 'Base CNEFE do IBGE (Censo 2022) - enderecos georreferenciados do Brasil';
COMMENT ON COLUMN cnefe_enderecos.nivel_geocodificacao IS '1=original, 2=modificada, 3=endereco, 4=logradouro, 5=localidade, 6=município';
