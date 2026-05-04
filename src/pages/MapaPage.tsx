import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Users, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCoordenadasCidade } from '@/data/coordenadasCidades';
import type { Eleitor } from '@/lib/supabase';

// react-leaflet imports (dynamic to avoid SSR issues)
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

// Fix default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function agruparPorCidade(eleitores: Eleitor[]) {
  const map = new Map<string, Eleitor[]>();
  eleitores.forEach(e => {
    const cidade = e.cidade || 'Sem cidade';
    const lista = map.get(cidade) || [];
    lista.push(e);
    map.set(cidade, lista);
  });
  return Array.from(map.entries())
    .map(([cidade, lista]) => ({ cidade, count: lista.length, eleitores: lista, coords: getCoordenadasCidade(cidade) }))
    .filter(c => c.coords !== null)
    .sort((a, b) => b.count - a.count);
}

export default function MapaPage() {
  const { data: eleitores, loading: loadingEleitores } = useEleitores();
  const { data: comunidades, loading: loadingComunidades } = useComunidades();
  const [filtroComunidade, setFiltroComunidade] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<string | null>(null);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(null);

  const niveis = ['lider', 'influenciador', 'apoiador', 'eleitor'];

  const eleitoresFiltrados = useMemo(() => {
    return eleitores.filter(e => {
      if (filtroComunidade && e.comunidade_id !== filtroComunidade) return false;
      if (filtroNivel && e.nivel !== filtroNivel) return false;
      return true;
    });
  }, [eleitores, filtroComunidade, filtroNivel]);

  const porCidade = useMemo(() => agruparPorCidade(eleitoresFiltrados), [eleitoresFiltrados]);

  const eleitoresDaCidade = useMemo(() => {
    if (!cidadeSelecionada) return [];
    return porCidade.find(c => c.cidade === cidadeSelecionada)?.eleitores || [];
  }, [cidadeSelecionada, porCidade]);

  // Centro do mapa: Brasil
  const centroBrasil: [number, number] = [-14.2350, -51.9253];

  const loading = loadingEleitores || loadingComunidades;

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Mapa de Eleitores
        </h2>
        <p className="text-sm text-slate-500 mt-1">Distribuição geográfica por cidade</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-sm text-slate-700">Filtros</h3>
                </div>
                {(filtroComunidade || filtroNivel) && (
                  <button onClick={() => { setFiltroComunidade(null); setFiltroNivel(null); }} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Limpar
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Comunidades</h4>
                <div className="space-y-1">
                  {comunidades.map(c => (
                    <button key={c.id} onClick={() => setFiltroComunidade(filtroComunidade === c.id ? null : c.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${filtroComunidade === c.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
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
                    <button key={n} onClick={() => setFiltroNivel(filtroNivel === n ? null : n)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors capitalize ${filtroNivel === n ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Eleitores</span><span className="font-semibold text-slate-800">{eleitoresFiltrados.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Cidades no mapa</span><span className="font-semibold text-slate-800">{porCidade.length}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de cidades */}
          <Card>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Cidades</h4>
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />)}</div>
              ) : (
                <div className="space-y-1.5">
                  {porCidade.map(c => (
                    <button key={c.cidade} onClick={() => setCidadeSelecionada(c.cidade)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-sm transition-colors ${cidadeSelecionada === c.cidade ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <span className="truncate">{c.cidade}</span>
                      <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{c.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mapa Leaflet */}
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-3">
          <Card className="h-full min-h-[500px]">
            <CardContent className="p-0 h-full overflow-visible">
              {loading ? (
                <div className="h-[500px] bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
                  <MapPin className="w-8 h-8 mr-2" /> Carregando mapa...
                </div>
              ) : (
                <MapContainer center={centroBrasil} zoom={4} scrollWheelZoom={true} style={{ height: '100%', minHeight: '500px', width: '100%' }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {porCidade.map(c => (
                    <Marker key={c.cidade} position={c.coords!} icon={customIcon} eventHandlers={{ click: () => setCidadeSelecionada(c.cidade) }}>
                      <Popup autoPan={true} autoPanPadding={[50, 50]}>
                        <div className="text-sm">
                          <p className="font-semibold">{c.cidade}</p>
                          <p className="text-xs text-slate-500">{c.count} eleitor{c.count > 1 ? 'es' : ''}</p>
                          <button onClick={() => setCidadeSelecionada(c.cidade)} className="text-xs text-blue-600 hover:underline mt-1">Ver lista</button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialog */}
      <Dialog open={!!cidadeSelecionada} onOpenChange={() => setCidadeSelecionada(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {cidadeSelecionada} — {eleitoresDaCidade.length} eleitor{eleitoresDaCidade.length > 1 ? 'es' : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {eleitoresDaCidade.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.nome}</p>
                  <p className="text-xs text-slate-500">{e.telefone} · {e.bairro}</p>
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
