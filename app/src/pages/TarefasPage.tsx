import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { tarefas } from '@/data/mockData';

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

export default function TarefasPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const filtered = useMemo(() => {
    return tarefas.filter(t => !search || t.titulo.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const columns = [
    { key: 'pendente', label: 'Pendente', icon: AlertCircle, color: 'amber' },
    { key: 'andamento', label: 'Em Andamento', icon: Clock, color: 'blue' },
    { key: 'concluida', label: 'Concluída', icon: CheckCircle, color: 'green' },
  ] as const;

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Tarefas
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} tarefas</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Kanban</button>
              <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Lista</button>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1.5" /> Nova
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar tarefa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>
      </motion.div>

      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col, ci) => {
            const items = filtered.filter(t => t.status === col.key);
            return (
              <motion.div key={col.key} custom={ci + 2} variants={fadeIn} initial="hidden" animate="visible">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <col.icon className={`w-4 h-4 text-${col.color}-500`} />
                    <span className="text-sm font-semibold text-slate-700">{col.label}</span>
                    <span className="text-xs text-slate-400 ml-auto">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((t) => (
                      <Card key={t.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                        <CardContent className="p-3">
                          <h4 className="text-sm font-medium text-slate-800 mb-2">{t.titulo}</h4>
                          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{t.descricao}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${prioridadeColors[t.prioridade]}`}>{t.prioridade}</span>
                            <span className="text-[10px] text-slate-400">{t.dataPrazo}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-50 flex items-center gap-1 text-[10px] text-slate-400">
                            <span>{t.responsavel}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tarefa</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Prioridade</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Responsável</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Prazo</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{t.titulo}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">{t.descricao}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${prioridadeColors[t.prioridade]}`}>{t.prioridade}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{t.responsavel}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{t.dataPrazo}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            t.status === 'concluida' ? 'bg-green-100 text-green-700' : t.status === 'andamento' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
