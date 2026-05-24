import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, TrendingUp, Users, Target, Award, BarChart3,
  ChevronDown, ChevronUp, MapPin, Building2, Filter, Medal, Zap, ArrowUpRight, Pencil, Check, X
} from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/providers/trpc';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const statusMetaColors: Record<string, { bg: string; text: string; label: string }> = {
  atingida: { bg: 'bg-green-100', text: 'text-green-700', label: 'Meta atingida' },
  em_andamento: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Em andamento' },
  abaixo: { bg: 'bg-red-100', text: 'text-red-700', label: 'Abaixo da meta' },
};

type Ordenacao = 'ranking' | 'nome' | 'estimativa' | 'vinculados' | 'conversao';

export default function LideresProdutividadePage() {
  const { data, isLoading, refetch } = trpc.lideres.produtividade.useQuery();
  const atualizarEstimativa = trpc.lideres.atualizarEstimativa.useMutation({
    onSuccess: () => refetch(),
  });
  const [busca, setBusca] = useState('');
  const [liderSelecionado, setLiderSelecionado] = useState<any>(null);
  const [detalhesExpandido, setDetalhesExpandido] = useState(false);
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('ranking');
  const [filtroComunidade, setFiltroComunidade] = useState<string | null>(null);
  const [filtroBairro, setFiltroBairro] = useState<string | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [editandoEstimativa, setEditandoEstimativa] = useState<string | null>(null);
  const [novaEstimativa, setNovaEstimativa] = useState('');

  const lideresFiltrados = useMemo(() => {
    let lista = data?.lideres || [];
    
    // Filtro por busca
    if (busca) {
      lista = lista.filter(l => l.nome.toLowerCase().includes(busca.toLowerCase()));
    }
    
    // Filtro por comunidade
    if (filtroComunidade) {
      lista = lista.filter(l => l.comunidade_id === filtroComunidade);
    }
    
    // Filtro por bairro
    if (filtroBairro) {
      lista = lista.filter(l => l.bairro === filtroBairro);
    }
    
    // Ordenação
    switch (ordenacao) {
      case 'ranking':
        lista = [...lista].sort((a, b) => a.ranking - b.ranking);
        break;
      case 'nome':
        lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'estimativa':
        lista = [...lista].sort((a, b) => (b.estimativa_votos || 0) - (a.estimativa_votos || 0));
        break;
      case 'vinculados':
        lista = [...lista].sort((a, b) => b.eleitores_vinculados - a.eleitores_vinculados);
        break;
      case 'conversao':
        lista = [...lista].sort((a, b) => b.taxa_conversao - a.taxa_conversao);
        break;
    }
    
    return lista;
  }, [data?.lideres, busca, filtroComunidade, filtroBairro, ordenacao]);

  const totais = data?.totais;
  const filtros = data?.filtros;
  const temFiltros = filtroComunidade || filtroBairro;

  // Top 3 para podium
  const top3 = data?.lideres?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Produtividade dos Líderes <span className="text-sm font-normal text-slate-400">(Dashboard de Performance)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Estimativa de votos (KPI) vs. eleitores mobilizados (Métrica de Conversão)
          </p>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Total Líderes <span className="hidden sm:inline text-[9px] text-slate-400 font-normal">(Base)</span></p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">{isLoading ? '...' : totais?.total_lideres ?? 0}</p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Crown className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Estimativa Total <span className="hidden sm:inline text-[9px] text-slate-400 font-normal">(KPI)</span></p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-0.5">{isLoading ? '...' : (totais?.total_estimativa ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Eleitores Vinc. <span className="hidden sm:inline text-[9px] text-slate-400 font-normal">(Métrica)</span></p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 mt-0.5">{isLoading ? '...' : (totais?.total_vinculados ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Média Conversão <span className="hidden sm:inline text-[9px] text-slate-400 font-normal">(%)</span></p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-0.5">{isLoading ? '...' : `${totais?.media_conversao ?? 0}%`}</p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Projeção Votos <span className="hidden sm:inline text-[9px] text-slate-400 font-normal">(Forecast)</span></p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">{isLoading ? '...' : (totais?.projecao_votos ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Podium - Top 3 */}
      {top3.length > 0 && (
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl">
            {top3.map((lider, i) => {
              const posicoes = [
                { bg: 'bg-yellow-50', border: 'border-yellow-400', icon: Medal, iconColor: 'text-yellow-500', label: '1º', rankColor: 'text-yellow-600' },
                { bg: 'bg-slate-100', border: 'border-slate-400', icon: Medal, iconColor: 'text-slate-400', label: '2º', rankColor: 'text-slate-600' },
                { bg: 'bg-orange-50', border: 'border-orange-400', icon: Medal, iconColor: 'text-orange-600', label: '3º', rankColor: 'text-orange-700' },
              ];
              const pos = posicoes[i];
              const Icon = pos.icon;
              return (
                <Card key={lider.id} className={`${pos.bg} border-2 ${pos.border}`}>
                  <CardContent className="p-1.5 sm:p-3 text-center">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      <Icon className={`w-3 h-3 sm:w-5 sm:h-5 ${pos.iconColor}`} />
                      <span className="text-[9px] sm:text-xs font-medium text-slate-500">{pos.label}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-[10px] sm:text-sm mt-0.5 truncate">{lider.nome}</p>
                    <p className="text-sm sm:text-xl font-bold text-slate-800">{lider.taxa_conversao}%</p>
                    <p className="text-[8px] sm:text-[10px] text-slate-500">{lider.eleitores_vinculados}/{lider.estimativa_votos || 0}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Busca e Filtros */}
      <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <Input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar líder por nome..."
                className="h-9 text-sm flex-1"
              />
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${mostrarFiltros ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {temFiltros && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
              </button>
            </div>
            
            {mostrarFiltros && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
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
                        className={`px-2 py-1 rounded-md text-[11px] transition-colors ${ordenacao === o.key ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
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
                      {filtros.comunidades.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setFiltroComunidade(filtroComunidade === c.id ? null : c.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors ${filtroComunidade === c.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
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
                      {filtros.bairros.map(b => (
                        <button
                          key={b}
                          onClick={() => setFiltroBairro(filtroBairro === b ? null : b)}
                          className={`px-2 py-1 rounded-md text-[11px] transition-colors ${filtroBairro === b ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {temFiltros && (
                  <button
                    onClick={() => { setFiltroComunidade(null); setFiltroBairro(null); }}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista de Líderes */}
      <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
        <div className="space-y-3">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-slate-400">Carregando...</CardContent></Card>
          ) : lideresFiltrados.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-slate-400">Nenhum líder encontrado</CardContent></Card>
          ) : (
            lideresFiltrados.map((lider, i) => {
              const statusMeta = statusMetaColors[lider.status_meta] || statusMetaColors.abaixo;
              return (
                <Card key={lider.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setLiderSelecionado(lider); setDetalhesExpandido(true); }}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-4">
                        {/* Ranking */}
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] sm:text-xs font-bold ${
                          lider.ranking === 1 ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-400' :
                          lider.ranking === 2 ? 'bg-slate-100 text-slate-500 border-2 border-slate-400' :
                          lider.ranking === 3 ? 'bg-orange-100 text-orange-600 border-2 border-orange-400' :
                          'bg-slate-50 text-slate-400'
                        }`}>
                          {lider.ranking}
                        </div>

                        {/* Avatar / Ícone */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800 text-sm">{lider.nome}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusMeta.bg} ${statusMeta.text}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {lider.comunidade_nome && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" style={{ color: lider.comunidade_cor || '#94a3b8' }} />
                              {lider.comunidade_nome}
                            </span>
                          )}
                          {lider.bairro && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lider.bairro}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        {/* Métricas */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                            <span className="font-semibold text-slate-800">{lider.eleitores_vinculados}</span>
                            <span>/</span>
                            {editandoEstimativa === lider.id ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={novaEstimativa}
                                  onChange={e => setNovaEstimativa(e.target.value)}
                                  className="w-14 h-5 text-[10px] px-1 py-0"
                                  min={0}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      atualizarEstimativa.mutate({
                                        liderId: lider.id,
                                        estimativaVotos: novaEstimativa ? parseInt(novaEstimativa) : null,
                                      });
                                      setEditandoEstimativa(null);
                                    }
                                  }}
                                  onClick={e => e.stopPropagation()}
                                />
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    atualizarEstimativa.mutate({
                                      liderId: lider.id,
                                      estimativaVotos: novaEstimativa ? parseInt(novaEstimativa) : null,
                                    });
                                    setEditandoEstimativa(null);
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditandoEstimativa(null);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setEditandoEstimativa(lider.id);
                                  setNovaEstimativa(lider.estimativa_votos ? String(lider.estimativa_votos) : '');
                                }}
                                className="flex items-center gap-1 hover:text-blue-600"
                                title="Editar estimativa"
                              >
                                <span>{lider.estimativa_votos || 0}</span>
                                <Pencil className="w-3 h-3 text-slate-400" />
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">eleitores / meta</div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="w-20 sm:w-24 flex-shrink-0">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                lider.progresso >= 100 ? 'bg-green-500' :
                                lider.progresso >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${lider.progresso}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-500 text-right mt-0.5">{lider.taxa_conversao}%</div>
                        </div>
                        
                        {/* Arrow */}
                        <ArrowUpRight className="w-4 h-4 text-slate-300 flex-shrink-0 hidden sm:block" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Dialog: Detalhes do Líder */}
      <Dialog open={detalhesExpandido} onOpenChange={() => setDetalhesExpandido(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              {liderSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>
          {liderSelecionado && (
            <div className="space-y-4 text-sm">
              {/* Ranking */}
              <div className="flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  liderSelecionado.ranking === 1 ? 'bg-amber-100' :
                  liderSelecionado.ranking === 2 ? 'bg-slate-100' :
                  liderSelecionado.ranking === 3 ? 'bg-orange-100' :
                  'bg-slate-50'
                }`}>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${
                      liderSelecionado.ranking === 1 ? 'text-amber-700' :
                      liderSelecionado.ranking === 2 ? 'text-slate-600' :
                      liderSelecionado.ranking === 3 ? 'text-orange-700' :
                      'text-slate-500'
                    }`}>#{liderSelecionado.ranking}</p>
                    <p className="text-[9px] text-slate-500">Ranking</p>
                  </div>
                </div>
              </div>
              
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  {editandoEstimativa === liderSelecionado.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <Input
                        type="number"
                        value={novaEstimativa}
                        onChange={e => setNovaEstimativa(e.target.value)}
                        className="w-20 h-8 text-sm"
                        min={0}
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          atualizarEstimativa.mutate({
                            liderId: liderSelecionado.id,
                            estimativaVotos: novaEstimativa ? parseInt(novaEstimativa) : null,
                          });
                          setEditandoEstimativa(null);
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditandoEstimativa(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <div className="text-2xl font-bold text-blue-600">{liderSelecionado.estimativa_votos || 0}</div>
                      <button
                        onClick={() => {
                          setEditandoEstimativa(liderSelecionado.id);
                          setNovaEstimativa(liderSelecionado.estimativa_votos ? String(liderSelecionado.estimativa_votos) : '');
                        }}
                        className="text-slate-400 hover:text-blue-600"
                        title="Editar estimativa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-slate-500">Estimativa de votos <span className="text-[9px] text-slate-400">(KPI)</span></div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{liderSelecionado.eleitores_vinculados}</div>
                  <div className="text-xs text-slate-500">Eleitores vinculados <span className="text-[9px] text-slate-400">(Métrica)</span></div>
                </div>
              </div>

              {/* Progresso */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Progresso</span>
                  <span className="font-medium text-slate-800">{liderSelecionado.taxa_conversao}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      liderSelecionado.progresso >= 100 ? 'bg-green-500' :
                      liderSelecionado.progresso >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${liderSelecionado.progresso}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Status:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusMetaColors[liderSelecionado.status_meta]?.bg} ${statusMetaColors[liderSelecionado.status_meta]?.text}`}>
                  {statusMetaColors[liderSelecionado.status_meta]?.label}
                </span>
              </div>

              {/* Info adicional */}
              <div className="space-y-1 text-slate-600 text-xs">
                {liderSelecionado.comunidade_nome && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Comunidade: {liderSelecionado.comunidade_nome}
                  </div>
                )}
                {liderSelecionado.cidade && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {liderSelecionado.cidade}{liderSelecionado.bairro ? `, ${liderSelecionado.bairro}` : ''}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
