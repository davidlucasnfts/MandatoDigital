-- 07/05/2026 — Tabelas de Pesquisa de Opinião / Enquetes

CREATE TYPE status_enquete AS ENUM ('rascunho', 'publicada', 'encerrada', 'arquivada');

CREATE TABLE enquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  user_id UUID NOT NULL,
  titulo VARCHAR(500) NOT NULL,
  descricao TEXT,
  status status_enquete NOT NULL DEFAULT 'rascunho',
  data_publicacao DATE,
  data_encerramento DATE,
  permite_multipla_escolha INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enquete_opcoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquete_id UUID NOT NULL REFERENCES enquetes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  texto VARCHAR(500) NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE enquete_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquete_id UUID NOT NULL REFERENCES enquetes(id) ON DELETE CASCADE,
  opcao_id UUID NOT NULL REFERENCES enquete_opcoes(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  eleitor_id UUID,
  nome_respondente VARCHAR(255),
  telefone_respondente VARCHAR(20),
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_enquetes_owner ON enquetes(owner_id);
CREATE INDEX idx_enquete_opcoes_enquete ON enquete_opcoes(enquete_id);
CREATE INDEX idx_enquete_respostas_enquete ON enquete_respostas(enquete_id);
CREATE INDEX idx_enquete_respostas_opcao ON enquete_respostas(opcao_id);
