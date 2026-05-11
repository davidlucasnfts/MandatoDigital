import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Search, Mail, X, ChevronDown, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { trpc } from '@/providers/trpc';
import { capitalizeWords } from '@/lib/masks';
import { usePermissions } from '@/hooks/usePermissions';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  visualizador: 'bg-slate-100 text-slate-600',
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  visualizador: 'Visualizador',
};

export default function EquipePage() {
  const { can } = usePermissions();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', cargo: '', role: 'editor' as 'admin' | 'editor' | 'visualizador', password: '' });
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const { data: membros, isLoading } = trpc.equipe.list.useQuery();
  const createMutation = trpc.equipe.create.useMutation({
    onSuccess: () => { setShowAdd(false); setForm({ nome: '', email: '', cargo: '', role: 'editor', password: '' }); utils.equipe.list.invalidate(); },
    onError: (e) => setError(e.message),
  });
  const updateMutation = trpc.equipe.update.useMutation({
    onSuccess: () => utils.equipe.list.invalidate(),
  });
  const removeMutation = trpc.equipe.remove.useMutation({
    onSuccess: () => { setShowDelete(null); utils.equipe.list.invalidate(); },
  });

  const filtered = membros?.filter(m =>
    !search || m.nome.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    createMutation.mutate({ ...form, role: form.role as 'admin' | 'editor' | 'visualizador' });
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Equipe
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} membros</p>
          </div>
          {can.manageTeam && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Convidar
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar membro..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>
      </motion.div>

      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {can.manageTeam && <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Ações</th>}
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Membro</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Cargo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Permissão</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={can.manageTeam ? 5 : 4} className="py-8 text-center text-slate-400">Carregando...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={can.manageTeam ? 5 : 4} className="py-8 text-center text-slate-400">Nenhum membro encontrado</td></tr>
                  ) : (
                    filtered.map((m) => (
                      <tr key={m.id} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors">
                        {can.manageTeam && (
                          <td className="py-3 px-2">
                            <button
                              onClick={(ev) => { ev.stopPropagation(); setShowDelete(m.id); }}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-3 h-3" />Excluir
                            </button>
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">{m.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{m.nome}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {m.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{m.cargo || '-'}</td>
                        <td className="py-3 px-4">
                          {can.manageTeam ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={`text-xs px-2 py-1 rounded-full font-medium capitalize inline-flex items-center gap-1 ${roleColors[m.role]}`}>
                                  {roleLabels[m.role]} <ChevronDown className="w-3 h-3" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {(['admin', 'editor', 'visualizador'] as const).map(r => (
                                  <DropdownMenuItem key={r} onClick={() => updateMutation.mutate({ id: m.id, role: r })}>
                                    {roleLabels[r]}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleColors[m.role]}`}>{roleLabels[m.role]}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {can.manageTeam ? (
                            <button
                              onClick={() => updateMutation.mutate({ id: m.id, status: m.status === 'ativo' ? 'inativo' : 'ativo' })}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${m.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}
                            >
                              {m.status}
                            </button>
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                              {m.status}
                            </span>
                          )}
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

      {/* Dialog: Adicionar membro */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar membro</DialogTitle>
            <DialogDescription>Cadastre um novo membro para sua equipe.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Nome completo</label>
                <Input value={form.nome} onChange={e => setForm({ ...form, nome: capitalizeWords(e.target.value) })} placeholder="Nome completo" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">E-mail</label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Cargo</label>
                <Input value={form.cargo} onChange={e => setForm({ ...form, cargo: capitalizeWords(e.target.value) })} placeholder="Assessor, voluntário" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Permissão</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'editor' | 'visualizador' })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="editor">Editor (ler e escrever)</option>
                  <option value="visualizador">Visualizador (só ler)</option>
                  <option value="admin">Administrador (tudo)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Senha temporária</label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-blue-600" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Criando...' : 'Convidar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar exclusão */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Remover membro
            </DialogTitle>
            <DialogDescription>
              Tem certeza? Esta ação não pode ser desfeita. O usuário perderá acesso imediato.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDelete(null)}>Cancelar</Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                const m = filtered.find(x => x.id === showDelete);
                if (m) removeMutation.mutate({ id: m.id, userId: m.userId });
              }}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
