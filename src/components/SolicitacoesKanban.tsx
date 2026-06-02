import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Pencil, Trash2, CalendarDays, User, MapPin, Calendar, Clock, AlertTriangle,
  AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronRight, X
} from '@/lib/icons';
import type { Solicitacao } from '@/lib/supabase';

const prioridadeColors: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  alta: 'bg-orange-100 text-orange-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-green-100 text-green-700'
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

const prioridadeLabel: Record<string, string> = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa'
};

const columnMeta = [
  { key: 'pendente', label: 'Pendente', icon: AlertCircle, color: 'amber' as const },
  { key: 'andamento', label: 'Em Andamento', icon: Clock, color: 'blue' as const },
  { key: 'concluido', label: 'Concluído', icon: CheckCircle, color: 'green' as const },
  { key: 'cancelado', label: 'Cancelado', icon: XCircle, color: 'red' as const },
];

const colorMap = {
  blue: { border: 'border-t-blue-600', bg: 'bg-blue-50', icon: 'text-blue-600', headerBg: 'bg-blue-50/60' },
  green: { border: 'border-t-green-600', bg: 'bg-green-50', icon: 'text-green-600', headerBg: 'bg-green-50/60' },
  amber: { border: 'border-t-amber-600', bg: 'bg-amber-50', icon: 'text-amber-600', headerBg: 'bg-amber-50/60' },
  red: { border: 'border-t-red-600', bg: 'bg-red-50', icon: 'text-red-600', headerBg: 'bg-red-50/60' },
};

interface Props {
  solicitacoes: Solicitacao[];
  loading: boolean;
  onEdit: (s: Solicitacao) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<Solicitacao>) => void;
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

function SolicitacaoPreview({ s, onEdit, onRemove, onUpdate }: {
  s: Solicitacao;
  onEdit: (s: Solicitacao) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<Solicitacao>) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-blue-50/30 overflow-hidden"
    >
      <div className="p-4 lg:p-6 overflow-hidden">
        {/* Header: ícone + título + badges + ações */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              s.prioridade === 'urgente' ? 'bg-red-100' : s.prioridade === 'alta' ? 'bg-orange-100' : s.prioridade === 'media' ? 'bg-amber-100' : 'bg-green-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${
                s.prioridade === 'urgente' ? 'text-red-600' : s.prioridade === 'alta' ? 'text-orange-600' : s.prioridade === 'media' ? 'text-amber-600' : 'text-green-600'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 break-all leading-tight">{s.titulo}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[s.status || 'pendente']}`}>{statusLabel[s.status || 'pendente']}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${prioridadeColors[s.prioridade || 'media']}`}>{prioridadeLabel[s.prioridade || 'media']}</span>
                {s.categoria && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">{s.categoria}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <button onClick={() => onEdit(s)} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm flex-1">
              <Pencil className="w-3.5 h-3.5" />Editar
            </button>
            <button onClick={() => { if (confirm('Excluir esta solicitação?')) onRemove(s.id); }} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm flex-1">
              <Trash2 className="w-3.5 h-3.5" />Excluir
            </button>
          </div>
        </div>

        {/* Descrição */}
        {s.descricao && <p className="text-sm text-slate-500 mb-4 break-all">{s.descricao}</p>}

        {/* Grid de detalhes */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><User className="w-3 h-3" />Eleitor</h4>
            <div className="text-sm font-medium text-slate-800">{s.eleitor_nome || '—'}</div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><User className="w-3 h-3" />Responsável</h4>
            <div className="text-sm font-medium text-slate-800">{s.responsavel || '—'}</div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" />Local</h4>
            <div className="text-sm font-medium text-slate-800">{s.local || '—'}</div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" />Solicitação</h4>
            <div className="text-sm font-medium text-slate-800">{s.data_solicitacao ? new Date(s.data_solicitacao).toLocaleDateString('pt-BR') : '—'}</div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><Clock className="w-3 h-3" />Prazo</h4>
            <div className="text-sm font-medium text-slate-800">{s.data_prazo ? new Date(s.data_prazo).toLocaleDateString('pt-BR') : '—'}</div>
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1"><CalendarDays className="w-3 h-3" />Evento</h4>
            <div className={`text-sm font-medium ${s.data_evento ? 'text-blue-600' : 'text-slate-800'}`}>{s.data_evento ? new Date(s.data_evento).toLocaleDateString('pt-BR') : '—'}</div>
          </div>
        </div>

        {/* Alterar Status */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase mb-2">Alterar Status</h4>
          <div className="flex flex-wrap gap-2">
            {[{ key: 'pendente', label: 'Pendente', color: 'amber' }, { key: 'andamento', label: 'Em Andamento', color: 'blue' }, { key: 'concluido', label: 'Concluído', color: 'green' }, { key: 'cancelado', label: 'Cancelado', color: 'red' }].map(st => (
              <button
                key={st.key}
                onClick={() => onUpdate(s.id, { status: st.key as Solicitacao['status'] })}
                disabled={s.status === st.key}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${s.status === st.key ? `bg-${st.color}-100 text-${st.color}-700 cursor-default` : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function KanbanCard({ s, isSelected, onClick }: {
  s: Solicitacao;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border bg-white p-3 transition-all hover:shadow-md ${
        isSelected ? 'border-blue-300 shadow-sm ring-1 ring-blue-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm text-slate-800 flex-1 min-w-0 truncate" title={s.titulo}>{s.titulo}</div>
      </div>
      <div className="text-xs text-slate-500 mt-1 truncate">{s.eleitor_nome || '—'}</div>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioridadeColors[s.prioridade || 'media']}`}>
          {prioridadeLabel[s.prioridade || 'media']}
        </span>
        <span className="text-[10px] text-slate-400">
          {s.data_prazo ? new Date(s.data_prazo).toLocaleDateString('pt-BR') : (s.data_evento ? new Date(s.data_evento).toLocaleDateString('pt-BR') : '—')}
        </span>
      </div>
    </div>
  );
}

export default function SolicitacoesKanban({ solicitacoes, loading, onEdit, onRemove, onUpdate }: Props) {
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [colunasMinimizadas, setColunasMinimizadas] = useState<Record<string, boolean>>({});

  const solicitacaoSelecionada = selecionada ? solicitacoes.find(s => s.id === selecionada) || null : null;

  const toggleColuna = (colKey: string) => {
    setColunasMinimizadas(prev => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const itemId = active.id as string;
    const overId = over.id as string;
    const isColumn = columnMeta.some(c => c.key === overId);
    const item = solicitacoes.find(i => i.id === itemId);
    const newStatus = isColumn ? overId : solicitacoes.find(i => i.id === overId)?.status;
    if (newStatus && item && newStatus !== item.status) {
      onUpdate(itemId, { status: newStatus as Solicitacao['status'] });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {columnMeta.map(col => (
          <div key={col.key} className="bg-slate-50 rounded-lg p-3 min-h-[200px]">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-20" />
              <div className="h-4 bg-slate-200 rounded animate-pulse w-6 ml-auto" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-3 h-20 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-sm text-slate-400">Nenhuma solicitação encontrada</div>
      </div>
    );
  }

  const itemsByColumn = (colKey: string) => solicitacoes.filter(s => s.status === colKey);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {columnMeta.map(col => {
          const colItems = itemsByColumn(col.key);
          const colors = colorMap[col.color];
          const Icon = col.icon;
          return (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-slate-50 rounded-xl border border-slate-200 border-t-[3px] ${colors.border} min-h-[200px] flex flex-col`}
              data-status={col.key}
            >
              {/* Header da coluna — clicável para minimizar */}
              <button
                onClick={() => toggleColuna(col.key)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${colors.headerBg} hover:opacity-80 transition-opacity text-left`}
              >
                <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                <span className="text-xs text-slate-400 ml-auto bg-white px-2 py-0.5 rounded-full border border-slate-200">{colItems.length}</span>
                {colunasMinimizadas[col.key] ? (
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {/* Cards */}
              {!colunasMinimizadas[col.key] ? (
                <SortableContext
                  items={colItems.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                  id={col.key}
                >
                  <div className="p-2 space-y-2 flex-1">
                    {colItems.map(item => (
                      <SortableItem key={item.id} id={item.id}>
                        <KanbanCard
                          s={item}
                          isSelected={selecionada === item.id}
                          onClick={() => setSelecionada(selecionada === item.id ? null : item.id)}
                        />
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              ) : (
                /* Preview compacto quando minimizado */
                <div className="p-2 space-y-1">
                  {colItems.slice(0, 5).map(item => (
                    <div key={item.id} className="text-xs text-slate-500 truncate px-1 py-0.5" title={item.titulo}>
                      {item.titulo}
                    </div>
                  ))}
                  {colItems.length > 5 && (
                    <div className="text-[10px] text-slate-400 px-1 py-0.5">+{colItems.length - 5} mais</div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Drawer lateral para preview */}
      {solicitacaoSelecionada && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelecionada(null)}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] lg:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
              <span className="text-sm font-semibold text-slate-700">Detalhes da Solicitação</span>
              <button
                onClick={() => setSelecionada(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <SolicitacaoPreview
              s={solicitacaoSelecionada}
              onEdit={(s) => { onEdit(s); setSelecionada(null); }}
              onRemove={(id) => { onRemove(id); setSelecionada(null); }}
              onUpdate={onUpdate}
            />
          </motion.div>
        </>
      )}
    </DndContext>
  );
}
