import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Search, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { solicitacoes } from '@/data/mockData';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const prioridadeColors: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  alta: 'bg-orange-100 text-orange-700',
  media: 'bg-amber-100 text-amber-700',
  baixa: 'bg-green-100 text-green-700',
};

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  andamento: 'bg-blue-100 text-blue-700',
  concluido: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
};

export default function SolicitacoesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [view, setView] = useState<'table' | 'kanban'>('table');

  const filtered = useMemo(() => {
    return solicitacoes.filter(s => {
      const matchSearch = !search || s.titulo.toLowerCase().includes(search.toLowerCase()) || s.eleitor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const byStatus = {
    pendente: filtered.filter(s => s.status === 'pendente'),
    andamento: filtered.filter(s => s.status === 'andamento'),
    concluido: filtered.filter(s => s.status === 'concluido'),
    cancelado: filtered.filter(s => s.status === 'cancelado'),
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              Solicitações
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} solicitações</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setView('table')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Lista</button>
              <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Kanban</button>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1.5" /> Nova
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Buscar solicitação..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
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
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Título</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Eleitor</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Categoria</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Prioridade</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Prazo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{s.titulo}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">{s.descricao}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{s.eleitor}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{s.categoria}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${prioridadeColors[s.prioridade]}`}>{s.prioridade}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[s.status]}`}>{s.status}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">{s.dataPrazo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['pendente', 'andamento', 'concluido', 'cancelado'] as const).map((status) => (
            <motion.div key={status} custom={2} variants={fadeIn} initial="hidden" animate="visible">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3 px-1">
                  {status === 'pendente' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  {status === 'andamento' && <Clock className="w-4 h-4 text-blue-500" />}
                  {status === 'concluido' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {status === 'cancelado' && <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-sm font-semibold text-slate-700 capitalize">{status}</span>
                  <span className="text-xs text-slate-400 ml-auto">{byStatus[status].length}</span>
                </div>
                <div className="space-y-2">
                  {byStatus[status].map((s) => (
                    <Card key={s.id} className="cursor-pointer hover:shadow-sm">
                      <CardContent className="p-3">
                        <div className="font-medium text-sm text-slate-800 mb-1">{s.titulo}</div>
                        <div className="text-xs text-slate-500 mb-2">{s.eleitor}</div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize ${prioridadeColors[s.prioridade]}`}>{s.prioridade}</span>
                          <span className="text-[10px] text-slate-400">{s.dataPrazo}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
