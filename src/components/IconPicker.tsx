import { useState, useMemo } from 'react';
import * as icons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Ícones mais relevantes para comunidades/organizações políticas
const ICONES_RECOMENDADOS = [
  'Users', 'User', 'UserCheck', 'UserPlus', 'UserCircle',
  'Building2', 'Building', 'Home', 'House',
  'MapPin', 'Map', 'Globe', 'Locate',
  'Heart', 'HeartHandshake', 'Handshake', 'HelpingHand',
  'Star', 'Award', 'Trophy', 'Medal',
  'Flag', 'FlagTriangleRight', 'Landmark',
  'Shield', 'ShieldCheck', 'ShieldAlert',
  'BookOpen', 'Book', 'Library',
  'Church', 'School', 'Hospital', 'Store',
  'TreePine', 'Flower2', 'Sun', 'Moon',
  'Music', 'Mic', 'Video', 'Camera',
  'Car', 'Bus', 'Train', 'Plane',
  'Briefcase', 'Wrench', 'Hammer', 'HardHat',
  'ShoppingCart', 'ShoppingBag', 'Gift',
  'Coffee', 'Utensils', 'Pizza',
  'Dumbbell', 'Bike', 'Activity',
  'Baby', 'Accessibility', 'Ear',
  'GraduationCap', 'PenTool', 'Palette',
  'Monitor', 'Smartphone', 'Wifi',
  'Droplets', 'Flame', 'Zap',
  'Anchor', 'Rocket', 'PlaneTakeoff',
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export default function IconPicker({ value, onChange, label = 'Ícone' }: IconPickerProps) {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);

  const iconesFiltrados = useMemo(() => {
    if (!busca) return ICONES_RECOMENDADOS;
    const q = busca.toLowerCase();
    return ICONES_RECOMENDADOS.filter(n => n.toLowerCase().includes(q));
  }, [busca]);

  // Componente do ícone selecionado
  const IconSelecionado = (icons as Record<string, React.ComponentType<{ className?: string }>>)[value] || icons.Users;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>

      {/* Botão que abre o picker */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <IconSelecionado className="w-4 h-4 text-blue-600" />
        </div>
        <span className="flex-1 text-left text-slate-700">{value}</span>
        <icons.ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown do picker */}
      {aberto && (
        <div className="border rounded-lg bg-white shadow-lg p-3 space-y-2 z-50">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar ícone..."
              className="pl-8 h-8 text-sm"
              autoFocus
            />
            {busca && (
              <button onClick={() => setBusca('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* Grid de ícones */}
          <div className="grid grid-cols-6 gap-1 max-h-[200px] overflow-y-auto">
            {iconesFiltrados.map(nome => {
              const Icon = (icons as Record<string, React.ComponentType<{ className?: string }>>)[nome];
              if (!Icon) return null;
              const selecionado = nome === value;
              return (
                <button
                  key={nome}
                  type="button"
                  onClick={() => { onChange(nome); setAberto(false); setBusca(''); }}
                  title={nome}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    selecionado
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selecionado ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className={`text-[9px] truncate w-full text-center ${selecionado ? 'text-blue-700 font-medium' : 'text-slate-400'}`}>
                    {nome}
                  </span>
                </button>
              );
            })}
          </div>

          {iconesFiltrados.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-2">Nenhum ícone encontrado</p>
          )}
        </div>
      )}
    </div>
  );
}
