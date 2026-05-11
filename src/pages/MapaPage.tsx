import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Users, X, Building2, Navigation, MapPinned, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCoordenadasCidade } from '@/data/coordenadasCidades';
import { createColorIcon } from '@/lib/mapIcons';
import { trpc } from '@/providers/trpc';
import type { Eleitor } from '@/lib/supabase';

import { MapContainer, TileLayer, Marker, Tooltip, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

const BOUNDS_BRASIL = L.latLngBounds(
  L.latLng(-33.75, -73.99),
  L.latLng(5.27, -34.79)
);

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Agrupa eleitores por cidade (fallback quando nao tem coordenadas)
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
  const [eleitorSelecionado, setEleitorSelecionado] = useState<Eleitor | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<string | null>(null);

  const geocodeAll = trpc.geocoding.geocodeAll.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setGeocodingStatus(`Processados: ${data.processed} | Falhas: ${data.failed}`);
        // Recarrega a pagina apos 2 segundos para mostrar os novos pontos
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setGeocodingStatus(`Erro: ${(data as any).error || 'Falha desconhecida'}`);
      }
    },
    onError: (err: any) => {
      setGeocodingStatus(`Erro: ${err?.message || 'Falha na geocodificacao'}`);
    },
  });

  const niveis = ['lider', 'eleitor'];

  const eleitoresFiltrados = useMemo(() => {
    return eleitores.filter(e => {
      if (filtroComunidade && e.comunidade_id !== filtroComunidade) return false;
      if (filtroNivel && e.nivel !== filtroNivel) return false;
      return true;
    });
  }, [eleitores, filtroComunidade, filtroNivel]);

  // Eleitores com coordenadas reais (geocodificados)
  const eleitoresComCoords = useMemo(() => {
    return eleitoresFiltrados.filter(e => e.latitude && e.longitude);
  }, [eleitoresFiltrados]);

  // Eleitores SEM coordenadas (fallback: agrupa por cidade)
  const eleitoresSemCoords = useMemo(() => {
    return eleitoresFiltrados.filter(e => !e.latitude || !e.longitude);
  }, [eleitoresFiltrados]);

  const porCidade = useMemo(() => agruparPorCidade(eleitoresSemCoords), [eleitoresSemCoords]);

  // Comunidades com cidade vinculada
  const comunidadesNoMapa = useMemo(() => {
    return comunidades
      .filter(c => c.cidade && getCoordenadasCidade(c.cidade))
      .map(c => ({
        ...c,
        coords: getCoordenadasCidade(c.cidade!)!,
      }));
  }, [comunidades]);

  const eleitoresDaCidade = useMemo(() => {
    if (!cidadeSelecionada) return [];
    return porCidade.find(c => c.cidade === cidadeSelecionada)?.eleitores || [];
  }, [cidadeSelecionada, porCidade]);

  const centroBrasil: [number, number] = [-14.2350, -51.9253];
  const loading = loadingEleitores || loadingComunidades;

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Mapa de Eleitores
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {eleitoresComCoords.length > 0
            ? `${eleitoresComCoords.length} eleitor${eleitoresComCoords.length > 1 ? 'es' : ''} posicionado${eleitoresComCoords.length > 1 ? 's' : ''} no endereco exato`
            : 'Distribuicao geografica por cidade e comunidades'}
        </p>
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
                      {c.cidade && <span className="text-[10px] text-slate-400">{c.cidade}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Nivel</h4>
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
                <div className="flex justify-between text-sm"><span className="text-slate-500">Com coordenadas</span><span className="font-semibold text-green-600">{eleitoresComCoords.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Sem coordenadas</span><span className="font-semibold text-amber-600">{eleitoresSemCoords.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Comunidades no mapa</span><span className="font-semibold text-slate-800">{comunidadesNoMapa.length}</span></div>
              </div>

              {/* Botao de geocodificacao batch */}
              {eleitoresSemCoords.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setGeocodingStatus('Processando... (isso pode levar alguns minutos)');
                      geocodeAll.mutate();
                    }}
                    disabled={geocodeAll.isPending}
                  >
                    {geocodeAll.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <MapPinned className="w-3 h-3 mr-1" />
                    )}
                    Geocodificar {eleitoresSemCoords.length} eleitor{eleitoresSemCoords.length > 1 ? 'es' : ''}
                  </Button>
                  {geocodingStatus && (
                    <p className="text-[10px] text-slate-500 mt-1 text-center">{geocodingStatus}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de cidades (apenas eleitores sem coordenadas) */}
          {porCidade.length > 0 && (
            <Card>
              <CardContent className="p-4 max-h-[300px] overflow-y-auto">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Cidades (sem coordenadas)</h4>
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
          )}
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
                <MapContainer center={centroBrasil} zoom={4} minZoom={3} maxBounds={BOUNDS_BRASIL} maxBoundsViscosity={1.0} scrollWheelZoom={true} style={{ height: '100%', minHeight: '500px', width: '100%' }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {/* Marcadores de comunidades (cor personalizada) */}
                  {comunidadesNoMapa.map(c => (
                    <Marker
                      key={`comunidade-${c.id}`}
                      position={c.coords}
                      icon={createColorIcon(c.cor)}
                      eventHandlers={{ click: () => setFiltroComunidade(filtroComunidade === c.id ? null : c.id) }}
                    >
                      <Tooltip direction="top" offset={[0, -20]}>
                        <div className="text-xs font-medium">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {c.nome}
                          </div>
                          <div className="text-slate-500">{c.cidade}</div>
                        </div>
                      </Tooltip>
                    </Marker>
                  ))}

                  {/* Eleitores COM coordenadas reais (pontos precisos) */}
                  {eleitoresComCoords.map(e => (
                    <CircleMarker
                      key={e.id}
                      center={[e.latitude!, e.longitude!]}
                      radius={6}
                      pathOptions={{
                        fillColor: e.nivel === 'lider' ? '#9333ea' : '#2563eb',
                        color: '#fff',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.85,
                      }}
                      eventHandlers={{ click: () => setEleitorSelecionado(e) }}
                    >
                      <Tooltip direction="top" offset={[0, -10]}>
                        <div className="text-xs">
                          <div className="font-medium">{e.nome}</div>
                          <div className="text-slate-500">{e.endereco || e.bairro || e.cidade}</div>
                          <div className={`text-[10px] mt-0.5 font-medium capitalize ${e.nivel === 'lider' ? 'text-purple-600' : 'text-blue-600'}`}>{e.nivel}</div>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}

                  {/* Eleitores SEM coordenadas (marcador da cidade) */}
                  {porCidade.map(c => (
                    <Marker key={c.cidade} position={c.coords!} icon={customIcon} eventHandlers={{ click: () => setCidadeSelecionada(c.cidade) }}>
                      <Tooltip direction="top" offset={[0, -20]}>
                        <span className="text-xs font-medium">{c.cidade}: {c.count} eleitor{c.count > 1 ? 'es' : ''} (sem coordenadas)</span>
                      </Tooltip>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Dialog: eleitores da cidade (sem coordenadas) */}
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
                  e.nivel === 'eleitor' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{e.nivel}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: detalhes do eleitor (com coordenadas) */}
      <Dialog open={!!eleitorSelecionado} onOpenChange={() => setEleitorSelecionado(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              {eleitorSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>
          {eleitorSelecionado && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                  eleitorSelecionado.nivel === 'lider' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>{eleitorSelecionado.nivel}</span>
              </div>
              <div className="space-y-1 text-slate-600">
                {eleitorSelecionado.endereco && <p>{eleitorSelecionado.endereco}</p>}
                {eleitorSelecionado.bairro && <p>{eleitorSelecionado.bairro}</p>}
                <p>{eleitorSelecionado.cidade}, {eleitorSelecionado.estado}</p>
                {eleitorSelecionado.cep && <p className="text-slate-400">CEP: {eleitorSelecionado.cep}</p>}
              </div>
              {eleitorSelecionado.latitude && eleitorSelecionado.longitude && (
                <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded">
                  Coordenadas: {eleitorSelecionado.latitude.toFixed(6)}, {eleitorSelecionado.longitude.toFixed(6)}
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-600">
                {eleitorSelecionado.telefone && <p>Tel: {eleitorSelecionado.telefone}</p>}
                {eleitorSelecionado.email && <p>{eleitorSelecionado.email}</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
