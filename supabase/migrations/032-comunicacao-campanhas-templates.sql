-- ============================================================
-- MIGRATION 032: Comunicação — Campanhas, Templates e Envios
-- Data: 04/06/2026
-- Descricao: Tabelas para envio de mensagens WhatsApp/E-mail
-- com templates, campanhas e registro de envios
-- ============================================================

-- Templates de mensagem (reutilizáveis)
CREATE TABLE IF NOT EXISTS templates_mensagem (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('whatsapp','email')) DEFAULT 'whatsapp',
  assunto TEXT,
  conteudo TEXT NOT NULL,
  variaveis TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campanhas de comunicação
CREATE TABLE IF NOT EXISTS campanhas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('whatsapp','email')) DEFAULT 'whatsapp',
  template_id UUID REFERENCES templates_mensagem(id) ON DELETE SET NULL,
  assunto TEXT,
  conteudo TEXT NOT NULL,
  status TEXT CHECK (status IN ('rascunho','enviando','enviada','cancelada')) DEFAULT 'rascunho',
  total_destinatarios INTEGER DEFAULT 0,
  total_enviados INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0,
  filtros JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de envios individuais
CREATE TABLE IF NOT EXISTS envios_campanha (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID REFERENCES campanhas(id) ON DELETE CASCADE,
  eleitor_id UUID REFERENCES eleitores(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('whatsapp','email')) DEFAULT 'whatsapp',
  status TEXT CHECK (status IN ('pendente','enviado','erro','lido')) DEFAULT 'pendente',
  erro TEXT,
  data_envio TIMESTAMPTZ,
  data_leitura TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE templates_mensagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE envios_campanha ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_mensagem_own" ON templates_mensagem;
DROP POLICY IF EXISTS "campanhas_own" ON campanhas;
DROP POLICY IF EXISTS "envios_campanha_own" ON envios_campanha;

CREATE POLICY "templates_mensagem_own" ON templates_mensagem FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "campanhas_own" ON campanhas FOR ALL USING (user_has_access(owner_id));
CREATE POLICY "envios_campanha_own" ON envios_campanha FOR ALL USING (user_has_access(owner_id));
