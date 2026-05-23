import { useState } from 'react';
import {
  // === NAVEGAÇÃO PRINCIPAL (Sidebar) ===
  IconLayoutDashboard,
  IconUsers,
  IconBuildingCommunity,
  IconClipboardList,
  IconMessageCircle,
  IconMapPin,
  IconCalendar,
  IconFileText,
  IconFolder,
  IconGavel,
  IconTrendingUp,
  IconCrown,
  IconChartBar,
  IconReportAnalytics,
  IconShield,
  IconSettings,

  // === AÇÕES CRUD ===
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconCopy,
  IconCheck,
  IconFileExport,
  IconFileImport,
  IconRefresh,

  // === COMUNICAÇÃO ===
  IconMail,
  IconMessage,
  IconPhone,
  IconBell,
  IconSend,
  IconShare,

  // === STATUS ===
  IconCircleCheck,
  IconClock,
  IconHourglass,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,

  // === PESSOAS ===
  IconUser,
  IconUserPlus,
  IconUserCheck,
  IconUsersGroup,
  IconUserStar,
  IconHeartHandshake,

  // === DOCUMENTOS ===
  IconFile,
  IconFileDescription,
  IconFileCheck,
  IconFileTypePdf,
  IconCertificate,
  IconAward,

  // === MAPA ===
  IconMap,
  IconCurrentLocation,
  IconRoute,
  IconNavigation,

  // === SEGURANÇA ===
  IconShieldCheck,
  IconLock,
  IconKey,

  // === FILTROS / BUSCA ===
  IconSearch,
  IconFilter,
  IconAdjustmentsHorizontal,

  // === SETAS / NAVEGAÇÃO ===
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,

  // === OUTROS ===
  IconX,
  IconMenu2,
  IconLogout,
  IconLogin,
  IconStar,
  IconBookmark,
  IconFlag,
  IconChartPie,
  IconChartLine,
  IconReport,
  IconNotes,
  IconNotebook,
  IconBook,
  IconBuilding,
  IconSchool,
  IconWorld,
  IconCompass,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconMinimize,
  IconPrinter,
  IconDeviceDesktop,
  IconCloud,
  IconDatabase,
  IconWifi,
  IconCode,
  IconTerminal2,
  IconBug,
  IconApi,
  IconBulb,
  IconRosette,
  IconMoodSmile,
  IconMoodCheck,
  IconEyeOff,
  IconPassword,
  IconLockAccess,
  IconLockOpen,
  IconFingerprint,
  IconId,
  IconAccessPoint,
  IconArchive,
  IconHistory,
  IconRotateClockwise,
  IconArchiveOff,
  IconMailOpened,
  IconMailForward,
  IconMessageDots,
  IconPhoneCall,
  IconVideo,
  IconBellRinging,
  IconBellOff,
  IconBrandWhatsapp,
  IconBrandTelegram,
  IconTrendingDown,
  IconFileAnalytics,
  IconCalendarStats,
  IconMapSearch,
  IconLocation,
  IconWorldLatitude,
  IconWorldLongitude,
  IconGps,
  IconRouteAltLeft,
  IconScale,
  IconSignature,
  IconFileInvoice,
  IconFileCertificate,
  IconCurrencyDollar,
  IconCreditCard,
  IconCash,
  IconCashBanknote,
  IconReceiptTax,
  IconChartDonut,
  IconChartArea,
  IconServer,
  IconCloudUpload,
  IconCloudDownload,
  IconNetwork,
  IconCodeDots,
  IconDeviceMobile,
  IconScan,
  IconCircleX,
  IconSquareCheck,
  IconHelpCircle,
  IconStarFilled,
} from '@tabler/icons-react';

// ============================================
// MAPEAMENTO PROFISSIONAL DE ÍCONES POR FUNÇÃO
// ============================================

interface IconeSugestao {
  funcao: string;
  Icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
  nomeTabler: string;
  contexto: string;
  cor?: string;
}

const navegacaoPrincipal: IconeSugestao[] = [
  { funcao: 'Dashboard / Painel', Icon: IconLayoutDashboard, nomeTabler: 'IconLayoutDashboard', contexto: 'Página inicial — visão geral', cor: 'blue' },
  { funcao: 'Eleitores / Cidadãos', Icon: IconUsers, nomeTabler: 'IconUsers', contexto: 'Cadastro de eleitores', cor: 'blue' },
  { funcao: 'Comunidades / Bairros', Icon: IconBuildingCommunity, nomeTabler: 'IconBuildingCommunity', contexto: 'Grupos territoriais', cor: 'blue' },
  { funcao: 'Solicitações / Demandas', Icon: IconClipboardList, nomeTabler: 'IconClipboardList', contexto: 'Kanban de demandas', cor: 'blue' },
  { funcao: 'Comunicação / Mensagens', Icon: IconMessageCircle, nomeTabler: 'IconMessageCircle', contexto: 'Email, SMS, WhatsApp', cor: 'blue' },
  { funcao: 'Mapa / Território', Icon: IconMapPin, nomeTabler: 'IconMapPin', contexto: 'Mapa de eleitores', cor: 'blue' },
];

const navegacaoGestao: IconeSugestao[] = [
  { funcao: 'Agenda / Eventos', Icon: IconCalendar, nomeTabler: 'IconCalendar', contexto: 'Calendário de compromissos', cor: 'slate' },
  { funcao: 'Tarefas / Afazeres', Icon: IconFileText, nomeTabler: 'IconFileText', contexto: 'Kanban de tarefas', cor: 'slate' },
  { funcao: 'Documentos / Arquivos', Icon: IconFolder, nomeTabler: 'IconFolder', contexto: 'Gerenciador de documentos', cor: 'slate' },
  { funcao: 'Proposições / Leis', Icon: IconGavel, nomeTabler: 'IconGavel', contexto: 'PLs, emendas, requerimentos', cor: 'slate' },
  { funcao: 'Produtividade / Métricas', Icon: IconTrendingUp, nomeTabler: 'IconTrendingUp', contexto: 'Dashboard de produtividade', cor: 'slate' },
  { funcao: 'Líderes / Coordenadores', Icon: IconCrown, nomeTabler: 'IconCrown', contexto: 'Ranking de líderes', cor: 'slate' },
  { funcao: 'Enquetes / Consultas', Icon: IconChartBar, nomeTabler: 'IconChartBar', contexto: 'Votações e pesquisas', cor: 'slate' },
  { funcao: 'Relatórios / Analytics', Icon: IconReportAnalytics, nomeTabler: 'IconReportAnalytics', contexto: 'Relatórios e gráficos', cor: 'slate' },
];

const navegacaoAdmin: IconeSugestao[] = [
  { funcao: 'Equipe / Permissões', Icon: IconShield, nomeTabler: 'IconShield', contexto: 'Gestão de usuários e roles', cor: 'purple' },
  { funcao: 'Configurações / Ajustes', Icon: IconSettings, nomeTabler: 'IconSettings', contexto: 'Configurações do sistema', cor: 'purple' },
];

const acoesCrud: IconeSugestao[] = [
  { funcao: 'Novo / Adicionar', Icon: IconPlus, nomeTabler: 'IconPlus', contexto: 'Botão primário de criação', cor: 'green' },
  { funcao: 'Editar / Modificar', Icon: IconEdit, nomeTabler: 'IconEdit', contexto: 'Ação de edição', cor: 'blue' },
  { funcao: 'Excluir / Remover', Icon: IconTrash, nomeTabler: 'IconTrash', contexto: 'Ação de exclusão', cor: 'red' },
  { funcao: 'Visualizar / Detalhes', Icon: IconEye, nomeTabler: 'IconEye', contexto: 'Ver detalhes/preview', cor: 'slate' },
  { funcao: 'Copiar / Duplicar', Icon: IconCopy, nomeTabler: 'IconCopy', contexto: 'Duplicar registro', cor: 'slate' },
  { funcao: 'Salvar / Confirmar', Icon: IconCheck, nomeTabler: 'IconCheck', contexto: 'Salvar alterações', cor: 'green' },
  { funcao: 'Exportar / Download', Icon: IconFileExport, nomeTabler: 'IconFileExport', contexto: 'Exportar dados', cor: 'slate' },
  { funcao: 'Importar / Upload', Icon: IconFileImport, nomeTabler: 'IconFileImport', contexto: 'Importar CSV/dados', cor: 'slate' },
  { funcao: 'Atualizar / Refresh', Icon: IconRefresh, nomeTabler: 'IconRefresh', contexto: 'Recarregar dados', cor: 'slate' },
  { funcao: 'Arquivar', Icon: IconArchive, nomeTabler: 'IconArchive', contexto: 'Arquivar registro', cor: 'amber' },
  { funcao: 'Restaurar', Icon: IconRotateClockwise, nomeTabler: 'IconRotateClockwise', contexto: 'Desfazer arquivamento', cor: 'amber' },
  { funcao: 'Histórico', Icon: IconHistory, nomeTabler: 'IconHistory', contexto: 'Ver histórico', cor: 'slate' },
];

const comunicacao: IconeSugestao[] = [
  { funcao: 'Email / Correio', Icon: IconMail, nomeTabler: 'IconMail', contexto: 'Envio de email', cor: 'blue' },
  { funcao: 'Email Lido', Icon: IconMailOpened, nomeTabler: 'IconMailOpened', contexto: 'Mensagem lida', cor: 'slate' },
  { funcao: 'Encaminhar', Icon: IconMailForward, nomeTabler: 'IconMailForward', contexto: 'Encaminhar mensagem', cor: 'slate' },
  { funcao: 'Mensagem / Chat', Icon: IconMessage, nomeTabler: 'IconMessage', contexto: 'Mensagem direta', cor: 'blue' },
  { funcao: 'Conversa / Chat', Icon: IconMessageDots, nomeTabler: 'IconMessageDots', contexto: 'Chat com histórico', cor: 'blue' },
  { funcao: 'Telefone / Ligação', Icon: IconPhone, nomeTabler: 'IconPhone', contexto: 'Contato telefônico', cor: 'green' },
  { funcao: 'Ligação', Icon: IconPhoneCall, nomeTabler: 'IconPhoneCall', contexto: 'Chamada ativa', cor: 'green' },
  { funcao: 'Vídeo / Reunião', Icon: IconVideo, nomeTabler: 'IconVideo', contexto: 'Videoconferência', cor: 'purple' },
  { funcao: 'Notificação', Icon: IconBell, nomeTabler: 'IconBell', contexto: 'Alertas do sistema', cor: 'amber' },
  { funcao: 'Notificação Ativa', Icon: IconBellRinging, nomeTabler: 'IconBellRinging', contexto: 'Novo alerta', cor: 'red' },
  { funcao: 'Silenciar', Icon: IconBellOff, nomeTabler: 'IconBellOff', contexto: 'Desativar notificações', cor: 'slate' },
  { funcao: 'Enviar', Icon: IconSend, nomeTabler: 'IconSend', contexto: 'Botão de envio', cor: 'blue' },
  { funcao: 'Compartilhar', Icon: IconShare, nomeTabler: 'IconShare', contexto: 'Compartilhar link', cor: 'slate' },
  { funcao: 'WhatsApp', Icon: IconBrandWhatsapp, nomeTabler: 'IconBrandWhatsapp', contexto: 'Integração WhatsApp', cor: 'green' },
  { funcao: 'Telegram', Icon: IconBrandTelegram, nomeTabler: 'IconBrandTelegram', contexto: 'Integração Telegram', cor: 'blue' },
];

const pessoas: IconeSugestao[] = [
  { funcao: 'Usuário / Perfil', Icon: IconUser, nomeTabler: 'IconUser', contexto: 'Perfil individual', cor: 'slate' },
  { funcao: 'Adicionar Pessoa', Icon: IconUserPlus, nomeTabler: 'IconUserPlus', contexto: 'Novo cadastro', cor: 'green' },
  { funcao: 'Verificado', Icon: IconUserCheck, nomeTabler: 'IconUserCheck', contexto: 'Usuário confirmado', cor: 'green' },
  { funcao: 'Grupo / Equipe', Icon: IconUsersGroup, nomeTabler: 'IconUsersGroup', contexto: 'Equipe/coletivo', cor: 'blue' },
  { funcao: 'Destaque / VIP', Icon: IconUserStar, nomeTabler: 'IconUserStar', contexto: 'Eleitor prioritário', cor: 'amber' },
  { funcao: 'Parceria / Apoio', Icon: IconHeartHandshake, nomeTabler: 'IconHeartHandshake', contexto: 'Colaboração', cor: 'pink' },
  { funcao: 'Identidade / RG', Icon: IconId, nomeTabler: 'IconId', contexto: 'Documento de identidade', cor: 'slate' },
  { funcao: 'Biometria', Icon: IconFingerprint, nomeTabler: 'IconFingerprint', contexto: 'Autenticação biométrica', cor: 'slate' },
  { funcao: 'Acesso / Login', Icon: IconAccessPoint, nomeTabler: 'IconAccessPoint', contexto: 'Ponto de acesso', cor: 'blue' },
];

const documentos: IconeSugestao[] = [
  { funcao: 'Arquivo / Documento', Icon: IconFile, nomeTabler: 'IconFile', contexto: 'Documento genérico', cor: 'slate' },
  { funcao: 'Descrição / Texto', Icon: IconFileDescription, nomeTabler: 'IconFileDescription', contexto: 'Documento com texto', cor: 'slate' },
  { funcao: 'Conferido / OK', Icon: IconFileCheck, nomeTabler: 'IconFileCheck', contexto: 'Documento aprovado', cor: 'green' },
  { funcao: 'PDF', Icon: IconFileTypePdf, nomeTabler: 'IconFileTypePdf', contexto: 'Arquivo PDF', cor: 'red' },
  { funcao: 'Certificado / Diploma', Icon: IconCertificate, nomeTabler: 'IconCertificate', contexto: 'Certificado oficial', cor: 'amber' },
  { funcao: 'Prêmio / Reconhecimento', Icon: IconAward, nomeTabler: 'IconAward', contexto: 'Medalha/honraria', cor: 'amber' },
  { funcao: 'Contrato', Icon: IconFileInvoice, nomeTabler: 'IconFileInvoice', contexto: 'Documento legal', cor: 'slate' },
  { funcao: 'Assinatura', Icon: IconSignature, nomeTabler: 'IconSignature', contexto: 'Assinatura digital', cor: 'slate' },
  { funcao: 'Balança / Justiça', Icon: IconScale, nomeTabler: 'IconScale', contexto: 'Aspecto jurídico', cor: 'slate' },
  { funcao: 'Notas / Anotações', Icon: IconNotes, nomeTabler: 'IconNotes', contexto: 'Bloco de notas', cor: 'slate' },
  { funcao: 'Caderno', Icon: IconNotebook, nomeTabler: 'IconNotebook', contexto: 'Registro detalhado', cor: 'slate' },
  { funcao: 'Livro / Legislação', Icon: IconBook, nomeTabler: 'IconBook', contexto: 'Leis/regulamentos', cor: 'slate' },
];

const mapaTerritorio: IconeSugestao[] = [
  { funcao: 'Mapa', Icon: IconMap, nomeTabler: 'IconMap', contexto: 'Visualização de mapa', cor: 'blue' },
  { funcao: 'Localização / Pin', Icon: IconMapPin, nomeTabler: 'IconMapPin', contexto: 'Marcador no mapa', cor: 'red' },
  { funcao: 'Busca no Mapa', Icon: IconMapSearch, nomeTabler: 'IconMapSearch', contexto: 'Pesquisa territorial', cor: 'blue' },
  { funcao: 'Local Atual', Icon: IconCurrentLocation, nomeTabler: 'IconCurrentLocation', contexto: 'GPS / posição atual', cor: 'blue' },
  { funcao: 'Navegação', Icon: IconNavigation, nomeTabler: 'IconNavigation', contexto: 'Direções/rotas', cor: 'blue' },
  { funcao: 'Bússola', Icon: IconCompass, nomeTabler: 'IconCompass', contexto: 'Orientação', cor: 'blue' },
  { funcao: 'Rota / Percurso', Icon: IconRoute, nomeTabler: 'IconRoute', contexto: 'Roteirização', cor: 'blue' },
  { funcao: 'Rota Alternativa', Icon: IconRouteAltLeft, nomeTabler: 'IconRouteAltLeft', contexto: 'Caminho alternativo', cor: 'slate' },
  { funcao: 'Mundo / Global', Icon: IconWorld, nomeTabler: 'IconWorld', contexto: 'Cobertura ampla', cor: 'blue' },
  { funcao: 'GPS / Sinal', Icon: IconGps, nomeTabler: 'IconGps', contexto: 'Sinal de posicionamento', cor: 'green' },
];

const status: IconeSugestao[] = [
  { funcao: 'Concluído / Sucesso', Icon: IconCircleCheck, nomeTabler: 'IconCircleCheck', contexto: 'Status positivo', cor: 'green' },
  { funcao: 'Pendente / Espera', Icon: IconClock, nomeTabler: 'IconClock', contexto: 'Aguardando ação', cor: 'amber' },
  { funcao: 'Urgente / Prazo', Icon: IconHourglass, nomeTabler: 'IconHourglass', contexto: 'Prazo curto', cor: 'red' },
  { funcao: 'Aviso / Atenção', Icon: IconAlertCircle, nomeTabler: 'IconAlertCircle', contexto: 'Alerta moderado', cor: 'amber' },
  { funcao: 'Perigo / Erro', Icon: IconAlertTriangle, nomeTabler: 'IconAlertTriangle', contexto: 'Problema crítico', cor: 'red' },
  { funcao: 'Informação', Icon: IconInfoCircle, nomeTabler: 'IconInfoCircle', contexto: 'Dica/informativo', cor: 'blue' },
  { funcao: 'Cancelar / Fechar', Icon: IconCircleX, nomeTabler: 'IconCircleX', contexto: 'Ação negada', cor: 'red' },
  { funcao: 'Confirmado', Icon: IconSquareCheck, nomeTabler: 'IconSquareCheck', contexto: 'Checklist/item OK', cor: 'green' },
  { funcao: 'Aprovado / Feliz', Icon: IconMoodCheck, nomeTabler: 'IconMoodCheck', contexto: 'Satisfação', cor: 'green' },
  { funcao: 'Satisfeito', Icon: IconMoodSmile, nomeTabler: 'IconMoodSmile', contexto: 'Feedback positivo', cor: 'green' },
];

const seguranca: IconeSugestao[] = [
  { funcao: 'Escudo / Proteção', Icon: IconShield, nomeTabler: 'IconShield', contexto: 'Segurança geral', cor: 'blue' },
  { funcao: 'Verificado / Seguro', Icon: IconShieldCheck, nomeTabler: 'IconShieldCheck', contexto: 'Proteção ativa', cor: 'green' },
  { funcao: 'Cadeado / Bloqueado', Icon: IconLock, nomeTabler: 'IconLock', contexto: 'Acesso restrito', cor: 'red' },
  { funcao: 'Acesso Liberado', Icon: IconLockOpen, nomeTabler: 'IconLockOpen', contexto: 'Desbloqueado', cor: 'green' },
  { funcao: 'Acesso Controlado', Icon: IconLockAccess, nomeTabler: 'IconLockAccess', contexto: 'Permissão específica', cor: 'amber' },
  { funcao: 'Chave / Senha', Icon: IconKey, nomeTabler: 'IconKey', contexto: 'Credenciais', cor: 'amber' },
  { funcao: 'Senha / Password', Icon: IconPassword, nomeTabler: 'IconPassword', contexto: 'Campo de senha', cor: 'slate' },
  { funcao: 'Ocultar / Mostrar', Icon: IconEyeOff, nomeTabler: 'IconEyeOff', contexto: 'Toggle visibilidade', cor: 'slate' },
];

const financeiro: IconeSugestao[] = [
  { funcao: 'Moeda / Dinheiro', Icon: IconCurrencyDollar, nomeTabler: 'IconCurrencyDollar', contexto: 'Transação financeira', cor: 'green' },
  { funcao: 'Recibo / Comprovante', Icon: IconFileInvoice, nomeTabler: 'IconFileInvoice', contexto: 'Comprovante de pagamento', cor: 'slate' },
  { funcao: 'Imposto / Taxa', Icon: IconReceiptTax, nomeTabler: 'IconReceiptTax', contexto: 'Tributos', cor: 'slate' },
  { funcao: 'Carteira / Orçamento', Icon: IconCash, nomeTabler: 'IconCash', contexto: 'Gestão orçamentária', cor: 'green' },
  { funcao: 'Cartão de Crédito', Icon: IconCreditCard, nomeTabler: 'IconCreditCard', contexto: 'Pagamento', cor: 'blue' },
  { funcao: 'Dinheiro', Icon: IconCashBanknote, nomeTabler: 'IconCashBanknote', contexto: 'Dinheiro em espécie', cor: 'green' },
];

const analytics: IconeSugestao[] = [
  { funcao: 'Gráfico de Barras', Icon: IconChartBar, nomeTabler: 'IconChartBar', contexto: 'Comparativos', cor: 'blue' },
  { funcao: 'Gráfico de Linha', Icon: IconChartLine, nomeTabler: 'IconChartLine', contexto: 'Tendências temporais', cor: 'blue' },
  { funcao: 'Gráfico de Área', Icon: IconChartArea, nomeTabler: 'IconChartArea', contexto: 'Acumulado', cor: 'blue' },
  { funcao: 'Gráfico Pizza', Icon: IconChartPie, nomeTabler: 'IconChartPie', contexto: 'Distribuição %', cor: 'blue' },
  { funcao: 'Gráfico Rosca', Icon: IconChartDonut, nomeTabler: 'IconChartDonut', contexto: 'Proporção', cor: 'blue' },
  { funcao: 'Relatório', Icon: IconReport, nomeTabler: 'IconReport', contexto: 'Documento de análise', cor: 'slate' },
  { funcao: 'Relatório Analítico', Icon: IconReportAnalytics, nomeTabler: 'IconReportAnalytics', contexto: 'Análise detalhada', cor: 'blue' },
  { funcao: 'Análise de Dados', Icon: IconFileAnalytics, nomeTabler: 'IconFileAnalytics', contexto: 'Métricas', cor: 'blue' },
  { funcao: 'Crescimento', Icon: IconTrendingUp, nomeTabler: 'IconTrendingUp', contexto: 'Evolução positiva', cor: 'green' },
  { funcao: 'Queda', Icon: IconTrendingDown, nomeTabler: 'IconTrendingDown', contexto: 'Evolução negativa', cor: 'red' },
];

const interfaceUi: IconeSugestao[] = [
  { funcao: 'Buscar / Pesquisar', Icon: IconSearch, nomeTabler: 'IconSearch', contexto: 'Campo de busca', cor: 'slate' },
  { funcao: 'Filtrar', Icon: IconFilter, nomeTabler: 'IconFilter', contexto: 'Filtros de lista', cor: 'slate' },
  { funcao: 'Ajustes Avançados', Icon: IconAdjustmentsHorizontal, nomeTabler: 'IconAdjustmentsHorizontal', contexto: 'Filtros complexos', cor: 'slate' },
  { funcao: 'Voltar', Icon: IconArrowLeft, nomeTabler: 'IconArrowLeft', contexto: 'Navegação retorno', cor: 'slate' },
  { funcao: 'Avançar', Icon: IconArrowRight, nomeTabler: 'IconArrowRight', contexto: 'Navegação próxima', cor: 'slate' },
  { funcao: 'Link Externo', Icon: IconArrowUpRight, nomeTabler: 'IconArrowUpRight', contexto: 'Abrir em nova aba', cor: 'slate' },
  { funcao: 'Expandir', Icon: IconChevronDown, nomeTabler: 'IconChevronDown', contexto: 'Dropdown/accordion', cor: 'slate' },
  { funcao: 'Próximo', Icon: IconChevronRight, nomeTabler: 'IconChevronRight', contexto: 'Paginação/menu', cor: 'slate' },
  { funcao: 'Anterior', Icon: IconChevronLeft, nomeTabler: 'IconChevronLeft', contexto: 'Paginação/menu', cor: 'slate' },
  { funcao: 'Fechar / X', Icon: IconX, nomeTabler: 'IconX', contexto: 'Fechar modal/alert', cor: 'slate' },
  { funcao: 'Menu / Hambúrguer', Icon: IconMenu2, nomeTabler: 'IconMenu2', contexto: 'Menu mobile', cor: 'slate' },
  { funcao: 'Sair / Logout', Icon: IconLogout, nomeTabler: 'IconLogout', contexto: 'Encerrar sessão', cor: 'red' },
  { funcao: 'Entrar / Login', Icon: IconLogin, nomeTabler: 'IconLogin', contexto: 'Iniciar sessão', cor: 'blue' },
  { funcao: 'Zoom In', Icon: IconZoomIn, nomeTabler: 'IconZoomIn', contexto: 'Aumentar zoom', cor: 'slate' },
  { funcao: 'Zoom Out', Icon: IconZoomOut, nomeTabler: 'IconZoomOut', contexto: 'Diminuir zoom', cor: 'slate' },
  { funcao: 'Maximizar', Icon: IconMaximize, nomeTabler: 'IconMaximize', contexto: 'Tela cheia', cor: 'slate' },
  { funcao: 'Minimizar', Icon: IconMinimize, nomeTabler: 'IconMinimize', contexto: 'Reduzir tela', cor: 'slate' },
];

const reconhecimento: IconeSugestao[] = [
  { funcao: 'Estrela / Favorito', Icon: IconStar, nomeTabler: 'IconStar', contexto: 'Favoritar item', cor: 'amber' },
  { funcao: 'Estrela Preenchida', Icon: IconStarFilled, nomeTabler: 'IconStarFilled', contexto: 'Favorito ativo', cor: 'amber' },
  { funcao: 'Marcador / Bookmark', Icon: IconBookmark, nomeTabler: 'IconBookmark', contexto: 'Salvar para depois', cor: 'blue' },
  { funcao: 'Bandeira / Meta', Icon: IconFlag, nomeTabler: 'IconFlag', contexto: 'Marcar objetivo', cor: 'red' },
  { funcao: 'Selo / Distinção', Icon: IconRosette, nomeTabler: 'IconRosette', contexto: 'Conquista', cor: 'amber' },
  { funcao: 'Ideia / Insight', Icon: IconBulb, nomeTabler: 'IconBulb', contexto: 'Sugestão/ideia', cor: 'amber' },
];

const infraestrutura: IconeSugestao[] = [
  { funcao: 'Desktop / Computador', Icon: IconDeviceDesktop, nomeTabler: 'IconDeviceDesktop', contexto: 'Estação de trabalho', cor: 'slate' },
  { funcao: 'Mobile / Celular', Icon: IconDeviceMobile, nomeTabler: 'IconDeviceMobile', contexto: 'Dispositivo móvel', cor: 'slate' },
  { funcao: 'Impressora', Icon: IconPrinter, nomeTabler: 'IconPrinter', contexto: 'Impressão', cor: 'slate' },
  { funcao: 'Scanner', Icon: IconScan, nomeTabler: 'IconScan', contexto: 'Digitalização', cor: 'slate' },
  { funcao: 'Banco de Dados', Icon: IconDatabase, nomeTabler: 'IconDatabase', contexto: 'Armazenamento', cor: 'blue' },
  { funcao: 'Servidor', Icon: IconServer, nomeTabler: 'IconServer', contexto: 'Infraestrutura', cor: 'slate' },
  { funcao: 'Nuvem', Icon: IconCloud, nomeTabler: 'IconCloud', contexto: 'Cloud computing', cor: 'blue' },
  { funcao: 'Upload', Icon: IconCloudUpload, nomeTabler: 'IconCloudUpload', contexto: 'Enviar para nuvem', cor: 'green' },
  { funcao: 'Download', Icon: IconCloudDownload, nomeTabler: 'IconCloudDownload', contexto: 'Baixar da nuvem', cor: 'blue' },
  { funcao: 'WiFi / Rede', Icon: IconWifi, nomeTabler: 'IconWifi', contexto: 'Conectividade', cor: 'green' },
  { funcao: 'Rede / Network', Icon: IconNetwork, nomeTabler: 'IconNetwork', contexto: 'Infraestrutura de rede', cor: 'blue' },
  { funcao: 'Código / Dev', Icon: IconCode, nomeTabler: 'IconCode', contexto: 'Desenvolvimento', cor: 'purple' },
  { funcao: 'Snippet', Icon: IconCodeDots, nomeTabler: 'IconCodeDots', contexto: 'Código exemplo', cor: 'purple' },
  { funcao: 'Terminal', Icon: IconTerminal2, nomeTabler: 'IconTerminal2', contexto: 'CLI / comandos', cor: 'slate' },
  { funcao: 'Bug / Erro', Icon: IconBug, nomeTabler: 'IconBug', contexto: 'Issue / defeito', cor: 'red' },
  { funcao: 'API / Interface', Icon: IconApi, nomeTabler: 'IconApi', contexto: 'Integração API', cor: 'blue' },
];

const todasCategorias = [
  { titulo: '🏠 Navegação Principal (Sidebar)', icones: navegacaoPrincipal, descricao: 'Ícones das abas principais do dashboard' },
  { titulo: '📋 Navegação Gestão (Sidebar)', icones: navegacaoGestao, descricao: 'Ícones das abas de gestão legislativa' },
  { titulo: '⚙️ Administração (Sidebar)', icones: navegacaoAdmin, descricao: 'Ícones de configurações e equipe' },
  { titulo: '⚡ Ações CRUD', icones: acoesCrud, descricao: 'Botões de criar, editar, excluir, visualizar' },
  { titulo: '💬 Comunicação', icones: comunicacao, descricao: 'Email, SMS, WhatsApp, notificações' },
  { titulo: '👥 Pessoas & Eleitores', icones: pessoas, descricao: 'Perfis, grupos, verificação' },
  { titulo: '📄 Documentos & Legal', icones: documentos, descricao: 'Arquivos, certificados, contratos' },
  { titulo: '🗺️ Mapa & Território', icones: mapaTerritorio, descricao: 'GPS, rotas, localização' },
  { titulo: '✅ Status & Feedback', icones: status, descricao: 'Concluído, pendente, erro, alerta' },
  { titulo: '🔒 Segurança & Acesso', icones: seguranca, descricao: 'Escudo, cadeado, chave, senha' },
  { titulo: '💰 Financeiro', icones: financeiro, descricao: 'Orçamento, recibos, pagamentos' },
  { titulo: '📊 Analytics & Relatórios', icones: analytics, descricao: 'Gráficos, relatórios, métricas' },
  { titulo: '🎨 Interface & UI', icones: interfaceUi, descricao: 'Busca, filtros, navegação, zoom' },
  { titulo: '🏆 Reconhecimento & Metas', icones: reconhecimento, descricao: 'Estrelas, selos, bandeiras, ideias' },
  { titulo: '🔧 Infraestrutura & TI', icones: infraestrutura, descricao: 'Servidor, nuvem, código, API' },
];

const corClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  green:   { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200' },
  red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
  slate:   { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
  pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    border: 'border-pink-200' },
};

export default function IconesTablerSugestoesPage() {
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [size, setSize] = useState(24);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const categoriasFiltradas = todasCategorias
    .map(cat => ({
      ...cat,
      icones: cat.icones.filter(
        i =>
          i.funcao.toLowerCase().includes(busca.toLowerCase()) ||
          i.contexto.toLowerCase().includes(busca.toLowerCase()) ||
          i.nomeTabler.toLowerCase().includes(busca.toLowerCase())
      ),
    }))
    .filter(cat => cat.icones.length > 0)
    .filter(cat => !categoriaAtiva || cat.titulo === categoriaAtiva);

  const totalIcones = categoriasFiltradas.reduce((acc, cat) => acc + cat.icones.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <IconLayoutDashboard className="w-5 h-5 text-white" stroke={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Sugestões de Ícones Tabler</h1>
              <p className="text-slate-500 text-sm">Mapeamento profissional por função do Mandato Digital</p>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6 flex flex-wrap gap-6 items-center">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Espessura</label>
            <div className="flex gap-2">
              {[1, 1.5, 2].map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    strokeWidth === w
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Tamanho</label>
            <div className="flex gap-2">
              {[20, 24, 32].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    size === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Buscar</label>
            <div className="relative">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Função, contexto ou nome do ícone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="text-sm text-slate-400">
            {totalIcones} ícones
          </div>
        </div>

        {/* Filtro rápido de categorias */}
        {!busca && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setCategoriaAtiva(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !categoriaAtiva ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todas
            </button>
            {todasCategorias.map(cat => (
              <button
                key={cat.titulo}
                onClick={() => setCategoriaAtiva(categoriaAtiva === cat.titulo ? null : cat.titulo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  categoriaAtiva === cat.titulo ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.titulo.split(' ').slice(1).join(' ')}
              </button>
            ))}
          </div>
        )}

        {/* Categorias */}
        {categoriasFiltradas.map((cat) => (
          <div key={cat.titulo} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-base font-semibold text-slate-700">{cat.titulo}</h2>
              <span className="text-xs text-slate-400">{cat.descricao}</span>
              <span className="text-xs font-medium text-slate-300">({cat.icones.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {cat.icones.map((item) => {
                const cor = corClasses[item.cor || 'slate'];
                return (
                  <div
                    key={item.nomeTabler}
                    className={`${cor.bg} ${cor.border} border rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all group`}
                    title={`${item.funcao} — ${item.contexto}`}
                  >
                    <item.Icon
                      size={size}
                      stroke={strokeWidth}
                      className={`${cor.text} transition-transform group-hover:scale-110`}
                    />
                    <div className="text-center">
                      <div className="text-xs font-semibold text-slate-700 leading-tight">{item.funcao}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.contexto}</div>
                      <code className="text-[9px] text-slate-300 mt-1 block">{item.nomeTabler}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {categoriasFiltradas.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <IconSearch className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum ícone encontrado</p>
            <p className="text-sm">Tente outro termo de busca</p>
          </div>
        )}

        {/* Resumo para implementação */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-8">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <IconCode className="w-5 h-5 text-blue-600" />
            Resumo para Implementação
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-700 mb-2">Sidebar — Principal</h4>
              <code className="text-xs text-slate-600 block space-y-1">
                <div>Dashboard → <span className="text-blue-600">IconLayoutDashboard</span></div>
                <div>Eleitores → <span className="text-blue-600">IconUsers</span></div>
                <div>Comunidades → <span className="text-blue-600">IconBuildingCommunity</span></div>
                <div>Solicitações → <span className="text-blue-600">IconClipboardList</span></div>
                <div>Comunicação → <span className="text-blue-600">IconMessageCircle</span></div>
                <div>Mapa → <span className="text-blue-600">IconMapPin</span></div>
              </code>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-700 mb-2">Sidebar — Gestão</h4>
              <code className="text-xs text-slate-600 block space-y-1">
                <div>Agenda → <span className="text-blue-600">IconCalendar</span></div>
                <div>Tarefas → <span className="text-blue-600">IconFileText</span></div>
                <div>Documentos → <span className="text-blue-600">IconFolder</span></div>
                <div>Proposições → <span className="text-blue-600">IconGavel</span></div>
                <div>Produtividade → <span className="text-blue-600">IconTrendingUp</span></div>
                <div>Líderes → <span className="text-blue-600">IconCrown</span></div>
                <div>Enquetes → <span className="text-blue-600">IconChartBar</span></div>
                <div>Relatórios → <span className="text-blue-600">IconReportAnalytics</span></div>
              </code>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-700 mb-2">Ações CRUD</h4>
              <code className="text-xs text-slate-600 block space-y-1">
                <div>Novo → <span className="text-green-600">IconPlus</span></div>
                <div>Editar → <span className="text-blue-600">IconEdit</span></div>
                <div>Excluir → <span className="text-red-600">IconTrash</span></div>
                <div>Ver → <span className="text-slate-600">IconEye</span></div>
                <div>Salvar → <span className="text-green-600">IconCheck</span></div>
              </code>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-medium text-slate-700 mb-2">Status</h4>
              <code className="text-xs text-slate-600 block space-y-1">
                <div>Concluído → <span className="text-green-600">IconCircleCheck</span></div>
                <div>Pendente → <span className="text-amber-600">IconClock</span></div>
                <div>Urgente → <span className="text-red-600">IconHourglass</span></div>
                <div>Aviso → <span className="text-amber-600">IconAlertCircle</span></div>
                <div>Erro → <span className="text-red-600">IconAlertTriangle</span></div>
              </code>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-blue-800 mb-2">Como usar</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Esta página é uma <strong>referência visual</strong> — não altera a demo original em <code className="bg-blue-100 px-1 rounded">/icones-tabler</code></li>
            <li>• Para migrar: atualizar <code className="bg-blue-100 px-1 rounded">src/lib/icons.ts</code> com os imports do Tabler</li>
            <li>• Substituir os aliases Fluent (ex: <code className="bg-blue-100 px-1 rounded">LayoutDashboard</code>) pelos do Tabler (ex: <code className="bg-blue-100 px-1 rounded">IconLayoutDashboard</code>)</li>
            <li>• Todas as páginas que importam de <code className="bg-blue-100 px-1 rounded">@/lib/icons</code> serão atualizadas automaticamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
