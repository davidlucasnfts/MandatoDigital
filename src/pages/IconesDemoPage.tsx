import React from "react";
import {
  PeopleRegular, PeopleFilled,
  PersonRegular, PersonFilled,
  LocationRegular, LocationFilled,
  MailRegular, MailFilled,
  ChatRegular, ChatFilled,
  ChartMultipleRegular, ChartMultipleFilled,
  SearchRegular, SearchFilled,
  EditRegular, EditFilled,
  EyeRegular, EyeFilled,
  ArrowDownloadRegular, ArrowDownloadFilled,
  ArrowUploadRegular, ArrowUploadFilled,
  SaveRegular, SaveFilled,
  FilterRegular, FilterFilled,
  NavigationRegular, NavigationFilled,
  SettingsRegular, SettingsFilled,
  AlertRegular, AlertFilled,
  ShieldRegular, ShieldFilled,
  FlagRegular, FlagFilled,
  StarRegular, StarFilled,
  CalendarRegular, CalendarFilled,
  DocumentRegular, DocumentFilled,
  FolderRegular, FolderFilled,
  ImageRegular, ImageFilled,
  PhoneRegular, PhoneFilled,
  VideoRegular, VideoFilled,
  CameraRegular, CameraFilled,
  GiftRegular, GiftFilled,
  HeartRegular, HeartFilled,
  LockClosedRegular, LockClosedFilled,
  LinkRegular, LinkFilled,
  ShareRegular, ShareFilled,
  SendRegular, SendFilled,
  ClockRegular, ClockFilled,
  CopyRegular, CopyFilled,
  TagRegular, TagFilled,
  TargetRegular, TargetFilled,
  CheckmarkRegular, CheckmarkFilled,
  DismissRegular, DismissFilled,
  DeleteRegular, DeleteFilled,
  AddRegular, AddFilled,
  ChevronDownRegular, ChevronDownFilled,
  ChevronLeftRegular, ChevronLeftFilled,
  ChevronRightRegular, ChevronRightFilled,
  ChevronUpRegular, ChevronUpFilled,
  HomeRegular, HomeFilled,
  BuildingRegular, BuildingFilled,
  MapRegular, MapFilled,
  GlobeRegular, GlobeFilled,
  PinRegular, PinFilled,

  LayerRegular, LayerFilled,
  StackRegular, StackFilled,
  CheckRegular, CheckFilled,

  MoreHorizontalRegular, MoreHorizontalFilled,
  MoreVerticalRegular, MoreVerticalFilled,
  ArrowLeftRegular, ArrowLeftFilled,
  ArrowRightRegular, ArrowRightFilled,
  ArrowUpRegular, ArrowUpFilled,
  ThumbLikeRegular, ThumbLikeFilled,
  ThumbDislikeRegular, ThumbDislikeFilled,
  EmojiRegular, EmojiFilled,
  LightbulbRegular, LightbulbFilled,
  FlashRegular, FlashFilled,
  FireRegular, FireFilled,
  WeatherSunnyRegular, WeatherSunnyFilled,
  CloudRegular, CloudFilled,

  ColorRegular, ColorFilled,
  PaintBrushRegular, PaintBrushFilled,
  PenRegular, PenFilled,
  DesignIdeasRegular, DesignIdeasFilled,
  MicroscopeRegular, MicroscopeFilled,

  DatabaseRegular, DatabaseFilled,
  ServerRegular, ServerFilled,
  CloudSyncRegular, CloudSyncFilled,

  BluetoothRegular, BluetoothFilled,
  UsbStickRegular, UsbStickFilled,
  HeadphonesRegular, HeadphonesFilled,
  PlayRegular, PlayFilled,
  PauseRegular, PauseFilled,
  StopRegular, StopFilled,
  FastForwardRegular, FastForwardFilled,
  SubtractRegular, SubtractFilled,
} from "@fluentui/react-icons";

// Govicons — ícones temáticos de governo/política (fonte CSS)
const GOVICONS_CSS = `
@import url('https://unpkg.com/govicons@latest/css/govicons.min.css');
`;

interface FluentIconPair {
  nome: string;
  Regular: React.ComponentType<{ className?: string }>;
  Filled: React.ComponentType<{ className?: string }>;
  categoria: string;
}

const FLUENT_ICONES: FluentIconPair[] = [
  { nome: "People", Regular: PeopleRegular, Filled: PeopleFilled, categoria: "Pessoas" },
  { nome: "Person", Regular: PersonRegular, Filled: PersonFilled, categoria: "Pessoas" },
  { nome: "Location", Regular: LocationRegular, Filled: LocationFilled, categoria: "Território" },
  { nome: "Map", Regular: MapRegular, Filled: MapFilled, categoria: "Território" },
  { nome: "Globe", Regular: GlobeRegular, Filled: GlobeFilled, categoria: "Território" },
  { nome: "Pin", Regular: PinRegular, Filled: PinFilled, categoria: "Território" },

  { nome: "Mail", Regular: MailRegular, Filled: MailFilled, categoria: "Comunicação" },
  { nome: "Chat", Regular: ChatRegular, Filled: ChatFilled, categoria: "Comunicação" },
  { nome: "Send", Regular: SendRegular, Filled: SendFilled, categoria: "Comunicação" },
  { nome: "Share", Regular: ShareRegular, Filled: ShareFilled, categoria: "Comunicação" },
  { nome: "ChartMultiple", Regular: ChartMultipleRegular, Filled: ChartMultipleFilled, categoria: "Dados" },
  { nome: "Search", Regular: SearchRegular, Filled: SearchFilled, categoria: "Ações" },
  { nome: "Edit", Regular: EditRegular, Filled: EditFilled, categoria: "Ações" },
  { nome: "Eye", Regular: EyeRegular, Filled: EyeFilled, categoria: "Ações" },
  { nome: "ArrowDownload", Regular: ArrowDownloadRegular, Filled: ArrowDownloadFilled, categoria: "Ações" },
  { nome: "ArrowUpload", Regular: ArrowUploadRegular, Filled: ArrowUploadFilled, categoria: "Ações" },
  { nome: "Save", Regular: SaveRegular, Filled: SaveFilled, categoria: "Ações" },
  { nome: "Filter", Regular: FilterRegular, Filled: FilterFilled, categoria: "Ações" },
  { nome: "Add", Regular: AddRegular, Filled: AddFilled, categoria: "Ações" },
  { nome: "Delete", Regular: DeleteRegular, Filled: DeleteFilled, categoria: "Ações" },
  { nome: "Checkmark", Regular: CheckmarkRegular, Filled: CheckmarkFilled, categoria: "Status" },
  { nome: "Dismiss", Regular: DismissRegular, Filled: DismissFilled, categoria: "Status" },
  { nome: "Alert", Regular: AlertRegular, Filled: AlertFilled, categoria: "Status" },
  { nome: "Shield", Regular: ShieldRegular, Filled: ShieldFilled, categoria: "Institucional" },
  { nome: "Flag", Regular: FlagRegular, Filled: FlagFilled, categoria: "Institucional" },
  { nome: "Star", Regular: StarRegular, Filled: StarFilled, categoria: "Liderança" },
  { nome: "ThumbLike", Regular: ThumbLikeRegular, Filled: ThumbLikeFilled, categoria: "Liderança" },
  { nome: "Calendar", Regular: CalendarRegular, Filled: CalendarFilled, categoria: "Gestão" },
  { nome: "Clock", Regular: ClockRegular, Filled: ClockFilled, categoria: "Gestão" },
  { nome: "Document", Regular: DocumentRegular, Filled: DocumentFilled, categoria: "Gestão" },
  { nome: "Folder", Regular: FolderRegular, Filled: FolderFilled, categoria: "Gestão" },
  { nome: "Image", Regular: ImageRegular, Filled: ImageFilled, categoria: "Geral" },
  { nome: "Phone", Regular: PhoneRegular, Filled: PhoneFilled, categoria: "Geral" },
  { nome: "Video", Regular: VideoRegular, Filled: VideoFilled, categoria: "Geral" },
  { nome: "Camera", Regular: CameraRegular, Filled: CameraFilled, categoria: "Geral" },
  { nome: "Gift", Regular: GiftRegular, Filled: GiftFilled, categoria: "Geral" },
  { nome: "Heart", Regular: HeartRegular, Filled: HeartFilled, categoria: "Geral" },
  { nome: "LockClosed", Regular: LockClosedRegular, Filled: LockClosedFilled, categoria: "Geral" },
  { nome: "Link", Regular: LinkRegular, Filled: LinkFilled, categoria: "Geral" },
  { nome: "Copy", Regular: CopyRegular, Filled: CopyFilled, categoria: "Geral" },
  { nome: "Tag", Regular: TagRegular, Filled: TagFilled, categoria: "Geral" },
  { nome: "Target", Regular: TargetRegular, Filled: TargetFilled, categoria: "Geral" },
  { nome: "Home", Regular: HomeRegular, Filled: HomeFilled, categoria: "Navegação" },
  { nome: "Building", Regular: BuildingRegular, Filled: BuildingFilled, categoria: "Navegação" },
  { nome: "Settings", Regular: SettingsRegular, Filled: SettingsFilled, categoria: "Navegação" },
  { nome: "Navigation", Regular: NavigationRegular, Filled: NavigationFilled, categoria: "Navegação" },
  { nome: "ChevronDown", Regular: ChevronDownRegular, Filled: ChevronDownFilled, categoria: "Navegação" },
  { nome: "ChevronLeft", Regular: ChevronLeftRegular, Filled: ChevronLeftFilled, categoria: "Navegação" },
  { nome: "ChevronRight", Regular: ChevronRightRegular, Filled: ChevronRightFilled, categoria: "Navegação" },
  { nome: "ChevronUp", Regular: ChevronUpRegular, Filled: ChevronUpFilled, categoria: "Navegação" },
  { nome: "ArrowLeft", Regular: ArrowLeftRegular, Filled: ArrowLeftFilled, categoria: "Navegação" },
  { nome: "ArrowRight", Regular: ArrowRightRegular, Filled: ArrowRightFilled, categoria: "Navegação" },
  { nome: "MoreHorizontal", Regular: MoreHorizontalRegular, Filled: MoreHorizontalFilled, categoria: "Navegação" },
  { nome: "MoreVertical", Regular: MoreVerticalRegular, Filled: MoreVerticalFilled, categoria: "Navegação" },
  { nome: "Layer", Regular: LayerRegular, Filled: LayerFilled, categoria: "Geral" },
  { nome: "Stack", Regular: StackRegular, Filled: StackFilled, categoria: "Geral" },
];

// Govicons disponíveis (fonte CSS — usa classes)
const GOVICONS = [
  { classe: "gi-vote", nome: "Vote", categoria: "Política" },
  { classe: "gi-gavel", nome: "Gavel", categoria: "Política" },
  { classe: "gi-handshake", nome: "Handshake", categoria: "Política" },
  { classe: "gi-user-politician", nome: "Politician", categoria: "Política" },
  { classe: "gi-capitol", nome: "Capitol", categoria: "Política" },
  { classe: "gi-white-house", nome: "White House", categoria: "Política" },
  { classe: "gi-balance", nome: "Balance", categoria: "Política" },
  { classe: "gi-medal-star", nome: "Medal Star", categoria: "Política" },
  { classe: "gi-ribbon", nome: "Ribbon", categoria: "Política" },
  { classe: "gi-us-flag-wavy", nome: "Flag", categoria: "Política" },
  { classe: "gi-us-map", nome: "Map", categoria: "Política" },
  { classe: "gi-world", nome: "World", categoria: "Política" },
  { classe: "gi-shield", nome: "Shield", categoria: "Política" },
  { classe: "gi-id-card", nome: "ID Card", categoria: "Política" },
  { classe: "gi-fingerprint", nome: "Fingerprint", categoria: "Política" },
  { classe: "gi-money", nome: "Money", categoria: "Política" },
  { classe: "gi-usd", nome: "USD", categoria: "Política" },
  { classe: "gi-pie-chart", nome: "Pie Chart", categoria: "Política" },
  { classe: "gi-bar-chart", nome: "Bar Chart", categoria: "Política" },
  { classe: "gi-line-chart", nome: "Line Chart", categoria: "Política" },
  { classe: "gi-database", nome: "Database", categoria: "Política" },
  { classe: "gi-cloud", nome: "Cloud", categoria: "Política" },
  { classe: "gi-search", nome: "Search", categoria: "Política" },
  { classe: "gi-comment", nome: "Comment", categoria: "Política" },
  { classe: "gi-comments", nome: "Comments", categoria: "Política" },
  { classe: "gi-check", nome: "Check", categoria: "Política" },
  { classe: "gi-check-square-o", nome: "Check Square", categoria: "Política" },
  { classe: "gi-warning", nome: "Warning", categoria: "Política" },
  { classe: "gi-medal-circle", nome: "Medal Circle", categoria: "Política" },
  { classe: "gi-key", nome: "Key", categoria: "Política" },
  { classe: "gi-folder", nome: "Folder", categoria: "Política" },
  { classe: "gi-table", nome: "Table", categoria: "Política" },
  { classe: "gi-unlock", nome: "Unlock", categoria: "Política" },
  { classe: "gi-lock", nome: "Lock", categoria: "Política" },
  { classe: "gi-cog", nome: "Cog", categoria: "Política" },
  { classe: "gi-cogs", nome: "Cogs", categoria: "Política" },
  { classe: "gi-star", nome: "Star", categoria: "Política" },
  { classe: "gi-user", nome: "User", categoria: "Política" },
  { classe: "gi-users", nome: "Users", categoria: "Política" },
  { classe: "gi-user-suit", nome: "User Suit", categoria: "Política" },
  { classe: "gi-user-graduate", nome: "User Graduate", categoria: "Política" },
  { classe: "gi-presenter", nome: "Presenter", categoria: "Política" },
  { classe: "gi-file", nome: "File", categoria: "Política" },
  { classe: "gi-file-text", nome: "File Text", categoria: "Política" },
  { classe: "gi-file-o", nome: "File O", categoria: "Política" },
  { classe: "gi-file-text-o", nome: "File Text O", categoria: "Política" },
  { classe: "gi-file-word-o", nome: "File Word", categoria: "Política" },
  { classe: "gi-file-excel-o", nome: "File Excel", categoria: "Política" },
  { classe: "gi-file-contract-o", nome: "File Contract", categoria: "Política" },
  { classe: "gi-building", nome: "Building", categoria: "Política" },
  { classe: "gi-statue-of-liberty", nome: "Statue Liberty", categoria: "Política" },
  { classe: "gi-liberty-bell", nome: "Liberty Bell", categoria: "Política" },
  { classe: "gi-washington-monument", nome: "Washington", categoria: "Política" },
  { classe: "gi-pentagon", nome: "Pentagon", categoria: "Política" },
];

type IconStyle = "regular" | "filled";

export default function IconesDemoPage() {
  const [style, setStyle] = React.useState<IconStyle>("filled");

  const categoriasFluent = Array.from(new Set(FLUENT_ICONES.map(i => i.categoria)));
  const categoriasGov = Array.from(new Set(GOVICONS.map(i => i.categoria)));

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Inject Govicons CSS */}
      <style>{GOVICONS_CSS}</style>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Ícones Mandato Digital — Fluent UI + Govicons
        </h1>
        <p className="text-slate-500 mb-6">
          Combinação: <strong>Fluent UI</strong> (Microsoft) para UI geral + <strong>Govicons</strong> para política/governo
        </p>

        {/* Seletor de estilo */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Estilo Fluent UI</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setStyle("regular")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                style === "regular" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Regular (linha)
            </button>
            <button
              onClick={() => setStyle("filled")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                style === "filled" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Filled (preenchido)
            </button>
          </div>
        </div>

        {/* Fluent UI Icons */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Fluent UI — Ícones de Sistema</h2>
        {categoriasFluent.map(cat => (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">{cat}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {FLUENT_ICONES.filter(i => i.categoria === cat).map(({ nome, Regular, Filled }) => {
                const Icon = style === "regular" ? Regular : Filled;
                return (
                  <div key={nome} className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                    <Icon className="text-blue-600 w-6 h-6" />
                    <span className="text-[10px] text-slate-400 text-center truncate w-full">{nome}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Govicons */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4 mt-12">Govicons — Ícones de Governo/Política</h2>
        {categoriasGov.map(cat => (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">{cat}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {GOVICONS.filter(i => i.categoria === cat).map(({ classe, nome }) => (
                <div key={classe} className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                  <i className={`gi ${classe} text-blue-600`} style={{ fontSize: 24 }}></i>
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
              { Icon: HomeFilled, label: "Dashboard", ativo: true },
              { Icon: PeopleFilled, label: "Eleitores", ativo: false },
              { Icon: StarFilled, label: "Líderes", ativo: false },
              { Icon: LocationFilled, label: "Mapa", ativo: false },
              { Icon: ChatFilled, label: "Mensagens", ativo: false },
              { Icon: ChartMultipleFilled, label: "Relatórios", ativo: false },
            ].map(({ Icon, label, ativo }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  ativo ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${ativo ? "text-blue-600" : "text-slate-400"}`} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Como usar */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Como Usar</h2>
        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-300 overflow-x-auto mb-8">
          <pre>{`// Fluent UI (ícones de sistema)
import { PeopleFilled, LocationRegular } from "@fluentui/react-icons";

<PeopleFilled className="text-blue-600" style={{ fontSize: 24 }} />
<LocationRegular className="text-slate-500" style={{ width: 20, height: 20 }} />

// Govicons (ícones de governo/política) — fonte CSS
// Importar CSS: @import 'govicons/css/govicons.min.css';

<i className="gi gi-vote text-blue-600" style={{ fontSize: 24 }}></i>
<i className="gi gi-gavel text-purple-600" style={{ fontSize: 24 }}></i>
<i className="gi gi-capitol text-green-600" style={{ fontSize: 24 }}></i>`}</pre>
        </div>
      </div>
    </div>
  );
}
