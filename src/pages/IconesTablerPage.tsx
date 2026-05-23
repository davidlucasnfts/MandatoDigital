import { useState } from 'react';
import {
  IconUsers, IconMapPin, IconMail, IconChartBar, IconCalendar,
  IconFolder, IconShield, IconCheck, IconArrowRight, IconStar,
  IconPhone, IconMessage, IconLock, IconHeadphones,
  IconBell, IconFileText, IconTag, IconTrendingUp,
  IconClock, IconAward, IconHeartHandshake, IconSearch,
  IconSettings, IconPlus, IconPencil, IconTrash, IconEye,
  IconDownload, IconUpload, IconMenu, IconX, IconChevronDown,
  IconChevronLeft, IconChevronRight, IconLogout, IconUser,
  IconHome, IconBuilding, IconBriefcase, IconFlag, IconLocation,
  IconWorld, IconDeviceDesktop, IconCode, IconDatabase,
  IconServer, IconCloud, IconWifi, IconBluetooth, IconPrinter,
  IconCamera, IconVideo, IconMusic, IconPlayerPlay, IconPlayerPause,
  IconPlayerStop, IconVolume, IconMicrophone, IconSun, IconMoon,
  IconTemperature, IconDroplet, IconWind, IconCloudRain,
  IconSnowflake, IconBolt, IconFlame, IconLeaf, IconTree,
  IconFlower, IconMountain, IconCar,
  IconBus, IconTrain, IconPlane, IconShip,
  IconWalk, IconRun, IconSwimming,
  IconTrophy, IconMedal, IconCrown, IconDiamond, IconGift,
  IconShoppingCart, IconShoppingBag, IconCreditCard, IconWallet,
  IconCoin, IconReceipt, IconInvoice,
  IconBuildingBank, IconBuildingStore, IconBuildingFactory,
  IconSchool, IconBook, IconBookmark,
  IconNotes, IconNotebook, IconClipboard, IconClipboardCheck,
  IconClipboardList, IconClipboardText, IconClipboardCopy,
  IconClipboardData, IconClipboardHeart, IconClipboardTypography,
  IconClipboardX, IconCopy, IconCut, IconClearAll,
  IconSelectAll, IconTextWrap, IconTextDirectionLtr,
  IconTextDirectionRtl, IconTextSize, IconTextRecognition,
  IconTextSpellcheck, IconTextColor, IconTextDecrease, IconTextIncrease,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified,
  IconLineHeight, IconLetterSpacing, IconLetterCase,
  IconLetterCaseLower, IconLetterCaseUpper, IconLetterCaseToggle,
  IconTypography, IconBold, IconItalic, IconUnderline,
  IconStrikethrough, IconHighlight, IconOverline, IconSubscript,
  IconSuperscript, IconLink, IconExternalLink, IconUnlink,
  IconAnchor, IconQuote, IconBlockquote, IconCodeDots,
  IconBraces, IconBrackets, IconParentheses
} from '@tabler/icons-react';

const iconesPorCategoria = [
  {
    categoria: 'Navegação',
    icones: [
      { nome: 'IconHome', Icon: IconHome },
      { nome: 'IconUser', Icon: IconUser },
      { nome: 'IconUsers', Icon: IconUsers },
      { nome: 'IconSettings', Icon: IconSettings },
      { nome: 'IconMenu', Icon: IconMenu },
      { nome: 'IconX', Icon: IconX },
      { nome: 'IconChevronDown', Icon: IconChevronDown },
      { nome: 'IconChevronLeft', Icon: IconChevronLeft },
      { nome: 'IconChevronRight', Icon: IconChevronRight },
      { nome: 'IconLogout', Icon: IconLogout },
    ]
  },
  {
    categoria: 'Ações',
    icones: [
      { nome: 'IconPlus', Icon: IconPlus },
      { nome: 'IconPencil', Icon: IconPencil },
      { nome: 'IconTrash', Icon: IconTrash },
      { nome: 'IconEye', Icon: IconEye },
      { nome: 'IconDownload', Icon: IconDownload },
      { nome: 'IconUpload', Icon: IconUpload },
      { nome: 'IconSearch', Icon: IconSearch },
      { nome: 'IconCheck', Icon: IconCheck },
      { nome: 'IconArrowRight', Icon: IconArrowRight },
    ]
  },
  {
    categoria: 'Comunicação',
    icones: [
      { nome: 'IconMail', Icon: IconMail },
      { nome: 'IconPhone', Icon: IconPhone },
      { nome: 'IconMessage', Icon: IconMessage },
      { nome: 'IconBell', Icon: IconBell },
      { nome: 'IconHeadphones', Icon: IconHeadphones },
    ]
  },
  {
    categoria: 'Negócio',
    icones: [
      { nome: 'IconChartBar', Icon: IconChartBar },
      { nome: 'IconTrendingUp', Icon: IconTrendingUp },
      { nome: 'IconFileText', Icon: IconFileText },
      { nome: 'IconCalendar', Icon: IconCalendar },
      { nome: 'IconFolder', Icon: IconFolder },
      { nome: 'IconTag', Icon: IconTag },
      { nome: 'IconClock', Icon: IconClock },
      { nome: 'IconAward', Icon: IconAward },
    ]
  },
  {
    categoria: 'Mapa / Localização',
    icones: [
      { nome: 'IconMapPin', Icon: IconMapPin },
      { nome: 'IconLocation', Icon: IconLocation },
      { nome: 'IconWorld', Icon: IconWorld },
      { nome: 'IconFlag', Icon: IconFlag },
    ]
  },
  {
    categoria: 'Segurança',
    icones: [
      { nome: 'IconShield', Icon: IconShield },
      { nome: 'IconLock', Icon: IconLock },
      { nome: 'IconBolt', Icon: IconBolt },
    ]
  },
];

export default function IconesTablerPage() {
  const [strokeWidth, setStrokeWidth] = useState(1.5);
  const [size, setSize] = useState(24);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Tabler Icons</h1>
        <p className="text-slate-500 mb-8">5.900+ ícones open source — estilo minimalista, stroke fino</p>

        {/* Controles */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8 flex gap-8 items-center">
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-2">Stroke Width</label>
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
            <label className="text-sm font-medium text-slate-600 block mb-2">Tamanho</label>
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
        </div>

        {/* Ícones por categoria */}
        {iconesPorCategoria.map((cat) => (
          <div key={cat.categoria} className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">{cat.categoria}</h2>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
              {cat.icones.map(({ nome, Icon }) => (
                <div
                  key={nome}
                  className="bg-white rounded-lg p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                >
                  <Icon
                    size={size}
                    stroke={strokeWidth}
                    className="text-slate-700"
                  />
                  <span className="text-[10px] text-slate-400 text-center leading-tight">
                    {nome.replace('Icon', '')}
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
            <li>• 5.900+ ícones open source</li>
            <li>• Licença MIT (gratuito para uso comercial)</li>
            <li>• Grid 24×24, stroke 2px (customizável)</li>
            <li>• Pacote: <code className="bg-blue-100 px-1 rounded">@tabler/icons-react</code></li>
            <li>• Site: <a href="https://tabler-icons.io" className="underline" target="_blank" rel="noopener">tabler-icons.io</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
