import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Pencil, Trash2, CalendarDays, User, MapPin, Calendar, Clock, AlertTriangle } from '@/lib/icons';
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

interface Props {
  solicitacoes: Solicitacao[];
  loading: boolean;
  onEdit: (s: Solicitacao) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<Solicitacao>) => void;
}

function SolicitacaoRow({ s, isSelected, onClick, onEdit, onRemove, onUpdate }: {
  s: Solicitacao;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (s: Solicitacao) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<Solicitacao>) => void;
}) {
  return (
    <>
      <tr
        className={`border-b transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/80 border-blue-100' : 'border-slate-50 hover:bg-blue-50/50'}`}
        onClick={onClick}
      >
        <td className="py-3 px-2 align-top" style={{ width: '90px' }}>
          <div className="flex flex-col gap-1">
            <button onClick={(ev) => { ev.stopPropagation(); onEdit(s); }} className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm w-full" title="Editar">
              <Pencil className="w-3 h-3" />Editar
            </button>
            <button onClick={(ev) => { ev.stopPropagation(); if (confirm('Excluir esta solicitação?')) onRemove(s.id); }} className="flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm w-full" title="Excluir">
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
      {isSelected && (
        <tr className="border-b border-blue-100">
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
                    <button onClick={() => onEdit(s)} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"><Pencil className="w-3.5 h-3.5" />Editar</button>
                    <button onClick={() => { if (confirm('Excluir esta solicitação?')) { onRemove(s.id); } }} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"><Trash2 className="w-3.5 h-3.5" />Excluir</button>
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
                      <button key={st.key} onClick={() => onUpdate(s.id, { status: st.key as Solicitacao['status'] })} disabled={s.status === st.key} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${s.status === st.key ? `bg-${st.color}-100 text-${st.color}-700 cursor-default` : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>{st.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
}

function SecaoColapsavel({ titulo, badge, children, defaultOpen = false }: {
  titulo: string;
  badge: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [aberto, setAberto] = useState(defaultOpen);

  return (
    <div className="border-t border-slate-100">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">{titulo}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{badge}</span>
        </div>
        {aberto ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {aberto && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          {children}
        </motion.div>
      )}
    </div>
  );
}

export default function SolicitacoesLista({ solicitacoes, loading, onEdit, onRemove, onUpdate }: Props) {
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const ativas = solicitacoes.filter(s => s.status !== 'concluido' && s.status !== 'cancelado' && s.status !== 'excluido');
  const concluidas = solicitacoes.filter(s => s.status === 'concluido');
  const canceladasExcluidas = solicitacoes.filter(s => s.status === 'cancelado' || s.status === 'excluido');

  if (loading) {
    return (
      <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-slate-50">
              <td colSpan={7} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (solicitacoes.length === 0) {
    return (
      <div className="py-8">
        <div className="text-center text-sm text-slate-400">Nenhuma solicitação encontrada</div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Lista principal - Ativas */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '90px' }}>Ações</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '32%' }}>Título</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '14%' }}>Eleitor</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap hidden md:table-cell" style={{ width: '11%' }}>Categoria</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '10%' }}>Prioridade</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap" style={{ width: '11%' }}>Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase whitespace-nowrap hidden lg:table-cell" style={{ width: '11%' }}>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {ativas.map(s => (
              <SolicitacaoRow
                key={s.id}
                s={s}
                isSelected={selecionada === s.id}
                onClick={() => setSelecionada(selecionada === s.id ? null : s.id)}
                onEdit={onEdit}
                onRemove={onRemove}
                onUpdate={onUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Seção Concluídas */}
      {concluidas.length > 0 && (
        <SecaoColapsavel titulo="Concluídas" badge={concluidas.length}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
              <tbody>
                {concluidas.map(s => (
                  <SolicitacaoRow
                    key={s.id}
                    s={s}
                    isSelected={selecionada === s.id}
                    onClick={() => setSelecionada(selecionada === s.id ? null : s.id)}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    onUpdate={onUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </SecaoColapsavel>
      )}

      {/* Seção Canceladas / Excluídas */}
      {canceladasExcluidas.length > 0 && (
        <SecaoColapsavel titulo="Canceladas & Excluídas" badge={canceladasExcluidas.length}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
              <tbody>
                {canceladasExcluidas.map(s => (
                  <SolicitacaoRow
                    key={s.id}
                    s={s}
                    isSelected={selecionada === s.id}
                    onClick={() => setSelecionada(selecionada === s.id ? null : s.id)}
                    onEdit={onEdit}
                    onRemove={onRemove}
                    onUpdate={onUpdate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </SecaoColapsavel>
      )}
    </div>
  );
}
