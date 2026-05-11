import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import cidadesData from '@/data/cidadesBrasil.json';

interface CidadeItem {
  nome: string;
  uf: string;
}

const cidades: CidadeItem[] = cidadesData;

interface Props {
  value: string;
  onChange: (value: string, uf?: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
}

export default function AutocompleteCidade({ value, onChange, placeholder = 'Digite a cidade', label, id, disabled }: Props) {
  const [aberto, setAberto] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza input com prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const filtradas = useMemo(() => {
    const q = inputValue.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!q) return [];
    return cidades
      .filter(c => {
        const nomeNorm = c.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nomeNorm.includes(q);
      })
      .slice(0, 8);
  }, [inputValue]);

  const selecionar = useCallback((cidade: CidadeItem) => {
    setInputValue(cidade.nome);
    onChange(cidade.nome, cidade.uf);
    setAberto(false);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!aberto && filtradas.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      setAberto(true);
      return;
    }
    if (!aberto) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlighted(prev => (prev + 1) % filtradas.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlighted(prev => (prev - 1 + filtradas.length) % filtradas.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtradas[highlighted]) {
          selecionar(filtradas[highlighted]);
        }
        break;
      case 'Escape':
        setAberto(false);
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length >= 2 && filtradas.length > 0) {
      setAberto(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val, undefined);
    setHighlighted(0);
    if (val.trim().length >= 2) {
      setAberto(true);
    } else {
      setAberto(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
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

      {/* Dropdown */}
      {aberto && filtradas.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filtradas.map((cidade, i) => (
            <li
              key={cidade.nome + cidade.uf}
              onClick={() => selecionar(cidade)}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between ${
                i === highlighted ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{cidade.nome}</span>
              <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{cidade.uf}</span>
            </li>
          ))}
        </ul>
      )}

      {aberto && inputValue.trim().length >= 2 && filtradas.length === 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-slate-200 bg-white shadow-lg px-3 py-2 text-sm text-slate-500">
          Nenhuma cidade encontrada
        </div>
      )}
    </div>
  );
}
