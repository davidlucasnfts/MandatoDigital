-- 20/05/2026 - Estimativa de votos para líderes eleitorais
-- Adiciona campo estimativa_votos na tabela eleitores para líderes

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS estimativa_votos INTEGER;

-- Comentário explicativo
COMMENT ON COLUMN eleitores.estimativa_votos IS 'Estimativa de votos que o líder pode mobilizar (aplica-se apenas a nível=lider)';
