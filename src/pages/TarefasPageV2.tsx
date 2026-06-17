import { useState, useMemo } from 'react';
import { FileText, Plus, Search, AlertCircle, Clock, CheckCircle2, Pencil, Trash2, LayoutGrid, List, Calendar } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader, StatCard, SearchFilterBar, SkeletonList, EmptyState } from '@/components/dashboard';
import { useTarefas } from '@/hooks/useSupabaseData';
import KanbanBoard from '@/components/KanbanBoard';
import NovaTarefaDialog from '@/components/NovaTarefaDialog';
import type { Tarefa } from '@/lib/supabase';

const prioridadeColors: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  alta: 'bg-orange-100 text-orange-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-green-100 text-green-700',
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  andamento: 'Em Andamento',
  concluida: 'Concluída',
};

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-50 text-amber-600',
  andamento: 'bg-blue-50 text-blue-600',
  concluida: 'bg-green-50 text-green-600',
};

const columns = [
  { key: 'pendente' as const, label: 'Pendente', icon: AlertCircle },
  { key: 'andamento' as const, label: 'Em Andamento', icon: Clock },
  { key: 'concluida' as const, label: 'Concluída', icon: CheckCircle2 },
];

function TarefaCard({ tarefa, onEdit, onDelete }: { tarefa: Tarefa; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-sm transition-shadow cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800 mb-2 flex-1 break-all line-clamp-2">{tarefa.titulo}</h4>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
          >
            <Pencil className="w-3 h-3" strokeWidth={2} /> Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" strokeWidth={2} /> Excluir
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-2 line-clamp-2 break-all">{tarefa.descricao}</p>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioridadeColors[tarefa.prioridade || 'media']}`}>
          {tarefa.prioridade}
        </span>
        <span className="text-[10px] text-slate-400">{tarefa.data_prazo || '—'}</span>
      </div>
    </div>
  );
}

export default function TarefasPageV2() {
  const { data: tarefas, loading, update, remove } = useTarefas();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [novaOpen, setNovaOpen] = useState(false);
  const [editTarefa, setEditTarefa] = useState<Tarefa | null>(null);

  const filtered = useMemo(
    () => tarefas.filter((t) => !search || t.titulo?.toLowerCase().includes(search.toLowerCase())),
    [tarefas, search]
  );

  const stats = useMemo(
    () => ({
      total: tarefas.length,
      pendentes: tarefas.filter((t) => t.status === 'pendente').length,
      andamento: tarefas.filter((t) => t.status === 'andamento').length,
      concluidas: tarefas.filter((t) => t.status === 'concluida').length,
    }),
    [tarefas]
  );

  const handleDragEnd = async (itemId: string, newStatus: string) => {
    await update(itemId, { status: newStatus as Tarefa['status'] });
  };

  const extraActions = (
    <div className="flex bg-slate-100 rounded-lg p-0.5">
      <button
        onClick={() => setView('kanban')}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} /> Kanban
      </button>
      <button
        onClick={() => setView('list')}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          view === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
        }`}
      >
        <List className="w-3.5 h-3.5" strokeWidth={2} /> Lista
      </button>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Tarefas"
        subtitle="Organize as atividades da equipe."
        icon={FileText}
        action={{ label: 'Nova Tarefa', onClick: () => setNovaOpen(true), icon: Plus }}
        extraActions={extraActions}
        delay={0}
      />

      {loading ? (
        <SkeletonList count={4} delay={1} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard label="Total" value={stats.total} icon={FileText} color="blue" delay={1} />
          <StatCard label="Pendentes" value={stats.pendentes} icon={AlertCircle} color="amber" delay={2} />
          <StatCard label="Em Andamento" value={stats.andamento} icon={Clock} color="blue" delay={3} />
          <StatCard label="Concluídas" value={stats.concluidas} icon={CheckCircle2} color="green" delay={4} />
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar tarefa..."
        searchWidth="w-48"
        delay={2}
      />

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3 animate-pulse h-60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma tarefa encontrada"
          description={search ? 'Tente ajustar a busca.' : 'Crie sua primeira tarefa para começar.'}
          action={!search ? { label: 'Nova Tarefa', onClick: () => setNovaOpen(true) } : undefined}
        />
      ) : view === 'kanban' ? (
        <KanbanBoard
          items={filtered}
          columns={columns.map((c) => ({ id: c.key, label: c.label, icon: c.icon }))}
          onDragEnd={handleDragEnd}
          renderCard={(tarefa) => (
            <TarefaCard
              tarefa={tarefa}
              onEdit={() => setEditTarefa(tarefa)}
              onDelete={() => {
                if (confirm('Excluir esta tarefa?')) remove(tarefa.id);
              }}
            />
          )}
          getItemStatus={(t) => t.status}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 break-all">{t.titulo}</h4>
                  <p className="text-xs text-slate-500 mt-1 break-all line-clamp-2">{t.descricao}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioridadeColors[t.prioridade || 'media']}`}>
                      {t.prioridade}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[t.status]}`}>
                      {statusLabels[t.status]}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={2} /> {t.data_prazo || 'Sem prazo'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setEditTarefa(t)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Editar
                  </button>
                  <button
                    onClick={() => { if (confirm('Excluir esta tarefa?')) remove(t.id); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <NovaTarefaDialog
        open={novaOpen || !!editTarefa}
        onClose={() => { setNovaOpen(false); setEditTarefa(null); }}
        tarefa={editTarefa}
      />
    </div>
  );
}
