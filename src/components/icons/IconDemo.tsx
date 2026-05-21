import React from "react";
import {
  Users, MapPin, Crown, ChartBar, Chat, ClipboardText,
  SquaresFour, Shield, Calendar, FileText, GearSix, Bell,
  TrendUp, CheckCircle, MagnifyingGlass, Plus, Trash, Pencil,
  Eye, Download, Upload, Envelope, PaperPlaneRight, SignOut,
  Star, Medal, Lightning, HandHeart, Gavel, Stack, FunnelSimple,
  List, SpinnerGap, SealCheck, Confetti, ArrowSquareOut,
  DeviceMobile, ShareNetwork, MapPinArea, NavigationArrow,
  FloppyDisk, Path, CaretDown, CaretLeft, CaretRight, CaretUp,
  Warning, X, XCircle, Lock, Heart, Phone, Building, Tag,
  Target, Thermometer, Image, FolderOpen, Gift, Headphones,
  Check, Clock, Copy, File, ArrowLeft, ArrowRight, ArrowUpRight,
  At, User, UserPlus, Video, EyeSlash, LinkSimple,
} from "@phosphor-icons/react";

type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

interface IconItem {
  nome: string;
  Icon: React.ComponentType<{ weight?: IconWeight; size?: number; className?: string }>;
  categoria: string;
}

const ICONES: IconItem[] = [
  { nome: "Users", Icon: Users, categoria: "Pessoas" },
  { nome: "User", Icon: User, categoria: "Pessoas" },
  { nome: "UserPlus", Icon: UserPlus, categoria: "Pessoas" },
  { nome: "Crown", Icon: Crown, categoria: "Liderança" },
  { nome: "Medal", Icon: Medal, categoria: "Liderança" },
  { nome: "Star", Icon: Star, categoria: "Liderança" },
  { nome: "HandHeart", Icon: HandHeart, categoria: "Comunidade" },
  { nome: "Heart", Icon: Heart, categoria: "Comunidade" },
  { nome: "MapPin", Icon: MapPin, categoria: "Território" },
  { nome: "MapPinArea", Icon: MapPinArea, categoria: "Território" },
  { nome: "NavigationArrow", Icon: NavigationArrow, categoria: "Território" },
  { nome: "Building", Icon: Building, categoria: "Institucional" },
  { nome: "Gavel", Icon: Gavel, categoria: "Institucional" },
  { nome: "Shield", Icon: Shield, categoria: "Institucional" },
  { nome: "ChartBar", Icon: ChartBar, categoria: "Dados" },
  { nome: "TrendUp", Icon: TrendUp, categoria: "Dados" },
  { nome: "Chat", Icon: Chat, categoria: "Comunicação" },
  { nome: "Envelope", Icon: Envelope, categoria: "Comunicação" },
  { nome: "PaperPlaneRight", Icon: PaperPlaneRight, categoria: "Comunicação" },
  { nome: "DeviceMobile", Icon: DeviceMobile, categoria: "Comunicação" },
  { nome: "Calendar", Icon: Calendar, categoria: "Gestão" },
  { nome: "ClipboardText", Icon: ClipboardText, categoria: "Gestão" },
  { nome: "FileText", Icon: FileText, categoria: "Gestão" },
  { nome: "FolderOpen", Icon: FolderOpen, categoria: "Gestão" },
  { nome: "CheckCircle", Icon: CheckCircle, categoria: "Status" },
  { nome: "SealCheck", Icon: SealCheck, categoria: "Status" },
  { nome: "Warning", Icon: Warning, categoria: "Status" },
  { nome: "XCircle", Icon: XCircle, categoria: "Status" },
  { nome: "Clock", Icon: Clock, categoria: "Status" },
  { nome: "SquaresFour", Icon: SquaresFour, categoria: "Navegação" },
  { nome: "GearSix", Icon: GearSix, categoria: "Navegação" },
  { nome: "Bell", Icon: Bell, categoria: "Navegação" },
  { nome: "SignOut", Icon: SignOut, categoria: "Navegação" },
  { nome: "MagnifyingGlass", Icon: MagnifyingGlass, categoria: "Ações" },
  { nome: "Plus", Icon: Plus, categoria: "Ações" },
  { nome: "Pencil", Icon: Pencil, categoria: "Ações" },
  { nome: "Trash", Icon: Trash, categoria: "Ações" },
  { nome: "Eye", Icon: Eye, categoria: "Ações" },
  { nome: "EyeSlash", Icon: EyeSlash, categoria: "Ações" },
  { nome: "Download", Icon: Download, categoria: "Ações" },
  { nome: "Upload", Icon: Upload, categoria: "Ações" },
  { nome: "FloppyDisk", Icon: FloppyDisk, categoria: "Ações" },
  { nome: "ArrowLeft", Icon: ArrowLeft, categoria: "Ações" },
  { nome: "ArrowRight", Icon: ArrowRight, categoria: "Ações" },
  { nome: "ArrowSquareOut", Icon: ArrowSquareOut, categoria: "Ações" },
  { nome: "LinkSimple", Icon: LinkSimple, categoria: "Ações" },
  { nome: "ShareNetwork", Icon: ShareNetwork, categoria: "Ações" },
  { nome: "Lock", Icon: Lock, categoria: "Ações" },
  { nome: "Copy", Icon: Copy, categoria: "Ações" },
  { nome: "FunnelSimple", Icon: FunnelSimple, categoria: "Ações" },
  { nome: "List", Icon: List, categoria: "Ações" },
  { nome: "CaretDown", Icon: CaretDown, categoria: "Ações" },
  { nome: "Tag", Icon: Tag, categoria: "Geral" },
  { nome: "Target", Icon: Target, categoria: "Geral" },
  { nome: "Gift", Icon: Gift, categoria: "Geral" },
  { nome: "Headphones", Icon: Headphones, categoria: "Geral" },
  { nome: "Phone", Icon: Phone, categoria: "Geral" },
  { nome: "Video", Icon: Video, categoria: "Geral" },
  { nome: "Image", Icon: Image, categoria: "Geral" },
  { nome: "Lightning", Icon: Lightning, categoria: "Geral" },
  { nome: "Confetti", Icon: Confetti, categoria: "Geral" },
  { nome: "SpinnerGap", Icon: SpinnerGap, categoria: "Geral" },
  { nome: "At", Icon: At, categoria: "Geral" },
  { nome: "Path", Icon: Path, categoria: "Geral" },
  { nome: "Stack", Icon: Stack, categoria: "Geral" },
  { nome: "Check", Icon: Check, categoria: "Geral" },
  { nome: "File", Icon: File, categoria: "Geral" },
  { nome: "X", Icon: X, categoria: "Geral" },
  { nome: "Thermometer", Icon: Thermometer, categoria: "Geral" },
];

const PESOS: { label: string; weight: IconWeight }[] = [
  { label: "Thin", weight: "thin" },
  { label: "Light", weight: "light" },
  { label: "Regular", weight: "regular" },
  { label: "Bold", weight: "bold" },
  { label: "Fill", weight: "fill" },
  { label: "Duotone", weight: "duotone" },
];

export const IconDemo: React.FC = () => {
  const [pesoAtivo, setPesoAtivo] = React.useState<IconWeight>(
    () => (localStorage.getItem("icon-weight-preference") as IconWeight) || "bold"
  );

  const salvarPeso = (peso: IconWeight) => {
    setPesoAtivo(peso);
    localStorage.setItem("icon-weight-preference", peso);
  };

  const categorias = Array.from(new Set(ICONES.map(i => i.categoria)));

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Ícones Mandato Digital — Phosphor Icons
        </h1>
        <p className="text-slate-500 mb-8">
          Biblioteca profissional com 6 pesos visuais. Padrão: <strong>Fill</strong> (efeito 3D)
        </p>

        {/* Seletor de peso */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Peso do Ícone</h2>
          <div className="flex flex-wrap gap-2">
            {PESOS.map(({ label, weight }) => (
              <button
                key={weight}
                onClick={() => salvarPeso(weight)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pesoAtivo === weight
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Ícones por categoria */}
        {categorias.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{cat}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {ICONES.filter(i => i.categoria === cat).map(({ nome, Icon }) => (
                <div
                  key={nome}
                  className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                >
                  <Icon weight={pesoAtivo} size={28} className="text-blue-600" />
                  <span className="text-[10px] text-slate-400 text-center truncate w-full">{nome}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Demonstração de escala */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4 mt-12">Escala de Tamanhos</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-end gap-6 flex-wrap">
            {[16, 20, 24, 32, 40, 48, 64].map(size => (
              <div key={size} className="flex flex-col items-center gap-2">
                <Crown weight="fill" size={size} className="text-blue-600" />
                <span className="text-xs text-slate-400">{size}px</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demonstração de cores */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Paleta de Cores</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex flex-wrap gap-6">
            {[
              { cor: "text-blue-600", nome: "Primária" },
              { cor: "text-green-600", nome: "Sucesso" },
              { cor: "text-red-600", nome: "Perigo" },
              { cor: "text-amber-600", nome: "Aviso" },
              { cor: "text-purple-600", nome: "Líder" },
              { cor: "text-slate-600", nome: "Neutro" },
              { cor: "text-cyan-600", nome: "Info" },
            ].map(({ cor, nome }) => (
              <div key={nome} className="flex flex-col items-center gap-2">
                <Shield weight="fill" size={28} className={cor} />
                <span className="text-xs text-slate-400">{nome}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exemplo em contexto (Menu) */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Exemplo: Menu de Navegação</h2>
        <div className="bg-white rounded-lg border border-slate-200 p-4 max-w-xs mb-8">
          <nav className="space-y-1">
            {[
              { Icon: SquaresFour, label: "Dashboard", ativo: true },
              { Icon: Users, label: "Eleitores", ativo: false },
              { Icon: Crown, label: "Líderes", ativo: false },
              { Icon: MapPin, label: "Mapa", ativo: false },
              { Icon: Chat, label: "Mensagens", ativo: false },
              { Icon: ChartBar, label: "Relatórios", ativo: false },
            ].map(({ Icon, label, ativo }) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon weight={ativo ? "fill" : "regular"} size={20} className={ativo ? "text-blue-600" : "text-slate-400"} />
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Código de uso */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Como Usar</h2>
        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-300 overflow-x-auto">
          <pre>{`import { Users, Crown, MapPin } from "@/lib/icons";

// Uso básico (herda weight="fill" do IconContext)
<Users size={24} className="text-blue-600" />

// Sobrescrever peso individualmente
<Crown weight="duotone" size={32} className="text-purple-600" />

// Pesos disponíveis: thin | light | regular | bold | fill | duotone`}</pre>
        </div>
      </div>
    </div>
  );
};
