import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList, Plus, Search, AlertCircle, Clock, CheckCircle, XCircle,
  Filter, X
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PanelCard, EmptyState } from '@/components/dashboard';

import { useSolicitacoes } from '@/hooks/useSupabaseData';
import SolicitacoesKanban from '@/components/SolicitacoesKanban';
import NovaSolicitacaoDialog from '@/components/NovaSolicitacaoDialog';
import SolicitacoesLista from '@/components/SolicitacoesLista';
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

const colorMap = {
  blue: { border: 'border-t-blue-600', bg: 'bg-blue-50', icon: 'text-blue-600' },
  green: { border: 'border-t-green-600', bg: 'bg-green-50', icon: 'text-green-600' },
  amber: { border: 'border-t-amber-600', bg: 'bg-amber-50', icon: 'text-amber-600' },
  red: { border: 'border-t-red-600', bg: 'bg-red-50', icon: 'text-red-600' },
  purple: { border: 'border-t-purple-600', bg: 'bg-purple-50', icon: 'text-purple-600' },
};

export default function SolicitacoesPage() {
  const { data: solicitacoes, loading, update, remove, fetch } = useSolicitacoes();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [novaOpen, setNovaOpen] = useState(false);
  const [editSolicitacao, setEditSolicitacao] = useState<Solicitacao | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${colors.icon}`} />
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                    {loading ? '...' : stat.value}
                  </div>
                </div>
                <div className="text-[10px] lg:text-xs text-slate-500 font-medium">{stat.label}</div>
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
              <SolicitacoesLista
                solicitacoes={filtered}
                loading={loading}
                onEdit={setEditSolicitacao}
                onRemove={remove}
                onUpdate={update}
              />
            </div>
          </PanelCard>
        </motion.div>
      ) : (
        <SolicitacoesKanban
          solicitacoes={filtered}
          loading={loading}
          onEdit={setEditSolicitacao}
          onRemove={remove}
          onUpdate={update}
        />
      )}

      <NovaSolicitacaoDialog
        open={novaOpen || !!editSolicitacao}
        onClose={() => { setNovaOpen(false); setEditSolicitacao(null); }}
        onSuccess={() => {
          // Atualiza a lista sem reload
          fetch();
        }}
        solicitacao={editSolicitacao}
      />
    </div>
  );
}
