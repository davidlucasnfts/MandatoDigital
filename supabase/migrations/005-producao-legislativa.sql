-- ============================================================
-- MIGRATION 005: Painel de Producao Legislativa
-- Data: 07/05/2026
-- Descricao: Tabelas proposicoes e tramitacoes para controle
-- de projetos, emendas, indicacoes, requerimentos, pareceres
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_proposicao') THEN
    CREATE TYPE tipo_proposicao AS ENUM (
      'projeto_lei', 'emenda', 'indicacao', 'requerimento', 'parecer', 'mocao', 'decreto'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_proposicao') THEN
    CREATE TYPE status_proposicao AS ENUM (
      'em_elaboracao', 'protocolado', 'em_tramitacao', 'em_comissao',
      'aprovado', 'rejeitado', 'sancionado', 'arquivado', 'vetoado', 'retirado'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS proposicoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo tipo_proposicao NOT NULL,
  numero TEXT,
  ano INTEGER,
  titulo TEXT NOT NULL,
  ementa TEXT,
  tema TEXT,
  status status_proposicao DEFAULT 'em_elaboracao' NOT NULL,
  data_apresentacao DATE,
  data_aprovacao DATE,
  orgao_atual TEXT,
  relator TEXT,
  link_oficial TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tramitacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposicao_id UUID REFERENCES proposicoes(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  orgao TEXT NOT NULL,
  status status_proposicao NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposicoes_owner ON proposicoes(owner_id);
CREATE INDEX IF NOT EXISTS idx_proposicoes_tipo ON proposicoes(tipo);
CREATE INDEX IF NOT EXISTS idx_proposicoes_status ON proposicoes(status);
CREATE INDEX IF NOT EXISTS idx_proposicoes_tema ON proposicoes(tema);
CREATE INDEX IF NOT EXISTS idx_proposicoes_ano ON proposicoes(ano);
CREATE INDEX IF NOT EXISTS idx_tramitacoes_proposicao ON tramitacoes(proposicao_id);
CREATE INDEX IF NOT EXISTS idx_tramitacoes_data ON tramitacoes(data DESC);

ALTER TABLE proposicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramitacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposicoes_own" ON proposicoes;
DROP POLICY IF EXISTS "tramitacoes_own" ON tramitacoes;

CREATE POLICY "proposicoes_own" ON proposicoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "tramitacoes_own" ON tramitacoes FOR ALL USING (user_has_access(owner_id));
