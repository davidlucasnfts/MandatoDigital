import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Plus, Search, Trash2, AlertTriangle, Eye, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { trpc } from '@/providers/trpc';
import NovaEnqueteDialog from '@/components/NovaEnqueteDialog';
import ResponderEnqueteDialog from '@/components/ResponderEnqueteDialog';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const statusLabels: Record<string, string> = {
  rascunho: 'Rascunho',
  publicada: 'Publicada',
  encerrada: 'Encerrada',
  arquivada: 'Arquivada',
};

const statusColors: Record<string, string> = {
  rascunho: 'bg-slate-100 text-slate-600',
  publicada: 'bg-green-50 text-green-600',
  encerrada: 'bg-amber-50 text-amber-600',
  arquivada: 'bg-gray-100 text-gray-500',
};

export default function EnquetesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editEnquete, setEditEnquete] = useState<any>(null);
  const [showResponder, setShowResponder] = useState<string | null>(null);
  const [showEstatisticas, setShowEstatisticas] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: enquetes, isLoading } = trpc.enquetes.list.useQuery(
    statusFilter ? { status: statusFilter as any } : {},
    { enabled: true }
  );
  const removeMutation = trpc.enquetes.delete.useMutation({
    onSuccess: () => { setShowDelete(null); utils.enquetes.list.invalidate(); },
  });
  const { data: estatisticas } = trpc.enquetes.estatisticas.useQuery(
    { id: showEstatisticas! },
    { enabled: !!showEstatisticas }
  );

  const filtered = useMemo(() => {
    if (!enquetes) return [];
    return enquetes.filter(e => {
      const matchSearch = !search ||
        e.titulo.toLowerCase().includes(search.toLowerCase()) ||
        (e.descricao?.toLowerCase().includes(search.toLowerCase()));
      return matchSearch;
    });
  }, [enquetes, search]);

  const handleEdit = (enquete: any) => {
    setEditEnquete(enquete);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditEnquete(null);
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Pesquisa de Opinião
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} enquetes</p>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Nova Enquete
          </Button>
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
              </div>
              <div className="relative">
                <BarChart3 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background pl-8 pr-6 text-sm">
                  <option value="">Todos os status</option>
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Enquete</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Período</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">Carregando...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-slate-400">Nenhuma enquete encontrada</td></tr>
                  ) : (
                    filtered.map((e) => (
                      <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-slate-800 line-clamp-1">{e.titulo}</div>
                            {e.descricao && <div className="text-xs text-slate-400 line-clamp-1">{e.descricao}</div>}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status] || 'bg-slate-100 text-slate-600'}`}>
                            {statusLabels[e.status] || e.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {e.dataPublicacao ? new Date(e.dataPublicacao).toLocaleDateString('pt-BR') : '-'} {e.dataEncerramento ? `→ ${new Date(e.dataEncerramento).toLocaleDateString('pt-BR')}` : ''}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {e.permiteMultiplaEscolha ? 'Múltipla escolha' : 'Única escolha'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setShowEstatisticas(e.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Estatísticas">
                              <Eye className="w-4 h-4" />
                            </button>
                            {e.status === 'publicada' && (
                              <button onClick={() => setShowResponder(e.id)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Registrar resposta">
                                <Vote className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleEdit(e)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowDelete(e.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog: Nova/Editar Enquete */}
      <NovaEnqueteDialog
        open={showForm}
        onClose={handleCloseForm}
        onSuccess={() => utils.enquetes.list.invalidate()}
        enquete={editEnquete}
      />

      {/* Dialog: Responder Enquete */}
      <ResponderEnqueteDialog
        open={!!showResponder}
        onClose={() => setShowResponder(null)}
        enqueteId={showResponder}
        onSuccess={() => utils.enquetes.list.invalidate()}
      />

      {/* Dialog: Estatísticas */}
      <Dialog open={!!showEstatisticas} onOpenChange={() => setShowEstatisticas(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Resultados
            </DialogTitle>
            <DialogDescription>
              {estatisticas?.enquete.titulo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="text-sm text-slate-500">
              Total de respostas: <span className="font-semibold text-slate-800">{estatisticas?.totalRespostas ?? 0}</span>
            </div>
            {estatisticas?.opcoes.map((opcao: any) => {
              const pct = estatisticas.totalRespostas > 0
                ? Math.round((opcao.votos / estatisticas.totalRespostas) * 100)
                : 0;
              return (
                <div key={opcao.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">{opcao.texto}</span>
                    <span className="font-medium text-slate-800">{opcao.votos} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar exclusão */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Excluir enquete
            </DialogTitle>
            <DialogDescription>
              Tem certeza? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDelete(null)}>Cancelar</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => showDelete && removeMutation.mutate({ id: showDelete })} disabled={removeMutation.isPending}>
              {removeMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
