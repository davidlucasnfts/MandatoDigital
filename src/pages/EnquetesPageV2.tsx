import { useState, useMemo } from 'react';
import {
  BarChart3, Plus, Eye, Vote, Pencil, Trash2,
  CheckCircle2, XCircle, Clock, FileText, AlertTriangle,
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
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
import NovaEnqueteDialog from '@/components/NovaEnqueteDialog';
import ResponderEnqueteDialog from '@/components/ResponderEnqueteDialog';

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

const tabs = [
  { value: 'todas', label: 'Todas' },
  { value: 'publicada', label: 'Publicadas' },
  { value: 'encerrada', label: 'Encerradas' },
  { value: 'rascunho', label: 'Rascunhos' },
];

function EstatisticasContent({ id }: { id: string | null }) {
  const { data: estatisticas, isLoading } = trpc.enquetes.estatisticas.useQuery(
    { id: id! },
    { enabled: !!id }
  );

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" strokeWidth={2} />
          Resultados
        </DialogTitle>
        <DialogDescription className="break-all">
          {isLoading ? 'Carregando...' : estatisticas?.enquete.titulo}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <div className="text-sm text-slate-500">Carregando resultados...</div>
        ) : (
          <>
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
                    <span className="text-slate-700 break-all">{opcao.texto}</span>
                    <span className="font-medium text-slate-800">{opcao.votos} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </DialogContent>
  );
}

export default function EnquetesPageV2() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todas');
  const [preview, setPreview] = useState<any>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editEnquete, setEditEnquete] = useState<any>(null);
  const [showResponder, setShowResponder] = useState<string | null>(null);
  const [showEstatisticas, setShowEstatisticas] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: enquetes, isLoading } = trpc.enquetes.list.useQuery({});
  const removeMutation = trpc.enquetes.delete.useMutation({
    onSuccess: () => {
      setShowDelete(null);
      setPreview(null);
      utils.enquetes.list.invalidate();
    },
  });

  const filtered = useMemo(() => {
    if (!enquetes) return [];
    let list = [...enquetes];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.titulo.toLowerCase().includes(term) ||
          (e.descricao?.toLowerCase().includes(term))
      );
    }
    if (tab !== 'todas') list = list.filter((e) => e.status === tab);
    return list.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [enquetes, search, tab]);

  const stats = useMemo(() => {
    const list = enquetes ?? [];
    return {
      total: list.length,
      publicadas: list.filter((e) => e.status === 'publicada').length,
      encerradas: list.filter((e) => e.status === 'encerrada').length,
      rascunhos: list.filter((e) => e.status === 'rascunho').length,
    };
  }, [enquetes]);

  const handleEdit = (enquete: any) => {
    setEditEnquete(enquete);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditEnquete(null);
  };

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
          <StatCard label="Encerradas" value={stats.encerradas} icon={Clock} color="amber" delay={3} />
          <StatCard label="Rascunhos" value={stats.rascunhos} icon={XCircle} color="slate" delay={4} />
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
        <EmptyState
          icon={BarChart3}
          title="Nenhuma enquete encontrada"
          description={search ? 'Tente ajustar os filtros de busca.' : 'Crie sua primeira enquete para começar.'}
          action={!search ? { label: 'Nova Enquete', onClick: () => setShowForm(true) } : undefined}
        />
      ) : (
        <DataList
          items={filtered}
          delay={3}
          onClick={setPreview}
          renderIcon={() => ({
            icon: BarChart3,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
          })}
          renderTitle={(e: any) => (
            <h4 className="text-sm font-semibold text-slate-800 break-all line-clamp-2">{e.titulo}</h4>
          )}
          renderBadges={(e: any) => (
            <>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[e.status] || 'bg-slate-100 text-slate-600'}`}>
                {statusLabels[e.status] || e.status}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                {e.permiteMultiplaEscolha ? 'Múltipla escolha' : 'Única escolha'}
              </span>
            </>
          )}
          renderMeta={(e: any) => (
            <div className="text-[10px] text-slate-400">
              {e.dataPublicacao && (
                <span>
                  {new Date(e.dataPublicacao).toLocaleDateString('pt-BR')}
                  {e.dataEncerramento && ` → ${new Date(e.dataEncerramento).toLocaleDateString('pt-BR')}`}
                </span>
              )}
            </div>
          )}
          actions={(e: any) => [
            {
              label: 'Resultados',
              icon: Eye,
              variant: 'blue',
              onClick: (ev: React.MouseEvent) => {
                ev.stopPropagation();
                setShowEstatisticas(e.id);
              },
            },
            ...(e.status === 'publicada'
              ? [
                  {
                    label: 'Votar',
                    icon: Vote,
                    variant: 'green',
                    onClick: (ev: React.MouseEvent) => {
                      ev.stopPropagation();
                      setShowResponder(e.id);
                    },
                  } as any,
                ]
              : []),
            {
              label: 'Editar',
              icon: Pencil,
              variant: 'slate',
              onClick: (ev: React.MouseEvent) => {
                ev.stopPropagation();
                setPreview(null);
                handleEdit(e);
              },
            },
            {
              label: 'Excluir',
              icon: Trash2,
              variant: 'red',
              onClick: (ev: React.MouseEvent) => {
                ev.stopPropagation();
                setShowDelete(e.id);
              },
            },
          ]}
        />
      )}

      {/* Preview Modal */}
      <ModalPreview isOpen={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <>
            <ModalPreviewHeader
              icon={BarChart3}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              title={preview.titulo}
              badges={
                <>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[preview.status] || 'bg-slate-100 text-slate-600'}`}>
                    {statusLabels[preview.status] || preview.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                    {preview.permiteMultiplaEscolha ? 'Múltipla escolha' : 'Única escolha'}
                  </span>
                </>
              }
              description={preview.descricao || undefined}
              onClose={() => setPreview(null)}
            />
            <ModalPreviewGrid>
              <ModalPreviewField label="Publicação">
                {preview.dataPublicacao ? new Date(preview.dataPublicacao).toLocaleDateString('pt-BR') : '—'}
              </ModalPreviewField>
              <ModalPreviewField label="Encerramento">
                {preview.dataEncerramento ? new Date(preview.dataEncerramento).toLocaleDateString('pt-BR') : '—'}
              </ModalPreviewField>
              <ModalPreviewField label="Tipo" className="col-span-2">
                {preview.permiteMultiplaEscolha ? 'Múltipla escolha' : 'Única escolha'}
              </ModalPreviewField>
            </ModalPreviewGrid>
            <ModalPreviewFooter
              onClose={() => setPreview(null)}
              actions={
                <>
                  <button
                    onClick={(ev) => { ev.stopPropagation(); setShowEstatisticas(preview.id); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={2} /> Resultados
                  </button>
                  {preview.status === 'publicada' && (
                    <button
                      onClick={(ev) => { ev.stopPropagation(); setShowResponder(preview.id); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm"
                    >
                      <Vote className="w-3.5 h-3.5" strokeWidth={2} /> Votar
                    </button>
                  )}
                  <button
                    onClick={(ev) => { ev.stopPropagation(); setPreview(null); handleEdit(preview); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 rounded-lg shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Editar
                  </button>
                  <button
                    onClick={(ev) => { ev.stopPropagation(); setShowDelete(preview.id); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Excluir
                  </button>
                </>
              }
            />
          </>
        )}
      </ModalPreview>

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
        <EstatisticasContent id={showEstatisticas} />
      </Dialog>

      {/* Dialog: Confirmar exclusão */}
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
            <Button variant="outline" className="flex-1" onClick={() => setShowDelete(null)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => showDelete && removeMutation.mutate({ id: showDelete })}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
