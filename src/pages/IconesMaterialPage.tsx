import React from "react";

// Ícones Material Design (Google) — variantes: padrão (filled), outlined, rounded, sharp, two-tone
import {
  People,
  Person,
  PersonAdd,
  LocationOn,
  LocationCity,
  Map,
  Public,
  Email,
  Chat,
  ChatBubble,
  Forum,
  Send,
  Share,
  BarChart,
  PieChart,
  ShowChart,
  TrendingUp,
  Search,
  Edit,
  Visibility,
  VisibilityOff,
  Download,
  Upload,
  Save,
  FilterList,
  Menu,
  Settings,
  Notifications,
  Warning,
  Error,
  Shield,
  Flag,
  Star,
  StarBorder,
  CalendarToday,
  AccessTime,
  Description,
  Folder,
  FolderOpen,
  Image,
  Phone,
  Videocam,
  CameraAlt,
  CardGiftcard,
  Favorite,
  FavoriteBorder,
  Lock,
  LockOpen,
  Link,
  LinkOff,
  Share as ShareIcon,
  ContentCopy,
  Label,
  Adjust,
  Check,
  CheckCircle,
  CheckBox,
  Close,
  Cancel,
  Clear,
  Delete,
  DeleteForever,
  Add,
  Remove,
  AddCircle,
  RemoveCircle,
  ExpandMore,
  ExpandLess,
  ChevronLeft,
  ChevronRight,
  ArrowBack,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
  Home,
  Business,
  Apartment,
  AccountBalance,
  Gavel,
  HowToVote,
  Policy,
  VerifiedUser,
  Assignment,
  AssignmentInd,
  ContactMail,
  ContactPhone,
  Group,
  Groups,
  Diversity3,
  Handshake,
  ThumbUp,
  ThumbUpAlt,
  EmojiEvents,
  WorkspacePremium,
  MilitaryTech,
  EmojiObjects,
  Lightbulb,
  WbSunny,
  Cloud,
  CloudQueue,
  Storage,
  Dns,
  Wifi,
  Headphones,
  PlayArrow,
  Pause,
  Stop,
  FastForward,
  Brush,
  ColorLens,
  Create,
  Science,
  Biotech,
  RocketLaunch,
  SatelliteAlt,
  TrackChanges,
  LocalShipping,
  DirectionsCar,
  Train,
  Flight,
  Badge,
  Bookmark,
  BookmarkBorder,
  Info,
  Help,
  HelpOutlined as HelpOutlineIcon,
  Support,
  Feedback,
  ThumbDown,
  ThumbDownAlt,
  Celebration,
  Newspaper,
  Article,
  Feed,
  Announcement,
  Campaign,
  RecordVoiceOver,
} from "@mui/icons-material";

interface IconItem {
  nome: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  categoria: string;
}

const ICONES: IconItem[] = [
  { nome: "Person", Icon: Person, categoria: "Pessoas" },
  { nome: "People", Icon: People, categoria: "Pessoas" },
  { nome: "PersonAdd", Icon: PersonAdd, categoria: "Pessoas" },
  { nome: "Group", Icon: Group, categoria: "Pessoas" },
  { nome: "Groups", Icon: Groups, categoria: "Pessoas" },
  { nome: "Diversity3", Icon: Diversity3, categoria: "Pessoas" },
  { nome: "LocationOn", Icon: LocationOn, categoria: "Território" },
  { nome: "LocationCity", Icon: LocationCity, categoria: "Território" },
  { nome: "Map", Icon: Map, categoria: "Território" },
  { nome: "Public", Icon: Public, categoria: "Território" },
  { nome: "Email", Icon: Email, categoria: "Comunicação" },
  { nome: "Chat", Icon: Chat, categoria: "Comunicação" },
  { nome: "ChatBubble", Icon: ChatBubble, categoria: "Comunicação" },
  { nome: "Forum", Icon: Forum, categoria: "Comunicação" },
  { nome: "Send", Icon: Send, categoria: "Comunicação" },
  { nome: "Share", Icon: ShareIcon, categoria: "Comunicação" },
  { nome: "BarChart", Icon: BarChart, categoria: "Dados" },
  { nome: "PieChart", Icon: PieChart, categoria: "Dados" },
  { nome: "ShowChart", Icon: ShowChart, categoria: "Dados" },
  { nome: "TrendingUp", Icon: TrendingUp, categoria: "Dados" },
  { nome: "Search", Icon: Search, categoria: "Ações" },
  { nome: "Edit", Icon: Edit, categoria: "Ações" },
  { nome: "Create", Icon: Create, categoria: "Ações" },
  { nome: "Visibility", Icon: Visibility, categoria: "Ações" },
  { nome: "VisibilityOff", Icon: VisibilityOff, categoria: "Ações" },
  { nome: "Download", Icon: Download, categoria: "Ações" },
  { nome: "Upload", Icon: Upload, categoria: "Ações" },
  { nome: "Save", Icon: Save, categoria: "Ações" },
  { nome: "FilterList", Icon: FilterList, categoria: "Ações" },
  { nome: "Add", Icon: Add, categoria: "Ações" },
  { nome: "AddCircle", Icon: AddCircle, categoria: "Ações" },
  { nome: "Remove", Icon: Remove, categoria: "Ações" },
  { nome: "RemoveCircle", Icon: RemoveCircle, categoria: "Ações" },
  { nome: "Delete", Icon: Delete, categoria: "Ações" },
  { nome: "DeleteForever", Icon: DeleteForever, categoria: "Ações" },
  { nome: "Check", Icon: Check, categoria: "Status" },
  { nome: "CheckCircle", Icon: CheckCircle, categoria: "Status" },
  { nome: "CheckBox", Icon: CheckBox, categoria: "Status" },
  { nome: "Close", Icon: Close, categoria: "Status" },
  { nome: "Cancel", Icon: Cancel, categoria: "Status" },
  { nome: "Clear", Icon: Clear, categoria: "Status" },
  { nome: "Error", Icon: Error, categoria: "Status" },
  { nome: "Warning", Icon: Warning, categoria: "Status" },
  { nome: "Info", Icon: Info, categoria: "Status" },
  { nome: "Help", Icon: Help, categoria: "Status" },
  { nome: "Shield", Icon: Shield, categoria: "Institucional" },
  { nome: "VerifiedUser", Icon: VerifiedUser, categoria: "Institucional" },
  { nome: "Policy", Icon: Policy, categoria: "Institucional" },
  { nome: "AccountBalance", Icon: AccountBalance, categoria: "Institucional" },
  { nome: "Business", Icon: Business, categoria: "Institucional" },
  { nome: "Apartment", Icon: Apartment, categoria: "Institucional" },
  { nome: "Flag", Icon: Flag, categoria: "Institucional" },
  { nome: "Star", Icon: Star, categoria: "Liderança" },
  { nome: "StarBorder", Icon: StarBorder, categoria: "Liderança" },
  { nome: "Favorite", Icon: Favorite, categoria: "Liderança" },
  { nome: "FavoriteBorder", Icon: FavoriteBorder, categoria: "Liderança" },
  { nome: "ThumbUp", Icon: ThumbUp, categoria: "Liderança" },
  { nome: "ThumbUpAlt", Icon: ThumbUpAlt, categoria: "Liderança" },
  { nome: "Handshake", Icon: Handshake, categoria: "Liderança" },
  { nome: "EmojiEvents", Icon: EmojiEvents, categoria: "Liderança" },
  { nome: "WorkspacePremium", Icon: WorkspacePremium, categoria: "Liderança" },
  { nome: "MilitaryTech", Icon: MilitaryTech, categoria: "Liderança" },
  { nome: "Gavel", Icon: Gavel, categoria: "Política" },
  { nome: "HowToVote", Icon: HowToVote, categoria: "Política" },
  { nome: "Assignment", Icon: Assignment, categoria: "Política" },
  { nome: "AssignmentInd", Icon: AssignmentInd, categoria: "Política" },
  { nome: "Campaign", Icon: Campaign, categoria: "Política" },
  { nome: "Announcement", Icon: Announcement, categoria: "Política" },
  { nome: "RecordVoiceOver", Icon: RecordVoiceOver, categoria: "Política" },
  { nome: "Newspaper", Icon: Newspaper, categoria: "Política" },
  { nome: "Article", Icon: Article, categoria: "Política" },
  { nome: "Feed", Icon: Feed, categoria: "Política" },
  { nome: "CalendarToday", Icon: CalendarToday, categoria: "Gestão" },
  { nome: "AccessTime", Icon: AccessTime, categoria: "Gestão" },
  { nome: "Description", Icon: Description, categoria: "Gestão" },
  { nome: "Folder", Icon: Folder, categoria: "Gestão" },
  { nome: "FolderOpen", Icon: FolderOpen, categoria: "Gestão" },
  { nome: "Image", Icon: Image, categoria: "Geral" },
  { nome: "Phone", Icon: Phone, categoria: "Geral" },
  { nome: "Videocam", Icon: Videocam, categoria: "Geral" },
  { nome: "CameraAlt", Icon: CameraAlt, categoria: "Geral" },
  { nome: "CardGiftcard", Icon: CardGiftcard, categoria: "Geral" },
  { nome: "Lock", Icon: Lock, categoria: "Geral" },
  { nome: "LockOpen", Icon: LockOpen, categoria: "Geral" },
  { nome: "Link", Icon: Link, categoria: "Geral" },
  { nome: "LinkOff", Icon: LinkOff, categoria: "Geral" },
  { nome: "ContentCopy", Icon: ContentCopy, categoria: "Geral" },
  { nome: "Label", Icon: Label, categoria: "Geral" },
  { nome: "Adjust", Icon: Adjust, categoria: "Geral" },
  { nome: "Bookmark", Icon: Bookmark, categoria: "Geral" },
  { nome: "BookmarkBorder", Icon: BookmarkBorder, categoria: "Geral" },
  { nome: "Badge", Icon: Badge, categoria: "Geral" },
  { nome: "Home", Icon: Home, categoria: "Navegação" },
  { nome: "Settings", Icon: Settings, categoria: "Navegação" },
  { nome: "Menu", Icon: Menu, categoria: "Navegação" },
  { nome: "Notifications", Icon: Notifications, categoria: "Navegação" },
  { nome: "ExpandMore", Icon: ExpandMore, categoria: "Navegação" },
  { nome: "ExpandLess", Icon: ExpandLess, categoria: "Navegação" },
  { nome: "ChevronLeft", Icon: ChevronLeft, categoria: "Navegação" },
  { nome: "ChevronRight", Icon: ChevronRight, categoria: "Navegação" },
  { nome: "ArrowBack", Icon: ArrowBack, categoria: "Navegação" },
  { nome: "ArrowForward", Icon: ArrowForward, categoria: "Navegação" },
  { nome: "ArrowUpward", Icon: ArrowUpward, categoria: "Navegação" },
  { nome: "ArrowDownward", Icon: ArrowDownward, categoria: "Navegação" },
  { nome: "Cloud", Icon: Cloud, categoria: "Geral" },
  { nome: "CloudQueue", Icon: CloudQueue, categoria: "Geral" },
  { nome: "Storage", Icon: Storage, categoria: "Geral" },
  { nome: "Dns", Icon: Dns, categoria: "Geral" },
  { nome: "Wifi", Icon: Wifi, categoria: "Geral" },
  { nome: "Headphones", Icon: Headphones, categoria: "Geral" },
  { nome: "PlayArrow", Icon: PlayArrow, categoria: "Geral" },
  { nome: "Pause", Icon: Pause, categoria: "Geral" },
  { nome: "Stop", Icon: Stop, categoria: "Geral" },
  { nome: "FastForward", Icon: FastForward, categoria: "Geral" },
  { nome: "EmojiObjects", Icon: EmojiObjects, categoria: "Geral" },
  { nome: "Lightbulb", Icon: Lightbulb, categoria: "Geral" },
  { nome: "WbSunny", Icon: WbSunny, categoria: "Geral" },
  { nome: "Brush", Icon: Brush, categoria: "Geral" },
  { nome: "ColorLens", Icon: ColorLens, categoria: "Geral" },
  { nome: "Science", Icon: Science, categoria: "Geral" },
  { nome: "Biotech", Icon: Biotech, categoria: "Geral" },
  { nome: "RocketLaunch", Icon: RocketLaunch, categoria: "Geral" },
  { nome: "SatelliteAlt", Icon: SatelliteAlt, categoria: "Geral" },
  { nome: "TrackChanges", Icon: TrackChanges, categoria: "Geral" },
  { nome: "LocalShipping", Icon: LocalShipping, categoria: "Geral" },
  { nome: "DirectionsCar", Icon: DirectionsCar, categoria: "Geral" },
  { nome: "Train", Icon: Train, categoria: "Geral" },
  { nome: "Flight", Icon: Flight, categoria: "Geral" },
  { nome: "ThumbDown", Icon: ThumbDown, categoria: "Geral" },
  { nome: "ThumbDownAlt", Icon: ThumbDownAlt, categoria: "Geral" },
  { nome: "Celebration", Icon: Celebration, categoria: "Geral" },
  { nome: "Support", Icon: Support, categoria: "Geral" },
  { nome: "Feedback", Icon: Feedback, categoria: "Geral" },
  { nome: "HelpOutline", Icon: HelpOutlineIcon, categoria: "Geral" },
  { nome: "ContactMail", Icon: ContactMail, categoria: "Geral" },
  { nome: "ContactPhone", Icon: ContactPhone, categoria: "Geral" },
];

export default function IconesMaterialPage() {
  const categorias = Array.from(new Set(ICONES.map(i => i.categoria)));

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Ícones Mandato Digital — Material Design (Google)
        </h1>
        <p className="text-slate-500 mb-8">
          Estilo preenchido (filled). Ícones do Android/Google, reconhecíveis e amigáveis.
        </p>

        {/* Categoria especial: Política */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4 text-purple-700">Política (ícones específicos)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-8">
          {[
            { nome: "Gavel", Icon: Gavel },
            { nome: "HowToVote", Icon: HowToVote },
            { nome: "Campaign", Icon: Campaign },
            { nome: "Announcement", Icon: Announcement },
            { nome: "RecordVoiceOver", Icon: RecordVoiceOver },
            { nome: "Newspaper", Icon: Newspaper },
            { nome: "Article", Icon: Article },
            { nome: "Feed", Icon: Feed },
            { nome: "Assignment", Icon: Assignment },
            { nome: "AssignmentInd", Icon: AssignmentInd },
          ].map(({ nome, Icon }) => (
            <div
              key={nome}
              className="bg-white rounded-lg border border-purple-200 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
            >
              <Icon className="text-purple-600" style={{ fontSize: 24 }} />
              <span className="text-[10px] text-slate-400 text-center truncate w-full">{nome}</span>
            </div>
          ))}
        </div>

        {categorias.filter(c => c !== "Política").map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{cat}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {ICONES.filter(i => i.categoria === cat).map(({ nome, Icon }) => (
                <div
                  key={nome}
                  className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                >
                  <Icon className="text-blue-600" style={{ fontSize: 24 }} />
                  <span className="text-[10px] text-slate-400 text-center truncate w-full">{nome}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Exemplo em contexto */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4 mt-12">Exemplo: Menu de Navegação</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-4 max-w-xs mb-8">
          <nav className="space-y-1">
            {[
              { Icon: Home, label: "Dashboard", ativo: true },
              { Icon: People, label: "Eleitores", ativo: false },
              { Icon: Star, label: "Líderes", ativo: false },
              { Icon: LocationOn, label: "Mapa", ativo: false },
              { Icon: Chat, label: "Mensagens", ativo: false },
              { Icon: BarChart, label: "Relatórios", ativo: false },
            ].map(({ Icon, label, ativo }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  ativo ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={ativo ? "text-blue-600" : "text-slate-400"} style={{ fontSize: 20 }} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Como usar */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Como Usar</h2>
        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-300 overflow-x-auto mb-8">
          <pre>{`import { People, BarChart, LocationOn } from "@mui/icons-material";

<People className="text-blue-600" style={{ fontSize: 24 }} />
<BarChart className="text-green-600" style={{ fontSize: 32 }} />
<LocationOn className="text-red-600" style={{ fontSize: 20 }} />

// Ícones de política
import { Gavel, HowToVote, Campaign } from "@mui/icons-material";

<Gavel className="text-purple-600" style={{ fontSize: 24 }} />
<HowToVote className="text-amber-600" style={{ fontSize: 24 }} />`}</pre>
        </div>
      </div>
    </div>
  );
}
