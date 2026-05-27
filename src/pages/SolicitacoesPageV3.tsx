import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Plus, Search, AlertCircle, Clock, CheckCircle, XCircle,
  Pencil, Trash2, Filter, X, ChevronDown, Calendar, User, Tag,
  AlertTriangle, ArrowRight
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PanelCard, EmptyState } from '@/components/dashboard';

import { useSolicitacoes } from '@/hooks/useSupabaseData';
import KanbanBoard from '@/components/KanbanBoard';
import NovaSolicitacaoDialog from '@/components/NovaSolicitacaoDialog';
import type { Solicitacao } from '@/lib/supabase';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

const prioridadeColors: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  alta: 'bg-orange-100 text-orange-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-green-100 text-green-700'
};

const prioridadeLabel: Record<string, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa'
};

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  andamento: 'bg-blue-100 text-blue-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700'
};

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

const columns = [
  { key: 'pendente' as const, label: 'Pendente', icon: AlertCircle },
  { key: 'andamento' as const, label: 'Em Andamento', icon: Clock },
  { key: 'concluido' as const, label: 'Concluído', icon: CheckCircle },
  { key: 'cancelado' as const, label: 'Cancelado', icon: XCircle },
];

const colorMap = {
  blue: { border: 'border-t-blue-600', bg: 'bg-blue-50', icon: 'text-blue-600' },
  green: { border: 'border-t-green-600', bg: 'bg-green-50', icon: 'text-green-600' },
  amber: { border: 'border-t-amber-600', bg: 'bg-amber-50', icon: 'text-amber-600' },
  red: { border: 'border-t-red-600', bg: 'bg-red-50', icon: 'text-red-600' },
  purple: { border: 'border-t-purple-600', bg: 'bg-purple-50', icon: 'text-purple-600' },
};

export default function SolicitacoesPageV3() {
  const { data: solicitacoes, loading, update, remove } = useSolicitacoes();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [novaOpen, setNovaOpen] = useState(false);
  const [editSolicitacao, setEditSolicitacao] = useState<Solicitacao | null>(null);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const filtered = useMemo(() => solicitacoes.filter(s => {
    const matchSearch = !search || s.titulo?.toLowerCase().includes(search.toLowerCase()) || s.eleitor_nome?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    const matchPrioridade = !prioridadeFilter || s.prioridade === prioridadeFilter;
    return matchSearch && matchStatus && matchPrioridade;
  }), [solicitacoes, search, statusFilter, prioridadeFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const pendentes = filtered.filter(s => s.status === 'pendente').length;
    const andamento = filtered.filter(s => s.status === 'andamento').length;
    const concluidas = filtered.filter(s => s.status === 'concluido').length;
    const urgentes = filtered.filter(s => s.prioridade === 'urgente').length;
    return { total, pendentes, andamento, concluidas, urgentes };
  }, [filtered]);

  const temFiltros = !!(statusFilter || prioridadeFilter);

  const handleDragEnd = async (itemId: string, newStatus: string) => {
    await update(itemId, { status: newStatus as Solicitacao['status'] });
  };

  const handleStatusToggle = async (ev: React.MouseEvent, id: string, status: string) => {
    ev.stopPropagation();
    await update(id, { status: status as Solicitacao['status'] });
  };

  const statItems = [
    { label: 'Total', value: stats.total, icon: ClipboardList, color: 'blue' as const },
    { label: 'Pendentes', value: stats.pendentes, icon: AlertCircle, color: 'amber' as const },
    { label: 'Em Andamento', value: stats.andamento, icon: Clock, color: 'purple' as const },
    { label: 'Concluídas', value: stats.concluidas, icon: CheckCircle, color: 'green' as const },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />Solicitações
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              {filtered.length} solicitações · {stats.urgentes} urgentes
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Lista</button>
              <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Kanban</button>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setNovaOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />Nova
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {statItems.map((stat, i) => {
          const colors = colorMap[stat.color];
          return (
            <motion.div key={stat.label} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
              <button
                onClick={() => {
                  if (stat.label === 'Pendentes') setStatusFilter(statusFilter === 'pendente' ? '' : 'pendente');
                  else if (stat.label === 'Em Andamento') setStatusFilter(statusFilter === 'andamento' ? '' : 'andamento');
                  else if (stat.label === 'Concluídas') setStatusFilter(statusFilter === 'concluido' ? '' : 'concluido');
                  else setStatusFilter('');
                }}
                className={`w-full h-full text-left rounded-xl border border-slate-200 bg-white border-t-[3px] ${colors.border} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-3 lg:p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${colors.icon}`} />
                  </div>
                </div>
                <div className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-[10px] lg:text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Filtros */}
      <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
        <PanelCard
          title="Filtros"
          icon={Filter}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          action={{ label: mostrarFiltros ? 'Ocultar' : 'Mostrar', onClick: () => setMostrarFiltros(!mostrarFiltros) }}
          delay={5}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar solicitação por título ou eleitor..."
                className="pl-9 h-10"
              />
            </div>
            {temFiltros && (
              <button
                onClick={() => { setStatusFilter(''); setPrioridadeFilter(''); }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />Limpar filtros
              </button>
            )}
          </div>

          {mostrarFiltros && (
            <div className="space-y-3 pt-3 mt-3 border-t border-slate-100">
              {/* Status */}
              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Status</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'pendente', label: 'Pendente', color: 'amber' },
                    { key: 'andamento', label: 'Em Andamento', color: 'blue' },
                    { key: 'concluido', label: 'Concluído', color: 'green' },
                    { key: 'cancelado', label: 'Cancelado', color: 'red' },
                  ].map(s => (
                    <button
                      key={s.key}
                      onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${statusFilter === s.key ? `bg-${s.color}-50 text-${s.color}-700 border border-${s.color}-200` : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioridade */}
              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Prioridade</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'urgente', label: 'Urgente', color: 'red' },
                    { key: 'alta', label: 'Alta', color: 'orange' },
                    { key: 'media', label: 'Média', color: 'amber' },
                    { key: 'baixa', label: 'Baixa', color: 'green' },
                  ].map(p => (
                    <button
                      key={p.key}
                      onClick={() => setPrioridadeFilter(prioridadeFilter === p.key ? '' : p.key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${prioridadeFilter === p.key ? `bg-${p.color}-50 text-${p.color}-700 border border-${p.color}-200` : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </PanelCard>
      </motion.div>

      {/* Preview da Solicitação Selecionada */}
      {solicitacaoSelecionada && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[solicitacaoSelecionada.status || 'pendente']}`}>
                      {statusLabel[solicitacaoSelecionada.status || 'pendente']}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${prioridadeColors[solicitacaoSelecionada.prioridade || 'media']}`}>
                      {prioridadeLabel[solicitacaoSelecionada.prioridade || 'media']}
                    </span>
                    {solicitacaoSelecionada.categoria && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
                        {solicitacaoSelecionada.categoria}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-800">{solicitacaoSelecionada.titulo}</h3>
                  {solicitacaoSelecionada.descricao && (
                    <p className="text-sm text-slate-500 mt-1">{solicitacaoSelecionada.descricao}</p>
                  )}
                </div>
                {/* Ações */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setEditSolicitacao(solicitacaoSelecionada); }}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                  >
                    <Pencil className="w-3.5 h-3.5" />Editar
                  </button>
                  <button
                    onClick={() => { if (confirm('Excluir esta solicitação?')) { remove(solicitacaoSelecionada.id); setSolicitacaoSelecionada(null); } }}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />Excluir
                  </button>
                </div>
              </div>
            </div>

            {/* Detalhes em Grid */}
            <div className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Eleitor */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" />Eleitor
                </h4>
                <div className="text-sm font-medium text-slate-800">{solicitacaoSelecionada.eleitor_nome || '—'}</div>
              </div>

              {/* Responsável */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" />Responsável
                </h4>
                <div className="text-sm font-medium text-slate-800">{solicitacaoSelecionada.responsavel || '—'}</div>
              </div>

              {/* Data Solicitação */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Solicitação
                </h4>
                <div className="text-sm font-medium text-slate-800">
                  {solicitacaoSelecionada.data_solicitacao ? new Date(solicitacaoSelecionada.data_solicitacao).toLocaleDateString('pt-BR') : '—'}
                </div>
              </div>

              {/* Prazo */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />Prazo
                </h4>
                <div className="text-sm font-medium text-slate-800">
                  {solicitacaoSelecionada.data_prazo ? new Date(solicitacaoSelecionada.data_prazo).toLocaleDateString('pt-BR') : '—'}
                </div>
              </div>

              {/* Data Evento */}
              {solicitacaoSelecionada.data_evento && (
                <div className="space-y-1 col-span-2 lg:col-span-4">
                  <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />Data do Evento
                  </h4>
                  <div className="text-sm font-medium text-blue-600">
                    {new Date(solicitacaoSelecionada.data_evento).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </div>

            {/* Toggle de Status Rápido */}
            <div className="px-4 lg:px-6 pb-4 lg:pb-6">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Alterar Status</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'pendente', label: 'Pendente', color: 'amber' },
                  { key: 'andamento', label: 'Em Andamento', color: 'blue' },
                  { key: 'concluido', label: 'Concluído', color: 'green' },
                  { key: 'cancelado', label: 'Cancelado', color: 'red' },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => { update(solicitacaoSelecionada.id, { status: s.key as Solicitacao['status'] }); }}
                    disabled={solicitacaoSelecionada.status === s.key}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      solicitacaoSelecionada.status === s.key
                        ? `bg-${s.color}-100 text-${s.color}-700 cursor-default`
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <div className="flex justify-center">
            <button onClick={() => setSolicitacaoSelecionada(null)} className="flex items-center gap-1 px-4 py-2 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4" />Fechar
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista / Kanban */}
      {view === 'table' ? (
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
          <PanelCard title="Lista de Solicitações" icon={ClipboardList} iconColor="text-blue-600" iconBg="bg-blue-50" badge={filtered.length} delay={6}>
            <div className="overflow-x-auto -mx-4 lg:-mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase w-16">Ações</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Título</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Eleitor</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Categoria</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Prioridade</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={7} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8">
                        <EmptyState icon={ClipboardList} title="Nenhuma solicitação encontrada" description="Ajuste os filtros ou crie uma nova solicitação" action={{ label: 'Nova solicitação', onClick: () => setNovaOpen(true) }} />
                      </td>
                    </tr>
                  ) : (
                    filtered.map(s => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => setSolicitacaoSelecionada(solicitacaoSelecionada?.id === s.id ? null : s)}
                      >
                        {/* Ações */}
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(ev) => { ev.stopPropagation(); setEditSolicitacao(s); }}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Pencil className="w-3 h-3" />Editar
                            </button>
                            <button
                              onClick={(ev) => { ev.stopPropagation(); if (confirm('Excluir esta solicitação?')) remove(s.id); }}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-3 h-3" />Excluir
                            </button>
                          </div>
                        </td>
                        {/* Título */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{s.titulo}</div>
                          {s.descricao && <div className="text-xs text-slate-400 line-clamp-1">{s.descricao}</div>}
                        </td>
                        {/* Eleitor */}
                        <td className="py-3 px-4 text-slate-600 text-xs hidden sm:table-cell">{s.eleitor_nome || '—'}</td>
                        {/* Categoria */}
                        <td className="py-3 px-4 hidden md:table-cell">
                          {s.categoria ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{s.categoria}</span> : '—'}
                        </td>
                        {/* Prioridade */}
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${prioridadeColors[s.prioridade || 'media']}`}>
                            {s.prioridade}
                          </span>
                        </td>
                        {/* Status + Toggle */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[s.status || 'pendente']}`}>
                              {s.status}
                            </span>
                            <div className="flex gap-0.5">
                              {s.status !== 'pendente' && (
                                <button onClick={(ev) => handleStatusToggle(ev, s.id, 'pendente')} className="w-5 h-5 rounded bg-amber-100 text-amber-600 text-[10px] hover:bg-amber-200 transition-colors" title="Pendente">P</button>
                              )}
                              {s.status !== 'andamento' && (
                                <button onClick={(ev) => handleStatusToggle(ev, s.id, 'andamento')} className="w-5 h-5 rounded bg-blue-100 text-blue-600 text-[10px] hover:bg-blue-200 transition-colors" title="Em Andamento">A</button>
                              )}
                              {s.status !== 'concluido' && (
                                <button onClick={(ev) => handleStatusToggle(ev, s.id, 'concluido')} className="w-5 h-5 rounded bg-green-100 text-green-600 text-[10px] hover:bg-green-200 transition-colors" title="Concluído">C</button>
                              )}
                              {s.status !== 'cancelado' && (
                                <button onClick={(ev) => handleStatusToggle(ev, s.id, 'cancelado')} className="w-5 h-5 rounded bg-red-100 text-red-600 text-[10px] hover:bg-red-200 transition-colors" title="Cancelado">X</button>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Prazo */}
                        <td className="py-3 px-4 text-xs text-slate-500 hidden lg:table-cell">
                          {s.data_evento ? (
                            <span className="text-blue-600">📅 {new Date(s.data_evento).toLocaleDateString('pt-BR')}</span>
                          ) : (
                            s.data_prazo ? new Date(s.data_prazo).toLocaleDateString('pt-BR') : '—'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </PanelCard>
        </motion.div>
      ) : (
        <KanbanBoard
          items={filtered}
          columns={columns.map(c => ({ id: c.key, label: c.label, icon: c.icon }))}
          onDragEnd={handleDragEnd}
          renderCard={(s) => (
            <div className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white rounded-lg border border-slate-200 p-3">
              <div className="flex items-start justify-between">
                <div className="font-medium text-sm text-slate-800 mb-1 flex-1">{s.titulo}</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditSolicitacao(s)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors" title="Editar"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm('Excluir esta solicitação?')) remove(s.id); }} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="text-xs text-slate-500 mb-2">{s.eleitor_nome}</div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioridadeColors[s.prioridade || 'media']}`}>
                  {s.prioridade}
                </span>
                <span className="text-[10px] text-slate-400">{s.data_prazo || '—'}</span>
              </div>
            </div>
          )}
          getItemStatus={(s) => s.status}
        />
      )}

      <NovaSolicitacaoDialog
        open={novaOpen || !!editSolicitacao}
        onClose={() => { setNovaOpen(false); setEditSolicitacao(null); }}
        solicitacao={editSolicitacao}
      />
    </div>
  );
}
