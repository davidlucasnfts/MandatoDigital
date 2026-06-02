import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Search, X, MapPin, Calendar, Clock, User, Tag, AlertTriangle, FileText, Check } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSolicitacoes, useEleitores } from '@/hooks/useSupabaseData';
import { supabase } from '@/lib/supabase';
import { formatDateForInput } from '@/lib/masks';
import type { Solicitacao } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  solicitacao?: Solicitacao | null;
}

const prioridadeConfig = {
  urgente: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: 'focus:ring-red-500' },
  alta: { label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', ring: 'focus:ring-orange-500' },
  media: { label: 'Média', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'focus:ring-amber-500' },
  baixa: { label: 'Baixa', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', ring: 'focus:ring-green-500' },
};

export default function NovaSolicitacaoDialog({ open, onClose, onSuccess, solicitacao }: Props) {
  const { insert, update } = useSolicitacoes();
  const { data: eleitores } = useEleitores();
  const [loading, setLoading] = useState(false);
  const [buscaEleitor, setBuscaEleitor] = useState('');
  const [mostrarLista, setMostrarLista] = useState(false);
  const eleitorRef = useRef<HTMLDivElement>(null);
  const isEdit = !!solicitacao;

  const buildForm = (s?: Solicitacao | null) => ({
    titulo: s?.titulo || '',
    eleitor_id: s?.eleitor_id || '',
    eleitor_nome: s?.eleitor_nome || '',
    categoria: s?.categoria || '',
    prioridade: s?.prioridade || 'media',
    descricao: s?.descricao || '',
    data_solicitacao: s?.data_solicitacao || new Date().toISOString().split('T')[0],
    data_prazo: s?.data_prazo || null,
    data_evento: s?.data_evento || null,
    local: s?.local || '',
    responsavel: s?.responsavel || '',
  });

  const [form, setForm] = useState(buildForm(solicitacao));

  useEffect(() => { setForm(buildForm(solicitacao)); }, [solicitacao]);

  // Fecha lista ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (eleitorRef.current && !eleitorRef.current.contains(e.target as Node)) {
        setMostrarLista(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const eleitoresFiltrados = useMemo(() => {
    if (!buscaEleitor.trim()) return [];
    const termo = buscaEleitor.toLowerCase();
    return eleitores
      .filter(e => e.nome.toLowerCase().includes(termo) || (e.telefone && e.telefone.includes(termo)))
      .slice(0, 5);
  }, [buscaEleitor, eleitores]);

  const eleitorSelecionado = useMemo(() => {
    return eleitores.find(e => e.id === form.eleitor_id);
  }, [eleitores, form.eleitor_id]);

  const handleSelectEleitor = (eleitor: typeof eleitores[0]) => {
    setForm(prev => ({ ...prev, eleitor_id: eleitor.id, eleitor_nome: eleitor.nome }));
    setBuscaEleitor('');
    setMostrarLista(false);
  };

  const handleClearEleitor = () => {
    setForm(prev => ({ ...prev, eleitor_id: '', eleitor_nome: '' }));
    setBuscaEleitor('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo?.trim()) return;

    // Debug: verificar se supabase está configurado
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('[NovaSolicitacao] Session:', sessionData?.session ? 'Autenticado' : 'Não autenticado');
    console.log('[NovaSolicitacao] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    setLoading(true);
    const payload: any = {
      titulo: form.titulo,
      prioridade: form.prioridade || 'media',
      data_solicitacao: form.data_solicitacao || new Date().toISOString().split('T')[0],
    };
    // Só inclui campos opcionais se tiverem valor
    if (form.eleitor_id) payload.eleitor_id = form.eleitor_id;
    if (eleitorSelecionado?.nome || form.eleitor_nome) payload.eleitor_nome = eleitorSelecionado?.nome || form.eleitor_nome;
    if (form.categoria?.trim()) payload.categoria = form.categoria;
    if (form.descricao?.trim()) payload.descricao = form.descricao;
    if (form.data_prazo) payload.data_prazo = form.data_prazo;
    if (form.data_evento) payload.data_evento = form.data_evento;
    if (form.local?.trim()) payload.local = form.local;
    if (form.responsavel?.trim()) payload.responsavel = form.responsavel;
    console.log('[NovaSolicitacao] Payload:', payload);
    try {
      if (isEdit && solicitacao) {
        await update(solicitacao.id, payload);
      } else {
        const result = await insert(payload);
        console.log('[NovaSolicitacao] Result:', result);
      }
    } catch (err) {
      console.error('[NovaSolicitacao] Erro:', err);
    }
    setLoading(false);
    setForm(buildForm(null));
    setBuscaEleitor('');
    onSuccess?.();
    onClose();
  };

  const setField = <K extends keyof Solicitacao>(key: K, value: Solicitacao[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const hoje = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar solicitação' : 'Nova solicitação'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit ? 'Atualize os dados da solicitação.' : 'Registre uma nova demanda do eleitor.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pb-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* === SEÇÃO: INFORMAÇÕES BÁSICAS === */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3" />Informações básicas
            </h4>

            {/* Título */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="titulo" className="text-xs font-medium text-slate-700">
                  Título <span className="text-red-500">*</span>
                </Label>
                <span className="text-[10px] text-slate-400">
                  {(form.titulo || '').length}/60
                </span>
              </div>
              <Input
                id="titulo"
                value={form.titulo || ''}
                onChange={e => setField('titulo', e.target.value)}
                placeholder="Ex: Pavimentação Rua das Flores"
                required
                maxLength={60}
                className="h-10"
              />
            </div>

            {/* Eleitor com busca */}
            <div className="space-y-1.5" ref={eleitorRef}>
              <Label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <User className="w-3 h-3" />Eleitor
              </Label>
              {form.eleitor_id ? (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{eleitorSelecionado?.nome || form.eleitor_nome}</p>
                    {eleitorSelecionado?.telefone && (
                      <p className="text-[10px] text-slate-500">{eleitorSelecionado.telefone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearEleitor}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={buscaEleitor}
                    onChange={e => { setBuscaEleitor(e.target.value); setMostrarLista(true); }}
                    onFocus={() => buscaEleitor.trim() && setMostrarLista(true)}
                    placeholder="Buscar eleitor por nome ou telefone..."
                    className="pl-9 h-10"
                  />
                  {mostrarLista && eleitoresFiltrados.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      {eleitoresFiltrados.map(e => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => handleSelectEleitor(e)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{e.nome}</p>
                            <p className="text-[10px] text-slate-500">{e.bairro || 'Sem bairro'} {e.telefone ? `· ${e.telefone}` : ''}</p>
                          </div>
                          <Check className="w-3.5 h-3.5 text-blue-600 opacity-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {mostrarLista && buscaEleitor.trim() && eleitoresFiltrados.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center">
                      <p className="text-xs text-slate-500">Nenhum eleitor encontrado</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Categoria + Prioridade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="categoria" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <Tag className="w-3 h-3" />Categoria
                </Label>
                <Input
                  id="categoria"
                  value={form.categoria || ''}
                  onChange={e => setField('categoria', e.target.value)}
                  placeholder="Ex: Infraestrutura"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />Prioridade
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(prioridadeConfig) as Array<keyof typeof prioridadeConfig>).map(p => {
                    const cfg = prioridadeConfig[p];
                    const ativo = form.prioridade === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setField('prioridade', p as Solicitacao['prioridade'])}
                        className={`px-2 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                          ativo
                            ? `${cfg.bg} ${cfg.color} ${cfg.border} border`
                            : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="descricao" className="text-xs font-medium text-slate-700">Descrição</Label>
                <span className="text-[10px] text-slate-400">
                  {(form.descricao || '').length}/250
                </span>
              </div>
              <Textarea
                id="descricao"
                value={form.descricao || ''}
                onChange={e => setField('descricao', e.target.value)}
                placeholder="Descreva a demanda com detalhes..."
                rows={3}
                maxLength={250}
                className="resize-none"
              />
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <Label htmlFor="responsavel" className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <User className="w-3 h-3" />Responsável
              </Label>
              <Input
                id="responsavel"
                value={form.responsavel || ''}
                onChange={e => setField('responsavel', e.target.value)}
                placeholder="Nome do responsável pela solicitação"
                className="h-10"
              />
            </div>
          </div>

          {/* === SEÇÃO: PRAZO === */}
          <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" />Prazo de resolução
            </h4>
            <p className="text-[10px] text-slate-500 -mt-1">Data limite para dar retorno ou resolver a demanda</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="data_solicitacao" className="text-xs font-medium text-slate-700">Data da solicitação</Label>
                <Input
                  id="data_solicitacao"
                  type="date"
                  min="1900-01-01"
                  max={hoje}
                  value={formatDateForInput(form.data_solicitacao) || ''}
                  onChange={e => setField('data_solicitacao', e.target.value || null)}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="data_prazo" className="text-xs font-medium text-slate-700">Prazo</Label>
                <Input
                  id="data_prazo"
                  type="date"
                  min={hoje}
                  value={formatDateForInput(form.data_prazo) || ''}
                  onChange={e => setField('data_prazo', e.target.value || null)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* === SEÇÃO: EVENTO === */}
          <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" />Evento relacionado
            </h4>
            <p className="text-[10px] text-slate-500 -mt-1">Data de uma reunião, visita ou compromisso vinculado a esta demanda</p>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="data_evento" className="text-xs font-medium text-slate-700">Data do evento</Label>
                <Input
                  id="data_evento"
                  type="date"
                  min={hoje}
                  value={formatDateForInput(form.data_evento) || ''}
                  onChange={e => setField('data_evento', e.target.value || null)}
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* === SEÇÃO: LOCAL === */}
          <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" />Local da demanda
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="local" className="text-xs font-medium text-slate-700">Endereço / Local</Label>
              <Input
                id="local"
                value={form.local || ''}
                onChange={e => setField('local', e.target.value)}
                placeholder="Ex: Rua das Flores, 123 - Bairro Centro"
                className="h-10"
              />
            </div>
          </div>

          {/* === STATUS (edição apenas) === */}
          {isEdit && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Status atual:</strong> {form.status} — Para alterar o status, use o Kanban ou os botões rápidos na lista.
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-10">
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 h-10 shadow-sm"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                {isEdit ? 'Salvar alterações' : 'Criar solicitação'}
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
