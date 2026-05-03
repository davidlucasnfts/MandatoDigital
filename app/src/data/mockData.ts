export interface Eleitor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  comunidade: string;
  nivel: 'lider' | 'influenciador' | 'apoiador' | 'eleitor';
  tags: string[];
  status: 'ativo' | 'inativo' | 'pendente';
  dataCadastro: string;
  ultimaInteracao: string;
  observacoes: string;
  dataNascimento: string;
}

export interface Comunidade {
  id: string;
  nome: string;
  descricao: string;
  lider: string;
  totalEleitores: number;
  cor: string;
  bairros: string[];
}

export interface Solicitacao {
  id: string;
  titulo: string;
  descricao: string;
  eleitor: string;
  eleitorId: string;
  categoria: string;
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'andamento' | 'concluido' | 'cancelado';
  dataCriacao: string;
  dataPrazo: string;
  responsavel: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'andamento' | 'concluida';
  prioridade: 'urgente' | 'alta' | 'media' | 'baixa';
  responsavel: string;
  dataCriacao: string;
  dataPrazo: string;
  tags: string[];
}

export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  tipo: 'reuniao' | 'evento' | 'visita' | 'compromisso';
  participantes: string[];
}

export interface Documento {
  id: string;
  nome: string;
  tipo: 'pdf' | 'doc' | 'xls' | 'img' | 'outro';
  tamanho: string;
  pasta: string;
  dataUpload: string;
  uploadedBy: string;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  permissao: 'admin' | 'editor' | 'visualizador';
  status: 'ativo' | 'inativo';
  dataCadastro: string;
  ultimoAcesso: string;
}

export interface Comunicacao {
  id: string;
  tipo: 'email' | 'sms';
  assunto: string;
  conteudo: string;
  destinatarios: number;
  dataEnvio: string;
  status: 'enviado' | 'programado' | 'rascunho';
  taxaAbertura?: number;
}

export const comunidades: Comunidade[] = [
  { id: '1', nome: 'Jardim das Oliveiras', descricao: 'Comunidade do bairro Jardim das Oliveiras', lider: 'Maria Santos', totalEleitores: 342, cor: '#2563EB', bairros: ['Jardim das Oliveiras'] },
  { id: '2', nome: 'Centro', descricao: 'Região central da cidade', lider: 'João Silva', totalEleitores: 518, cor: '#0891B2', bairros: ['Centro'] },
  { id: '3', nome: 'Vila Nova', descricao: 'Comunidade Vila Nova e arredores', lider: 'Ana Paula', totalEleitores: 276, cor: '#059669', bairros: ['Vila Nova'] },
  { id: '4', nome: 'Boa Vista', descricao: 'Bairro Boa Vista', lider: 'Carlos Eduardo', totalEleitores: 189, cor: '#D97706', bairros: ['Boa Vista'] },
  { id: '5', nome: 'São Francisco', descricao: 'Comunidade São Francisco', lider: 'Fernanda Lima', totalEleitores: 423, cor: '#DC2626', bairros: ['São Francisco'] },
  { id: '6', nome: 'Industrial', descricao: 'Região industrial', lider: 'Roberto Carlos', totalEleitores: 156, cor: '#7C3AED', bairros: ['Distrito Industrial'] },
  { id: '7', nome: 'Universitários', descricao: 'Comunidade de estudantes', lider: 'Pedro Henrique', totalEleitores: 234, cor: '#EC4899', bairros: ['Vila Universitária'] },
  { id: '8', nome: 'Lideranças', descricao: 'Lideranças comunitárias', lider: 'Sebastião Oliveira', totalEleitores: 89, cor: '#14B8A6', bairros: ['Vários'] },
];

export const eleitores: Eleitor[] = [
  { id: '1', nome: 'Maria Aparecida Santos', email: 'maria.santos@email.com', telefone: '(11) 98765-4321', cpf: '123.456.789-00', endereco: 'Rua das Flores, 123', bairro: 'Jardim das Oliveiras', cidade: 'São Paulo', estado: 'SP', cep: '01234-567', comunidade: 'Jardim das Oliveiras', nivel: 'lider', tags: ['mulheres', 'saude', 'educacao'], status: 'ativo', dataCadastro: '2024-01-15', ultimaInteracao: '2025-04-20', observacoes: 'Liderança comunitária ativa', dataNascimento: '1975-03-12' },
  { id: '2', nome: 'João Batista Silva', email: 'joao.silva@email.com', telefone: '(11) 97654-3210', cpf: '234.567.890-11', endereco: 'Av. Paulista, 1000', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01310-100', comunidade: 'Centro', nivel: 'influenciador', tags: ['empresarios', 'infraestrutura'], status: 'ativo', dataCadastro: '2024-02-20', ultimaInteracao: '2025-04-18', observacoes: 'Empresário local', dataNascimento: '1980-07-25' },
  { id: '3', nome: 'Ana Paula Ferreira', email: 'ana.ferreira@email.com', telefone: '(11) 96543-2109', cpf: '345.678.901-22', endereco: 'Rua da Paz, 45', bairro: 'Vila Nova', cidade: 'São Paulo', estado: 'SP', cep: '02345-678', comunidade: 'Vila Nova', nivel: 'lider', tags: ['mulheres', 'educacao', 'juventude'], status: 'ativo', dataCadastro: '2024-01-20', ultimaInteracao: '2025-04-22', observacoes: 'Professora e líder comunitária', dataNascimento: '1985-11-08' },
  { id: '4', nome: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', telefone: '(11) 95432-1098', cpf: '456.789.012-33', endereco: 'Rua Boa Vista, 789', bairro: 'Boa Vista', cidade: 'São Paulo', estado: 'SP', cep: '03456-789', comunidade: 'Boa Vista', nivel: 'apoiador', tags: ['esportes', 'cultura'], status: 'ativo', dataCadastro: '2024-03-10', ultimaInteracao: '2025-04-15', observacoes: 'Organiza eventos esportivos', dataNascimento: '1990-01-30' },
  { id: '5', nome: 'Fernanda Costa Oliveira', email: 'fernanda.oliveira@email.com', telefone: '(11) 94321-0987', cpf: '567.890.123-44', endereco: 'Rua São Francisco, 234', bairro: 'São Francisco', cidade: 'São Paulo', estado: 'SP', cep: '04567-890', comunidade: 'São Francisco', nivel: 'influenciador', tags: ['mulheres', 'saude', 'idosos'], status: 'ativo', dataCadastro: '2024-01-25', ultimaInteracao: '2025-04-21', observacoes: 'Enfermeira, trabalha com saúde da mulher', dataNascimento: '1982-05-15' },
  { id: '6', nome: 'Roberto Carlos Mendes', email: 'roberto.mendes@email.com', telefone: '(11) 93210-9876', cpf: '678.901.234-55', endereco: 'Av. Industrial, 567', bairro: 'Distrito Industrial', cidade: 'São Paulo', estado: 'SP', cep: '05678-901', comunidade: 'Industrial', nivel: 'apoiador', tags: ['empresarios', 'infraestrutura', 'trabalho'], status: 'ativo', dataCadastro: '2024-04-05', ultimaInteracao: '2025-04-10', observacoes: ' dono de fábrica', dataNascimento: '1970-09-22' },
  { id: '7', nome: 'Pedro Henrique Souza', email: 'pedro.souza@email.com', telefone: '(11) 92109-8765', cpf: '789.012.345-66', endereco: 'Rua Universitária, 890', bairro: 'Vila Universitária', cidade: 'São Paulo', estado: 'SP', cep: '06789-012', comunidade: 'Universitários', nivel: 'apoiador', tags: ['juventude', 'educacao', 'tecnologia'], status: 'ativo', dataCadastro: '2024-05-12', ultimaInteracao: '2025-04-19', observacoes: 'Estudante de Direito', dataNascimento: '2000-04-10' },
  { id: '8', nome: 'Sebastião Oliveira Neto', email: 'sebastiao.neto@email.com', telefone: '(11) 91098-7654', cpf: '890.123.456-77', endereco: 'Rua das Lideranças, 12', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01310-200', comunidade: 'Lideranças', nivel: 'lider', tags: ['idosos', 'tradicional', 'comunitario'], status: 'ativo', dataCadastro: '2023-12-01', ultimaInteracao: '2025-04-22', observacoes: 'Liderança histórica da região', dataNascimento: '1955-08-18' },
  { id: '9', nome: 'Juliana Martins Rocha', email: 'juliana.rocha@email.com', telefone: '(11) 99876-5432', cpf: '901.234.567-88', endereco: 'Rua Primavera, 456', bairro: 'Jardim das Oliveiras', cidade: 'São Paulo', estado: 'SP', cep: '01234-568', comunidade: 'Jardim das Oliveiras', nivel: 'eleitor', tags: ['mulheres', 'meio-ambiente'], status: 'ativo', dataCadastro: '2024-06-15', ultimaInteracao: '2025-04-14', observacoes: 'Ativista ambiental', dataNascimento: '1992-12-03' },
  { id: '10', nome: 'Marcos Vinícius Almeida', email: 'marcos.almeida@email.com', telefone: '(11) 98765-1234', cpf: '012.345.678-99', endereco: 'Av. Central, 789', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01310-300', comunidade: 'Centro', nivel: 'eleitor', tags: ['comercio', 'infraestrutura'], status: 'ativo', dataCadastro: '2024-07-20', ultimaInteracao: '2025-04-16', observacoes: 'Comerciante do centro', dataNascimento: '1978-06-28' },
  { id: '11', nome: 'Luciana Pereira Dias', email: 'luciana.dias@email.com', telefone: '(11) 97654-9876', cpf: '111.222.333-44', endereco: 'Rua da Alegria, 67', bairro: 'Vila Nova', cidade: 'São Paulo', estado: 'SP', cep: '02345-679', comunidade: 'Vila Nova', nivel: 'apoiador', tags: ['educacao', 'juventude', 'cultura'], status: 'ativo', dataCadastro: '2024-08-01', ultimaInteracao: '2025-04-17', observacoes: 'Diretora de escola municipal', dataNascimento: '1983-02-14' },
  { id: '12', nome: 'Ricardo Gonçalves', email: 'ricardo.goncalves@email.com', telefone: '(11) 96543-8765', cpf: '222.333.444-55', endereco: 'Rua do Sol, 234', bairro: 'Boa Vista', cidade: 'São Paulo', estado: 'SP', cep: '03456-790', comunidade: 'Boa Vista', nivel: 'eleitor', tags: ['esportes', 'saude'], status: 'ativo', dataCadastro: '2024-09-10', ultimaInteracao: '2025-04-13', observacoes: 'Personal trainer', dataNascimento: '1988-10-05' },
  { id: '13', nome: 'Cristiane Moraes', email: 'cristiane.moraes@email.com', telefone: '(11) 95432-7654', cpf: '333.444.555-66', endereco: 'Rua Nova Esperança, 890', bairro: 'São Francisco', cidade: 'São Paulo', estado: 'SP', cep: '04567-891', comunidade: 'São Francisco', nivel: 'apoiador', tags: ['mulheres', 'assistencia-social'], status: 'ativo', dataCadastro: '2024-10-15', ultimaInteracao: '2025-04-20', observacoes: 'Assistente social', dataNascimento: '1976-07-20' },
  { id: '14', nome: 'Antônio Carlos Braga', email: 'antonio.braga@email.com', telefone: '(11) 94321-6543', cpf: '444.555.666-77', endereco: 'Av. das Indústrias, 1234', bairro: 'Distrito Industrial', cidade: 'São Paulo', estado: 'SP', cep: '05678-902', comunidade: 'Industrial', nivel: 'eleitor', tags: ['trabalho', 'infraestrutura'], status: 'ativo', dataCadastro: '2024-11-01', ultimaInteracao: '2025-04-11', observacoes: 'Sindicalista', dataNascimento: '1965-04-12' },
  { id: '15', nome: 'Beatriz Nunes Camargo', email: 'beatriz.camargo@email.com', telefone: '(11) 93210-5432', cpf: '555.666.777-88', endereco: 'Rua do Campus, 567', bairro: 'Vila Universitária', cidade: 'São Paulo', estado: 'SP', cep: '06789-013', comunidade: 'Universitários', nivel: 'apoiador', tags: ['juventude', 'tecnologia', 'inovacao'], status: 'ativo', dataCadastro: '2024-12-10', ultimaInteracao: '2025-04-18', observacoes: 'Estudante de Engenharia', dataNascimento: '2002-08-30' },
];

export const solicitacoes: Solicitacao[] = [
  { id: '1', titulo: 'Posto de Saúde Jardim das Oliveiras precisa de reforma', descricao: 'O posto de saúde está sem condições de atendimento. Precisa de reforma urgente.', eleitor: 'Maria Aparecida Santos', eleitorId: '1', categoria: 'Saúde', prioridade: 'urgente', status: 'andamento', dataCriacao: '2025-04-01', dataPrazo: '2025-05-15', responsavel: 'Equipe de Saúde' },
  { id: '2', titulo: 'Iluminação pública na Av. Paulista', descricao: 'Várias luminárias queimadas na avenida.', eleitor: 'João Batista Silva', eleitorId: '2', categoria: 'Infraestrutura', prioridade: 'media', status: 'pendente', dataCriacao: '2025-04-05', dataPrazo: '2025-04-30', responsavel: 'Equipe de Infraestrutura' },
  { id: '3', titulo: 'Creche para bairro Vila Nova', descricao: 'Não há creche pública no bairro. Mães precisam se deslocar muito.', eleitor: 'Ana Paula Ferreira', eleitorId: '3', categoria: 'Educação', prioridade: 'alta', status: 'andamento', dataCriacao: '2025-04-08', dataPrazo: '2025-06-30', responsavel: 'Equipe de Educação' },
  { id: '4', titulo: 'Praça Boa Vista sem manutenção', descricao: 'A praça está abandonada, sem limpeza e equipamentos quebrados.', eleitor: 'Carlos Eduardo Lima', eleitorId: '4', categoria: 'Infraestrutura', prioridade: 'media', status: 'pendente', dataCriacao: '2025-04-10', dataPrazo: '2025-05-20', responsavel: 'Equipe de Obras' },
  { id: '5', titulo: 'Ambulância para São Francisco', descricao: 'O bairro não tem ambulância própria.', eleitor: 'Fernanda Costa Oliveira', eleitorId: '5', categoria: 'Saúde', prioridade: 'urgente', status: 'andamento', dataCriacao: '2025-04-12', dataPrazo: '2025-05-10', responsavel: 'Equipe de Saúde' },
  { id: '6', titulo: 'Transporte público para Distrito Industrial', descricao: 'Funcionários têm dificuldade de chegar ao trabalho.', eleitor: 'Roberto Carlos Mendes', eleitorId: '6', categoria: 'Transporte', prioridade: 'alta', status: 'pendente', dataCriacao: '2025-04-14', dataPrazo: '2025-05-30', responsavel: 'Equipe de Mobilidade' },
  { id: '7', titulo: 'Ônibus noturno para Vila Universitária', descricao: 'Estudantes precisam de transporte noturno.', eleitor: 'Pedro Henrique Souza', eleitorId: '7', categoria: 'Transporte', prioridade: 'media', status: 'concluido', dataCriacao: '2025-03-20', dataPrazo: '2025-04-15', responsavel: 'Equipe de Mobilidade' },
  { id: '8', titulo: 'Asfaltamento da Rua das Lideranças', descricao: 'Rua está sem asfalto há anos.', eleitor: 'Sebastião Oliveira Neto', eleitorId: '8', categoria: 'Infraestrutura', prioridade: 'alta', status: 'andamento', dataCriacao: '2025-04-15', dataPrazo: '2025-07-30', responsavel: 'Equipe de Obras' },
  { id: '9', titulo: 'Coleta seletiva no Jardim das Oliveiras', descricao: 'Implementar coleta seletiva no bairro.', eleitor: 'Juliana Martins Rocha', eleitorId: '9', categoria: 'Meio Ambiente', prioridade: 'baixa', status: 'pendente', dataCriacao: '2025-04-16', dataPrazo: '2025-06-15', responsavel: 'Equipe de Meio Ambiente' },
  { id: '10', titulo: 'Segurança no comércio do Centro', descricao: 'Aumentar policiamento na região central.', eleitor: 'Marcos Vinícius Almeida', eleitorId: '10', categoria: 'Segurança', prioridade: 'alta', status: 'pendente', dataCriacao: '2025-04-17', dataPrazo: '2025-05-25', responsavel: 'Equipe de Segurança' },
];

export const tarefas: Tarefa[] = [
  { id: '1', titulo: 'Reunião com lideranças do Jardim das Oliveiras', descricao: 'Agendar reunião para discutir demandas da comunidade', status: 'pendente', prioridade: 'alta', responsavel: 'Assessor João', dataCriacao: '2025-04-20', dataPrazo: '2025-04-25', tags: ['reuniao', 'comunidade'] },
  { id: '2', titulo: 'Visita ao posto de saúde', descricao: 'Vistoriar as condições do posto de saúde', status: 'andamento', prioridade: 'urgente', responsavel: 'Assessor Maria', dataCriacao: '2025-04-19', dataPrazo: '2025-04-22', tags: ['saude', 'vistoria'] },
  { id: '3', titulo: 'Elaborar relatório de gastos', descricao: 'Relatório mensal de gastos do gabinete', status: 'concluida', prioridade: 'media', responsavel: 'Assessor Pedro', dataCriacao: '2025-04-15', dataPrazo: '2025-04-20', tags: ['administrativo'] },
  { id: '4', titulo: 'Atualizar base de eleitores', descricao: 'Incluir novos eleitores cadastrados', status: 'pendente', prioridade: 'media', responsavel: 'Assessor Ana', dataCriacao: '2025-04-18', dataPrazo: '2025-04-28', tags: ['dados'] },
  { id: '5', titulo: 'Responder solicitação #001', descricao: 'Dar retorno sobre reforma do posto de saúde', status: 'andamento', prioridade: 'urgente', responsavel: 'Assessor Maria', dataCriacao: '2025-04-17', dataPrazo: '2025-04-21', tags: ['saude', 'resposta'] },
  { id: '6', titulo: 'Evento no bairro Boa Vista', descricao: 'Organizar evento de prestação de contas', status: 'pendente', prioridade: 'alta', responsavel: 'Assessor João', dataCriacao: '2025-04-16', dataPrazo: '2025-05-05', tags: ['evento', 'prestacao-contas'] },
  { id: '7', titulo: 'Reunião com sindicato', descricao: 'Reunião sobre transporte para trabalhadores', status: 'concluida', prioridade: 'alta', responsavel: 'Assessor Pedro', dataCriacao: '2025-04-10', dataPrazo: '2025-04-15', tags: ['reuniao', 'trabalho'] },
  { id: '8', titulo: 'Visita técnica ao canteiro de obras', descricao: 'Acompanhar obra de asfaltamento', status: 'pendente', prioridade: 'media', responsavel: 'Assessor João', dataCriacao: '2025-04-14', dataPrazo: '2025-04-26', tags: ['obras', 'vistoria'] },
];

export const eventos: Evento[] = [
  { id: '1', titulo: 'Reunião com Lideranças', descricao: 'Encontro mensal com lideranças comunitárias', data: '2025-04-25', horaInicio: '09:00', horaFim: '11:00', local: 'Câmara Municipal', tipo: 'reuniao', participantes: ['Maria Santos', 'João Silva', 'Ana Paula'] },
  { id: '2', titulo: 'Visita ao Jardim das Oliveiras', descricao: 'Visita para vistoriar demandas da comunidade', data: '2025-04-26', horaInicio: '14:00', horaFim: '16:00', local: 'Jardim das Oliveiras', tipo: 'visita', participantes: ['Assessor João', 'Assessor Maria'] },
  { id: '3', titulo: 'Evento de Prestação de Contas', descricao: 'Evento para apresentar ações do mandato', data: '2025-04-28', horaInicio: '19:00', horaFim: '21:00', local: 'Centro Comunitário Boa Vista', tipo: 'evento', participantes: ['Todos'] },
  { id: '4', titulo: 'Audiência Pública - Saúde', descricao: 'Audiência sobre melhorias na saúde pública', data: '2025-04-30', horaInicio: '10:00', horaFim: '12:00', local: 'Câmara Municipal', tipo: 'compromisso', participantes: ['Fernanda Lima', 'Maria Santos'] },
  { id: '5', titulo: 'Reunião com Empresários', descricao: 'Café da manhã com empresários do centro', data: '2025-05-02', horaInicio: '08:00', horaFim: '10:00', local: 'Restaurante Central', tipo: 'reuniao', participantes: ['João Silva', 'Roberto Mendes'] },
];

export const documentos: Documento[] = [
  { id: '1', nome: 'Projeto de Lei - Saúde.pdf', tipo: 'pdf', tamanho: '2.4 MB', pasta: 'Projetos de Lei', dataUpload: '2025-04-15', uploadedBy: 'Assessor João' },
  { id: '2', nome: 'Relatório Mensal - Abril.docx', tipo: 'doc', tamanho: '1.8 MB', pasta: 'Relatórios', dataUpload: '2025-04-20', uploadedBy: 'Assessor Maria' },
  { id: '3', nome: 'Foto - Evento Boa Vista.jpg', tipo: 'img', tamanho: '3.2 MB', pasta: 'Fotos', dataUpload: '2025-04-18', uploadedBy: 'Assessor Ana' },
  { id: '4', nome: 'Planilha de Eleitores.xlsx', tipo: 'xls', tamanho: '856 KB', pasta: 'Dados', dataUpload: '2025-04-10', uploadedBy: 'Assessor Pedro' },
  { id: '5', nome: 'Ofício - Secretaria de Obras.pdf', tipo: 'pdf', tamanho: '1.1 MB', pasta: 'Ofícios', dataUpload: '2025-04-12', uploadedBy: 'Assessor João' },
];

export const equipe: MembroEquipe[] = [
  { id: '1', nome: 'Carlos Alberto Mendes', email: 'carlos@mandato.digital', cargo: 'Chefe de Gabinete', permissao: 'admin', status: 'ativo', dataCadastro: '2023-01-15', ultimoAcesso: '2025-04-23 09:30' },
  { id: '2', nome: 'Fernanda Lima Souza', email: 'fernanda@mandato.digital', cargo: 'Assessor de Comunicação', permissao: 'editor', status: 'ativo', dataCadastro: '2023-02-20', ultimoAcesso: '2025-04-23 08:45' },
  { id: '3', nome: 'Ricardo Oliveira', email: 'ricardo@mandato.digital', cargo: 'Assessor de Orçamento', permissao: 'editor', status: 'ativo', dataCadastro: '2023-03-10', ultimoAcesso: '2025-04-22 17:00' },
  { id: '4', nome: 'Patrícia Nunes', email: 'patricia@mandato.digital', cargo: 'Assessor Parlamentar', permissao: 'editor', status: 'ativo', dataCadastro: '2023-04-05', ultimoAcesso: '2025-04-23 10:15' },
  { id: '5', nome: 'Bruno Costa', email: 'bruno@mandato.digital', cargo: 'Estagiário', permissao: 'visualizador', status: 'ativo', dataCadastro: '2024-01-10', ultimoAcesso: '2025-04-21 14:30' },
];

export const comunicacoes: Comunicacao[] = [
  { id: '1', tipo: 'email', assunto: 'Feliz Aniversário!', conteudo: 'Mensagem de aniversário personalizada', destinatarios: 12, dataEnvio: '2025-04-23', status: 'enviado', taxaAbertura: 78 },
  { id: '2', tipo: 'email', assunto: 'Convite - Prestação de Contas', conteudo: 'Convite para o evento de prestação de contas', destinatarios: 2450, dataEnvio: '2025-04-22', status: 'enviado', taxaAbertura: 42 },
  { id: '3', tipo: 'sms', assunto: 'Lembrete Reunião', conteudo: 'Lembrete de reunião com lideranças amanhã às 9h', destinatarios: 45, dataEnvio: '2025-04-24', status: 'programado' },
  { id: '4', tipo: 'email', assunto: 'Newsletter - Abril 2025', conteudo: 'Resumo das ações do mês de abril', destinatarios: 3100, dataEnvio: '2025-04-20', status: 'enviado', taxaAbertura: 35 },
  { id: '5', tipo: 'sms', assunto: 'Agradecimento', conteudo: 'Agradecimento pela participação no evento', destinatarios: 180, dataEnvio: '2025-04-19', status: 'enviado' },
];

export const atividadesRecentes = [
  { id: '1', acao: 'Eleitor cadastrado', detalhe: 'Maria Aparecida Santos foi adicionada', usuario: 'Assessor Ana', data: '2025-04-23 10:30' },
  { id: '2', acao: 'Solicitação atualizada', detalhe: 'Posto de Saúde - status mudou para "Em Andamento"', usuario: 'Assessor Maria', data: '2025-04-23 09:15' },
  { id: '3', acao: 'E-mail enviado', detalhe: 'Feliz Aniversário! - 12 destinatários', usuario: 'Sistema', data: '2025-04-23 08:00' },
  { id: '4', acao: 'Tarefa concluída', detalhe: 'Elaborar relatório de gastos', usuario: 'Assessor Pedro', data: '2025-04-22 16:45' },
  { id: '5', acao: 'Documento adicionado', detalhe: 'Relatório Mensal - Abril.docx', usuario: 'Assessor Maria', data: '2025-04-22 14:20' },
  { id: '6', acao: 'Reunião agendada', detalhe: 'Reunião com Lideranças - 25/04 às 09:00', usuario: 'Assessor João', data: '2025-04-22 11:00' },
];

export const chartData = {
  crescimentoMensal: [
    { mes: 'Jan', eleitores: 1200, solicitacoes: 45 },
    { mes: 'Fev', eleitores: 1350, solicitacoes: 52 },
    { mes: 'Mar', eleitores: 1580, solicitacoes: 61 },
    { mes: 'Abr', eleitores: 1820, solicitacoes: 48 },
    { mes: 'Mai', eleitores: 2100, solicitacoes: 72 },
    { mes: 'Jun', eleitores: 2340, solicitacoes: 68 },
    { mes: 'Jul', eleitores: 2450, solicitacoes: 55 },
    { mes: 'Ago', eleitores: 2450, solicitacoes: 63 },
    { mes: 'Set', eleitores: 2450, solicitacoes: 71 },
    { mes: 'Out', eleitores: 2450, solicitacoes: 58 },
    { mes: 'Nov', eleitores: 2450, solicitacoes: 64 },
    { mes: 'Dez', eleitores: 2450, solicitacoes: 70 },
  ],
  solicitacoesPorCategoria: [
    { categoria: 'Saúde', total: 28 },
    { categoria: 'Infraestrutura', total: 35 },
    { categoria: 'Educação', total: 22 },
    { categoria: 'Transporte', total: 18 },
    { categoria: 'Segurança', total: 15 },
    { categoria: 'Meio Ambiente', total: 12 },
  ],
  eleitoresPorComunidade: [
    { nome: 'Centro', valor: 518 },
    { nome: 'São Francisco', valor: 423 },
    { nome: 'Jardim das Oliveiras', valor: 342 },
    { nome: 'Vila Nova', valor: 276 },
    { nome: 'Universitários', valor: 234 },
    { nome: 'Boa Vista', valor: 189 },
    { nome: 'Industrial', valor: 156 },
    { nome: 'Lideranças', valor: 89 },
  ],
  statusSolicitacoes: [
    { status: 'Pendente', valor: 124 },
    { status: 'Em Andamento', valor: 89 },
    { status: 'Concluído', valor: 156 },
    { status: 'Cancelado', valor: 23 },
  ],
};
