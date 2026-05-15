-- 15/05/2026 - Adiciona campos de endereco completo na tabela comunidades
-- CEP, logradouro (rua), numero, estado — vinculados para geocodificacao precisa no mapa

ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS cep VARCHAR(8),
  ADD COLUMN IF NOT EXISTS logradouro VARCHAR(200),
  ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
  ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

-- Atualiza estado baseado na cidade existente (se houver)
UPDATE comunidades SET estado = 'SP' WHERE estado IS NULL AND cidade IS NOT NULL;

COMMENT ON COLUMN comunidades.cep IS 'CEP da comunidade (sem formato, apenas numeros)';
COMMENT ON COLUMN comunidades.logradouro IS 'Rua/avenida/travessa da comunidade';
COMMENT ON COLUMN comunidades.numero IS 'Numero do endereco (S/N se nao houver)';
COMMENT ON COLUMN comunidades.estado IS 'UF da comunidade (2 caracteres)';
