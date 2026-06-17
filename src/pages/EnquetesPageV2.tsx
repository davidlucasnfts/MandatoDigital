import { useState, useMemo } from 'react';
import {
  BarChart3, Plus, Pencil, Trash2, Send,
  CheckCircle2, XCircle, Clock, FileText, AlertTriangle,
  Archive, RotateCcw, Play, Eye, Link2,
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
import EnviarEnqueteDialog from '@/components/EnviarEnqueteDialog';

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
  arquivada: 'bg-slate-100 text-slate-500',
};

const tabs = [
  { value: 'todas', label: 'Todas' },
  { value: 'publicada', label: 'Publicadas' },
  { value: 'encerrada', label: 'Encerradas' },
  { value: 'arquivada', label: 'Arquivadas' },
];

/* ─── Resultados embutidos no preview ─── */
function ResultadosEnquete({ id }: { id: string }) {
  const { data: estatisticas, isLoading } = trpc.enquetes.estatisticas.useQuery(
    { id },
    { enabled: !!id }
  );

  if (isLoading) {
    return <div className="text-sm text-slate-500 py-4">Carregando resultados...</div>;
  }

  if (!estatisticas || estatisticas.totalRespostas === 0) {
    return (
      <div className="text-center py-6">
        <Eye className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Nenhuma resposta ainda</p>
        <p className="text-xs text-slate-400 mt-1">Compartilhe a enquete para começar a receber respostas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Resultados</span>
        <span className="text-xs text-slate-500">
          {estatisticas.totalRespostas} {estatisticas.totalRespostas === 1 ? 'resposta' : 'respostas'}
        </span>
      </div>
      {estatisticas.opcoes.map((opcao: any) => {
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
    </div>
  );
}

export default function EnquetesPageV2() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todas');
  const [preview, setPreview] = useState<any>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editEnquete, setEditEnquete] = useState<any>(null);
  const [showEnviar, setShowEnviar] = useState(false);
  const [enqueteParaEnviar, setEnqueteParaEnviar] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: enquetes, isLoading } = trpc.enquetes.list.useQuery({});
  const removeMutation = trpc.enquetes.delete.useMutation({
    onSuccess: () => {
      setShowDelete(null);
      setPreview(null);
      utils.enquetes.list.invalidate();
    },
  });
  const updateMutation = trpc.enquetes.update.useMutation({
    onSuccess: () => {
      utils.enquetes.list.invalidate();
    },
    onError: (err) => {
      console.error('Erro ao atualizar status:', err.message);
      alert('Erro: ' + err.message);
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
      arquivadas: list.filter((e) => e.status === 'arquivada').length,
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

  const handleToggleStatus = (enquete: any, novoStatus: string) => {
    updateMutation.mutate({
      id: enquete.id,
      data: { status: novoStatus as any },
    });
  };

  /* Ações do DataList por status */
  const getDataListActions = (e: any) => {
    const actions: any[] = [];

    if (e.status === 'publicada') {
      actions.push({
        label: 'Copiar Link',
        icon: Link2,
        variant: 'purple',
        onClick: (ev: React.MouseEvent) => {
          ev.stopPropagation();
          const url = `${window.location.origin}/enquete/${e.id}`;
          navigator.clipboard.writeText(url);
          alert('Link copiado!');
        },
      });
      actions.push({
        label: 'Encerrar',
        icon: AlertTriangle,
        variant: 'amber',
        onClick: (ev: React.MouseEvent) => {
          ev.stopPropagation();
          handleToggleStatus(e, 'encerrada');
        },
      });
    }

    if (e.status === 'encerrada') {
      actions.push({
        label: 'Reabrir',
        icon: RotateCcw,
        variant: 'green',
        onClick: (ev: React.MouseEvent) => {
          ev.stopPropagation();
          handleToggleStatus(e, 'publicada');
        },
      });
      actions.push({
        label: 'Arquivar',
        icon: Archive,
        variant: 'slate',
        onClick: (ev: React.MouseEvent) => {
          ev.stopPropagation();
          handleToggleStatus(e, 'arquivada');
        },
      });
    }

    if (e.status === 'arquivada') {
      actions.push({
        label: 'Reabrir',
        icon: RotateCcw,
        variant: 'green',
        onClick: (ev: React.MouseEvent) => {
          ev.stopPropagation();
          handleToggleStatus(e, 'publicada');
        },
      });
    }

    actions.push({
      label: 'Editar',
      icon: Pencil,
      variant: 'slate',
      onClick: (ev: React.MouseEvent) => {
        ev.stopPropagation();
        setPreview(null);
        handleEdit(e);
      },
    });

    actions.push({
      label: 'Excluir',
      icon: Trash2,
      variant: 'red',
      onClick: (ev: React.MouseEvent) => {
        ev.stopPropagation();
        setShowDelete(e.id);
      },
    });

    return actions;
  };

  /* Ações do Preview Footer por status */
  const getPreviewActions = (p: any) => {
    const actions: React.ReactNode[] = [];

    if (p.status === 'publicada') {
      actions.push(
        <button
          key="copiar-link"
          onClick={(ev) => { ev.stopPropagation(); const url = `${window.location.origin}/enquete/${p.id}`; navigator.clipboard.writeText(url); alert('Link copiado!'); }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm"
        >
          <Link2 className="w-3.5 h-3.5" strokeWidth={2} /> Copiar Link
        </button>
      );
      actions.push(
        <button
          key="encerrar"
          onClick={(ev) => { ev.stopPropagation(); handleToggleStatus(p, 'encerrada'); }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-lg shadow-sm"
        >
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} /> Encerrar
        </button>
      );
    }

    if (p.status === 'encerrada') {
      actions.push(
        <button
          key="reabrir"
          onClick={(ev) => { ev.stopPropagation(); handleToggleStatus(p, 'publicada'); }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} /> Reabrir
        </button>
      );
      actions.push(
        <button
          key="arquivar"
          onClick={(ev) => { ev.stopPropagation(); handleToggleStatus(p, 'arquivada'); }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 rounded-lg shadow-sm"
        >
          <Archive className="w-3.5 h-3.5" strokeWidth={2} /> Arquivar
        </button>
      );
    }

    if (p.status === 'arquivada') {
      actions.push(
        <button
          key="reabrir"
          onClick={(ev) => { ev.stopPropagation(); handleToggleStatus(p, 'publicada'); }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} /> Reabrir
        </button>
      );
    }

    actions.push(
      <button
        key="editar"
        onClick={(ev) => { ev.stopPropagation(); setPreview(null); handleEdit(p); }}
        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 rounded-lg shadow-sm"
      >
        <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Editar
      </button>
    );

    actions.push(
      <button
        key="excluir"
        onClick={(ev) => { ev.stopPropagation(); setShowDelete(p.id); }}
        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
      >
        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Excluir
      </button>
    );

    return actions;
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
          <StatCard label="Arquivadas" value={stats.arquivadas} icon={Archive} color="slate" delay={4} />
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título..."
        searchWidth="w-56"
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
              {e.createdAt && new Date(e.createdAt).toLocaleDateString('pt-BR')}
            </div>
          )}
          actions={getDataListActions}
        />
      )}

      {/* Preview Modal com Resultados Embutidos */}
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

            {/* Resultados embutidos */}
            <div className="px-4 lg:px-6 pb-2">
              <ResultadosEnquete id={preview.id} />
            </div>

            <ModalPreviewGrid className="!pt-2">
              <ModalPreviewField label="Criada em" className="min-w-0">
                {preview.createdAt ? new Date(preview.createdAt).toLocaleDateString('pt-BR') : '—'}
              </ModalPreviewField>
              <ModalPreviewField label="Tipo" className="min-w-0">
                {preview.permiteMultiplaEscolha ? 'Múltipla escolha' : 'Única escolha'}
              </ModalPreviewField>
            </ModalPreviewGrid>

            <ModalPreviewFooter
              onClose={() => setPreview(null)}
              actions={getPreviewActions(preview)}
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

      {showEnviar && enqueteParaEnviar && (
        <EnviarEnqueteDialog
          open={true}
          onClose={() => { setShowEnviar(false); setEnqueteParaEnviar(null); }}
          enquete={enqueteParaEnviar}
        />
      )}

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
