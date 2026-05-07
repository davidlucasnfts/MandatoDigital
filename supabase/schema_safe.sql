-- ============================================================
-- Mandato Digital - Schema Completo (SAFE VERSION)
-- Gerado automaticamente a partir das migrations
-- NAO EDITE MANUALMENTE - edite as migrations e regenere
-- ============================================================

-- ============================================================
-- MIGRATION 001: Schema Inicial
-- ============================================================

CREATE TABLE IF NOT EXISTS comunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  lider TEXT,
  cor TEXT DEFAULT '#2563EB',
  icone TEXT DEFAULT 'Users',
  bairros TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eleitores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  nome_mae TEXT,
  email TEXT,
  telefone TEXT,
  cpf TEXT,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT DEFAULT 'São Paulo',
  estado TEXT DEFAULT 'SP',
  cep TEXT,
  comunidade_id UUID REFERENCES comunidades(id) ON DELETE SET NULL,
  indicador_id UUID REFERENCES eleitores(id) ON DELETE SET NULL,
  nivel TEXT DEFAULT 'eleitor' CHECK (nivel IN ('lider','influenciador','apoiador','eleitor')),
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','pendente')),
  observacoes TEXT,
  data_nascimento DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eleitores_indicador ON eleitores(indicador_id);
CREATE INDEX IF NOT EXISTS idx_eleitores_nome_mae ON eleitores(nome_mae);

CREATE TABLE IF NOT EXISTS solicitacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  eleitor_id UUID REFERENCES eleitores(id) ON DELETE SET NULL,
  eleitor_nome TEXT,
  categoria TEXT,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('urgente','alta','media','baixa')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','andamento','concluido','cancelado')),
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  data_evento DATE,
  data_prazo DATE,
  responsavel TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MIGRATION 002: Multi-usuario com Permissoes (RBAC)
-- ============================================================

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

-- ============================================================
-- MIGRATION 003: Automacao de Aniversario
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

-- ============================================================
-- MIGRATION 004: Logs de Auditoria LGPD
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- ============================================================
-- MIGRATION 005: Producao Legislativa
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

-- ============================================================
-- MIGRATION 006: Melhorias no Cadastro de Eleitores
-- ============================================================

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

-- ============================================================
-- MIGRATION 007: Storage Bucket Documentos
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- RLS (aplicado em todas as tabelas)
-- ============================================================

ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleitores ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_aniversario ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites_eleitores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comunidades_own" ON comunidades;
DROP POLICY IF EXISTS "eleitores_own" ON eleitores;
DROP POLICY IF EXISTS "solicitacoes_own" ON solicitacoes;
DROP POLICY IF EXISTS "tarefas_own" ON tarefas;
DROP POLICY IF EXISTS "eventos_own" ON eventos;
DROP POLICY IF EXISTS "documentos_own" ON documentos;
DROP POLICY IF EXISTS "comunicacoes_own" ON comunicacoes;
DROP POLICY IF EXISTS "configuracoes_own" ON configuracoes;
DROP POLICY IF EXISTS "envios_aniversario_own" ON envios_aniversario;
DROP POLICY IF EXISTS "equipe_own" ON equipe;
DROP POLICY IF EXISTS "audit_logs_own" ON audit_logs;
DROP POLICY IF EXISTS "proposicoes_own" ON proposicoes;
DROP POLICY IF EXISTS "tramitacoes_own" ON tramitacoes;
DROP POLICY IF EXISTS "convites_eleitores_own" ON convites_eleitores;
DROP POLICY IF EXISTS "storage_own" ON storage.objects;

CREATE POLICY "comunidades_own" ON comunidades FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "eleitores_own" ON eleitores FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "solicitacoes_own" ON solicitacoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "tarefas_own" ON tarefas FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "eventos_own" ON eventos FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "documentos_own" ON documentos FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "comunicacoes_own" ON comunicacoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "configuracoes_own" ON configuracoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "envios_aniversario_own" ON envios_aniversario FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "equipe_own" ON equipe FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "audit_logs_own" ON audit_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "proposicoes_own" ON proposicoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "tramitacoes_own" ON tramitacoes FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "convites_eleitores_own" ON convites_eleitores FOR ALL USING (user_has_access(owner_id));

CREATE POLICY "storage_own" ON storage.objects
  FOR ALL USING (bucket_id = 'documentos' AND auth.uid() = owner);
