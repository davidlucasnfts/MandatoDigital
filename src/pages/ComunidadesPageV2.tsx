import { useState, useMemo } from 'react';
import { BuildingCommunity, Users, MapPin, Plus, Pencil, Trash2, UserCheck, Search } from '@/lib/icons';
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
import { useComunidades, useEleitores } from '@/hooks/useSupabaseData';
import NovaComunidadeDialog from '@/components/NovaComunidadeDialog';
import type { Comunidade } from '@/lib/supabase';

export default function ComunidadesPageV2() {
  const { data: comunidades, loading, fetch, remove } = useComunidades();
  const { data: eleitores } = useEleitores();
  const [novaOpen, setNovaOpen] = useState(false);
  const [editComunidade, setEditComunidade] = useState<Comunidade | null>(null);
  const [preview, setPreview] = useState<Comunidade | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todas');

  const getLiderNome = (liderId: string | null) => {
    if (!liderId) return null;
    return eleitores.find((e) => e.id === liderId)?.nome || '—';
  };

  const stats = useMemo(
    () => ({
      total: comunidades.length,
      comLider: comunidades.filter((c) => c.lider_id).length,
      semLider: comunidades.filter((c) => !c.lider_id).length,
      totalEleitores: comunidades.reduce((acc, c) => acc + (c.total_eleitores || 0), 0),
    }),
    [comunidades]
  );

  const filtered = useMemo(() => {
    let list = [...comunidades];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.nome.toLowerCase().includes(term) ||
          (c.cidade && c.cidade.toLowerCase().includes(term)) ||
          (c.bairro && c.bairro.toLowerCase().includes(term))
      );
    }
    if (tab === 'com-lider') list = list.filter((c) => c.lider_id);
    if (tab === 'sem-lider') list = list.filter((c) => !c.lider_id);
    return list.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [comunidades, search, tab]);

  const handleEdit = (e: React.MouseEvent, c: Comunidade) => {
    e.stopPropagation();
    setPreview(null);
    setEditComunidade(c);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Excluir esta comunidade?')) return;
    await remove(id);
    fetch();
    setPreview(null);
  };

  const handleNovo = () => {
    setEditComunidade(null);
    setNovaOpen(true);
  };

  const formatEndereco = (c: Comunidade) => {
    const parts = [
      c.logradouro,
      c.numero,
      c.bairro,
      c.cidade,
      c.estado,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Comunidades"
        subtitle="Organize grupos e comunidades territoriais."
        icon={BuildingCommunity}
        action={{ label: 'Nova Comunidade', onClick: handleNovo, icon: Plus }}
        delay={0}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total" value={stats.total} icon={BuildingCommunity} color="blue" delay={1} />
        <StatCard label="Com líder" value={stats.comLider} icon={UserCheck} color="green" delay={2} />
        <StatCard label="Sem líder" value={stats.semLider} icon={Users} color="amber" delay={3} />
        <StatCard label="Eleitores vinculados" value={stats.totalEleitores} icon={Users} color="purple" delay={4} />
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome, cidade ou bairro..."
        tabs={[
          { value: 'todas', label: 'Todas', count: comunidades.length },
          { value: 'com-lider', label: 'Com líder', count: stats.comLider },
          { value: 'sem-lider', label: 'Sem líder', count: stats.semLider },
        ]}
        activeTab={tab}
        onTabChange={setTab}
        delay={2}
      />

      {loading ? (
        <SkeletonList count={4} delay={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BuildingCommunity}
          title="Nenhuma comunidade encontrada"
          description={
            search ? 'Tente ajustar os filtros de busca.' : 'Cadastre sua primeira comunidade para começar.'
          }
          action={
            !search
              ? { label: 'Nova Comunidade', onClick: handleNovo }
              : undefined
          }
        />
      ) : (
        <DataList
          items={filtered}
          delay={3}
          onClick={setPreview}
          renderIcon={(c) => ({
            icon: BuildingCommunity,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
          })}
          renderTitle={(c) => (
            <h4 className="text-sm font-semibold text-slate-800">{c.nome}</h4>
          )}
          renderBadges={(c) => (
            <>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.lider_id ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {c.lider_id ? 'Com líder' : 'Sem líder'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                {c.total_eleitores || 0} eleitores
              </span>
            </>
          )}
          renderMeta={(c) => (
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
              <span className="truncate">{formatEndereco(c)}</span>
            </div>
          )}
          actions={[
            { label: 'Editar', icon: Pencil, variant: 'blue', onClick: (e) => handleEdit(e, preview!) },
            { label: 'Excluir', icon: Trash2, variant: 'red', onClick: (e) => preview && handleDelete(e, preview.id) },
          ]}
        />
      )}

      {/* Preview Modal */}
      <ModalPreview isOpen={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <>
            <ModalPreviewHeader
              icon={BuildingCommunity}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              title={preview.nome}
              badges={
                <>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${preview.lider_id ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                    {preview.lider_id ? 'Com líder' : 'Sem líder'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                    {preview.total_eleitores || 0} eleitores
                  </span>
                </>
              }
              description={preview.descricao || undefined}
              onClose={() => setPreview(null)}
            />
            <ModalPreviewGrid>
              <ModalPreviewField label="Cidade">{preview.cidade || '—'}</ModalPreviewField>
              <ModalPreviewField label="Bairro">{preview.bairro || '—'}</ModalPreviewField>
              <ModalPreviewField label="Estado">{preview.estado || '—'}</ModalPreviewField>
              <ModalPreviewField label="CEP">{preview.cep || '—'}</ModalPreviewField>
              <ModalPreviewField label="Líder" className="col-span-2 lg:col-span-3">
                {getLiderNome(preview.lider_id) || 'Nenhum líder vinculado'}
              </ModalPreviewField>
              <ModalPreviewField label="Endereço" className="col-span-2 lg:col-span-3">
                {formatEndereco(preview)}
              </ModalPreviewField>
            </ModalPreviewGrid>
            <ModalPreviewFooter
              onClose={() => setPreview(null)}
              actions={
                <>
                  <button
                    onClick={() => { setPreview(null); setEditComunidade(preview); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Editar
                  </button>
                  <button
                    onClick={(e) => handleDelete(e as any, preview.id)}
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

      <NovaComunidadeDialog
        open={novaOpen || !!editComunidade}
        onClose={() => { setNovaOpen(false); setEditComunidade(null); }}
        onSuccess={fetch}
        comunidade={editComunidade}
      />
    </div>
  );
}
