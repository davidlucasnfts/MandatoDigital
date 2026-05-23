import { useState } from 'react';
import {
  // === NAVEGAÇÃO E INTERFACE ===
  IconHome, IconDashboard, IconLayoutDashboard, IconChartPie,
  IconMenu2, IconX, IconChevronDown, IconChevronRight,
  IconArrowLeft, IconArrowRight, IconArrowUpRight,
  IconSearch, IconFilter, IconAdjustmentsHorizontal,
  IconSettings, IconTool, IconLogout, IconLogin,
  IconUser, IconUsers, IconUserPlus, IconUserCheck,
  IconId, IconFingerprint, IconAccessPoint,

  // === AÇÕES CRUD ===
  IconPlus, IconEdit, IconTrash, IconEye,
  IconCopy, IconCheck, IconChecks,
  IconDownload, IconUpload, IconFileExport, IconFileImport,
  IconRefresh, IconRotateClockwise, IconHistory,
  IconArchive, IconArchiveOff, IconRestore,

  // === COMUNICAÇÃO ===
  IconMail, IconMailOpened, IconMailForward,
  IconMessage, IconMessageCircle, IconMessageDots,
  IconPhone, IconPhoneCall, IconVideo,
  IconBell, IconBellRinging, IconBellOff,
  IconShare, IconShare2, IconSend,
  IconBrandWhatsapp, IconBrandTelegram,

  // === NEGÓCIOS / CRM ===
  IconChartBar, IconChartLine, IconChartArea,
  IconTrendingUp, IconTrendingDown,
  IconReport, IconReportAnalytics, IconReportSearch,
  IconFileText, IconFileDescription, IconFileAnalytics,
  IconClipboardText, IconClipboardCheck, IconClipboardList,
  IconNotes, IconNotebook, IconBook,
  IconCalendar, IconCalendarEvent, IconCalendarStats,
  IconClock, IconClockHour4, IconHourglass,
  IconTag, IconTags, IconBookmark,
  IconFlag, IconFlag2, IconFlag3,

  // === PESSOAS / ELEITORES ===
  IconUsersGroup, IconUserCircle, IconUserStar,
  IconUserHeart, IconUserExclamation,
  IconFriends, IconHeartHandshake,
  IconMan, IconWoman, IconBabyCarriage,
  IconSchool, IconBuildingBank, IconBuilding,
  IconBuildingCommunity, IconBuildingStore,

  // === MAPA / TERRITÓRIO ===
  IconMap, IconMapPin, IconMapSearch,
  IconLocation, IconCurrentLocation,
  IconWorld, IconWorldLatitude, IconWorldLongitude,
  IconNavigation, IconCompass, IconGps,
  IconRoute, IconRouteAltLeft,

  // === SEGURANÇA / ACESSO ===
  IconShield, IconShieldCheck, IconShieldLock,
  IconLock, IconLockAccess, IconLockOpen,
  IconKey, IconPassword,
  IconEyeOff, IconEyeCheck,
  IconMoodCheck, IconMoodSmile,

  // === DOCUMENTOS / LEGAL ===
  IconFile, IconFiles, IconFolder,
  IconFolderOpen, IconFolders,
  IconFileCertificate, IconFileCheck,
  IconFileInvoice, IconFileTypePdf,
  IconContract, IconSignature,
  IconScale, IconGavel,
  IconCertificate, IconAward,

  // === FINANÇAS ===
  IconCoin, IconCoins, IconCurrencyDollar,
  IconCreditCard, IconWallet,
  IconReceipt, IconReceiptTax,
  IconCash, IconCashBanknote,
  IconTrendingUp2, IconTrendingDown2,
  IconChartPie2, IconChartDonut,

  // === TI / SISTEMAS ===
  IconDeviceDesktop, IconDeviceMobile,
  IconPrinter, IconScan,
  IconDatabase, IconServer,
  IconCloud, IconCloudUpload, IconCloudDownload,
  IconWifi, IconNetwork,
  IconCode, IconCodeDots, IconTerminal2,
  IconBug, IconApi,

  // === CONFIG / UTILS ===
  IconTrashX, IconCircleX, IconSquareX,
  IconAlertCircle, IconAlertTriangle, IconInfoCircle,
  IconHelpCircle, IconQuestionMark,
  IconCircleCheck, IconSquareCheck,
  IconStar, IconStarFilled, IconRosette,
  IconBulb, IconLamp,
  IconZoomIn, IconZoomOut,
  IconMaximize, IconMinimize,

} from '@tabler/icons-react';

const iconesPorCategoria = [
  {
    categoria: 'Dashboard & Navegação',
    icones: [
      { nome: 'Home', Icon: IconHome },
      { nome: 'Dashboard', Icon: IconDashboard },
      { nome: 'Layout', Icon: IconLayoutDashboard },
      { nome: 'Gráfico', Icon: IconChartPie },
      { nome: 'Menu', Icon: IconMenu2 },
      { nome: 'Fechar', Icon: IconX },
      { nome: 'Expandir', Icon: IconChevronDown },
      { nome: 'Avançar', Icon: IconChevronRight },
      { nome: 'Voltar', Icon: IconArrowLeft },
      { nome: 'Ir', Icon: IconArrowRight },
      { nome: 'Externo', Icon: IconArrowUpRight },
      { nome: 'Buscar', Icon: IconSearch },
      { nome: 'Filtrar', Icon: IconFilter },
      { nome: 'Ajustes', Icon: IconAdjustmentsHorizontal },
      { nome: 'Config', Icon: IconSettings },
      { nome: 'Ferramenta', Icon: IconTool },
    ]
  },
  {
    categoria: 'Usuários & Pessoas',
    icones: [
      { nome: 'Usuário', Icon: IconUser },
      { nome: 'Grupo', Icon: IconUsers },
      { nome: 'Adicionar', Icon: IconUserPlus },
      { nome: 'Verificado', Icon: IconUserCheck },
      { nome: 'ID', Icon: IconId },
      { nome: 'Digital', Icon: IconFingerprint },
      { nome: 'Acesso', Icon: IconAccessPoint },
      { nome: 'Equipe', Icon: IconUsersGroup },
      { nome: 'Perfil', Icon: IconUserCircle },
      { nome: 'Destaque', Icon: IconUserStar },
      { nome: 'Favorito', Icon: IconUserHeart },
      { nome: 'Alerta', Icon: IconUserExclamation },
      { nome: 'Amigos', Icon: IconFriends },
      { nome: 'Parceria', Icon: IconHeartHandshake },
      { nome: 'Homem', Icon: IconMan },
      { nome: 'Mulher', Icon: IconWoman },
    ]
  },
  {
    categoria: 'Ações (CRUD)',
    icones: [
      { nome: 'Novo', Icon: IconPlus },
      { nome: 'Editar', Icon: IconEdit },
      { nome: 'Excluir', Icon: IconTrash },
      { nome: 'Ver', Icon: IconEye },
      { nome: 'Copiar', Icon: IconCopy },
      { nome: 'Ok', Icon: IconCheck },
      { nome: 'Concluído', Icon: IconChecks },
      { nome: 'Download', Icon: IconDownload },
      { nome: 'Upload', Icon: IconUpload },
      { nome: 'Exportar', Icon: IconFileExport },
      { nome: 'Importar', Icon: IconFileImport },
      { nome: 'Atualizar', Icon: IconRefresh },
      { nome: 'Restaurar', Icon: IconRotateClockwise },
      { nome: 'Histórico', Icon: IconHistory },
      { nome: 'Arquivar', Icon: IconArchive },
      { nome: 'Desarquivar', Icon: IconArchiveOff },
    ]
  },
  {
    categoria: 'Comunicação',
    icones: [
      { nome: 'Email', Icon: IconMail },
      { nome: 'Aberto', Icon: IconMailOpened },
      { nome: 'Encaminhar', Icon: IconMailForward },
      { nome: 'Mensagem', Icon: IconMessage },
      { nome: 'Chat', Icon: IconMessageCircle },
      { nome: 'Conversa', Icon: IconMessageDots },
      { nome: 'Telefone', Icon: IconPhone },
      { nome: 'Ligação', Icon: IconPhoneCall },
      { nome: 'Vídeo', Icon: IconVideo },
      { nome: 'Notificação', Icon: IconBell },
      { nome: 'Alerta', Icon: IconBellRinging },
      { nome: 'Silenciar', Icon: IconBellOff },
      { nome: 'Compartilhar', Icon: IconShare },
      { nome: 'Enviar', Icon: IconSend },
      { nome: 'WhatsApp', Icon: IconBrandWhatsapp },
      { nome: 'Telegram', Icon: IconBrandTelegram },
    ]
  },
  {
    categoria: 'Negócios & Analytics',
    icones: [
      { nome: 'Barras', Icon: IconChartBar },
      { nome: 'Linha', Icon: IconChartLine },
      { nome: 'Área', Icon: IconChartArea },
      { nome: 'Subir', Icon: IconTrendingUp },
      { nome: 'Descer', Icon: IconTrendingDown },
      { nome: 'Relatório', Icon: IconReport },
      { nome: 'Análise', Icon: IconReportAnalytics },
      { nome: 'Pesquisa', Icon: IconReportSearch },
      { nome: 'Texto', Icon: IconFileText },
      { nome: 'Descrição', Icon: IconFileDescription },
      { nome: 'Métricas', Icon: IconFileAnalytics },
      { nome: 'Notas', Icon: IconNotes },
      { nome: 'Caderno', Icon: IconNotebook },
      { nome: 'Livro', Icon: IconBook },
      { nome: 'Calendário', Icon: IconCalendar },
      { nome: 'Evento', Icon: IconCalendarEvent },
    ]
  },
  {
    categoria: 'Território & Mapa',
    icones: [
      { nome: 'Mapa', Icon: IconMap },
      { nome: 'Pin', Icon: IconMapPin },
      { nome: 'Busca', Icon: IconMapSearch },
      { nome: 'Local', Icon: IconLocation },
      { nome: 'GPS', Icon: IconCurrentLocation },
      { nome: 'Mundo', Icon: IconWorld },
      { nome: 'Latitude', Icon: IconWorldLatitude },
      { nome: 'Longitude', Icon: IconWorldLongitude },
      { nome: 'Navegar', Icon: IconNavigation },
      { nome: 'Bússola', Icon: IconCompass },
      { nome: 'Sinal', Icon: IconGps },
      { nome: 'Rota', Icon: IconRoute },
      { nome: 'Alternativa', Icon: IconRouteAltLeft },
    ]
  },
  {
    categoria: 'Segurança & Acesso',
    icones: [
      { nome: 'Escudo', Icon: IconShield },
      { nome: 'Verificado', Icon: IconShieldCheck },
      { nome: 'Bloqueado', Icon: IconShieldLock },
      { nome: 'Cadeado', Icon: IconLock },
      { nome: 'Acesso', Icon: IconLockAccess },
      { nome: 'Aberto', Icon: IconLockOpen },
      { nome: 'Chave', Icon: IconKey },
      { nome: 'Senha', Icon: IconPassword },
      { nome: 'Ocultar', Icon: IconEyeOff },
      { nome: 'Visto', Icon: IconEyeCheck },
      { nome: 'Aprovado', Icon: IconMoodCheck },
      { nome: 'Satisfeito', Icon: IconMoodSmile },
    ]
  },
  {
    categoria: 'Documentos & Legal',
    icones: [
      { nome: 'Arquivo', Icon: IconFile },
      { nome: 'Arquivos', Icon: IconFiles },
      { nome: 'Pasta', Icon: IconFolder },
      { nome: 'Aberta', Icon: IconFolderOpen },
      { nome: 'Pastas', Icon: IconFolders },
      { nome: 'Certificado', Icon: IconFileCertificate },
      { nome: 'Conferido', Icon: IconFileCheck },
      { nome: 'Fatura', Icon: IconFileInvoice },
      { nome: 'PDF', Icon: IconFileTypePdf },
      { nome: 'Contrato', Icon: IconContract },
      { nome: 'Assinatura', Icon: IconSignature },
      { nome: 'Balança', Icon: IconScale },
      { nome: 'Martelo', Icon: IconGavel },
      { nome: 'Diploma', Icon: IconCertificate },
      { nome: 'Prêmio', Icon: IconAward },
    ]
  },
  {
    categoria: 'Finanças',
    icones: [
      { nome: 'Moeda', Icon: IconCoin },
      { nome: 'Moedas', Icon: IconCoins },
      { nome: 'Dólar', Icon: IconCurrencyDollar },
      { nome: 'Cartão', Icon: IconCreditCard },
      { nome: 'Carteira', Icon: IconWallet },
      { nome: 'Recibo', Icon: IconReceipt },
      { nome: 'Imposto', Icon: IconReceiptTax },
      { nome: 'Dinheiro', Icon: IconCash },
      { nome: 'Nota', Icon: IconCashBanknote },
      { nome: 'Crescimento', Icon: IconTrendingUp2 },
      { nome: 'Queda', Icon: IconTrendingDown2 },
      { nome: 'Pizza', Icon: IconChartPie2 },
      { nome: 'Rosca', Icon: IconChartDonut },
    ]
  },
  {
    categoria: 'TI & Infraestrutura',
    icones: [
      { nome: 'Desktop', Icon: IconDeviceDesktop },
      { nome: 'Mobile', Icon: IconDeviceMobile },
      { nome: 'Impressora', Icon: IconPrinter },
      { nome: 'Scanner', Icon: IconScan },
      { nome: 'Banco', Icon: IconDatabase },
      { nome: 'Servidor', Icon: IconServer },
      { nome: 'Nuvem', Icon: IconCloud },
      { nome: 'Up', Icon: IconCloudUpload },
      { nome: 'Down', Icon: IconCloudDownload },
      { nome: 'WiFi', Icon: IconWifi },
      { nome: 'Rede', Icon: IconNetwork },
      { nome: 'Código', Icon: IconCode },
      { nome: 'Snippet', Icon: IconCodeDots },
      { nome: 'Terminal', Icon: IconTerminal2 },
      { nome: 'Bug', Icon: IconBug },
      { nome: 'API', Icon: IconApi },
    ]
  },
  {
    categoria: 'Status & Feedback',
    icones: [
      { nome: 'Remover', Icon: IconTrashX },
      { nome: 'Cancelar', Icon: IconCircleX },
      { nome: 'Fechar', Icon: IconSquareX },
      { nome: 'Aviso', Icon: IconAlertCircle },
      { nome: 'Perigo', Icon: IconAlertTriangle },
      { nome: 'Info', Icon: IconInfoCircle },
      { nome: 'Ajuda', Icon: IconHelpCircle },
      { nome: 'Dúvida', Icon: IconQuestionMark },
      { nome: 'Sucesso', Icon: IconCircleCheck },
      { nome: 'Concluído', Icon: IconSquareCheck },
      { nome: 'Estrela', Icon: IconStar },
      { nome: 'Favorito', Icon: IconStarFilled },
      { nome: 'Selo', Icon: IconRosette },
      { nome: 'Ideia', Icon: IconBulb },
      { nome: 'Luz', Icon: IconLamp },
      { nome: 'Mais', Icon: IconZoomIn },
    ]
  },
];

export default function IconesTablerPage() {
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [size, setSize] = useState(24);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Tabler Icons — Versão Profissional</h1>
          <p className="text-slate-500">
            5.900+ ícones open source — selecionados para aplicações corporativas e governamentais
          </p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8 flex flex-wrap gap-8 items-center">
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-2">Espessura do traço</label>
            <div className="flex gap-2">
              {[1, 1.5, 2].map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
            <label className="text-sm font-medium text-slate-600 block mb-2">Tamanho</label>
            <div className="flex gap-2">
              {[20, 24, 32].map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="ml-auto text-sm text-slate-400">
            {iconesPorCategoria.reduce((acc, cat) => acc + cat.icones.length, 0)} ícones exibidos
          </div>
        </div>

        {/* Ícones por categoria */}
        {iconesPorCategoria.map((cat) => (
          <div key={cat.categoria} className="mb-10">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {cat.categoria}
              <span className="text-sm font-normal text-slate-400">({cat.icones.length})</span>
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
              {cat.icones.map(({ nome, Icon }) => (
                <div
                  key={nome}
                  className="bg-white rounded-lg p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow border border-slate-100"
                  title={nome}
                >
                  <Icon
                    size={size}
                    stroke={strokeWidth}
                    className="text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400 text-center leading-tight truncate w-full">
                    {nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="font-semibold text-blue-800 mb-2">Sobre o Tabler Icons</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 5.900+ ícones open source — estilo minimalista, stroke fino</li>
            <li>• Licença MIT (gratuito para uso comercial)</li>
            <li>• Grid 24×24, stroke 2px (customizável via props)</li>
            <li>• Pacote: <code className="bg-blue-100 px-1 rounded">@tabler/icons-react</code></li>
            <li>• Site: <a href="https://tabler-icons.io" className="underline" target="_blank" rel="noopener">tabler-icons.io</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
