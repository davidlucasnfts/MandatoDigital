import { useState, useMemo } from 'react';
import { Shield, Plus, Search, Mail, Trash2, AlertTriangle, UserCheck, Users, Crown, Eye, Pencil } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  PageHeader,
  StatCard,
  DataList,
  SkeletonList,
  EmptyState,
  ModalPreview,
  ModalPreviewHeader,
  ModalPreviewFooter,
  ModalPreviewGrid,
  ModalPreviewField,
  SearchFilterBar,
} from '@/components/dashboard';
import { trpc } from '@/providers/trpc';
import { capitalizeWords } from '@/lib/masks';
import { usePermissions } from '@/hooks/usePermissions';

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

const roles: ('admin' | 'editor' | 'visualizador')[] = ['admin', 'editor', 'visualizador'];

export default function EquipePageV2() {
  const { can } = usePermissions();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [form, setForm] = useState({ nome: '', email: '', cargo: '', role: 'editor' as 'admin' | 'editor' | 'visualizador', password: '' });
  const [error, setError] = useState('');

  const utils = trpc.useUtils();
  const { data: membros, isLoading } = trpc.equipe.list.useQuery();
  const createMutation = trpc.equipe.create.useMutation({
    onSuccess: () => {
      setShowAdd(false);
      setForm({ nome: '', email: '', cargo: '', role: 'editor', password: '' });
      utils.equipe.list.invalidate();
    },
    onError: (e) => setError(e.message),
  });
  const updateMutation = trpc.equipe.update.useMutation({
    onSuccess: () => utils.equipe.list.invalidate(),
  });
  const removeMutation = trpc.equipe.remove.useMutation({
    onSuccess: () => {
      setShowDelete(null);
      setPreview(null);
      utils.equipe.list.invalidate();
    },
  });

  const filtered = useMemo(() => {
    let list = [...(membros ?? [])];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((m) => m.nome.toLowerCase().includes(term) || m.email.toLowerCase().includes(term));
    }
    if (tab === 'ativos') list = list.filter((m) => m.status === 'ativo');
    if (tab === 'inativos') list = list.filter((m) => m.status === 'inativo');
    return list.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [membros, search, tab]);

  const stats = useMemo(() => {
    const list = membros ?? [];
    return {
      total: list.length,
      admin: list.filter((m) => m.role === 'admin').length,
      editor: list.filter((m) => m.role === 'editor').length,
      ativos: list.filter((m) => m.status === 'ativo').length,
    };
  }, [membros]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({ ...form, role: form.role });
  };

  const handleDelete = (id: string, userId: string) => {
    removeMutation.mutate({ id, userId });
  };

  const handleRoleChange = (id: string, role: 'admin' | 'editor' | 'visualizador') => {
    updateMutation.mutate({ id, role });
  };

  const handleStatusToggle = (id: string, status: string) => {
    updateMutation.mutate({ id, status: status === 'ativo' ? 'inativo' : 'ativo' });
  };

  const getInitials = (nome: string) =>
    nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const roleActionButtons = (m: any) =>
    roles
      .filter((r) => r !== m.role)
      .map((r) => ({
        label: `Tornar ${roleLabels[r]}`,
        icon: r === 'admin' ? Crown : r === 'editor' ? Pencil : Eye,
        variant: r === 'admin' ? 'purple' : r === 'editor' ? 'blue' : 'slate',
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          handleRoleChange(m.id, r);
        },
      }));

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Equipe"
        subtitle="Gerencie membros e permissões de acesso."
        icon={Shield}
        action={can.manageTeam ? { label: 'Convidar membro', onClick: () => setShowAdd(true), icon: Plus } : undefined}
        delay={0}
      />

      {isLoading ? (
        <SkeletonList count={4} delay={1} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard label="Total" value={stats.total} icon={Users} color="blue" delay={1} />
          <StatCard label="Administradores" value={stats.admin} icon={Crown} color="purple" delay={2} />
          <StatCard label="Editores" value={stats.editor} icon={Pencil} color="blue" delay={3} />
          <StatCard label="Ativos" value={stats.ativos} icon={UserCheck} color="green" delay={4} />
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou e-mail..."
        searchWidth="w-48"
        tabs={[
          { value: 'todos', label: 'Todos', count: stats.total },
          { value: 'ativos', label: 'Ativos', count: stats.ativos },
          { value: 'inativos', label: 'Inativos', count: stats.total - stats.ativos },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        delay={2}
      />

      {isLoading ? (
        <SkeletonList count={4} delay={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum membro encontrado"
          description={search ? 'Tente ajustar os filtros de busca.' : 'Convide seu primeiro membro para a equipe.'}
          action={
            can.manageTeam && !search
              ? { label: 'Convidar membro', onClick: () => setShowAdd(true) }
              : undefined
          }
        />
      ) : (
        <DataList
          items={filtered}
          delay={3}
          onClick={setPreview}
          renderIcon={(m) => ({
            icon: m.role === 'admin' ? Crown : m.role === 'editor' ? Pencil : Eye,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
          })}
          renderTitle={(m) => (
            <h4 className="text-sm font-semibold text-slate-800">{m.nome}</h4>
          )}
          renderBadges={(m) => (
            <>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleColors[m.role]}`}>
                {roleLabels[m.role]}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${m.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                {m.status}
              </span>
            </>
          )}
          renderMeta={(m) => (
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Mail className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                <span className="truncate">{m.email}</span>
              </div>
              {m.cargo && <div className="text-[10px] text-slate-400 truncate">{m.cargo}</div>}
            </div>
          )}
          actions={
            can.manageTeam
              ? [
                  ...roleActionButtons(preview ?? filtered[0]),
                  {
                    label: 'Excluir',
                    icon: Trash2,
                    variant: 'red',
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation();
                      preview ? setShowDelete(preview.id) : setShowDelete(filtered[0].id);
                    },
                  },
                ]
              : undefined
          }
        />
      )}

      {/* Preview Modal */}
      <ModalPreview isOpen={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <>
            <ModalPreviewHeader
              icon={preview.role === 'admin' ? Crown : preview.role === 'editor' ? Pencil : Eye}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              title={preview.nome}
              badges={
                <>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColors[preview.role]}`}>
                    {roleLabels[preview.role]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${preview.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    {preview.status}
                  </span>
                </>
              }
              onClose={() => setPreview(null)}
            />
            <ModalPreviewGrid>
              <ModalPreviewField label="E-mail">{preview.email}</ModalPreviewField>
              <ModalPreviewField label="Cargo">{preview.cargo || '—'}</ModalPreviewField>
              <ModalPreviewField label="Permissão">{roleLabels[preview.role]}</ModalPreviewField>
              <ModalPreviewField label="Status">{preview.status}</ModalPreviewField>
            </ModalPreviewGrid>
            <ModalPreviewFooter
              onClose={() => setPreview(null)}
              actions={
                can.manageTeam
                  ? [
                      ...roleActionButtons(preview).map((btn, i) => (
                        <button
                          key={i}
                          onClick={btn.onClick}
                          className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                            btn.variant === 'purple'
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : btn.variant === 'blue'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-600 text-white hover:bg-slate-700'
                          }`}
                        >
                          <btn.icon className="w-3.5 h-3.5" strokeWidth={2} /> {btn.label}
                        </button>
                      )),
                      <button
                        key="delete"
                        onClick={() => setShowDelete(preview.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Excluir
                      </button>,
                    ]
                  : undefined
              }
            />
          </>
        )}
      </ModalPreview>

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
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: capitalizeWords(e.target.value) })} placeholder="Nome completo" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">E-mail</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Cargo</label>
                <Input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: capitalizeWords(e.target.value) })} placeholder="Assessor, voluntário" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Permissão</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'editor' | 'visualizador' })}
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
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" required />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>
                Cancelar
              </Button>
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
            <DialogDescription>Tem certeza? Esta ação não pode ser desfeita. O usuário perderá acesso imediato.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDelete(null)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                const m = membros?.find((x) => x.id === showDelete);
                if (m) handleDelete(m.id, m.userId);
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
