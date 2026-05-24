import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Filter, Users, X, Building2, Navigation, MapPinned, Loader2,
  Eye, Layers, Search, Route, Thermometer, BarChart3, ChevronDown, ChevronUp,
  CheckCircle2, Trash2, Share2
} from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCoordenadasCidade } from '@/data/coordenadasCidades';
import { createComunidadeIcon, createEleitorIcon, createLiderIcon, createHeatmapIcon, createRouteIcon } from '@/lib/mapIcons';
import { trpc } from '@/providers/trpc';
import HeatmapLayer from '@/components/HeatmapLayer';
import type { Eleitor, Comunidade } from '@/lib/supabase';

import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const BOUNDS_BRASIL = L.latLngBounds(L.latLng(-33.75, -73.99), L.latLng(5.27, -34.79));
const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

const statusColors: Record<string, string> = { ativo: '#22c55e', inativo: '#94a3b8', pendente: '#f59e0b' };

function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 30, color = '#2563eb';
  if (count >= 100) { size = 44; color = '#dc2626'; }
  else if (count >= 50) { size = 38; color = '#ea580c'; }
  else if (count >= 20) { size = 34; color = '#ca8a04'; }
  return L.divIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:${count >= 100 ? 13 : count >= 50 ? 12 : 11}px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${count}</div>`,
    className: 'marker-cluster-custom',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapController({ flyTo }: { flyTo?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => { if (flyTo) map.flyTo(flyTo, 14, { duration: 1.2 }); }, [flyTo, map]);
  return null;
}

// Controle de camadas de tile (Voyager / Satelite / Dark)
function TileLayerController({ camada }: { camada: 'voyager' | 'satellite' | 'dark' }) {
  const map = useMap();
  useEffect(() => {
    // Forca refresh do tile quando muda a camada
    map.invalidateSize();
  }, [camada, map]);
  return null;
}

const tileLayers = {
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    subdomains: '',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
};

function agruparPorCidade(eleitores: Eleitor[]) {
  const map = new Map<string, Eleitor[]>();
  eleitores.forEach(e => { const cidade = e.cidade || 'Sem cidade'; const lista = map.get(cidade) || []; lista.push(e); map.set(cidade, lista); });
  return Array.from(map.entries()).map(([cidade, lista]) => ({ cidade, count: lista.length, eleitores: lista, coords: getCoordenadasCidade(cidade) })).filter(c => c.coords !== null).sort((a, b) => b.count - a.count);
}

// Heurística simples de rota: ordena pontos pelo ângulo em relação ao centroide (vizinho mais próximo aproximado)
function otimizarRota(pontos: Array<[number, number]>): Array<[number, number]> {
  if (pontos.length <= 2) return pontos;
  const visitados = new Set<number>();
  const rota: Array<[number, number]> = [];
  let atual = 0;
  visitados.add(atual);
  rota.push(pontos[atual]);

  while (visitados.size < pontos.length) {
    let maisProximo = -1;
    let menorDist = Infinity;
    for (let i = 0; i < pontos.length; i++) {
      if (visitados.has(i)) continue;
      const dx = pontos[atual][0] - pontos[i][0];
      const dy = pontos[atual][1] - pontos[i][1];
      const dist = dx * dx + dy * dy;
      if (dist < menorDist) { menorDist = dist; maisProximo = i; }
    }
    if (maisProximo === -1) break;
    visitados.add(maisProximo);
    rota.push(pontos[maisProximo]);
    atual = maisProximo;
  }
  return rota;
}

export default function MapaPage() {
  const { data: eleitores, loading: loadingEleitores } = useEleitores();
  const { data: comunidades, loading: loadingComunidades } = useComunidades();

  // Filtros
  const [filtroComunidade, setFiltroComunidade] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroBairro, setFiltroBairro] = useState<string | null>(null);
  const [filtroTag, setFiltroTag] = useState<string | null>(null);
  const [buscaNome, setBuscaNome] = useState('');

  // Camadas
  const [mostrarEleitores, setMostrarEleitores] = useState(true);
  const [mostrarComunidades, setMostrarComunidades] = useState(true);
  const [mostrarCidadesFallback, setMostrarCidadesFallback] = useState(true);
  const [mostrarHeatmap, setMostrarHeatmap] = useState(false);
  const [mostrarRota, setMostrarRota] = useState(false);
  const [camadaBase, setCamadaBase] = useState<'voyager' | 'satellite' | 'dark'>('voyager');

  // Dialogs
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string | null>(null);
  const [eleitorSelecionado, setEleitorSelecionado] = useState<Eleitor | null>(null);
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState<Comunidade | null>(null);
  const [geocodingStatus, setGeocodingStatus] = useState<string | null>(null);

  // FlyTo
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  // Sidebar expansível
  const [filtrosExpandido, setFiltrosExpandido] = useState(true);
  const [camadasExpandido, setCamadasExpandido] = useState(true);
  const [statsExpandido, setStatsExpandido] = useState(true);
  const [rotaExpandido, setRotaExpandido] = useState(false);

  const geocodeAll = trpc.geocoding.geocodeAll.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setGeocodingStatus(data.message || `Processados: ${data.processed} | Falhas: ${data.failed}`);
        if (data.processed > 0) setTimeout(() => window.location.reload(), 2500);
      } else { setGeocodingStatus(`Erro: ${(data as any).error || 'Falha'}`); }
    },
    onError: (err: any) => { setGeocodingStatus(`Erro: ${err?.message || 'Falha'}`); },
  });

  const todasTags = useMemo(() => { const s = new Set<string>(); eleitores.forEach(e => e.tags?.forEach(t => s.add(t))); return Array.from(s).sort(); }, [eleitores]);
  const todosBairros = useMemo(() => { const s = new Set<string>(); eleitores.forEach(e => { if (e.bairro) s.add(e.bairro); }); return Array.from(s).sort(); }, [eleitores]);

  const eleitoresFiltrados = useMemo(() => eleitores.filter(e => {
    if (filtroComunidade && e.comunidade_id !== filtroComunidade) return false;
    if (filtroNivel && e.nivel !== filtroNivel) return false;
    if (filtroStatus && e.status !== filtroStatus) return false;
    if (filtroBairro && e.bairro !== filtroBairro) return false;
    if (filtroTag && !e.tags?.includes(filtroTag)) return false;
    if (buscaNome) {
      const q = buscaNome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const nome = e.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!nome.includes(q)) return false;
    }
    return true;
  }), [eleitores, filtroComunidade, filtroNivel, filtroStatus, filtroBairro, filtroTag, buscaNome]);

  const eleitoresComCoords = useMemo(() => eleitoresFiltrados.filter(e => e.latitude && e.longitude), [eleitoresFiltrados]);
  const eleitoresSemCoords = useMemo(() => eleitoresFiltrados.filter(e => !e.latitude || !e.longitude), [eleitoresFiltrados]);
  const porCidade = useMemo(() => agruparPorCidade(eleitoresSemCoords), [eleitoresSemCoords]);

  // Dados para heatmap: [lat, lng, intensidade]
  const heatmapPoints = useMemo(() => {
    return eleitoresComCoords.map(e => [e.latitude!, e.longitude!, e.nivel === 'lider' ? 1.0 : 0.6] as [number, number, number]);
  }, [eleitoresComCoords]);

  // Rota de visita
  const rotaPontos = useMemo(() => {
    if (!mostrarRota || eleitoresComCoords.length < 2) return [];
    const pts = eleitoresComCoords.map(e => [e.latitude!, e.longitude!] as [number, number]);
    return otimizarRota(pts);
  }, [mostrarRota, eleitoresComCoords]);

  // Geocodificar bairros das comunidades
  const [bairrosCoords, setBairrosCoords] = useState<Map<string, [number, number]>>(new Map());
  const geocodeBairro = trpc.geocoding.geocodeBairro.useMutation();
  const comunidadesParaGeocodificar = useMemo(() => comunidades.filter(c => c.cidade && c.bairro && (!c.latitude || !c.longitude)), [comunidades]);

  useEffect(() => {
    const fetchCoords = async () => {
      const newCoords = new Map<string, [number, number]>();
      for (const c of comunidadesParaGeocodificar) {
        const key = `${c.bairro}-${c.cidade}`;
        if (bairrosCoords.has(key)) { newCoords.set(key, bairrosCoords.get(key)!); continue; }
        try {
          const coords = await geocodeBairro.mutateAsync({ bairro: c.bairro!, cidade: c.cidade!, estado: '' });
          if (coords) newCoords.set(key, [coords.lat, coords.lng]);
        } catch { /* ignora */ }
      }
      if (newCoords.size > 0) setBairrosCoords(prev => new Map([...prev, ...newCoords]));
    };
    if (comunidadesParaGeocodificar.length > 0) fetchCoords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunidadesParaGeocodificar.map(c => c.id).join(',')]);

  const comunidadesNoMapa = useMemo(() => comunidades.filter(c => c.cidade).map(c => {
    if (c.latitude && c.longitude) return { ...c, coords: [c.latitude, c.longitude] as [number, number] };
    if (c.bairro) { const key = `${c.bairro}-${c.cidade}`; const bCoords = bairrosCoords.get(key); if (bCoords) return { ...c, coords: bCoords }; }
    const cidadeCoords = getCoordenadasCidade(c.cidade!);
    if (cidadeCoords) return { ...c, coords: cidadeCoords };
    return null;
  }).filter(Boolean) as Array<Comunidade & { coords: [number, number] }>, [comunidades, bairrosCoords]);

  useEffect(() => {
    if (filtroComunidade) { const c = comunidadesNoMapa.find(c => c.id === filtroComunidade); if (c) setFlyTo(c.coords); }
    else { setFlyTo(null); }
  }, [filtroComunidade, comunidadesNoMapa]);

  const stats = useMemo(() => {
    const total = eleitoresFiltrados.length;
    const lideres = eleitoresFiltrados.filter(e => e.nivel === 'lider').length;
    const ativos = eleitoresFiltrados.filter(e => e.status === 'ativo').length;
    const pendentes = eleitoresFiltrados.filter(e => e.status === 'pendente').length;
    const comCoords = eleitoresComCoords.length;
    return { total, lideres, ativos, pendentes, comCoords };
  }, [eleitoresFiltrados, eleitoresComCoords]);

  const eleitoresDaCidade = useMemo(() => { if (!cidadeSelecionada) return []; return porCidade.find(c => c.cidade === cidadeSelecionada)?.eleitores || []; }, [cidadeSelecionada, porCidade]);

  const centroBrasil: [number, number] = [-14.2350, -51.9253];
  const loading = loadingEleitores || loadingComunidades;
  const niveis = ['lider', 'eleitor'];
  const statusList = ['ativo', 'inativo', 'pendente'];
  const temFiltros = filtroComunidade || filtroNivel || filtroStatus || filtroBairro || filtroTag || buscaNome;

  const limparFiltros = () => { setFiltroComunidade(null); setFiltroNivel(null); setFiltroStatus(null); setFiltroBairro(null); setFiltroTag(null); setBuscaNome(''); };

  // Copiar rota como texto
  const copiarRota = () => {
    if (rotaPontos.length === 0) return;
    const texto = rotaPontos.map((p, i) => `${i + 1}. ${p[0].toFixed(6)}, ${p[1].toFixed(6)}`).join('\n');
    navigator.clipboard.writeText(texto).then(() => alert('Rota copiada para a área de transferência!'));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Mapa Territorial
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {stats.total} eleitor{stats.total > 1 ? 'es' : ''} visíveis · {stats.comCoords} com coordenadas exatas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {eleitoresSemCoords.length > 0 && (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => { setGeocodingStatus('Processando...'); geocodeAll.mutate(); }} disabled={geocodeAll.isPending}>
                {geocodeAll.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MapPinned className="w-3 h-3 mr-1" />}
                Geocodificar {eleitoresSemCoords.length}
              </Button>
            )}
          </div>
        </div>
        {geocodingStatus && <p className="text-xs text-slate-500 mt-1">{geocodingStatus}</p>}
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-1 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto">
          {/* Busca */}
          <Card>
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={buscaNome} onChange={e => setBuscaNome(e.target.value)} placeholder="Buscar eleitor por nome..." className="pl-9 h-9 text-sm" />
                {buscaNome && <button onClick={() => setBuscaNome('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          <Card>
            <CardContent className="p-3 space-y-3">
              <button onClick={() => setFiltrosExpandido(!filtrosExpandido)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-sm text-slate-700">Filtros</h3>
                </div>
                <div className="flex items-center gap-2">
                  {temFiltros && <button onClick={(e) => { e.stopPropagation(); limparFiltros(); }} className="text-[10px] text-red-500 hover:underline">Limpar</button>}
                  {filtrosExpandido ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>
              {filtrosExpandido && (
                <>
                  <div>
                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Comunidades</h4>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto">
                      {comunidades.map(c => (
                        <button key={c.id} onClick={() => setFiltroComunidade(filtroComunidade === c.id ? null : c.id)}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-colors ${filtroComunidade === c.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.cor }} />
                          <span className="flex-1 truncate">{c.nome}</span>
                          {c.cidade && <span className="text-[10px] text-slate-400">{c.cidade}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Nível</h4>
                    <div className="flex flex-wrap gap-1">
                      {niveis.map(n => (
                        <button key={n} onClick={() => setFiltroNivel(filtroNivel === n ? null : n)}
                          className={`px-2 py-1 rounded-md text-[11px] capitalize transition-colors ${filtroNivel === n ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>{n}</button>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Status</h4>
                    <div className="flex flex-wrap gap-1">
                      {statusList.map(s => (
                        <button key={s} onClick={() => setFiltroStatus(filtroStatus === s ? null : s)}
                          className={`px-2 py-1 rounded-md text-[11px] capitalize transition-colors ${filtroStatus === s ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  {todosBairros.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Bairro</h4>
                      <select value={filtroBairro || ''} onChange={e => setFiltroBairro(e.target.value || null)} className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs">
                        <option value="">Todos os bairros</option>
                        {todosBairros.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  )}
                  {todasTags.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {todasTags.map(t => (
                          <button key={t} onClick={() => setFiltroTag(filtroTag === t ? null : t)}
                            className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${filtroTag === t ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Camadas */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <button onClick={() => setCamadasExpandido(!camadasExpandido)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-sm text-slate-700">Camadas</h3>
                </div>
                {camadasExpandido ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {camadasExpandido && (
                <div className="space-y-2 pt-1">
                  {/* Seletor de camada base */}
                  <div className="pb-2 border-b border-slate-100">
                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Mapa base</h4>
                    <div className="flex gap-1">
                      {[
                        { key: 'voyager' as const, label: 'Ruas', icon: '🗺️' },
                        { key: 'satellite' as const, label: 'Satélite', icon: '🛰️' },
                        { key: 'dark' as const, label: 'Escuro', icon: '🌙' },
                      ].map(c => (
                        <button
                          key={c.key}
                          onClick={() => setCamadaBase(c.key)}
                          className={`flex-1 text-[10px] py-1 px-1.5 rounded border transition-colors ${camadaBase === c.key ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                          {c.icon} {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mostrarEleitores} onChange={e => setMostrarEleitores(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
                      Eleitores ({eleitoresComCoords.filter(e => e.nivel !== 'lider').length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mostrarEleitores} onChange={e => setMostrarEleitores(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9333ea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6l4 6 5-4-2 10H5L3 8l5 4z"/></svg>
                      Líderes ({eleitoresComCoords.filter(e => e.nivel === 'lider').length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mostrarComunidades} onChange={e => setMostrarComunidades(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="2"/><circle cx="15" cy="8" r="2"/><path d="M6 15c0-2 2-3 4-3s4 1 4 3"/><path d="M18 15c0-2-2-3-4-3"/></svg>
                      Comunidades ({comunidadesNoMapa.length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mostrarCidadesFallback} onChange={e => setMostrarCidadesFallback(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Cidades sem coordenadas ({porCidade.length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mostrarHeatmap} onChange={e => setMostrarHeatmap(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                      Heatmap
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={mostrarRota} onChange={e => setMostrarRota(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className="text-xs text-slate-600 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/></svg>
                      Rota de visita ({rotaPontos.length} pts)
                    </span>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rota de visita */}
          {mostrarRota && rotaPontos.length > 0 && (
            <Card>
              <CardContent className="p-3 space-y-2">
                <button onClick={() => setRotaExpandido(!rotaExpandido)} className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-sm text-slate-700">Rota de Visita</h3>
                  </div>
                  {rotaExpandido ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {rotaExpandido && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] text-slate-500">{rotaPontos.length} paradas otimizadas (vizinho mais próximo)</p>
                    <div className="max-h-[150px] overflow-y-auto space-y-1">
                      {rotaPontos.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                          <span className="text-slate-600 truncate">{p[0].toFixed(5)}, {p[1].toFixed(5)}</span>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs mt-2" onClick={copiarRota}>
                      <Share2 className="w-3 h-3 mr-1" /> Copiar rota
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Estatísticas */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <button onClick={() => setStatsExpandido(!statsExpandido)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-sm text-slate-700">Estatísticas</h3>
                </div>
                {statsExpandido ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {statsExpandido && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Total</span><span className="font-semibold text-slate-800">{stats.total}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Líderes</span><span className="font-semibold text-purple-600">{stats.lideres}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Ativos</span><span className="font-semibold text-green-600">{stats.ativos}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Pendentes</span><span className="font-semibold text-amber-600">{stats.pendentes}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Com coordenadas</span><span className="font-semibold text-blue-600">{stats.comCoords}</span></div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 mb-1">Distribuição por nível</div>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      {stats.total > 0 && (
                        <>
                          <div className="bg-purple-500" style={{ width: `${(stats.lideres / stats.total) * 100}%` }} />
                          <div className="bg-blue-500" style={{ width: `${((stats.total - stats.lideres) / stats.total) * 100}%` }} />
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" />Líderes</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />Eleitores</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cidades sem coordenadas */}
          {porCidade.length > 0 && (
            <Card>
              <CardContent className="p-3 max-h-[200px] overflow-y-auto">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Cidades (sem coord.)</h4>
                <div className="space-y-1">
                  {porCidade.map(c => (
                    <button key={c.cidade} onClick={() => setCidadeSelecionada(c.cidade)}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-colors ${cidadeSelecionada === c.cidade ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <span className="truncate">{c.cidade}</span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{c.count}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Mapa */}
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-3">
          <Card className="h-full min-h-[600px]">
            <CardContent className="p-0 h-full overflow-visible">
              {loading ? (
                <div className="h-[600px] bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
                  <MapPin className="w-8 h-8 mr-2" /> Carregando mapa...
                </div>
              ) : (
                <MapContainer center={centroBrasil} zoom={4} minZoom={3} maxBounds={BOUNDS_BRASIL} maxBoundsViscosity={1.0} scrollWheelZoom={true} style={{ height: '100%', minHeight: '600px', width: '100%' }}>
                  <TileLayerController camada={camadaBase} />
                  <TileLayer
                    attribution={tileLayers[camadaBase].attribution}
                    url={tileLayers[camadaBase].url}
                    subdomains={tileLayers[camadaBase].subdomains}
                    maxZoom={19}
                    key={camadaBase}
                  />
                  <MapController flyTo={flyTo} />

                  {/* Heatmap */}
                  {mostrarHeatmap && heatmapPoints.length > 0 && (
                    <HeatmapLayer points={heatmapPoints} radius={25} blur={15} max={1.5} />
                  )}

                  {/* Rota de visita */}
                  {mostrarRota && rotaPontos.length > 1 && (
                    <Polyline positions={rotaPontos} pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.7, dashArray: '8, 6' }} />
                  )}

                  {/* Comunidades */}
                  {mostrarComunidades && comunidadesNoMapa.map(c => (
                    <Marker key={`comunidade-${c.id}`} position={c.coords} icon={createComunidadeIcon(c.cor)}
                      eventHandlers={{ click: () => setComunidadeSelecionada(c) }}>
                      <Popup>
                        <div className="text-xs min-w-[160px]">
                          <div className="font-semibold text-slate-800 flex items-center gap-1 mb-1">
                            <Building2 className="w-3.5 h-3.5" style={{ color: c.cor }} />
                            {c.nome}
                          </div>
                          <div className="text-slate-500">{c.bairro ? `${c.bairro}, ${c.cidade}` : c.cidade}</div>
                          {c.latitude && <div className="text-[10px] text-green-600 mt-1">📍 Posição exata</div>}
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-500">{c.total_eleitores || 0} eleitores</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Eleitores COM coordenadas — com cluster */}
                  {mostrarEleitores && (
                    <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon} maxClusterRadius={60} spiderfyOnMaxZoom showCoverageOnHover={false}>
                      {eleitoresComCoords.map(e => (
                        <Marker
                          key={e.id}
                          position={[e.latitude!, e.longitude!]}
                          icon={e.nivel === 'lider' ? createLiderIcon(e.status) : createEleitorIcon(e.status)}
                          eventHandlers={{ click: () => setEleitorSelecionado(e) }}
                        >
                          <Popup>
                            <div className="text-xs min-w-[180px]">
                              <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                                {e.nivel === 'lider' && (
                                  <span className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                  </span>
                                )}
                                {e.nome}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`text-[10px] capitalize ${e.nivel === 'lider' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>{e.nivel}</Badge>
                                <Badge variant="outline" className={`text-[10px] capitalize ${e.status === 'ativo' ? 'border-green-200 text-green-700 bg-green-50' : e.status === 'pendente' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-slate-200 text-slate-600 bg-slate-50'}`}>{e.status}</Badge>
                              </div>
                              <div className="mt-2 space-y-0.5 text-slate-500">
                                {e.endereco && <div>{e.endereco}</div>}
                                {e.bairro && <div>{e.bairro}</div>}
                                <div>{e.cidade}, {e.estado}</div>
                                {e.telefone && <div className="text-slate-400">{e.telefone}</div>}
                              </div>
                              {e.tags && e.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {e.tags.map(t => <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>)}
                                </div>
                              )}
                              <div className="mt-2 pt-2 border-t border-slate-100 flex gap-2">
                                <button onClick={() => setEleitorSelecionado(e)} className="text-[10px] text-blue-600 hover:underline flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> Ver detalhes
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MarkerClusterGroup>
                  )}

                  {/* Eleitores SEM coordenadas */}
                  {mostrarCidadesFallback && porCidade.map(c => (
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

      {/* Dialog: eleitores da cidade */}
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
                  e.nivel === 'lider' ? 'bg-purple-100 text-purple-700' : e.nivel === 'eleitor' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>{e.nivel}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: detalhes do eleitor */}
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
                <Badge className={`text-[10px] capitalize ${eleitorSelecionado.nivel === 'lider' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : 'bg-green-100 text-green-700 hover:bg-green-100'}`}>{eleitorSelecionado.nivel}</Badge>
                <Badge className={`text-[10px] capitalize ${eleitorSelecionado.status === 'ativo' ? 'bg-green-100 text-green-700 hover:bg-green-100' : eleitorSelecionado.status === 'pendente' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'}`}>{eleitorSelecionado.status}</Badge>
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
              {eleitorSelecionado.tags && eleitorSelecionado.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {eleitorSelecionado.tags.map(t => <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>)}
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

      {/* Dialog: detalhes da comunidade */}
      <Dialog open={!!comunidadeSelecionada} onOpenChange={() => setComunidadeSelecionada(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: comunidadeSelecionada?.cor }} />
              {comunidadeSelecionada?.nome}
            </DialogTitle>
          </DialogHeader>
          {comunidadeSelecionada && (
            <div className="space-y-3 text-sm">
              <div className="text-slate-500">
                {comunidadeSelecionada.bairro ? `${comunidadeSelecionada.bairro}, ${comunidadeSelecionada.cidade}` : comunidadeSelecionada.cidade}
              </div>
              {comunidadeSelecionada.descricao && <p className="text-slate-600">{comunidadeSelecionada.descricao}</p>}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-800">{comunidadeSelecionada.total_eleitores || 0}</div>
                  <div className="text-[10px] text-slate-500">eleitores</div>
                </div>
                {comunidadeSelecionada.latitude && <div className="text-[10px] text-green-600">📍 Posição exata no mapa</div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
