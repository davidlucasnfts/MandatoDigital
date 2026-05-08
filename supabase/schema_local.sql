-- ============================================================
-- MIGRATION 001: Schema Inicial
-- Data: baseline (antes do versionamento)
-- Descricao: Tabelas base do projeto - comunidades, eleitores,
-- solicitacoes, tarefas, eventos, documentos, comunicacoes
-- ============================================================

CREATE TABLE IF NOT EXISTS comunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  lider TEXT,
  cor TEXT DEFAULT '#2563EB',
  bairros TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eleitores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT DEFAULT 'SÃ£o Paulo',
  estado TEXT DEFAULT 'SP',
  cep TEXT,
  comunidade_id UUID REFERENCES comunidades(id) ON DELETE SET NULL,
  nivel TEXT DEFAULT 'eleitor' CHECK (nivel IN ('lider','influenciador','apoiador','eleitor')),
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','pendente')),
  observacoes TEXT,
  data_nascimento DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  eleitor_id UUID REFERENCES eleitores(id) ON DELETE SET NULL,
  eleitor_nome TEXT,
  categoria TEXT,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('urgente','alta','media','baixa')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','andamento','concluido','cancelado')),
  data_prazo DATE,
  responsavel TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tarefas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','andamento','concluida')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('urgente','alta','media','baixa')),
  responsavel TEXT,
  data_prazo DATE,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  hora_inicio TEXT,
  hora_fim TEXT,
  local TEXT,
  tipo TEXT DEFAULT 'compromisso' CHECK (tipo IN ('reuniao','evento','visita','compromisso')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT,
  tamanho TEXT,
  pasta TEXT DEFAULT 'Geral',
  storage_path TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comunicacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT CHECK (tipo IN ('email','sms')),
  assunto TEXT,
  conteudo TEXT,
  destinatarios INTEGER DEFAULT 0,
  data_envio TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('enviado','programado','rascunho')),
  taxa_abertura INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS basico (sem user_has_access ainda)
ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleitores ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comunidades_own" ON comunidades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "eleitores_own" ON eleitores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "solicitacoes_own" ON solicitacoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "tarefas_own" ON tarefas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "eventos_own" ON eventos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "documentos_own" ON documentos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "comunicacoes_own" ON comunicacoes FOR ALL USING (auth.uid() = user_id);
-- ============================================================
-- MIGRATION 002: Multi-usuario com Permissoes (RBAC)
-- Data: 04/05/2026
-- Descricao: Cria tabela equipe, adiciona owner_id em todas
-- as tabelas, atualiza RLS para compartilhamento
-- ============================================================

-- Tabela equipe
CREATE TABLE IF NOT EXISTS equipe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  cargo TEXT,
  role TEXT DEFAULT 'visualizador' CHECK (role IN ('admin','editor','visualizador')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','inativo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar owner_id em todas as tabelas de negocio
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE comunicacoes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Popular owner_id com user_id existente
UPDATE comunidades SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE eleitores SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE solicitacoes SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE tarefas SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE eventos SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE documentos SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE comunicacoes SET owner_id = user_id WHERE owner_id IS NULL;

-- Funcao auxiliar
CREATE OR REPLACE FUNCTION public.user_has_access(target_owner_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = target_owner_id
    OR EXISTS (
      SELECT 1 FROM equipe
      WHERE user_id = auth.uid()
        AND owner_id = target_owner_id
        AND status = 'ativo'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar policies para usar user_has_access
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comunidades_own" ON comunidades;
DROP POLICY IF EXISTS "eleitores_own" ON eleitores;
DROP POLICY IF EXISTS "solicitacoes_own" ON solicitacoes;
DROP POLICY IF EXISTS "tarefas_own" ON tarefas;
DROP POLICY IF EXISTS "eventos_own" ON eventos;
DROP POLICY IF EXISTS "documentos_own" ON documentos;
DROP POLICY IF EXISTS "comunicacoes_own" ON comunicacoes;
DROP POLICY IF EXISTS "equipe_own" ON equipe;

CREATE POLICY "comunidades_own" ON comunidades FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "eleitores_own" ON eleitores FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "solicitacoes_own" ON solicitacoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "tarefas_own" ON tarefas FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "eventos_own" ON eventos FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "documentos_own" ON documentos FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "comunicacoes_own" ON comunicacoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "equipe_own" ON equipe FOR ALL USING (user_has_access(owner_id));
-- ============================================================
-- MIGRATION 003: Automacao de Aniversario
-- Data: 04/05/2026
-- Descricao: Tabelas para template de mensagem e registro
-- de envios de aniversario via WhatsApp
-- ============================================================

CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS envios_aniversario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eleitor_id UUID REFERENCES eleitores(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  data_envio TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_aniversario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "configuracoes_own" ON configuracoes;
DROP POLICY IF EXISTS "envios_aniversario_own" ON envios_aniversario;

CREATE POLICY "configuracoes_own" ON configuracoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "envios_aniversario_own" ON envios_aniversario FOR ALL USING (user_has_access(owner_id));
-- ============================================================
-- MIGRATION 004: Logs de Auditoria LGPD
-- Data: 07/05/2026
-- Descricao: Cria tabela de auditoria para rastrear acessos
-- e modificacoes em dados de cidadaos
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('create','read','update','delete','login','logout','export')),
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_own" ON audit_logs;
CREATE POLICY "audit_logs_own" ON audit_logs FOR ALL USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
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
-- ============================================================
-- MIGRATION 006: Melhorias no Cadastro de Eleitores
-- Data: 07/05/2026
-- Descricao: Adiciona nome_mae, indicador_id, e cria tabela
-- convites_eleitores para afiliacao por lideres
-- ============================================================

-- 1. Novos campos na tabela eleitores
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS nome_mae TEXT;
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS indicador_id UUID REFERENCES eleitores(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_eleitores_indicador ON eleitores(indicador_id);
CREATE INDEX IF NOT EXISTS idx_eleitores_nome_mae ON eleitores(nome_mae);

-- 2. Tabela de convites para afiliacao
CREATE TABLE IF NOT EXISTS convites_eleitores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  indicador_id UUID REFERENCES eleitores(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','aprovado','rejeitado','expirado')),
  data_expiracao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_convites_token ON convites_eleitores(token);
CREATE INDEX IF NOT EXISTS idx_convites_indicador ON convites_eleitores(indicador_id);
CREATE INDEX IF NOT EXISTS idx_convites_status ON convites_eleitores(status);

-- 3. RLS para convites
ALTER TABLE convites_eleitores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "convites_eleitores_own" ON convites_eleitores;
CREATE POLICY "convites_eleitores_own" ON convites_eleitores FOR ALL USING (user_has_access(owner_id));
-- ============================================================
-- MIGRATION 007: Storage Bucket Documentos
-- Data: baseline (antes do versionamento)
-- Descricao: Cria bucket para armazenamento de documentos
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "storage_own" ON storage.objects;

CREATE POLICY "storage_own" ON storage.objects
  FOR ALL USING (bucket_id = 'documentos' AND auth.uid() = owner);
-- ============================================================
-- MIGRATION 008: Melhorias em Solicitacoes
-- Data: 07/05/2026
-- Descricao: Adiciona data_solicitacao e data_evento na tabela
-- solicitacoes para vinculo com agenda
-- ============================================================

ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_solicitacao DATE DEFAULT CURRENT_DATE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_evento DATE;
-- ============================================================
-- MIGRATION 009: Comunidade Icone, Mapa Bounds, Aniversariantes
-- Data: 07/05/2026
-- Descricao: Adiciona icone em comunidades; schema ja possui
-- data_solicitacao/data_evento (migration 008)
-- ============================================================

-- Comunidades: icone personalizado
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT 'Users';

-- Atualizar comunidades existentes
UPDATE comunidades SET icone = 'Users' WHERE icone IS NULL;
-- 07/05/2026 â€” Tabelas de Pesquisa de OpiniÃ£o / Enquetes

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
