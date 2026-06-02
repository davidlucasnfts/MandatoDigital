import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Plus, Search, AlertCircle, Clock, CheckCircle, XCircle,
  Pencil, Trash2, Filter, X, ChevronDown, ChevronRight, Calendar, CalendarDays, User, Tag,
  AlertTriangle, ArrowRight, MapPin
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

export default function SolicitacoesPageV4() {
  const { data: solicitacoes, loading, update, remove } = useSolicitacoes();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [novaOpen, setNovaOpen] = useState(false);
  const [editSolicitacao, setEditSolicitacao] = useState<Solicitacao | null>(null);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<Solicitacao | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarConcluidas, setMostrarConcluidas] = useState(false);
  const [mostrarCanceladas, setMostrarCanceladas] = useState(false);

  const filtered = useMemo(() => solicitacoes.filter(s => {
    const matchSearch = !search || s.titulo?.toLowerCase().includes(search.toLowerCase()) || s.eleitor_nome?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    const matchPrioridade = !prioridadeFilter || s.prioridade === prioridadeFilter;
    return matchSearch && matchStatus && matchPrioridade;
  }), [solicitacoes, search, statusFilter, prioridadeFilter]);

  const ativas = filtered.filter(s => s.status !== 'concluido' && s.status !== 'cancelado');
  const concluidas = filtered.filter(s => s.status === 'concluido');
  const canceladas = filtered.filter(s => s.status === 'cancelado');

  const stats = useMemo(() => {
    const total = filtered.length;
    const pendentes = filtered.filter(s => s.status === 'pendente').length;
    const andamento = filtered.filter(s => s.status === 'andamento').length;
    const concluidasCount = filtered.filter(s => s.status === 'concluido').length;
    const canceladasCount = filtered.filter(s => s.status === 'cancelado').length;
    const urgentes = filtered.filter(s => s.prioridade === 'urgente').length;
    return { total, pendentes, andamento, concluidas: concluidasCount, canceladas: canceladasCount, urgentes };
  }, [filtered]);

  const temFiltros = !!(statusFilter || prioridadeFilter);

  const handleDragEnd = async (itemId: string, newStatus: string) => {
    await update(itemId, { status: newStatus as Solicitacao['status'] });
  };

  const handleStatusToggle = async (ev: React.MouseEvent, id: string, status: string) => {
    ev.stopPropagation();
    await update(id, { status: status as Solicitacao['status'] });
  };

  // Scroll automático para o preview quando abrir (offset para não ficar atrás do header)
  useEffect(() => {
    if (solicitacaoSelecionada && previewRef.current) {
      const yOffset = -80; // offset para não ficar atrás do header fixo
      const y = previewRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [solicitacaoSelecionada]);

  const statItems = [
    { label: 'Total', value: stats.total, icon: ClipboardList, color: 'blue' as const },
    { label: 'Pendentes', value: stats.pendentes, icon: AlertCircle, color: 'amber' as const },
    { label: 'Em Andamento', value: stats.andamento, icon: Clock, color: 'purple' as const },
    { label: 'Concluídas', value: stats.concluidas, icon: CheckCircle, color: 'green' as const },
    { label: 'Canceladas', value: stats.canceladas, icon: XCircle, color: 'red' as const },
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



      {/* Lista / Kanban */}
      {view === 'table' ? (
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
          <PanelCard title="Lista de Solicitações" icon={ClipboardList} iconColor="text-blue-600" iconBg="bg-blue-50" badge={filtered.length} delay={6}>
            <div className="overflow-x-auto -mx-4 lg:-mx-6">
              {/* Mobile table - 2 columns only */}
              <table className="w-full text-sm sm:hidden" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-1 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '56px' }}>Ações</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">Solicitação</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={2} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8">
                        <EmptyState icon={ClipboardList} title="Nenhuma solicitação encontrada" description="Ajuste os filtros ou crie uma nova solicitação" action={{ label: 'Nova solicitação', onClick: () => setNovaOpen(true) }} />
                      </td>
                    </tr>
                  ) : (
                    filtered.flatMap(s => {
                      const isSelected = solicitacaoSelecionada?.id === s.id;
                      const rows = [
                        <tr
                          key={s.id}
                          className={`border-b transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/80 border-blue-100' : 'border-slate-50 hover:bg-blue-50/50'}`}
                          onClick={() => setSolicitacaoSelecionada(isSelected ? null : s)}
                        >
                          <td className="py-3 px-1 align-top" style={{ width: '56px' }}>
                            <div className="flex flex-col gap-1">
                              <button onClick={(ev) => { ev.stopPropagation(); setEditSolicitacao(s); }} className="flex items-center justify-center px-2 py-1.5 text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm" title="Editar">
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button onClick={(ev) => { ev.stopPropagation(); if (confirm('Excluir esta solicitação?')) remove(s.id); }} className="flex items-center justify-center px-2 py-1.5 text-[10px] font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm" title="Excluir">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 overflow-hidden">
                            <div className="font-medium text-slate-800 truncate" style={{ maxWidth: 'calc(100vw - 120px)' }}>{s.titulo}</div>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${statusColors[s.status || 'pendente']}`}>{s.status}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${prioridadeColors[s.prioridade || 'media']}`}>{s.prioridade}</span>
                            </div>
                          </td>
                        </tr>
                      ];
                      if (isSelected) {
                        rows.push(
                          <tr key={`${s.id}-preview`} className="border-b border-blue-100">
                            <td colSpan={2} className="p-0 overflow-hidden">
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50/30 overflow-hidden">
                                <div className="p-4 overflow-hidden">
                                  <div className="flex flex-col gap-3 mb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        s.prioridade === 'urgente' ? 'bg-red-100' : s.prioridade === 'alta' ? 'bg-orange-100' : s.prioridade === 'media' ? 'bg-amber-100' : 'bg-green-100'
                                      }`}>
                                        <AlertTriangle className={`w-5 h-5 ${
                                          s.prioridade === 'urgente' ? 'text-red-600' : s.prioridade === 'alta' ? 'text-orange-600' : s.prioridade === 'media' ? 'text-amber-600' : 'text-green-600'
                                        }`} />
                                      </div>
                                      <div className="min-w-0">
                                        <h3 className="text-base font-bold text-slate-800 break-words">{s.titulo}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s.status || 'pendente']}`}>{statusLabel[s.status || 'pendente']}</span>
                                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioridadeColors[s.prioridade || 'media']}`}>{prioridadeLabel[s.prioridade || 'media']}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => setEditSolicitacao(s)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"><Pencil className="w-3 h-3" />Editar</button>
                                      <button onClick={() => { if (confirm('Excluir esta solicitação?')) { remove(s.id); setSolicitacaoSelecionada(null); } }} className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"><Trash2 className="w-3 h-3" />Excluir</button>
                                    </div>
                                  </div>
                                  {s.descricao && <p className="text-sm text-slate-500 mb-4 break-all">{s.descricao}</p>}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-0.5"><h4 className="text-[10px] font-semibold text-slate-400 uppercase">Eleitor</h4><div className="text-sm font-medium text-slate-800">{s.eleitor_nome || '—'}</div></div>
                                    <div className="space-y-0.5"><h4 className="text-[10px] font-semibold text-slate-400 uppercase">Responsável</h4><div className="text-sm font-medium text-slate-800">{s.responsavel || '—'}</div></div>
                                    <div className="space-y-0.5"><h4 className="text-[10px] font-semibold text-slate-400 uppercase">Local</h4><div className="text-sm font-medium text-slate-800">{s.local || '—'}</div></div>
                                    <div className="space-y-0.5"><h4 className="text-[10px] font-semibold text-slate-400 uppercase">Solicitação</h4><div className="text-sm font-medium text-slate-800">{s.data_solicitacao ? new Date(s.data_solicitacao).toLocaleDateString('pt-BR') : '—'}</div></div>
                                    <div className="space-y-0.5"><h4 className="text-[10px] font-semibold text-slate-400 uppercase">Prazo</h4><div className="text-sm font-medium text-slate-800">{s.data_prazo ? new Date(s.data_prazo).toLocaleDateString('pt-BR') : '—'}</div></div>
                                    <div className="space-y-0.5"><h4 className="text-[10px] font-semibold text-slate-400 uppercase">Evento</h4><div className={`text-sm font-medium ${s.data_evento ? 'text-blue-600' : 'text-slate-800'}`}>{s.data_evento ? new Date(s.data_evento).toLocaleDateString('pt-BR') : '—'}</div></div>
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-slate-200">
                                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Alterar Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {[{ key: 'pendente', label: 'Pendente', color: 'amber' }, { key: 'andamento', label: 'Em Andamento', color: 'blue' }, { key: 'concluido', label: 'Concluído', color: 'green' }, { key: 'cancelado', label: 'Cancelado', color: 'red' }].map(st => (
                                        <button key={st.key} onClick={() => update(s.id, { status: st.key as Solicitacao['status'] })} disabled={s.status === st.key} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${s.status === st.key ? `bg-${st.color}-100 text-${st.color}-700 cursor-default` : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>{st.label}</button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        );
                      }
                      return rows;
                    })
                  )}
                </tbody>
              </table>

              {/* Desktop table - full columns */}
              <table className="w-full text-sm hidden sm:table" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '90px' }}>Ações</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '32%' }}>Título</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '15%' }}>Eleitor</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap hidden md:table-cell" style={{ width: '12%' }}>Categoria</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '10%' }}>Prioridade</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '11%' }}>Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap hidden lg:table-cell" style={{ width: '12%' }}>Prazo</th>
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
                    filtered.flatMap(s => {
                      const isSelected = solicitacaoSelecionada?.id === s.id;
                      const rows = [
                        <tr
                          key={s.id}
                          className={`border-b transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/80 border-blue-100' : 'border-slate-50 hover:bg-blue-50/50'}`}
                          onClick={() => setSolicitacaoSelecionada(isSelected ? null : s)}
                        >
                          <td className="py-3 px-2 align-top" style={{ width: '90px' }}>
                            <div className="flex flex-col gap-1">
                              <button onClick={(ev) => { ev.stopPropagation(); setEditSolicitacao(s); }} className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm w-full" title="Editar">
                                <Pencil className="w-3 h-3" />Editar
                              </button>
                              <button onClick={(ev) => { ev.stopPropagation(); if (confirm('Excluir esta solicitação?')) remove(s.id); }} className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm w-full" title="Excluir">
                                <Trash2 className="w-3 h-3" />Excluir
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 overflow-hidden" style={{ width: '32%' }}>
                            <div className="font-medium text-slate-800 truncate">{s.titulo}</div>
                            {s.descricao && <div className="text-xs text-slate-400 truncate">{s.descricao}</div>}
                          </td>
                          <td className="py-3 px-4 text-slate-600 text-xs truncate" style={{ width: '14%' }}>{s.eleitor_nome || '—'}</td>
                          <td className="py-3 px-4 hidden md:table-cell overflow-hidden" style={{ width: '11%' }}>
                            {s.categoria ? <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full truncate inline-block max-w-full">{s.categoria}</span> : '—'}
                          </td>
                          <td className="py-3 px-4 overflow-hidden" style={{ width: '10%' }}>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize truncate inline-block max-w-full ${prioridadeColors[s.prioridade || 'media']}`}>{s.prioridade}</span>
                          </td>
                          <td className="py-3 px-4 overflow-hidden" style={{ width: '11%' }}>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize truncate inline-block max-w-full ${statusColors[s.status || 'pendente']}`}>{s.status}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500 hidden lg:table-cell overflow-hidden" style={{ width: '11%' }}>
                            {s.data_evento ? <span className="inline-flex items-center gap-1 text-blue-600 truncate"><CalendarDays className="w-3 h-3 flex-shrink-0" />{new Date(s.data_evento).toLocaleDateString('pt-BR')}</span> : (s.data_prazo ? new Date(s.data_prazo).toLocaleDateString('pt-BR') : '—')}
                          </td>
                        </tr>
                      ];
                      if (isSelected) {
                        rows.push(
                          <tr key={`${s.id}-preview`} className="border-b border-blue-100">
                            <td colSpan={7} className="p-0 overflow-hidden">
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50/30 overflow-hidden">
                                <div className="p-4 lg:p-6 overflow-hidden">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                                    <div className="flex items-center gap-4 min-w-0">
                                      <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        s.prioridade === 'urgente' ? 'bg-red-100' : s.prioridade === 'alta' ? 'bg-orange-100' : s.prioridade === 'media' ? 'bg-amber-100' : 'bg-green-100'
                                      }`}>
                                        <AlertTriangle className={`w-6 h-6 lg:w-7 lg:h-7 ${
                                          s.prioridade === 'urgente' ? 'text-red-600' : s.prioridade === 'alta' ? 'text-orange-600' : s.prioridade === 'media' ? 'text-amber-600' : 'text-green-600'
                                        }`} />
                                      </div>
                                      <div className="min-w-0">
                                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 break-words">{s.titulo}</h3>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[s.status || 'pendente']}`}>{statusLabel[s.status || 'pendente']}</span>
                                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${prioridadeColors[s.prioridade || 'media']}`}>{prioridadeLabel[s.prioridade || 'media']}</span>
                                          {s.categoria && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">{s.categoria}</span>}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col gap-2">
                                      <button onClick={() => setEditSolicitacao(s)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"><Pencil className="w-3.5 h-3.5" />Editar</button>
                                      <button onClick={() => { if (confirm('Excluir esta solicitação?')) { remove(s.id); setSolicitacaoSelecionada(null); } }} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"><Trash2 className="w-3.5 h-3.5" />Excluir</button>
                                    </div>
                                  </div>
                                  {s.descricao && <p className="text-sm text-slate-500 mb-4 break-all">{s.descricao}</p>}
                                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1"><h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><User className="w-3 h-3" />Eleitor</h4><div className="text-sm font-medium text-slate-800">{s.eleitor_nome || '—'}</div></div>
                                    <div className="space-y-1"><h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><User className="w-3 h-3" />Responsável</h4><div className="text-sm font-medium text-slate-800">{s.responsavel || '—'}</div></div>
                                    <div className="space-y-1"><h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" />Local</h4><div className="text-sm font-medium text-slate-800">{s.local || '—'}</div></div>
                                    <div className="space-y-1"><h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" />Solicitação</h4><div className="text-sm font-medium text-slate-800">{s.data_solicitacao ? new Date(s.data_solicitacao).toLocaleDateString('pt-BR') : '—'}</div></div>
                                    <div className="space-y-1"><h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><Clock className="w-3 h-3" />Prazo</h4><div className="text-sm font-medium text-slate-800">{s.data_prazo ? new Date(s.data_prazo).toLocaleDateString('pt-BR') : '—'}</div></div>
                                    <div className="space-y-1"><h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><CalendarDays className="w-3 h-3" />Evento</h4><div className={`text-sm font-medium ${s.data_evento ? 'text-blue-600' : 'text-slate-800'}`}>{s.data_evento ? new Date(s.data_evento).toLocaleDateString('pt-BR') : '—'}</div></div>
                                  </div>
                                  <div className="mt-4 pt-3 border-t border-slate-200">
                                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Alterar Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {[{ key: 'pendente', label: 'Pendente', color: 'amber' }, { key: 'andamento', label: 'Em Andamento', color: 'blue' }, { key: 'concluido', label: 'Concluído', color: 'green' }, { key: 'cancelado', label: 'Cancelado', color: 'red' }].map(st => (
                                        <button key={st.key} onClick={() => update(s.id, { status: st.key as Solicitacao['status'] })} disabled={s.status === st.key} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${s.status === st.key ? `bg-${st.color}-100 text-${st.color}-700 cursor-default` : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>{st.label}</button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        );
                      }
                      return rows;
                    })
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
                  <button onClick={() => setEditSolicitacao(s)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors" title="Editar"><Pencil className="w-3 h-3" />Editar</button>
                  <button onClick={() => { if (confirm('Excluir esta solicitação?')) remove(s.id); }} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-colors" title="Excluir"><Trash2 className="w-3 h-3" />Excluir</button>
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
