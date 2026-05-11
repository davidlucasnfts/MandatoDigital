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
