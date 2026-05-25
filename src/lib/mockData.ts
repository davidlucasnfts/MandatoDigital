// Dados mockados para testar o dashboard sem backend
export const mockData = {
  stats: {
    eleitores: 1247,
    pendentes: 12,
    tarefas: 8,
    eventos: 5,
  },
  tendencias: {
    eleitores: { valor: 15, positivo: true },
    pendentes: { valor: 5, positivo: false },
    tarefas: { valor: 3, positivo: false },
    eventos: { valor: 20, positivo: true },
  },
  bairros: [
    { bairro: 'Centro', total: 342 },
    { bairro: 'Jardim América', total: 198 },
    { bairro: 'Vila Nova', total: 156 },
    { bairro: 'Boa Vista', total: 134 },
    { bairro: 'São José', total: 89 },
  ],
  totalGeo: 890,
  totalEleitores: 1247,
  lideres: [
    { id: '1', nome: 'Carlos Silva', eleitores_vinculados: 45, estimativa_votos: 50, taxa_conversao: 90 },
    { id: '2', nome: 'Maria Oliveira', eleitores_vinculados: 38, estimativa_votos: 40, taxa_conversao: 95 },
    { id: '3', nome: 'João Pereira', eleitores_vinculados: 32, estimativa_votos: 35, taxa_conversao: 91 },
  ],
  proposicoesResumo: [
    { status: 'em_tramitacao', total: 5 },
    { status: 'aprovada', total: 3 },
    { status: 'em_elaboracao', total: 2 },
    { status: 'arquivada', total: 1 },
  ],
  proposicoesRecentes: [
    { id: '1', titulo: 'Projeto de Lei nº 45/2026 - Pavimentação', status: 'em_tramitacao', tipo: 'PL', numero: '45', ano: 2026 },
    { id: '2', titulo: 'Indicação nº 12/2026 - Posto de Saúde', status: 'aprovada', tipo: 'IND', numero: '12', ano: 2026 },
    { id: '3', titulo: 'Requerimento nº 8/2026 - Audiência Pública', status: 'em_elaboracao', tipo: 'REQ', numero: '8', ano: 2026 },
  ],
  enquetes: [
    { id: '1', titulo: 'Qual sua principal demanda?', status: 'ativa', total_respostas: 234 },
    { id: '2', titulo: 'Avaliação do mandato 2026', status: 'ativa', total_respostas: 189 },
    { id: '3', titulo: 'Prioridade para o próximo mês', status: 'ativa', total_respostas: 156 },
  ],
  totalAtivas: 3,
  totalRespostas: 579,
  atividades: [
    { tipo: 'eleitor', titulo: 'Ana Paula Ferreira', descricao: 'Cadastrado em João Pessoa', data: new Date(Date.now() - 5 * 60000).toISOString() },
    { tipo: 'solicitacao', titulo: 'Pavimentação Rua das Flores', descricao: 'Resolvida para Carlos Mendes', data: new Date(Date.now() - 30 * 60000).toISOString() },
    { tipo: 'interacao', titulo: 'Visita', descricao: 'Com Maria José Santos', data: new Date(Date.now() - 2 * 3600000).toISOString() },
    { tipo: 'eleitor', titulo: 'Roberto Almeida', descricao: 'Cadastrado em Bayeux', data: new Date(Date.now() - 3 * 3600000).toISOString() },
    { tipo: 'proposicao', titulo: 'PL 45/2026', descricao: 'Movido para em tramitação', data: new Date(Date.now() - 5 * 3600000).toISOString() },
    { tipo: 'enquete', titulo: 'Nova enquete criada', descricao: 'Prioridade para o próximo mês', data: new Date(Date.now() - 8 * 3600000).toISOString() },
  ],
  comEmail: 890,
  comTelefone: 756,
  enviosAniversario: 45,
  convites: [
    { id: '1', nome: 'Pedro Henrique Lima', email: 'pedro@email.com', telefone: '(83) 99999-1111', created_at: new Date(Date.now() - 86400000).toISOString(), indicador: { nome: 'Carlos Silva' } },
    { id: '2', nome: 'Juliana Costa', email: 'juliana@email.com', telefone: '(83) 99999-2222', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), indicador: { nome: 'Maria Oliveira' } },
    { id: '3', nome: 'Fernando Souza', email: null, telefone: '(83) 99999-3333', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), indicador: { nome: 'João Pereira' } },
  ],
  totalPendentes: 8,
};

// Hook simples para simular loading
export function useMockData() {
  return { ...mockData, loading: false };
}
