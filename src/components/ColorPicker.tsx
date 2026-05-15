import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

// Paleta de cores recomendadas para comunidades
const CORES_PRESET = [
  '#2563EB', '#DC2626', '#16A34A', '#CA8A04', '#9333EA',
  '#0891B2', '#EA580C', '#DB2777', '#4F46E5', '#059669',
  '#B91C1C', '#7C3AED', '#0EA5E9', '#F59E0B', '#84CC16',
  '#14B8A6', '#F97316', '#E11D48', '#6366F1', '#10B981',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label = 'Cor' }: ColorPickerProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-sm font-medium">{label}</label>

      {/* Botão que abre o picker */}
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-input bg-background text-sm hover:bg-slate-50 transition-colors"
      >
        <div
          className="w-8 h-8 rounded-lg border border-slate-200"
          style={{ backgroundColor: value || '#2563EB' }}
        />
        <span className="flex-1 text-left text-slate-700 font-mono text-xs uppercase">
          {value || '#2563EB'}
        </span>
      </button>

      {/* Dropdown */}
      {aberto && (
        <div className="border rounded-lg bg-white shadow-lg p-3 z-50">
          <div className="grid grid-cols-5 gap-2">
            {CORES_PRESET.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setAberto(false); }}
                className={`w-full aspect-square rounded-lg border-2 transition-all ${
                  c === value ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              >
                {c === value && <Check className="w-4 h-4 text-white mx-auto drop-shadow" />}
              </button>
            ))}
          </div>

          {/* Input customizado */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <input
              type="color"
              value={value || '#2563EB'}
              onChange={e => onChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
            />
            <span className="text-xs text-slate-400">Ou escolha uma cor personalizada</span>
          </div>
        </div>
      )}
    </div>
  );
}
