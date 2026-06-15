import { useState, useMemo } from 'react';
import { BarChart3, FileText, CheckCircle2, TrendingUp, Target, Plus, Eye, Vote, Pencil, Trash2 } from '@/lib/icons';
import { PageHeader, StatCard, SkeletonList, SearchFilterBar, DataList, ModalPreview, ModalPreviewHeader, ModalPreviewGrid, ModalPreviewField, ModalPreviewFooter, EmptyState } from '@/components/dashboard';
import { trpc } from '@/providers/trpc';
import { Button } from '@/components/ui/button';
import NovaEnqueteDialog from '@/components/NovaEnqueteDialog';
import ResponderEnqueteDialog from '@/components/ResponderEnqueteDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle } from '@/lib/icons';

const tabs = [
  { value: 'todas', label: 'Todas' },
  { value: 'publicada', label: 'Publicadas' },
  { value: 'encerrada', label: 'Encerradas' },
  { value: 'rascunho', label: 'Rascunhos' },
];

export default function EnquetesPageV2() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todas');
  const [preview, setPreview] = useState<any>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showResponder, setShowResponder] = useState<string | null>(null);
  const { data: enquetes, isLoading } = trpc.enquetes.list.useQuery({});
  const utils = trpc.useUtils();
  const removeMutation = trpc.enquetes.delete.useMutation({
    onSuccess: () => {
      setShowDelete(null);
      setPreview(null);
      utils.enquetes.list.invalidate();
    },
  });

  const stats = useMemo(() => {
    const list = enquetes ?? [];
    return {
      total: list.length,
      publicadas: list.filter((e) => e.status === 'publicada').length,
      encerradas: list.filter((e) => e.status === 'encerrada').length,
      rascunhos: list.filter((e) => e.status === 'rascunho').length,
    };
  }, [enquetes]);

  const filtered = useMemo(() => {
    if (!enquetes) return [];
    let list = [...enquetes];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((e) => e.titulo.toLowerCase().includes(term));
    }
    if (tab !== 'todas') list = list.filter((e) => e.status === tab);
    return list;
  }, [enquetes, search, tab]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Enquetes"
        subtitle="Crie pesquisas de opinião e acompanhe os resultados."
        icon={BarChart3}
        action={{ label: 'Nova Enquete', onClick: () => setShowForm(true), icon: Plus }}
        delay={0}
      />

      {isLoading ? (
        <SkeletonList count={4} delay={1} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard label="Total" value={stats.total} icon={FileText} color="blue" delay={1} />
          <StatCard label="Publicadas" value={stats.publicadas} icon={CheckCircle2} color="green" delay={2} />
          <StatCard label="Encerradas" value={stats.encerradas} icon={TrendingUp} color="amber" delay={3} />
          <StatCard label="Rascunhos" value={stats.rascunhos} icon={Target} color="blue" delay={4} />
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título..."
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        delay={2}
      />

      {isLoading ? (
        <SkeletonList count={4} delay={3} />
      ) : filtered.length === 0 ? (
        <div className="p-4 bg-amber-50 text-amber-700 rounded-lg">Lista vazia</div>
      ) : (
        <DataList
          items={filtered}
          delay={3}
          onClick={setPreview}
          renderIcon={() => ({ icon: BarChart3, bg: 'bg-blue-50', color: 'text-blue-600' })}
          renderTitle={(e: any) => <h4 className="text-sm font-semibold text-slate-800">{e.titulo}</h4>}
          renderBadges={(e: any) => <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{e.status}</span>}
          actions={(e: any) => [
            { label: 'Resultados', icon: Eye, variant: 'blue', onClick: (ev: any) => { ev.stopPropagation(); } },
            ...(e.status === 'publicada'
              ? [{ label: 'Votar', icon: Vote, variant: 'green', onClick: (ev: any) => { ev.stopPropagation(); setShowResponder(e.id); } } as any]
              : []),
            { label: 'Editar', icon: Pencil, variant: 'slate', onClick: (ev: any) => { ev.stopPropagation(); } },
            { label: 'Excluir', icon: Trash2, variant: 'red', onClick: (ev: any) => { ev.stopPropagation(); setShowDelete(e.id); } },
          ]}
        />
      )}

      <ModalPreview isOpen={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <>
            <ModalPreviewHeader
              icon={BarChart3}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              title={preview.titulo}
              badges={<span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{preview.status}</span>}
              onClose={() => setPreview(null)}
            />
            <ModalPreviewGrid>
              <ModalPreviewField label="Tipo">{preview.permiteMultiplaEscolha ? 'Múltipla' : 'Única'}</ModalPreviewField>
            </ModalPreviewGrid>
            <ModalPreviewFooter onClose={() => setPreview(null)} />
          </>
        )}
      </ModalPreview>

      <NovaEnqueteDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => utils.enquetes.list.invalidate()}
      />

      <ResponderEnqueteDialog
        open={!!showResponder}
        onClose={() => setShowResponder(null)}
        enqueteId={showResponder}
        onSuccess={() => utils.enquetes.list.invalidate()}
      />

      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Excluir enquete
            </DialogTitle>
            <DialogDescription>Tem certeza? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDelete(null)}>Cancelar</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => showDelete && removeMutation.mutate({ id: showDelete })} disabled={removeMutation.isPending}>
              {removeMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="p-4 bg-green-50 text-green-700 rounded-lg">Teste com exclusão</div>
    </div>
  );
}
