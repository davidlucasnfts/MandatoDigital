import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Building, ChevronDown } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  cidade?: string;
  uf?: string;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
}

// Bairros serão carregados dinamicamente do banco (eleitores existentes) + dataset local
export default function AutocompleteBairro({ value, onChange, cidade, uf, placeholder = 'Digite o bairro', label, id, disabled }: Props) {
  const [aberto, setAberto] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlighted, setHighlighted] = useState(0);
  const [bairrosLocais, setBairrosLocais] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincroniza input com prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Carrega bairros do dataset local se disponível
  useEffect(() => {
    if (!cidade || !uf) {
      setBairrosLocais([]);
      return;
    }
    const key = `${cidade}/${uf}`;
    // Import dinâmico do dataset (lazy load)
    import('@/data/bairrosBrasil.json')
      .then(mod => {
        const data = mod.default as Record<string, string[]> || {};
        const lista = data[key] || [];
        setBairrosLocais(lista);
      })
      .catch(() => setBairrosLocais([]));
  }, [cidade, uf]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtrados = useMemo(() => {
    const q = inputValue.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!q) return [];
    return bairrosLocais
      .filter(b => {
        const norm = b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return norm.includes(q);
      })
      .slice(0, 8);
  }, [inputValue, bairrosLocais]);

  const selecionar = useCallback((bairro: string) => {
    setInputValue(bairro);
    onChange(bairro);
    setAberto(false);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!aberto && filtrados.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      setAberto(true);
      return;
    }
    if (!aberto) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted(prev => (prev + 1) % filtrados.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted(prev => (prev - 1 + filtrados.length) % filtrados.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtrados[highlighted]) {
          selecionar(filtrados[highlighted]);
        }
        break;
      case 'Escape':
        setAberto(false);
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length >= 2 && filtrados.length > 0) {
      setAberto(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setHighlighted(0);
    if (val.trim().length >= 2) {
      setAberto(true);
    } else {
      setAberto(false);
    }
  };

  const mostrarDropdown = aberto && filtrados.length > 0;
  const mostrarVazio = aberto && inputValue.trim().length >= 2 && filtrados.length === 0 && bairrosLocais.length > 0;
  const mostrarInfo = aberto && bairrosLocais.length === 0 && cidade && uf;

  return (
    <div ref={containerRef} className="relative">
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-10 pl-9 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown com sugestões */}
      {mostrarDropdown && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filtrados.map((bairro, i) => (
            <li
              key={bairro}
              onClick={() => selecionar(bairro)}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                i === highlighted ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {bairro}
            </li>
          ))}
        </ul>
      )}

      {/* Sem resultados mas tem dataset */}
      {mostrarVazio && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-slate-200 bg-white shadow-lg px-3 py-2 text-sm text-slate-500">
          Nenhum bairro encontrado — você pode digitar livremente
        </div>
      )}

      {/* Sem dataset para esta cidade */}
      {mostrarInfo && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-slate-200 bg-white shadow-lg px-3 py-2 text-sm text-slate-500">
          Digite o nome do bairro
        </div>
      )}
    </div>
  );
}
