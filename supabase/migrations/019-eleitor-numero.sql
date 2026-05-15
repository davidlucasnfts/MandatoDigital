-- 15/05/2026 - Adiciona campo numero (numero da casa) na tabela eleitores
-- Para endereco completo vinculado, igual ao modelo de comunidades

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS numero VARCHAR(20);

COMMENT ON COLUMN eleitores.numero IS 'Numero do endereco do eleitor (S/N se nao houver)';
