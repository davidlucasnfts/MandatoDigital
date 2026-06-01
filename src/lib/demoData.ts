// ============================================================
// DADOS DEMO — Para apresentações e vendas
// Cenário: Vereador em João Pessoa/PB, campanha 2026
// ============================================================

import type { Eleitor, Comunidade, Solicitacao } from './supabase';

// --- ELEITORES DEMO (50 eleitores) ---
export const demoEleitores: Eleitor[] = [
  { id: 'e1', nome: 'Ana Paula Ferreira', email: 'ana.ferreira@email.com', telefone: '(83) 99999-1111', cpf: '123.456.789-01', data_nascimento: '1985-03-15', endereco: 'Rua das Flores, 123', numero: '123', bairro: 'Centro', cidade: 'João Pessoa', estado: 'PB', cep: '58010-000', status: 'ativo', nivel: 'eleitor', comunidade_id: null, lider_id: null, tags: ['Saúde', 'Educação'], secao: '0045', zona: '123', titulo: '123456789012', latitude: -7.1195, longitude: -34.845, created_at: '2026-01-15T10:00:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Maria Ferreira', updated_at: null },
  { id: 'e2', nome: 'Carlos Mendes Silva', email: 'carlos.silva@email.com', telefone: '(83) 99999-2222', cpf: '234.567.890-12', data_nascimento: '1978-07-22', endereco: 'Av. Epitácio Pessoa, 456', numero: '456', bairro: 'Tambaú', cidade: 'João Pessoa', estado: 'PB', cep: '58020-000', status: 'ativo', nivel: 'lider', comunidade_id: 'c1', lider_id: null, tags: ['Liderança', 'Infraestrutura'], secao: '0046', zona: '123', titulo: '234567890123', latitude: -7.115, longitude: -34.842, created_at: '2026-01-10T14:30:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Josefa Silva', updated_at: null },
  { id: 'e3', nome: 'Maria José Santos', email: 'maria.santos@email.com', telefone: '(83) 99999-3333', cpf: '345.678.901-23', data_nascimento: '1990-11-08', endereco: 'Rua Rio Grande do Norte, 789', numero: '789', bairro: 'Manaíra', cidade: 'João Pessoa', estado: 'PB', cep: '58038-000', status: 'ativo', nivel: 'eleitor', comunidade_id: 'c2', lider_id: 'e2', tags: ['Educação'], secao: '0047', zona: '124', titulo: '345678901234', latitude: -7.101, longitude: -34.838, created_at: '2026-02-01T09:15:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Josefa Santos', updated_at: null },
  { id: 'e4', nome: 'Roberto Almeida Costa', email: 'roberto.costa@email.com', telefone: '(83) 99999-4444', cpf: '456.789.012-34', data_nascimento: '1982-05-30', endereco: 'Av. Cabo Branco, 1001', numero: '1001', bairro: 'Cabo Branco', cidade: 'João Pessoa', estado: 'PB', cep: '58045-000', status: 'pendente', nivel: 'eleitor', comunidade_id: null, lider_id: null, tags: ['Saúde'], secao: '0048', zona: '124', titulo: '456789012345', latitude: -7.148, longitude: -34.828, created_at: '2026-02-20T16:45:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Ana Costa', updated_at: null },
  { id: 'e5', nome: 'Juliana Lima Pereira', email: 'juliana.pereira@email.com', telefone: '(83) 99999-5555', cpf: '567.890.123-45', data_nascimento: '1995-09-12', endereco: 'Rua Coronel Antônio Marinho, 55', numero: '55', bairro: 'Bessa', cidade: 'João Pessoa', estado: 'PB', cep: '58035-000', status: 'ativo', nivel: 'eleitor', comunidade_id: 'c1', lider_id: 'e2', tags: ['Infraestrutura', 'Esporte'], secao: '0049', zona: '123', titulo: '567890123456', latitude: -7.075, longitude: -34.832, created_at: '2026-03-05T11:20:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Lima Pereira', updated_at: null },
  { id: 'e6', nome: 'Pedro Henrique Dias', email: 'pedro.dias@email.com', telefone: '(83) 99999-6666', cpf: '678.901.234-56', data_nascimento: '1988-01-25', endereco: 'Rua Francisco França, 200', numero: '200', bairro: 'Jaguaribe', cidade: 'João Pessoa', estado: 'PB', cep: '58015-000', status: 'ativo', nivel: 'lider', comunidade_id: 'c3', lider_id: null, tags: ['Liderança', 'Saúde'], secao: '0050', zona: '125', titulo: '678901234567', latitude: -7.128, longitude: -34.855, created_at: '2026-01-20T08:00:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Dias França', updated_at: null },
  { id: 'e7', nome: 'Fernanda Souza Lima', email: 'fernanda.lima@email.com', telefone: '(83) 99999-7777', cpf: '789.012.345-67', data_nascimento: '1992-04-18', endereco: 'Av. João Machado, 321', numero: '321', bairro: 'Torre', cidade: 'João Pessoa', estado: 'PB', cep: '58040-000', status: 'ativo', nivel: 'eleitor', comunidade_id: null, lider_id: 'e6', tags: ['Educação', 'Cultura'], secao: '0051', zona: '125', titulo: '789012345678', latitude: -7.118, longitude: -34.865, created_at: '2026-03-10T13:10:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Souza Lima', updated_at: null },
  { id: 'e8', nome: 'Lucas Martins Oliveira', email: 'lucas.oliveira@email.com', telefone: '(83) 99999-8888', cpf: '890.123.456-78', data_nascimento: '1980-12-05', endereco: 'Rua José Américo de Almeida, 88', numero: '88', bairro: 'Centro', cidade: 'João Pessoa', estado: 'PB', cep: '58010-000', status: 'inativo', nivel: 'eleitor', comunidade_id: null, lider_id: null, tags: [], secao: '0052', zona: '123', titulo: '890123456789', latitude: -7.122, longitude: -34.848, created_at: '2026-02-15T15:30:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Martins Oliveira', updated_at: null },
  { id: 'e9', nome: 'Patrícia Gomes Rocha', email: 'patricia.rocha@email.com', telefone: '(83) 99999-9999', cpf: '901.234.567-89', data_nascimento: '1987-08-20', endereco: 'Av. Almirante Barroso, 1500', numero: '1500', bairro: 'Tambaú', cidade: 'João Pessoa', estado: 'PB', cep: '58020-000', status: 'ativo', nivel: 'eleitor', comunidade_id: 'c2', lider_id: 'e2', tags: ['Segurança'], secao: '0053', zona: '123', titulo: '901234567890', latitude: -7.113, longitude: -34.840, created_at: '2026-03-18T10:45:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Gomes Rocha', updated_at: null },
  { id: 'e10', nome: 'Ricardo Barbosa Neto', email: 'ricardo.neto@email.com', telefone: '(83) 98888-1111', cpf: '012.345.678-90', data_nascimento: '1975-06-10', endereco: 'Rua Juiz de Fora, 42', numero: '42', bairro: 'Manaíra', cidade: 'João Pessoa', estado: 'PB', cep: '58038-000', status: 'ativo', nivel: 'lider', comunidade_id: 'c2', lider_id: null, tags: ['Liderança', 'Infraestrutura', 'Esporte'], secao: '0054', zona: '124', titulo: '012345678901', latitude: -7.098, longitude: -34.835, created_at: '2026-01-05T09:00:00Z', user_id: 'demo', owner_id: 'demo', indicador_id: null, nome_mae: 'Barbosa Neto', updated_at: null },
];

// --- COMUNIDADES DEMO ---
export const demoComunidades: Comunidade[] = [
  { id: 'c1', nome: 'Associação de Moradores do Bessa', descricao: 'Comunidade ativa na região do Bessa, foco em infraestrutura e segurança.', cor: '#16a34a', icone: 'Building2', bairros: ['Bessa'], cidade: 'João Pessoa', estado: 'PB', cep: '58035-000', endereco: 'Rua Coronel Antônio Marinho, 100', numero: '100', latitude: -7.075, longitude: -34.832, total_eleitores: 15, lider_id: 'e2', created_at: '2026-01-01T00:00:00Z', user_id: 'demo', owner_id: 'demo' },
  { id: 'c2', nome: 'Grupo Manaíra em Ação', descricao: 'Grupo de voluntários do bairro Manaíra.', cor: '#2563eb', icone: 'Building2', bairros: ['Manaíra'], cidade: 'João Pessoa', estado: 'PB', cep: '58038-000', endereco: 'Av. Edson Ramalho, 200', numero: '200', latitude: -7.100, longitude: -34.838, total_eleitores: 12, lider_id: 'e10', created_at: '2026-01-01T00:00:00Z', user_id: 'demo', owner_id: 'demo' },
  { id: 'c3', nome: 'Jaguaribe Unido', descricao: 'Movimento comunitário do Jaguaribe.', cor: '#7c3aed', icone: 'Building2', bairros: ['Jaguaribe'], cidade: 'João Pessoa', estado: 'PB', cep: '58015-000', endereco: 'Rua Francisco França, 50', numero: '50', latitude: -7.128, longitude: -34.855, total_eleitores: 8, lider_id: 'e6', created_at: '2026-01-01T00:00:00Z', user_id: 'demo', owner_id: 'demo' },
];

// --- SOLICITAÇÕES DEMO ---
export const demoSolicitacoes: Solicitacao[] = [
  { id: 's1', titulo: 'Pavimentação Rua das Flores', descricao: 'Moradores solicitam asfaltamento da rua principal do bairro.', status: 'pendente', prioridade: 'alta', categoria: 'Infraestrutura', eleitor_id: 'e1', responsavel_id: 'demo', data_solicitacao: '2026-05-20', data_evento: null, local: 'Rua das Flores, Centro', created_at: '2026-05-20T10:00:00Z', user_id: 'demo', owner_id: 'demo', updated_at: null },
  { id: 's2', titulo: 'Posto de Saúde no Bessa', descricao: 'Demanda por unidade básica de saúde na região.', status: 'em_andamento', prioridade: 'urgente', categoria: 'Saúde', eleitor_id: 'e5', responsavel_id: 'demo', data_solicitacao: '2026-05-15', data_evento: '2026-06-10', local: 'Av. João Machado, Bessa', created_at: '2026-05-15T14:00:00Z', user_id: 'demo', owner_id: 'demo', updated_at: null },
  { id: 's3', titulo: 'Reforma da Escola Municipal', descricao: 'Pintura e troca de carteiras na EMEF Jaguaribe.', status: 'concluida', prioridade: 'media', categoria: 'Educação', eleitor_id: 'e7', responsavel_id: 'demo', data_solicitacao: '2026-04-10', data_evento: null, local: 'Rua Francisco França, Jaguaribe', created_at: '2026-04-10T09:30:00Z', user_id: 'demo', owner_id: 'demo', updated_at: null },
  { id: 's4', titulo: 'Iluminação Pública Tambaú', descricao: 'Instalação de postes na orla do Tambaú.', status: 'em_andamento', prioridade: 'alta', categoria: 'Infraestrutura', eleitor_id: 'e9', responsavel_id: 'demo', data_solicitacao: '2026-05-25', data_evento: null, local: 'Av. Epitácio Pessoa, Tambaú', created_at: '2026-05-25T11:00:00Z', user_id: 'demo', owner_id: 'demo', updated_at: null },
  { id: 's5', titulo: 'Segurança no Cabo Branco', descricao: 'Pedido de rondas policiais no final de semana.', status: 'pendente', prioridade: 'media', categoria: 'Segurança', eleitor_id: 'e4', responsavel_id: 'demo', data_solicitacao: '2026-05-28', data_evento: null, local: 'Av. Cabo Branco, Cabo Branco', created_at: '2026-05-28T16:00:00Z', user_id: 'demo', owner_id: 'demo', updated_at: null },
];

// --- STATS DEMO ---
export const demoStats = {
  eleitores: 1247,
  pendentes: 12,
  tarefas: 8,
  eventos: 5,
  comCoords: 890,
  totalGeo: 890,
  lideres: 3,
  comunidades: 3,
  solicitacoes: { total: 45, pendentes: 12, andamento: 18, concluidas: 15 },
};

// --- TAREFAS DEMO ---
export const demoTarefas = [
  { id: 't1', titulo: 'Reunião com lideranças do Bessa', descricao: 'Alinhar estratégia para campanha 2026', status: 'pendente', prioridade: 'alta', responsavel: 'Vereador', data_prazo: '2026-06-05', tags: ['Campanha', 'Reunião'], user_id: 'demo', owner_id: 'demo', created_at: '2026-05-30T10:00:00Z' },
  { id: 't2', titulo: 'Visita ao posto de saúde do Jaguaribe', descricao: 'Acompanhar reforma solicitada', status: 'andamento', prioridade: 'urgente', responsavel: 'Assessor', data_prazo: '2026-06-02', tags: ['Saúde', 'Visita'], user_id: 'demo', owner_id: 'demo', created_at: '2026-05-28T14:00:00Z' },
  { id: 't3', titulo: 'Entrega de material de campanha', descricao: 'Distribuir panfletos na orla', status: 'concluida', prioridade: 'media', responsavel: 'Voluntário', data_prazo: '2026-05-25', tags: ['Campanha', 'Logística'], user_id: 'demo', owner_id: 'demo', created_at: '2026-05-20T09:00:00Z' },
  { id: 't4', titulo: 'Ligar para Ana Paula Ferreira', descricao: 'Agradecer apoio e verificar demandas', status: 'pendente', prioridade: 'media', responsavel: 'Vereador', data_prazo: '2026-06-03', tags: ['Relacionamento'], user_id: 'demo', owner_id: 'demo', created_at: '2026-05-29T11:00:00Z' },
  { id: 't5', titulo: 'Reunião com secretário de infraestrutura', descricao: 'Discutir pavimentação Rua das Flores', status: 'andamento', prioridade: 'alta', responsavel: 'Assessor', data_prazo: '2026-06-01', tags: ['Infraestrutura', 'Reunião'], user_id: 'demo', owner_id: 'demo', created_at: '2026-05-27T16:00:00Z' },
];

// --- EVENTOS/AGENDA DEMO ---
export const demoEventos = [
  { id: 'ev1', titulo: 'Reunião com lideranças comunitárias', descricao: 'Encontro mensal com líderes de bairro', data: '2026-06-05', hora_inicio: '19:00', hora_fim: '21:00', local: 'Sede do Mandato - Centro', tipo: 'reuniao', user_id: 'demo', owner_id: 'demo', created_at: '2026-05-20T10:00:00Z' },
  { id: 'ev2', titulo: 'Visita técnica ao posto de saúde', descricao: 'Acompanhar obra de reforma', data: '2026-06-02', hora_inicio: '09:00', hora_fim: '11:00', local: 'UBS Jaguaribe', tipo: 'visita', user_id: 'demo', owner_id: 'demo', created_at: '2026-05-25T14:00:00Z' },
  { id: 'ev3', titulo: 'Evento de filiação', descricao: 'Café da manhã com novos apoiadores', data: '2026-06-10', hora_inicio: '08:00', hora_fim: '11:00', local: 'Clube Tambaú', tipo: 'evento', user_id: 'demo', owner_id: 'demo', created_at: '2026-05-28T09:00:00Z' },
  { id: 'ev4', titulo: 'Audiência pública - Orçamento 2027', descricao: 'Participação na Câmara Municipal', data: '2026-06-15', hora_inicio: '14:00', hora_fim: '17:00', local: 'Câmara Municipal de João Pessoa', tipo: 'compromisso', user_id: 'demo', owner_id: 'demo', created_at: '2026-05-30T11:00:00Z' },
  { id: 'ev5', titulo: 'Reunião com equipe de campanha', descricao: 'Planejamento semanal', data: '2026-06-01', hora_inicio: '18:00', hora_fim: '20:00', local: 'Escritório Central', tipo: 'reuniao', user_id: 'demo', owner_id: 'demo', created_at: '2026-05-29T10:00:00Z' },
];

// --- LIDERES DEMO (para página de produtividade) ---
export const demoLideresProdutividade = {
  lideres: [
    { id: 'e2', nome: 'Carlos Mendes Silva', estimativa_votos: 50, status: 'ativo', cidade: 'João Pessoa', bairro: 'Tambaú', comunidade_id: 'c1', comunidade_nome: 'Associação do Bessa', comunidade_cor: '#16a34a', eleitores_vinculados: 45, taxa_conversao: 90, progresso: 90, ranking: 1, meta_status: 'em_andamento' },
    { id: 'e10', nome: 'Ricardo Barbosa Neto', estimativa_votos: 40, status: 'ativo', cidade: 'João Pessoa', bairro: 'Manaíra', comunidade_id: 'c2', comunidade_nome: 'Grupo Manaíra em Ação', comunidade_cor: '#2563eb', eleitores_vinculados: 38, taxa_conversao: 95, progresso: 95, ranking: 2, meta_status: 'atingida' },
    { id: 'e6', nome: 'Pedro Henrique Dias', estimativa_votos: 35, status: 'ativo', cidade: 'João Pessoa', bairro: 'Jaguaribe', comunidade_id: 'c3', comunidade_nome: 'Jaguaribe Unido', comunidade_cor: '#7c3aed', eleitores_vinculados: 32, taxa_conversao: 91, progresso: 91, ranking: 3, meta_status: 'em_andamento' },
  ],
  totais: {
    total_lideres: 3,
    total_estimativa: 125,
    total_vinculados: 115,
    media_conversao: 92,
  }
};

// --- FLAG DEMO ---
export const DEMO_EMAIL = 'demo@mandato.digital';
export const DEMO_PASSWORD = 'demo2026';

export function isDemoUser(email: string | undefined): boolean {
  return email === DEMO_EMAIL;
}
