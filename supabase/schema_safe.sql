-- ============================================================
-- SCHEMA SAFE - Consolidado de Migrations
-- Gerado automaticamente em: 2026-05-24T15:13:17.620Z
-- Total de migrations: 26
--
-- INSTRUÇÕES:
-- 1. Este arquivo é IDEMPOTENTE — pode rodar quantas vezes quiser
-- 2. Sempre use ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS
-- 3. Nunca edite este arquivo manualmente — use o script build-schema-safe.ts
-- 4. Para atualizar: npx tsx scripts/build-schema-safe.ts
-- ============================================================



-- === 001-schema-inicial.sql ===
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


-- === 002-multi-usuario-rbac.sql ===
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


-- === 003-automacao-aniversario.sql ===
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


-- === 004-logs-auditoria.sql ===
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


-- === 005-producao-legislativa.sql ===
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


-- === 006-melhorias-eleitores.sql ===
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


-- === 007-storage-bucket.sql ===
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


-- === 008-solicitacoes-datas.sql ===
-- ============================================================
-- MIGRATION 008: Melhorias em Solicitacoes
-- Data: 07/05/2026
-- Descricao: Adiciona data_solicitacao e data_evento na tabela
-- solicitacoes para vinculo com agenda
-- ============================================================

ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_solicitacao DATE DEFAULT CURRENT_DATE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_evento DATE;


-- === 009-comunidade-icone-mapa-aniversariantes.sql ===
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


-- === 010-enquetes.sql ===
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


-- === 011-lider-eleitor.sql ===
-- 07/05/2026 — Campo lider_id em eleitores + hierarquia de lideres

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS lider_id UUID REFERENCES eleitores(id);

CREATE INDEX IF NOT EXISTS idx_eleitores_lider ON eleitores(lider_id);

COMMENT ON COLUMN eleitores.lider_id IS 'Lider responsavel por este eleitor (auto-relacionamento)';


-- === 012-convite-campos-personalizaveis.sql ===
-- ============================================================
-- MIGRATION 012: Campos Personalizaveis do Convite
-- Data: 11/05/2026
-- Descricao: Adiciona campo campos_obrigatorios na tabela
-- convites_eleitores para o lider escolher quais dados o
-- eleitor deve preencher no cadastro via link
-- ============================================================

-- Adiciona coluna JSONB para armazenar quais campos sao obrigatorios/visiveis
ALTER TABLE convites_eleitores
ADD COLUMN IF NOT EXISTS campos_obrigatorios JSONB DEFAULT '["nome","email","telefone","cpf","data_nascimento","cep","endereco","bairro","cidade","estado"]';

-- Comentario explicativo
COMMENT ON COLUMN convites_eleitores.campos_obrigatorios IS 'Lista de campos que o eleitor deve preencher no cadastro via convite. Padrao: todos os campos.';


-- === 013-comunidade-cidade-icone.sql ===
-- Migration 013: Vinculo comunidade-cidade + icone
-- Data: 11/05/2026
-- Descricao: Adiciona cidade e icone nas comunidades para vinculo geografico e visual no mapa

ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS cidade TEXT;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS icone TEXT DEFAULT 'Users';

COMMENT ON COLUMN comunidades.cidade IS 'Cidade onde a comunidade esta localizada. Usada para posicionar no mapa.';
COMMENT ON COLUMN comunidades.icone IS 'Nome do icone Lucide para exibir no mapa e na lista.';


-- === 014-eleitor-coordenadas.sql ===
-- 10/05/2026 - Adiciona coordenadas geograficas (lat/lng) aos eleitores para posicionamento preciso no mapa

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

COMMENT ON COLUMN eleitores.latitude IS 'Latitude do endereco do eleitor (geocodificado via Nominatim/OpenStreetMap)';
COMMENT ON COLUMN eleitores.longitude IS 'Longitude do endereco do eleitor (geocodificado via Nominatim/OpenStreetMap)';


-- === 015-comunidade-lider-id.sql ===
-- Migration 015: Vinculo comunidade → lider real
-- Data: 11/05/2026
-- Descricao: Substitui campo texto 'lider' por FK 'lider_id' para eleitores.id
-- Garante integridade: so pode vincular eleitor cadastrado com nivel = 'lider'

-- 1. Adiciona nova coluna FK
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS lider_id UUID REFERENCES eleitores(id) ON DELETE SET NULL;

-- 2. Remove coluna texto antiga (dados serao perdidos — aceitavel pois era livre)
ALTER TABLE comunidades DROP COLUMN IF EXISTS lider;

-- 3. Comentario
COMMENT ON COLUMN comunidades.lider_id IS 'Referencia ao eleitor que e lider desta comunidade. Deve ter nivel = lider.';


-- === 016-comunidade-bairro-relacional.sql ===
-- ============================================================
-- MIGRATION 016: Bairro relacional + coordenadas da comunidade
-- Data: 12/05/2026
-- Descricao: Troca bairros[] por bairro unico relacional e
-- adiciona lat/lng para posicionar comunidade no mapa
-- ============================================================

-- Adiciona colunas novas
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS bairro TEXT;
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8);
ALTER TABLE comunidades ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Migra dados: pega o primeiro bairro do array (se existir)
UPDATE comunidades
SET bairro = bairros[1]
WHERE bairros IS NOT NULL AND array_length(bairros, 1) > 0;

-- Remove coluna antiga (array)
ALTER TABLE comunidades DROP COLUMN IF EXISTS bairros;


-- === 017-cnefe-enderecos.sql ===
-- 14/05/2026 - Tabela CNEFE (Cadastro Nacional de Enderecos para Fins Estatisticos - IBGE)
-- Base de endereços georreferenciados do Censo 2022 para geocodificacao local
-- Fonte: ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/

CREATE TABLE IF NOT EXISTS cnefe_enderecos (
  id SERIAL PRIMARY KEY,
  uf VARCHAR(2) NOT NULL,
  codigo_municipio VARCHAR(20),
  municipio VARCHAR(100),
  bairro VARCHAR(100),
  tipo_logradouro VARCHAR(50),
  nome_logradouro VARCHAR(200) NOT NULL,
  numero VARCHAR(20),
  cep VARCHAR(8),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  nivel_geocodificacao INTEGER DEFAULT 3,
  codigo_unico VARCHAR(50) UNIQUE
);

-- Index para busca rapida por CEP
CREATE INDEX IF NOT EXISTS idx_cnefe_cep ON cnefe_enderecos(cep);

-- Index para busca por municipio + logradouro
CREATE INDEX IF NOT EXISTS idx_cnefe_municipio_logradouro ON cnefe_enderecos(municipio, nome_logradouro);

-- Index para busca por UF (para importacao parcial)
CREATE INDEX IF NOT EXISTS idx_cnefe_uf ON cnefe_enderecos(uf);

-- Index espacial para buscas proximas (opcional, pode ser ativado depois)
-- CREATE INDEX IF NOT EXISTS idx_cnefe_coords ON cnefe_enderecos USING btree(latitude, longitude);

COMMENT ON TABLE cnefe_enderecos IS 'Base CNEFE do IBGE (Censo 2022) - enderecos georreferenciados do Brasil';
COMMENT ON COLUMN cnefe_enderecos.nivel_geocodificacao IS '1=original, 2=modificada, 3=endereco, 4=logradouro, 5=localidade, 6=município';


-- === 018-comunidade-endereco-completo.sql ===
-- 15/05/2026 - Adiciona campos de endereco completo na tabela comunidades
-- CEP, logradouro (rua), numero, estado — vinculados para geocodificacao precisa no mapa

ALTER TABLE comunidades
  ADD COLUMN IF NOT EXISTS cep VARCHAR(8),
  ADD COLUMN IF NOT EXISTS logradouro VARCHAR(200),
  ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
  ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

-- Atualiza estado baseado na cidade existente (se houver)
UPDATE comunidades SET estado = 'SP' WHERE estado IS NULL AND cidade IS NOT NULL;

COMMENT ON COLUMN comunidades.cep IS 'CEP da comunidade (sem formato, apenas numeros)';
COMMENT ON COLUMN comunidades.logradouro IS 'Rua/avenida/travessa da comunidade';
COMMENT ON COLUMN comunidades.numero IS 'Numero do endereco (S/N se nao houver)';
COMMENT ON COLUMN comunidades.estado IS 'UF da comunidade (2 caracteres)';


-- === 019-eleitor-numero.sql ===
-- 15/05/2026 - Adiciona campo numero (numero da casa) na tabela eleitores
-- Para endereco completo vinculado, igual ao modelo de comunidades

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS numero VARCHAR(20);

COMMENT ON COLUMN eleitores.numero IS 'Numero do endereco do eleitor (S/N se nao houver)';


-- === 020-estimativa-votos-lider.sql ===
-- 20/05/2026 - Estimativa de votos para líderes eleitorais
-- Adiciona campo estimativa_votos na tabela eleitores para líderes

ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS estimativa_votos INTEGER;

-- Comentário explicativo
COMMENT ON COLUMN eleitores.estimativa_votos IS 'Estimativa de votos que o líder pode mobilizar (aplica-se apenas a nível=lider)';


-- === 021-corrige-schema-equipe.sql ===
-- ============================================================
-- MIGRATION 021: Corrige schema da tabela equipe
-- Data: 22/05/2026
-- Descricao: Recria tabela equipe com UUID (compativel com Drizzle)
--            A tabela original (migration 002) usava UUID, mas o
--            schema.ts estava desatualizado com serial.
-- ============================================================

-- Remove tabela antiga se existir com schema incorreto
DROP TABLE IF EXISTS equipe CASCADE;

-- Recria com UUID (igual migration 002 original)
CREATE TABLE equipe (
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

-- RLS
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

-- Policy (recria a funcao se nao existir)
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

DROP POLICY IF EXISTS "equipe_own" ON equipe;
CREATE POLICY "equipe_own" ON equipe FOR ALL USING (user_has_access(owner_id));


-- === 022-disable-rls-equipe.sql ===
-- ============================================================
-- MIGRATION 022: Desabilita RLS na tabela equipe para API
-- Data: 22/05/2026
-- Descricao: A API usa service_role_key, mas o Drizzle ORM
--            estava respeitando RLS e bloqueando queries.
--            Desabilitamos RLS na equipe para permitir
--            que a API gerencie registros livremente.
-- ============================================================

ALTER TABLE equipe DISABLE ROW LEVEL SECURITY;


-- === 023-verifica-foreign-key.sql ===
-- ============================================================
-- MIGRATION 023: Remove foreign key constraints da equipe
-- Data: 22/05/2026
-- Descricao: A API cria usuarios via Supabase Auth, mas as
--            foreign keys para auth.users podem falhar se
--            houver inconsistencia. Removemos as FKs para
--            garantir que a query funcione.
-- ============================================================

-- Remove foreign keys da tabela equipe
ALTER TABLE equipe DROP CONSTRAINT IF EXISTS equipe_user_id_fkey;
ALTER TABLE equipe DROP CONSTRAINT IF EXISTS equipe_owner_id_fkey;


-- === 024-rls-equipe-service-role.sql ===
-- ============================================================
-- MIGRATION 024: RLS na equipe compativel com service_role
-- Data: 22/05/2026
-- Descricao: Reativa RLS com policy que permite acesso
--            via service_role (API backend) e autenticacao
--            normal via JWT (frontend direto no Supabase).
-- ============================================================

-- Reativa RLS
ALTER TABLE equipe ENABLE ROW LEVEL SECURITY;

-- Remove policy antiga se existir
DROP POLICY IF EXISTS "equipe_own" ON equipe;
DROP POLICY IF EXISTS "equipe_service_role" ON equipe;
DROP POLICY IF EXISTS "equipe_authenticated" ON equipe;

-- Policy para service_role (API backend) - acesso total
CREATE POLICY "equipe_service_role" ON equipe
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy para usuarios autenticados (frontend direto)
-- Permite ver/editar apenas registros do mesmo owner
CREATE POLICY "equipe_authenticated" ON equipe
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Policy para anonimo - nega tudo
DROP POLICY IF EXISTS "equipe_anon" ON equipe;
CREATE POLICY "equipe_anon" ON equipe
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);


-- === 025-verifica-rls.sql ===
-- Verificar se RLS está ativo e policies corretas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'equipe';


-- === 026-eleitor-secao-zona-titulo-lider-vinculado.sql ===
-- 24/05/2026 - Adiciona campos eleitorais e vinculo de lider com lider
-- Secao, zona e titulo de eleitor para controle eleitoral
-- lider_vinculado_id permite que um lider seja vinculado a outro lider

-- Campos eleitorais (padrão Brasil)
-- Título de eleitor: 12 dígitos numéricos
-- Zona: até 3 dígitos
-- Seção: até 4 dígitos
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS secao VARCHAR(4);
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS zona VARCHAR(3);
ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS titulo_eleitor VARCHAR(12);

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


-- ============================================================
-- FIM DO SCHEMA SAFE
-- Total: 26 migrations consolidadas
-- ============================================================