-- ============================================================
-- Mandato Digital - Supabase Schema (SAFE VERSION)
-- Se ja existir, ignora. Rode sem medo de erro.
-- ============================================================

-- ============================================================
-- ALTERACAO: 04/05/2026 — Multi-usuario com Permissoes (RBAC)
-- Autor: Kimi Code
-- Descricao: Cria tabela equipe, adiciona owner_id em todas
-- as tabelas de negocio, atualiza RLS para compartilhamento
-- ============================================================

-- Tabela equipe (membros da equipe do mandato)
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
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE envios_aniversario ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Popular owner_id com user_id existente (dados antigos: dono = quem criou)
UPDATE comunidades SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE eleitores SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE solicitacoes SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE tarefas SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE eventos SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE documentos SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE comunicacoes SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE configuracoes SET owner_id = user_id WHERE owner_id IS NULL;
UPDATE envios_aniversario SET owner_id = user_id WHERE owner_id IS NULL;

-- Tabelas originais (sem alteracao)
CREATE TABLE IF NOT EXISTS comunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  lider TEXT,
  cor TEXT DEFAULT '#2563EB',
  bairros TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  cidade TEXT DEFAULT 'São Paulo',
  estado TEXT DEFAULT 'SP',
  cep TEXT,
  comunidade_id UUID REFERENCES comunidades(id) ON DELETE SET NULL,
  nivel TEXT DEFAULT 'eleitor' CHECK (nivel IN ('lider','influenciador','apoiador','eleitor')),
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','pendente')),
  observacoes TEXT,
  data_nascimento DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
-- ALTERACAO: 04/05/2026 — Automação de Aniversário MVP
-- Autor: Kimi Code
-- Descricao: Cria tabelas para template de mensagem e registro
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

-- RLS (seguranca) - idempotent
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

-- Funcao auxiliar: verifica se o usuario atual tem acesso aos dados do owner
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

-- Drop existing policies to avoid conflicts, then recreate
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
DROP POLICY IF EXISTS "storage_own" ON storage.objects;

-- Novas policies: acesso por owner_id (dono ou membro da equipe ativo)
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

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "storage_own" ON storage.objects
  FOR ALL USING (bucket_id = 'documentos' AND auth.uid() = owner);
