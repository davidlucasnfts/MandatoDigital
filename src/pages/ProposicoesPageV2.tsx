import { useState, useMemo } from 'react';
import { FileText, Plus, Search, Trash2, AlertTriangle, Eye, Gavel, CheckCircle2, XCircle, Clock, ArrowRight } from '@/lib/icons';
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
import { useNavigate } from 'react-router-dom';

const tipoLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei',
  emenda: 'Emenda',
  indicacao: 'Indicação',
  requerimento: 'Requerimento',
  parecer: 'Parecer',
  mocao: 'Moção',
  decreto: 'Decreto',
};

const tipoColors: Record<string, string> = {
  projeto_lei: 'bg-blue-100 text-blue-700',
  emenda: 'bg-amber-100 text-amber-700',
  indicacao: 'bg-emerald-100 text-emerald-700',
  requerimento: 'bg-violet-100 text-violet-700',
  parecer: 'bg-rose-100 text-rose-700',
  mocao: 'bg-cyan-100 text-cyan-700',
  decreto: 'bg-orange-100 text-orange-700',
};

const statusLabels: Record<string, string> = {
  em_elaboracao: 'Em elaboração',
  protocolado: 'Protocolado',
  em_tramitacao: 'Em tramitação',
  em_comissao: 'Em comissão',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  sancionado: 'Sancionado',
  arquivado: 'Arquivado',
  veteado: 'Vetado',
  retirado: 'Retirado',
};

const statusColors: Record<string, string> = {
  em_elaboracao: 'bg-slate-100 text-slate-600',
  protocolado: 'bg-blue-50 text-blue-600',
  em_tramitacao: 'bg-amber-50 text-amber-600',
  em_comissao: 'bg-purple-50 text-purple-600',
  aprovado: 'bg-green-50 text-green-600',
  rejeitado: 'bg-red-50 text-red-600',
  sancionado: 'bg-emerald-50 text-emerald-600',
  arquivado: 'bg-gray-100 text-gray-500',
  veteado: 'bg-orange-50 text-orange-600',
  retirado: 'bg-stone-100 text-stone-500',
};

const tabs = [
  { value: 'todas', label: 'Todas' },
  { value: 'tramitacao', label: 'Em tramitação' },
  { value: 'aprovado', label: 'Aprovadas' },
  { value: 'rejeitado', label: 'Rejeitadas' },
];

export default function ProposicoesPageV2() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todas');
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  const utils = trpc.useUtils();
  const { data: proposicoes, isLoading } = trpc.proposicoes.list.useQuery({});
  const removeMutation = trpc.proposicoes.delete.useMutation({
    onSuccess: () => {
      setShowDelete(null);
      setPreview(null);
      utils.proposicoes.list.invalidate();
    },
  });

  const filtered = useMemo(() => {
    if (!proposicoes) return [];
    let list = [...proposicoes];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.titulo.toLowerCase().includes(term) ||
          (p.ementa?.toLowerCase().includes(term)) ||
          (p.numero?.toLowerCase().includes(term))
      );
    }
    if (tab === 'tramitacao') {
      list = list.filter((p) => ['em_elaboracao', 'protocolado', 'em_tramitacao', 'em_comissao'].includes(p.status));
    }
    if (tab === 'aprovado') list = list.filter((p) => p.status === 'aprovado');
    if (tab === 'rejeitado') list = list.filter((p) => ['rejeitado', 'arquivado', 'retirado', 'veteado'].includes(p.status));
    return list.sort((a, b) => (b.ano || 0) - (a.ano || 0));
  }, [proposicoes, search, tab]);

  const stats = useMemo(() => {
    const list = proposicoes ?? [];
    return {
      total: list.length,
      aprovadas: list.filter((p) => p.status === 'aprovado').length,
      rejeitadas: list.filter((p) => ['rejeitado', 'arquivado', 'retirado', 'veteado'].includes(p.status)).length,
      tramitacao: list.filter((p) => ['em_elaboracao', 'protocolado', 'em_tramitacao', 'em_comissao'].includes(p.status)).length,
    };
  }, [proposicoes]);

  const handleVer = (id: string) => {
    setPreview(null);
    navigate(`/dashboard/proposicoes/${id}`);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Proposições"
        subtitle="Acompanhe a produção legislativa."
        icon={Gavel}
        action={{ label: 'Nova Proposição', onClick: () => navigate('/dashboard/proposicoes/nova'), icon: Plus }}
        delay={0}
      />

      {isLoading ? (
        <SkeletonList count={4} delay={1} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard label="Total" value={stats.total} icon={FileText} color="blue" delay={1} />
          <StatCard label="Em tramitação" value={stats.tramitacao} icon={Clock} color="amber" delay={2} />
          <StatCard label="Aprovadas" value={stats.aprovadas} icon={CheckCircle2} color="green" delay={3} />
          <StatCard label="Rejeitadas" value={stats.rejeitadas} icon={XCircle} color="red" delay={4} />
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por título, ementa ou número..."
        searchWidth="w-56"
        tabs={[
          { value: 'todas', label: 'Todas', count: stats.total },
          { value: 'em-tramitacao', label: 'Em tramitação', count: stats.emTramitacao },
          { value: 'aprovadas', label: 'Aprovadas', count: stats.aprovadas },
          { value: 'rejeitadas', label: 'Rejeitadas', count: stats.rejeitadas },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        delay={2}
      />

      {isLoading ? (
        <SkeletonList count={4} delay={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Gavel}
          title="Nenhuma proposição encontrada"
          description={search ? 'Tente ajustar os filtros de busca.' : 'Cadastre sua primeira proposição.'}
          action={!search ? { label: 'Nova Proposição', onClick: () => navigate('/dashboard/proposicoes/nova') } : undefined}
        />
      ) : (
        <DataList
          items={filtered}
          delay={3}
          onClick={setPreview}
          renderIcon={(p) => ({
            icon: FileText,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
          })}
          renderTitle={(p) => (
            <h4 className="text-sm font-semibold text-slate-800 break-all line-clamp-2">{p.titulo}</h4>
          )}
          renderBadges={(p) => (
            <>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tipoColors[p.tipo] || 'bg-slate-100 text-slate-600'}`}>
                {tipoLabels[p.tipo] || p.tipo}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-slate-100 text-slate-600'}`}>
                {statusLabels[p.status] || p.status}
              </span>
            </>
          )}
          renderMeta={(p) => (
            <div className="text-[10px] text-slate-400">
              {p.numero && <span>Nº {p.numero}{p.ano ? `/${p.ano}` : ''}</span>}
              {p.orgaoAtual && <span className="ml-2">• {p.orgaoAtual}</span>}
            </div>
          )}
          actions={[
            {
              label: 'Ver',
              icon: Eye,
              variant: 'blue',
              onClick: (e) => {
                e.stopPropagation();
                handleVer(preview?.id || filtered[0].id);
              },
            },
            {
              label: 'Excluir',
              icon: Trash2,
              variant: 'red',
              onClick: (e) => {
                e.stopPropagation();
                setShowDelete(preview?.id || filtered[0].id);
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
              icon={FileText}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              title={preview.titulo}
              badges={
                <>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tipoColors[preview.tipo] || 'bg-slate-100 text-slate-600'}`}>
                    {tipoLabels[preview.tipo] || preview.tipo}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[preview.status] || 'bg-slate-100 text-slate-600'}`}>
                    {statusLabels[preview.status] || preview.status}
                  </span>
                </>
              }
              description={preview.ementa || undefined}
              onClose={() => setPreview(null)}
            />
            <ModalPreviewGrid>
              <ModalPreviewField label="Número">{preview.numero ? `Nº ${preview.numero}${preview.ano ? `/${preview.ano}` : ''}` : '—'}</ModalPreviewField>
              <ModalPreviewField label="Ano">{preview.ano || '—'}</ModalPreviewField>
              <ModalPreviewField label="Data de apresentação">
                {preview.dataApresentacao ? new Date(preview.dataApresentacao).toLocaleDateString('pt-BR') : '—'}
              </ModalPreviewField>
              <ModalPreviewField label="Órgão atual">{preview.orgaoAtual || '—'}</ModalPreviewField>
              <ModalPreviewField label="Relator">{preview.relator || '—'}</ModalPreviewField>
              <ModalPreviewField label="Tema">{preview.tema || '—'}</ModalPreviewField>
            </ModalPreviewGrid>
            <ModalPreviewFooter
              onClose={() => setPreview(null)}
              actions={
                <>
                  <button
                    onClick={() => handleVer(preview.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={2} /> Ver detalhes
                  </button>
                  <button
                    onClick={() => setShowDelete(preview.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Excluir
                  </button>
                </>
              }
            />
          </>
        )}
      </ModalPreview>

      {/* Dialog: Confirmar exclusão */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Excluir proposição
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
