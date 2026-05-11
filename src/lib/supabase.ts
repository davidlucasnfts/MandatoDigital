import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias. ' +
    'Verifique se o arquivo .env está configurado corretamente.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for tables
export type Eleitor = {
  id: string;
  nome: string;
  nome_mae: string | null;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  comunidade_id: string | null;
  indicador_id: string | null;
  nivel: 'lider' | 'eleitor';
  lider_id: string | null;
  tags: string[];
  status: 'ativo' | 'inativo' | 'pendente';
  observacoes: string;
  data_nascimento: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id: string;
  owner_id: string | null;
  created_at: string;
};

export type ConviteEleitor = {
  id: string;
  indicador_id: string;
  owner_id: string | null;
  token: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'expirado';
  data_expiracao: string | null;
  campos_obrigatorios: string[] | null;
  created_at: string;
};

export type Comunidade = {
  id: string;
  nome: string;
  descricao: string;
  lider: string;
  cor: string;
  icone: string;
  cidade: string | null;
  bairros: string[];
  user_id: string;
  owner_id: string | null;
  created_at: string;
  total_eleitores?: number; // virtual
};

export type Solicitacao = {
  id: string;
  titulo: string;
  descricao: string;
  eleitor_id: string;
  eleitor_nome: string;
  categoria: string;
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'andamento' | 'concluido' | 'cancelado';
  data_solicitacao: string | null;
  data_evento: string | null;
  data_prazo: string | null;
  responsavel: string;
  user_id: string;
  owner_id: string | null;
  created_at: string;
};

export type Tarefa = {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'andamento' | 'concluida';
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
  responsavel: string;
  data_prazo: string | null;
  tags: string[];
  user_id: string;
  owner_id: string | null;
  created_at: string;
};

export type Evento = {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  tipo: 'reuniao' | 'evento' | 'visita' | 'compromisso';
  user_id: string;
  owner_id: string | null;
  created_at: string;
};

export type Interacao = {
  id: string;
  eleitor_id: string;
  tipo: 'ligacao' | 'reuniao' | 'whatsapp' | 'visita' | 'email' | 'outro';
  descricao: string;
  data: string;
  user_id: string;
  created_at: string;
};

export type Configuracao = {
  chave: string;
  valor: string;
  updated_at: string;
};

export type EnvioAniversario = {
  id: string;
  eleitor_id: string;
  ano: number;
  data_envio: string;
  user_id: string;
};
