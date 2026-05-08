import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Search, AlertCircle, Clock, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

import { useSolicitacoes } from '@/hooks/useSupabaseData';
import KanbanBoard from '@/components/KanbanBoard';
import NovaSolicitacaoDialog from '@/components/NovaSolicitacaoDialog';
import type { Solicitacao } from '@/lib/supabase';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };
const prioridadeColors: Record<string, string> = { urgente: 'bg-red-100 text-red-700', alta: 'bg-orange-100 text-orange-700', media: 'bg-amber-100 text-amber-700', baixa: 'bg-green-100 text-green-700' };
const statusColors: Record<string, string> = { pendente: 'bg-amber-100 text-amber-700', andamento: 'bg-blue-100 text-blue-700', concluido: 'bg-green-100 text-green-700', cancelado: 'bg-red-100 text-red-700' };

const columns = [
  { key: 'pendente' as const, label: 'Pendente', icon: AlertCircle },
  { key: 'andamento' as const, label: 'Em Andamento', icon: Clock },
  { key: 'concluido' as const, label: 'Concluído', icon: CheckCircle },
  { key: 'cancelado' as const, label: 'Cancelado', icon: XCircle },
];

function SolicitacaoCard({ solicitacao, onEdit, onDelete }: { solicitacao: Solicitacao; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="font-medium text-sm text-slate-800 mb-1 flex-1">{solicitacao.titulo}</div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar"><Pencil className="w-3.5 h-3.5"/></button>
            <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Excluir"><Trash2 className="w-3.5 h-3.5"/></button>
          </div>
        </div>
        <div className="text-xs text-slate-500 mb-2">{solicitacao.eleitor_nome}</div>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioridadeColors[solicitacao.prioridade || 'media']}`}>
            {solicitacao.prioridade}
          </span>
          <span className="text-[10px] text-slate-400">{solicitacao.data_prazo || '—'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SolicitacoesPage() {
  const { data: solicitacoes, loading, update, remove } = useSolicitacoes();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [novaOpen, setNovaOpen] = useState(false);
  const [editSolicitacao, setEditSolicitacao] = useState<Solicitacao | null>(null);

  const filtered = useMemo(() => solicitacoes.filter(s => {
    const matchSearch = !search || s.titulo?.toLowerCase().includes(search.toLowerCase()) || s.eleitor_nome?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  }), [solicitacoes, search, statusFilter]);

  const handleDragEnd = async (itemId: string, newStatus: string) => {
    await update(itemId, { status: newStatus as Solicitacao['status'] });
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600"/>Solicitações
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} solicitações</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Lista</button>
              <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Kanban</button>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setNovaOpen(true)}><Plus className="w-4 h-4 mr-1.5"/>Nova</Button>
          </div>
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                <Input placeholder="Buscar solicitação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10"/>
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {view === 'table' ? (
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Título','Eleitor','Categoria','Prioridade','Status','Prazo',''].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? Array.from({length:4}).map((_,i) => (
                      <tr key={i} className="border-b">
                        <td colSpan={6} className="py-3 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse"/></td>
                      </tr>
                    )) : filtered.map(s => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{s.titulo}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">{s.descricao}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{s.eleitor_nome}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{s.categoria}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${prioridadeColors[s.prioridade || 'media']}`}>{s.prioridade}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[s.status || 'pendente']}`}>{s.status}</span>
                            {/* Toggle rápido de status */}
                            <div className="flex gap-0.5">
                              {s.status !== 'pendente' && (
                                <button onClick={() => update(s.id, { status: 'pendente' })} className="w-5 h-5 rounded bg-amber-100 text-amber-600 text-[10px] hover:bg-amber-200 transition-colors" title="Pendente">P</button>
                              )}
                              {s.status !== 'andamento' && (
                                <button onClick={() => update(s.id, { status: 'andamento' })} className="w-5 h-5 rounded bg-blue-100 text-blue-600 text-[10px] hover:bg-blue-200 transition-colors" title="Em Andamento">A</button>
                              )}
                              {s.status !== 'concluido' && (
                                <button onClick={() => update(s.id, { status: 'concluido' })} className="w-5 h-5 rounded bg-green-100 text-green-600 text-[10px] hover:bg-green-200 transition-colors" title="Concluído">C</button>
                              )}
                              {s.status !== 'cancelado' && (
                                <button onClick={() => update(s.id, { status: 'cancelado' })} className="w-5 h-5 rounded bg-red-100 text-red-600 text-[10px] hover:bg-red-200 transition-colors" title="Cancelado">X</button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          <div>{s.data_evento ? <span className="text-blue-600">📅 {new Date(s.data_evento).toLocaleDateString('pt-BR')}</span> : (s.data_prazo || '—')}</div>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-slate-100 rounded"><MoreHorizontal className="w-4 h-4 text-slate-400"/></button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditSolicitacao(s)} className="text-xs cursor-pointer"><Pencil className="w-3.5 h-3.5 mr-2" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { if (confirm('Excluir esta solicitação?')) remove(s.id); }} className="text-xs cursor-pointer text-red-600"><Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <KanbanBoard
          items={filtered}
          columns={columns.map(c => ({ id: c.key, label: c.label, icon: c.icon }))}
          onDragEnd={handleDragEnd}
          renderCard={(s) => <SolicitacaoCard solicitacao={s} onEdit={() => setEditSolicitacao(s)} onDelete={() => { if (confirm('Excluir esta solicitação?')) remove(s.id); }} />}
          getItemStatus={(s) => s.status}
        />
      )}
      <NovaSolicitacaoDialog open={novaOpen || !!editSolicitacao} onClose={() => { setNovaOpen(false); setEditSolicitacao(null); }} solicitacao={editSolicitacao} />
    </div>
  );
}
