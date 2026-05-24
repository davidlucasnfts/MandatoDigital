-- 24/05/2026 - Adiciona campos eleitorais e vinculo de lider com lider
-- Secao, zona e titulo de eleitor para controle eleitoral
-- lider_vinculado_id permite que um lider seja vinculado a outro lider

-- Campos eleitorais
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS secao VARCHAR(10);
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS zona VARCHAR(10);
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS titulo_eleitor VARCHAR(20);

-- Vinculo de lider com outro lider (auto-relacionamento)
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS lider_vinculado_id UUID REFERENCES eleitores(id) ON DELETE SET NULL;

-- Comentarios explicativos
COMMENT ON COLUMN eleitores.secao IS 'Secao eleitoral do eleitor';
COMMENT ON COLUMN eleitores.zona IS 'Zona eleitoral do eleitor';
COMMENT ON COLUMN eleitores.titulo_eleitor IS 'Numero do titulo de eleitor';
COMMENT ON COLUMN eleitores.lider_vinculado_id IS 'Lider pai - permite vincular um lider a outro lider (hierarquia multi-nivel)';

-- Index para busca rapida
CREATE INDEX IF NOT EXISTS idx_eleitores_secao ON eleitores(secao);
CREATE INDEX IF NOT EXISTS idx_eleitores_zona ON eleitores(zona);
CREATE INDEX IF NOT EXISTS idx_eleitores_lider_vinculado ON eleitores(lider_vinculado_id);
