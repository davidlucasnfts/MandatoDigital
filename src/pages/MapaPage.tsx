import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Filter, Users, Building2, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Eleitor } from '@/lib/supabase';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

function agruparPorBairro(eleitores: Eleitor[]) {
  const map = new Map<string, Eleitor[]>();
  eleitores.forEach(e => {
    const chave = e.bairro || 'Sem bairro';
    const lista = map.get(chave) || [];
    lista.push(e);
    map.set(chave, lista);
  });
  return Array.from(map.entries())
    .map(([bairro, lista]) => ({ bairro, count: lista.length, eleitores: lista }))
    .sort((a, b) => b.count - a.count);
}

function agruparPorCidade(eleitores: Eleitor[]) {
  const map = new Map<string, number>();
  eleitores.forEach(e => {
    const chave = e.cidade || 'Sem cidade';
    map.set(chave, (map.get(chave) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([cidade, count]) => ({ cidade, count }))
    .sort((a, b) => b.count - a.count);
}

export default function MapaPage() {
  const { data: eleitores, loading: loadingEleitores } = useEleitores();
  const { data: comunidades, loading: loadingComunidades } = useComunidades();
  const [filtroComunidade, setFiltroComunidade] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<string | null>(null);
  const [bairroSelecionado, setBairroSelecionado] = useState<string | null>(null);

  const niveis = ['lider', 'influenciador', 'apoiador', 'eleitor'];

  const eleitoresFiltrados = useMemo(() => {
    return eleitores.filter(e => {
      if (filtroComunidade && e.comunidade_id !== filtroComunidade) return false;
      if (filtroNivel && e.nivel !== filtroNivel) return false;
      return true;
    });
  }, [eleitores, filtroComunidade, filtroNivel]);

  const porBairro = useMemo(() => agruparPorBairro(eleitoresFiltrados), [eleitoresFiltrados]);
  const porCidade = useMemo(() => agruparPorCidade(eleitoresFiltrados), [eleitoresFiltrados]);
  const totalCidades = porCidade.length;

  const maxCount = porBairro[0]?.count || 1;

  const eleitoresDoBairro = useMemo(() => {
    if (!bairroSelecionado) return [];
    return porBairro.find(b => b.bairro === bairroSelecionado)?.eleitores || [];
  }, [bairroSelecionado, porBairro]);

  const loading = loadingEleitores || loadingComunidades;

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Mapa Territorial
        </h2>
        <p className="text-sm text-slate-500 mt-1">Distribuição de eleitores por cidade e bairro</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Filtros */}
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-sm text-slate-700">Filtros</h3>
              </div>

              {(filtroComunidade || filtroNivel) && (
                <button
                  onClick={() => { setFiltroComunidade(null); setFiltroNivel(null); }}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Limpar filtros
                </button>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Comunidades</h4>
                <div className="space-y-1">
                  {comunidades.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFiltroComunidade(filtroComunidade === c.id ? null : c.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${filtroComunidade === c.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.cor }} />
                      <span className="flex-1 truncate">{c.nome}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Nível</h4>
                <div className="space-y-1">
                  {niveis.map(n => (
                    <button
                      key={n}
                      onClick={() => setFiltroNivel(filtroNivel === n ? null : n)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors capitalize ${filtroNivel === n ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Eleitores</span>
                  <span className="font-semibold text-slate-800">{eleitoresFiltrados.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cidades</span>
                  <span className="font-semibold text-slate-800">{totalCidades}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bairros</span>
                  <span className="font-semibold text-slate-800">{porBairro.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Cidades */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Top Cidades</h4>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />)}</div>
              ) : (
                <div className="space-y-2">
                  {porCidade.slice(0, 5).map(c => (
                    <div key={c.cidade} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 truncate">{c.cidade}</span>
                      <span className="font-semibold text-slate-800">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mapa de Bairros */}
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Distribuição por Bairro</span>
                </div>
                <span className="text-xs text-slate-400">{porBairro.length} bairros</span>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : porBairro.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Nenhum eleitor encontrado com os filtros selecionados</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {porBairro.map((item, i) => {
                        const intensidade = item.count / maxCount;
                        return (
                          <motion.button
                            key={item.bairro}
                            custom={i}
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            onClick={() => setBairroSelecionado(item.bairro)}
                            className="text-left p-4 rounded-lg border transition-all hover:shadow-md hover:border-blue-300"
                            style={{ backgroundColor: `rgba(37, 99, 235, ${0.03 + intensidade * 0.12})` }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-800 truncate">{item.bairro}</span>
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${intensidade * 100}%` }} />
                              </div>
                              <span className="text-xs font-medium text-slate-600">{item.count}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialog Eleitores do Bairro */}
      <Dialog open={!!bairroSelecionado} onOpenChange={() => setBairroSelecionado(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {bairroSelecionado} — {eleitoresDoBairro.length} eleitor{eleitoresDoBairro.length > 1 ? 'es' : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {eleitoresDoBairro.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.nome}</p>
                  <p className="text-xs text-slate-500">{e.telefone} · {e.endereco}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                  e.nivel === 'lider' ? 'bg-purple-100 text-purple-700' :
                  e.nivel === 'influenciador' ? 'bg-blue-100 text-blue-700' :
                  e.nivel === 'apoiador' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{e.nivel}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
