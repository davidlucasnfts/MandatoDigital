-- 07/05/2026 — Campo lider_id em eleitores + hierarquia de lideres

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS lider_id UUID REFERENCES eleitores(id);

CREATE INDEX IF NOT EXISTS idx_eleitores_lider ON eleitores(lider_id);

COMMENT ON COLUMN eleitores.lider_id IS 'Lider responsavel por este eleitor (auto-relacionamento)';
