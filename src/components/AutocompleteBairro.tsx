import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MapPin, ChevronDown } from '@/lib/icons';
import bairrosData from '@/data/bairrosBrasil.json';

interface Props {
  cidade: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
}

const bairrosPorCidade: Record<string, string[]> = bairrosData;

function normalizarCidade(cidade: string): string {
  // Remove acentos e converte para formato do JSON: "Sao Paulo/SP"
  const semAcento = cidade
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return semAcento;
}

function encontrarChaveCidade(cidade: string): string | null {
  if (!cidade) return null;
  const norm = normalizarCidade(cidade).toLowerCase();

  // Tenta match exato
  for (const key of Object.keys(bairrosPorCidade)) {
    const keyCidade = key.split('/')[0].toLowerCase();
    if (keyCidade === norm) return key;
  }

  // Tenta match parcial
  for (const key of Object.keys(bairrosPorCidade)) {
    const keyCidade = key.split('/')[0].toLowerCase();
    if (keyCidade.includes(norm) || norm.includes(keyCidade)) return key;
  }

  return null;
}

export default function AutocompleteBairro({ cidade, value, onChange, placeholder = 'Selecione o bairro', label, id, disabled }: Props) {
  const [aberto, setAberto] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chaveCidade = useMemo(() => encontrarChaveCidade(cidade), [cidade]);
  const bairros = useMemo(() => chaveCidade ? bairrosPorCidade[chaveCidade] : [], [chaveCidade]);

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
    if (!q) return bairros.slice(0, 8);
    return bairros
      .filter(b => {
        const nomeNorm = b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return nomeNorm.includes(q);
      })
      .slice(0, 8);
  }, [inputValue, bairros]);

  const selecionar = useCallback((bairro: string) => {
    setInputValue(bairro);
    onChange(bairro);
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
    if (bairros.length > 0) {
      setAberto(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setHighlighted(0);
    if (val.trim().length >= 1) {
      setAberto(true);
    } else {
      setAberto(false);
    }
  };

  const semBairros = !chaveCidade || bairros.length === 0;

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
          disabled={disabled || semBairros}
          placeholder={semBairros ? (cidade ? 'Cidade sem bairros cadastrados' : 'Selecione uma cidade primeiro') : placeholder}
          autoComplete="off"
          className="w-full h-10 pl-9 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {aberto && filtradas.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filtradas.map((bairro, i) => (
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

      {aberto && inputValue.trim().length >= 1 && filtradas.length === 0 && !semBairros && (
        <div className="absolute z-50 w-full mt-1 rounded-md border border-slate-200 bg-white shadow-lg px-3 py-2 text-sm text-slate-500">
          Nenhum bairro encontrado
        </div>
      )}
    </div>
  );
}
