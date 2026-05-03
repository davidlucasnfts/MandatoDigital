-- ============================================================
-- Mandato Digital - Supabase Schema
-- Copie e cole no SQL Editor do seu projeto Supabase
-- ============================================================

-- Comunidades
CREATE TABLE comunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  lider TEXT,
  cor TEXT DEFAULT '#2563EB',
  bairros TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eleitores
CREATE TABLE eleitores (
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solicitacoes
CREATE TABLE solicitacoes (
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

-- Tarefas
CREATE TABLE tarefas (
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

-- Eventos
CREATE TABLE eventos (
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

-- Documentos (metadados)
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT,
  tamanho TEXT,
  pasta TEXT DEFAULT 'Geral',
  storage_path TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comunicacoes
CREATE TABLE comunicacoes (
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

-- ============================================================
-- RLS Policies (seguranca - cada usuario so ve seus dados)
-- ============================================================

ALTER TABLE comunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleitores ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem suas comunidades" ON comunidades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios veem seus eleitores" ON eleitores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios veem suas solicitacoes" ON solicitacoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios veem suas tarefas" ON tarefas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios veem seus eventos" ON eventos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios veem seus documentos" ON documentos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuarios veem suas comunicacoes" ON comunicacoes FOR ALL USING (auth.uid() = user_id);

-- Storage bucket para documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Usuarios gerenciam seus documentos" ON storage.objects
  FOR ALL USING (bucket_id = 'documentos' AND auth.uid() = owner);
