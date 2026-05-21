import React from "react";

// Ícones Carbon (IBM) — importados dinamicamente para não sobrecarregar o bundle
import {
  User,
  UserMultiple,
  Location,
  Email,
  Chat,
  ChartBar,
  ChartPie,
  ChartLine,
  Search,
  Edit,
  View,
  ViewOff,
  Download,
  Upload,
  Save,
  Filter,
  Menu,
  Settings,
  Notification,
  Warning,
  WarningAlt,
  Security,
  Flag,
  Star,
  Calendar,
  Time,
  Document,
  Folder,
  Image,
  Phone,
  Video,
  Camera,
  Gift,
  Favorite,
  FavoriteFilled,
  Locked,
  Link,
  Share,
  Send,
  Copy,
  Tag,

  Checkmark,
  CheckmarkFilled,
  CheckmarkOutline,
  Close,
  CloseOutline,
  Error,
  ErrorOutline,
  Delete,
  TrashCan,
  Add,
  Subtract,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Home,
  Building,
  Map,
  Earth,
  Cloud,
  DataBase,

  Wifi,
  Headphones,
  Play,
  PlayFilled,
  Pause,
  PauseFilled,
  Stop,
  StopFilled,
  ThumbsUp,
  Idea,
  Light,
  LightFilled,
  Temperature,

  ColorPalette,
  Pen,

  Microscope,
  Rocket,
  Satellite,
  Radar,
  Certificate,

  DocumentAdd,
  DocumentBlank,
  DocumentDownload,
  DocumentExport,
  DocumentImport,
  DocumentPdf,
  DocumentWordProcessor,
  FolderAdd,
  FolderShared,
  FolderDetails,
  Report,
  ChartColumn,
  ChartBubble,
  ChartScatter,
  ChartTreemap,
  ChartVennDiagram,
  ChartWaterfall,
  ChartWinLoss,
  ChartRadial,
  ChartCombo,
  ChartClusterBar,
  ChartStacked,
  ChartMarimekko,
  ChartPopulation,
} from "@carbon/icons-react";

interface IconItem {
  nome: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  categoria: string;
}

const ICONES: IconItem[] = [
  { nome: "User", Icon: User, categoria: "Pessoas" },
  { nome: "UserMultiple", Icon: UserMultiple, categoria: "Pessoas" },
  { nome: "Location", Icon: Location, categoria: "Território" },
  { nome: "Map", Icon: Map, categoria: "Território" },
  { nome: "Earth", Icon: Earth, categoria: "Território" },
  { nome: "Email", Icon: Email, categoria: "Comunicação" },
  { nome: "Chat", Icon: Chat, categoria: "Comunicação" },
  { nome: "Send", Icon: Send, categoria: "Comunicação" },
  { nome: "Share", Icon: Share, categoria: "Comunicação" },
  { nome: "ChartBar", Icon: ChartBar, categoria: "Dados" },
  { nome: "ChartPie", Icon: ChartPie, categoria: "Dados" },
  { nome: "ChartLine", Icon: ChartLine, categoria: "Dados" },
  { nome: "ChartColumn", Icon: ChartColumn, categoria: "Dados" },
  { nome: "Report", Icon: Report, categoria: "Dados" },
  { nome: "Search", Icon: Search, categoria: "Ações" },
  { nome: "Edit", Icon: Edit, categoria: "Ações" },
  { nome: "View", Icon: View, categoria: "Ações" },
  { nome: "ViewOff", Icon: ViewOff, categoria: "Ações" },
  { nome: "Download", Icon: Download, categoria: "Ações" },
  { nome: "Upload", Icon: Upload, categoria: "Ações" },
  { nome: "Save", Icon: Save, categoria: "Ações" },
  { nome: "Filter", Icon: Filter, categoria: "Ações" },
  { nome: "Add", Icon: Add, categoria: "Ações" },
  { nome: "Delete", Icon: Delete, categoria: "Ações" },
  { nome: "TrashCan", Icon: TrashCan, categoria: "Ações" },
  { nome: "Checkmark", Icon: Checkmark, categoria: "Status" },
  { nome: "CheckmarkFilled", Icon: CheckmarkFilled, categoria: "Status" },
  { nome: "CheckmarkOutline", Icon: CheckmarkOutline, categoria: "Status" },
  { nome: "Close", Icon: Close, categoria: "Status" },
  { nome: "CloseOutline", Icon: CloseOutline, categoria: "Status" },
  { nome: "Error", Icon: Error, categoria: "Status" },
  { nome: "Warning", Icon: Warning, categoria: "Status" },
  { nome: "WarningAlt", Icon: WarningAlt, categoria: "Status" },
  { nome: "Security", Icon: Security, categoria: "Institucional" },
  { nome: "Flag", Icon: Flag, categoria: "Institucional" },
  { nome: "Star", Icon: Star, categoria: "Liderança" },
  { nome: "Favorite", Icon: Favorite, categoria: "Liderança" },
  { nome: "FavoriteFilled", Icon: FavoriteFilled, categoria: "Liderança" },
  { nome: "ThumbsUp", Icon: ThumbsUp, categoria: "Liderança" },
  { nome: "Certificate", Icon: Certificate, categoria: "Liderança" },
  { nome: "Calendar", Icon: Calendar, categoria: "Gestão" },
  { nome: "Time", Icon: Time, categoria: "Gestão" },
  { nome: "Document", Icon: Document, categoria: "Gestão" },
  { nome: "DocumentAdd", Icon: DocumentAdd, categoria: "Gestão" },
  { nome: "DocumentBlank", Icon: DocumentBlank, categoria: "Gestão" },
  { nome: "DocumentPdf", Icon: DocumentPdf, categoria: "Gestão" },
  { nome: "Folder", Icon: Folder, categoria: "Gestão" },
  { nome: "FolderAdd", Icon: FolderAdd, categoria: "Gestão" },
  { nome: "FolderShared", Icon: FolderShared, categoria: "Gestão" },
  { nome: "Image", Icon: Image, categoria: "Geral" },
  { nome: "Phone", Icon: Phone, categoria: "Geral" },
  { nome: "Video", Icon: Video, categoria: "Geral" },
  { nome: "Camera", Icon: Camera, categoria: "Geral" },
  { nome: "Gift", Icon: Gift, categoria: "Geral" },
  { nome: "Locked", Icon: Locked, categoria: "Geral" },
  { nome: "Link", Icon: Link, categoria: "Geral" },
  { nome: "Copy", Icon: Copy, categoria: "Geral" },
  { nome: "Tag", Icon: Tag, categoria: "Geral" },

  { nome: "Home", Icon: Home, categoria: "Navegação" },
  { nome: "Building", Icon: Building, categoria: "Navegação" },
  { nome: "Settings", Icon: Settings, categoria: "Navegação" },
  { nome: "Menu", Icon: Menu, categoria: "Navegação" },
  { nome: "Notification", Icon: Notification, categoria: "Navegação" },
  { nome: "ChevronDown", Icon: ChevronDown, categoria: "Navegação" },
  { nome: "ChevronLeft", Icon: ChevronLeft, categoria: "Navegação" },
  { nome: "ChevronRight", Icon: ChevronRight, categoria: "Navegação" },
  { nome: "ChevronUp", Icon: ChevronUp, categoria: "Navegação" },
  { nome: "ArrowLeft", Icon: ArrowLeft, categoria: "Navegação" },
  { nome: "ArrowRight", Icon: ArrowRight, categoria: "Navegação" },
  { nome: "ArrowUp", Icon: ArrowUp, categoria: "Navegação" },
  { nome: "ArrowDown", Icon: ArrowDown, categoria: "Navegação" },
  { nome: "Subtract", Icon: Subtract, categoria: "Navegação" },
  { nome: "Cloud", Icon: Cloud, categoria: "Geral" },
  { nome: "DataBase", Icon: DataBase, categoria: "Geral" },
  { nome: "Wifi", Icon: Wifi, categoria: "Geral" },
  { nome: "Headphones", Icon: Headphones, categoria: "Geral" },
  { nome: "Play", Icon: Play, categoria: "Geral" },
  { nome: "Pause", Icon: Pause, categoria: "Geral" },
  { nome: "Stop", Icon: Stop, categoria: "Geral" },
  { nome: "Idea", Icon: Idea, categoria: "Geral" },
  { nome: "Light", Icon: Light, categoria: "Geral" },
  { nome: "LightFilled", Icon: LightFilled, categoria: "Geral" },
  { nome: "Temperature", Icon: Temperature, categoria: "Geral" },
  { nome: "ColorPalette", Icon: ColorPalette, categoria: "Geral" },
  { nome: "Pen", Icon: Pen, categoria: "Geral" },
  { nome: "Microscope", Icon: Microscope, categoria: "Geral" },
  { nome: "Rocket", Icon: Rocket, categoria: "Geral" },
  { nome: "Satellite", Icon: Satellite, categoria: "Geral" },
  { nome: "Radar", Icon: Radar, categoria: "Geral" },
];

export default function IconesCarbonPage() {
  const categorias = Array.from(new Set(ICONES.map(i => i.categoria)));

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Ícones Mandato Digital — Carbon Icons (IBM)
        </h1>
        <p className="text-slate-500 mb-8">
          Estilo corporativo/institucional. Ícones de 32px, linha técnica, cantos quadrados.
        </p>

        {categorias.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{cat}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {ICONES.filter(i => i.categoria === cat).map(({ nome, Icon }) => (
                <div
                  key={nome}
                  className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                >
                  <Icon size={24} className="text-blue-600" />
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
              { Icon: UserMultiple, label: "Eleitores", ativo: false },
              { Icon: Star, label: "Líderes", ativo: false },
              { Icon: Location, label: "Mapa", ativo: false },
              { Icon: Chat, label: "Mensagens", ativo: false },
              { Icon: ChartBar, label: "Relatórios", ativo: false },
            ].map(({ Icon, label, ativo }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  ativo ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} className={ativo ? "text-blue-600" : "text-slate-400"} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Como usar */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Como Usar</h2>
        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-300 overflow-x-auto mb-8">
          <pre>{`import { User, ChartBar, Location } from "@carbon/icons-react";

<User size={24} className="text-blue-600" />
<ChartBar size={32} className="text-green-600" />
<Location size={20} className="text-red-600" />`}</pre>
        </div>
      </div>
    </div>
  );
}
