import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, TrendingUp, Users, Target, Zap,
  MapPin, Building2, Filter, Medal, Pencil, Check, X,
  Search, ChevronDown
} from '@/lib/icons';
import { PanelCard, EmptyState } from '@/components/dashboard';
import { Input } from '@/components/ui/input';
import { trpc } from '@/providers/trpc';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

const statusMetaColors: Record<string, { bg: string; text: string; label: string }> = {
  atingida: { bg: 'bg-green-100', text: 'text-green-700', label: 'Meta atingida' },
  em_andamento: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Em andamento' },
  abaixo: { bg: 'bg-red-100', text: 'text-red-700', label: 'Abaixo da meta' },
};

type Ordenacao = 'ranking' | 'nome' | 'estimativa' | 'vinculados' | 'conversao';

export default function LideresProdutividadePage() {
  const { data, isLoading, refetch } = trpc.lideres.produtividade.useQuery();
  const atualizarEstimativa = trpc.lideres.atualizarEstimativa.useMutation({ onSuccess: () => refetch() });

  const [busca, setBusca] = useState('');
  const [liderSelecionado, setLiderSelecionado] = useState<any>(null);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('ranking');
  const [filtroComunidade, setFiltroComunidade] = useState<string | null>(null);
  const [filtroBairro, setFiltroBairro] = useState<string | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [editandoEstimativa, setEditandoEstimativa] = useState<string | null>(null);
  const [novaEstimativa, setNovaEstimativa] = useState('');

  const lideresFiltrados = useMemo(() => {
    let lista = data?.lideres || [];
    if (busca) lista = lista.filter(l => l.nome.toLowerCase().includes(busca.toLowerCase()));
    if (filtroComunidade) lista = lista.filter(l => l.comunidade_id === filtroComunidade);
    if (filtroBairro) lista = lista.filter(l => l.bairro === filtroBairro);
    switch (ordenacao) {
      case 'ranking': lista = [...lista].sort((a, b) => a.ranking - b.ranking); break;
      case 'nome': lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome)); break;
      case 'estimativa': lista = [...lista].sort((a, b) => (b.estimativa_votos || 0) - (a.estimativa_votos || 0)); break;
      case 'vinculados': lista = [...lista].sort((a, b) => b.eleitores_vinculados - a.eleitores_vinculados); break;
      case 'conversao': lista = [...lista].sort((a, b) => b.taxa_conversao - a.taxa_conversao); break;
    }
    return lista;
  }, [data?.lideres, busca, filtroComunidade, filtroBairro, ordenacao]);

  const totais = data?.totais;
  const filtros = data?.filtros;
  const temFiltros = !!(filtroComunidade || filtroBairro);
  const top3 = data?.lideres?.slice(0, 3) || [];

  const colorMap = {
    blue: { border: 'border-t-blue-600', bg: 'bg-blue-50', icon: 'text-blue-600' },
    green: { border: 'border-t-green-600', bg: 'bg-green-50', icon: 'text-green-600' },
    amber: { border: 'border-t-amber-600', bg: 'bg-amber-50', icon: 'text-amber-600' },
    purple: { border: 'border-t-purple-600', bg: 'bg-purple-50', icon: 'text-purple-600' },
    red: { border: 'border-t-red-600', bg: 'bg-red-50', icon: 'text-red-600' },
  };

  const stats = [
    { label: 'Total de Líderes', value: totais?.total_lideres ?? 0, icon: Crown, color: 'purple' as const },
    { label: 'Estimativa Total', value: totais?.total_estimativa ?? 0, icon: Target, color: 'blue' as const },
    { label: 'Eleitores Vinculados', value: totais?.total_vinculados ?? 0, icon: Users, color: 'green' as const },
    { label: 'Média de Conversão', value: `${totais?.media_conversao ?? 0}%`, icon: TrendingUp, color: 'amber' as const },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />Líderes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              {lideresFiltrados.length} líderes · Estimativa de votos vs. eleitores mobilizados
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {stats.map((stat, i) => {
          const colors = colorMap[stat.color];
          return (
            <motion.div key={stat.label} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
              <div className={`rounded-xl border border-slate-200 bg-white border-t-[3px] ${colors.border} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-3 lg:p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${colors.icon}`} />
                  </div>
                </div>
                <div className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                  {isLoading ? '...' : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-[10px] lg:text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Podium - Top 3 */}
      {top3.length > 0 && (
        <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
          <PanelCard title="Top 3 Líderes" icon={Medal} iconColor="text-amber-600" iconBg="bg-amber-50" delay={5}>
            <div className="grid grid-cols-3 gap-3">
              {top3.map((lider, i) => {
                const posicoes = [
                  { bg: 'bg-yellow-50', border: 'border-yellow-400', iconColor: 'text-yellow-500', label: '1º', rankColor: 'text-yellow-600', bar: 'bg-yellow-500' },
                  { bg: 'bg-slate-50', border: 'border-slate-400', iconColor: 'text-slate-400', label: '2º', rankColor: 'text-slate-600', bar: 'bg-slate-400' },
                  { bg: 'bg-orange-50', border: 'border-orange-400', iconColor: 'text-orange-600', label: '3º', rankColor: 'text-orange-700', bar: 'bg-orange-500' },
                ];
                const pos = posicoes[i];
                return (
                  <div key={lider.id} className={`${pos.bg} border-2 ${pos.border} rounded-xl p-3 text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      <Medal className={`w-4 h-4 ${pos.iconColor}`} />
                      <span className="text-xs font-medium text-slate-500">{pos.label}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm mt-1 truncate">{lider.nome}</p>
                    <p className={`text-xl font-bold ${pos.rankColor}`}>{lider.taxa_conversao}%</p>
                    <p className="text-[10px] text-slate-500">{lider.eleitores_vinculados}/{lider.estimativa_votos || 0}</p>
                    <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <div className={`h-full ${pos.bar} rounded-full`} style={{ width: `${Math.min(100, lider.progresso)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </PanelCard>
        </motion.div>
      )}

      {/* Filtros */}
      <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
        <PanelCard
          title="Filtros"
          icon={Filter}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          action={{ label: mostrarFiltros ? 'Ocultar' : 'Mostrar', onClick: () => setMostrarFiltros(!mostrarFiltros) }}
          delay={6}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar líder por nome..."
                className="pl-9 h-10"
              />
            </div>
            {temFiltros && (
              <button
                onClick={() => { setFiltroComunidade(null); setFiltroBairro(null); }}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />Limpar filtros
              </button>
            )}
          </div>

          {mostrarFiltros && (
            <div className="space-y-3 pt-3 mt-3 border-t border-slate-100">
              {/* Ordenação */}
              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Ordenar por</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'ranking' as Ordenacao, label: 'Ranking' },
                    { key: 'nome' as Ordenacao, label: 'Nome' },
                    { key: 'estimativa' as Ordenacao, label: 'Estimativa' },
                    { key: 'vinculados' as Ordenacao, label: 'Vinculados' },
                    { key: 'conversao' as Ordenacao, label: 'Conversão' },
                  ].map(o => (
                    <button
                      key={o.key}
                      onClick={() => setOrdenacao(o.key)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${ordenacao === o.key ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro Comunidade */}
              {filtros?.comunidades && filtros.comunidades.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Comunidade</h4>
                  <div className="flex flex-wrap gap-1">
                    {filtros.comunidades.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => setFiltroComunidade(filtroComunidade === c.id ? null : c.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${filtroComunidade === c.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.cor || '#94a3b8' }} />
                        {c.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro Bairro */}
              {filtros?.bairros && filtros.bairros.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Bairro</h4>
                  <div className="flex flex-wrap gap-1">
                    {filtros.bairros.map((b: string) => (
                      <button
                        key={b}
                        onClick={() => setFiltroBairro(filtroBairro === b ? null : b)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${filtroBairro === b ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </PanelCard>
      </motion.div>

      {/* Preview do Líder Selecionado */}
      {liderSelecionado && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                    liderSelecionado.ranking === 1 ? 'bg-yellow-100' :
                    liderSelecionado.ranking === 2 ? 'bg-slate-100' :
                    liderSelecionado.ranking === 3 ? 'bg-orange-100' :
                    'bg-purple-100'
                  }`}>
                    <span className={`font-bold text-lg lg:text-xl ${
                      liderSelecionado.ranking === 1 ? 'text-yellow-600' :
                      liderSelecionado.ranking === 2 ? 'text-slate-600' :
                      liderSelecionado.ranking === 3 ? 'text-orange-600' :
                      'text-purple-600'
                    }`}>#{liderSelecionado.ranking}</span>
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-800">{liderSelecionado.nome}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {(() => {
                        const status = statusMetaColors[liderSelecionado.status_meta] || statusMetaColors.abaixo;
                        return <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>{status.label}</span>;
                      })()}
                      <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full font-medium">
                        {liderSelecionado.eleitores_vinculados} afiliados
                      </span>
                    </div>
                  </div>
                </div>
                {/* Ações */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditandoEstimativa(liderSelecionado.id);
                      setNovaEstimativa(liderSelecionado.estimativa_votos ? String(liderSelecionado.estimativa_votos) : '');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                  >
                    <Pencil className="w-3.5 h-3.5" />Editar Meta
                  </button>
                </div>
              </div>
            </div>

            {/* Métricas em Grid + Localização */}
            <div className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Estimativa */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3" />Estimativa
                </h4>
                {editandoEstimativa === liderSelecionado.id ? (
                  <div className="flex items-center gap-1">
                    <Input type="number" value={novaEstimativa} onChange={e => setNovaEstimativa(e.target.value)} className="w-16 h-7 text-xs" min={0} autoFocus />
                    <button onClick={() => { atualizarEstimativa.mutate({ liderId: liderSelecionado.id, estimativaVotos: novaEstimativa ? parseInt(novaEstimativa) : null }); setEditandoEstimativa(null); }} className="text-green-600 hover:text-green-700"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditandoEstimativa(null)} className="text-red-600 hover:text-red-700"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-blue-600">{liderSelecionado.estimativa_votos || 0}</div>
                )}
              </div>

              {/* Vinculados */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3" />Vinculados
                </h4>
                <div className="text-xl font-bold text-green-600">{liderSelecionado.eleitores_vinculados}</div>
              </div>

              {/* Conversão + Progresso */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />Conversão
                </h4>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold text-amber-600">{liderSelecionado.taxa_conversao}%</div>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                    <div className={`h-full rounded-full transition-all ${liderSelecionado.progresso >= 100 ? 'bg-green-500' : liderSelecionado.progresso >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${liderSelecionado.progresso}%` }} />
                  </div>
                </div>
              </div>

              {/* Local */}
              <div className="col-span-2 lg:col-span-3 flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                {liderSelecionado.comunidade_nome && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Building2 className="w-3 h-3 text-slate-400" />{liderSelecionado.comunidade_nome}
                  </div>
                )}
                {liderSelecionado.bairro && (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />{liderSelecionado.bairro}{liderSelecionado.cidade ? `, ${liderSelecionado.cidade}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <div className="flex justify-center">
            <button onClick={() => setLiderSelecionado(null)} className="flex items-center gap-1 px-4 py-2 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4" />Fechar
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabela de Líderes */}
      <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
        <PanelCard title="Lista de Líderes" icon={Crown} iconColor="text-purple-600" iconBg="bg-purple-50" badge={lideresFiltrados.length} delay={7}>
          <div className="overflow-x-auto -mx-4 lg:-mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Ranking</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Líder</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Local</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Meta</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Progresso</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td colSpan={6} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : lideresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8">
                      <EmptyState icon={Crown} title="Nenhum líder encontrado" description="Ajuste os filtros ou cadastre um novo líder" />
                    </td>
                  </tr>
                ) : (
                  lideresFiltrados.map(lider => {
                    const statusMeta = statusMetaColors[lider.status_meta] || statusMetaColors.abaixo;
                    return (
                      <tr key={lider.id} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => setLiderSelecionado(liderSelecionado?.id === lider.id ? null : lider)}>
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            lider.ranking === 1 ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-400' :
                            lider.ranking === 2 ? 'bg-slate-100 text-slate-500 border-2 border-slate-400' :
                            lider.ranking === 3 ? 'bg-orange-100 text-orange-600 border-2 border-orange-400' :
                            'bg-slate-50 text-slate-400'
                          }`}>{lider.ranking}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Crown className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{lider.nome}</div>
                              {lider.comunidade_nome && (
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Building2 className="w-3 h-3" style={{ color: lider.comunidade_cor || '#94a3b8' }} />{lider.comunidade_nome}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs hidden sm:table-cell">
                          {lider.cidade || '—'}{lider.bairro && <div className="text-[10px] text-slate-400">{lider.bairro}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-800">{lider.eleitores_vinculados}</span>
                            <span className="mx-1">/</span>
                            {editandoEstimativa === lider.id ? (
                              <div className="flex items-center gap-1 mt-1">
                                <Input type="number" value={novaEstimativa} onChange={e => setNovaEstimativa(e.target.value)} className="w-14 h-5 text-[10px] px-1 py-0" min={0}
                                  onKeyDown={e => { if (e.key === 'Enter') { atualizarEstimativa.mutate({ liderId: lider.id, estimativaVotos: novaEstimativa ? parseInt(novaEstimativa) : null }); setEditandoEstimativa(null); } }}
                                  onClick={e => e.stopPropagation()}
                                />
                                <button onClick={e => { e.stopPropagation(); atualizarEstimativa.mutate({ liderId: lider.id, estimativaVotos: novaEstimativa ? parseInt(novaEstimativa) : null }); setEditandoEstimativa(null); }} className="text-green-600 hover:text-green-700"><Check className="w-3 h-3" /></button>
                                <button onClick={e => { e.stopPropagation(); setEditandoEstimativa(null); }} className="text-red-600 hover:text-red-700"><X className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <button onClick={e => { e.stopPropagation(); setEditandoEstimativa(lider.id); setNovaEstimativa(lider.estimativa_votos ? String(lider.estimativa_votos) : ''); }} className="flex items-center gap-1 hover:text-blue-600" title="Editar estimativa">
                                <span>{lider.estimativa_votos || 0}</span><Pencil className="w-3 h-3 text-slate-400" />
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">eleitores / meta</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-20 sm:w-24">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all ${lider.progresso >= 100 ? 'bg-green-500' : lider.progresso >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${lider.progresso}%` }} />
                            </div>
                            <div className="text-[10px] text-slate-500 text-right mt-0.5">{lider.taxa_conversao}%</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusMeta.bg} ${statusMeta.text}`}>{statusMeta.label}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </motion.div>
    </div>
  );
}
