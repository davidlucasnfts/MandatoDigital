import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Users, X, Building2, Navigation, MapPinned, Loader2,
  Eye, Layers, Search, Crown, User, BuildingCommunity,
  World, BarChart3, Target, Home
} from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createComunidadeIcon, createEleitorIcon, createLiderIcon } from '@/lib/mapIcons';
import { StatCard, PanelCard, EmptyState, AnimatedBar } from '@/components/dashboard';
import type { Eleitor, Comunidade } from '@/lib/supabase';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const BOUNDS_BRASIL = L.latLngBounds(L.latLng(-33.75, -73.99), L.latLng(5.27, -34.79));
const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

const clusterColors = {
  ativo: '#3b82f6',
  pendente: '#f59e0b',
  lider: '#7c3aed',
  comunidade: '#22c55e',
};

function createClusterIcon(cluster: any, color: string = clusterColors.ativo, type: 'eleitor' | 'comunidade' | 'lider' = 'eleitor') {
  const count = cluster.getChildCount();
  const size = 48;
  const bgColor = type === 'comunidade' ? '#16a34a' : type === 'lider' ? '#7c3aed' : '#2563eb';

  // SVGs internos dos clusters (mesmos ícones dos marcadores individuais)
  const getIconSvg = () => {
    if (type === 'comunidade') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" fill="#22c55e" stroke="white" stroke-width="1.5"/>
        <rect x="7" y="6" width="4" height="4" rx="1" fill="#86efac"/>
        <rect x="13" y="6" width="4" height="4" rx="1" fill="#86efac"/>
        <rect x="7" y="12" width="4" height="4" rx="1" fill="#86efac"/>
        <rect x="13" y="12" width="4" height="4" rx="1" fill="#86efac"/>
        <rect x="9" y="18" width="6" height="3" rx="1" fill="#14532d"/>
      </svg>`;
    }
    if (type === 'lider') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M5 16L3 8l5 3 4-7 4 7 5-3-2 8H5z" fill="#fbbf24" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <rect x="5" y="18" width="14" height="3" rx="1" fill="#f59e0b"/>
      </svg>`;
    }
    // Eleitor — E14: 3D com sombra (mesmo do marcador individual)
    return `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none">
      <ellipse cx="13" cy="20" rx="5" ry="2" fill="rgba(0,0,0,0.25)"/>
      <circle cx="12" cy="7" r="4" fill="white" opacity="0.95"/>
      <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="white" opacity="0.95"/>
      <circle cx="12" cy="7" r="4" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
      <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
    </svg>`;
  };

  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="background:${bgColor};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.4), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3);">
          ${getIconSvg()}
        </div>
        <div style="position:absolute;bottom:-3px;right:-3px;background:white;color:${bgColor};font-weight:900;font-size:13px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid ${bgColor};box-shadow:0 2px 6px rgba(0,0,0,0.25);">${count}</div>
      </div>
    `,
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

function TileLayerController({ camada }: { camada: 'voyager' | 'satellite' | 'dark' }) {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [camada, map]);
  return null;
}

function MapBoundsController({ points, trigger }: { points: [number, number][]; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
  }, [points, trigger, map]);
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
    attribution: 'Tiles &copy; Esri',
    subdomains: '',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
};

export default function MapaPageV2() {
  const navigate = useNavigate();
  const { data: eleitores, loading: loadingEleitores } = useEleitores();
  const { data: comunidades, loading: loadingComunidades } = useComunidades();

  // Filtros essenciais
  const [filtroComunidade, setFiltroComunidade] = useState<string | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [buscaNome, setBuscaNome] = useState('');

  // Camadas essenciais
  const [mostrarLideres, setMostrarLideres] = useState(true);
  const [mostrarEleitores, setMostrarEleitores] = useState(true);
  const [mostrarComunidades, setMostrarComunidades] = useState(true);
  const [camadaBase, setCamadaBase] = useState<'voyager' | 'satellite' | 'dark'>('voyager');

  // Dialogs
  const [eleitorSelecionado, setEleitorSelecionado] = useState<Eleitor | null>(null);
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState<Comunidade | null>(null);

  // FlyTo + FitBounds
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);
  const [fitTrigger, setFitTrigger] = useState(0);

  const eleitoresFiltrados = useMemo(() => eleitores.filter(e => {
    if (filtroComunidade && e.comunidade_id !== filtroComunidade) return false;
    if (filtroNivel && e.nivel !== filtroNivel) return false;
    if (filtroStatus && e.status !== filtroStatus) return false;
    if (buscaNome) {
      const q = buscaNome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const nome = e.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!nome.includes(q)) return false;
    }
    return true;
  }), [eleitores, filtroComunidade, filtroNivel, filtroStatus, buscaNome]);

  const eleitoresComCoords = useMemo(() => eleitoresFiltrados.filter(e => e.latitude && e.longitude), [eleitoresFiltrados]);

  const comunidadesNoMapa = useMemo(() => comunidades.filter(c => c.latitude && c.longitude).map(c => ({
    ...c,
    coords: [c.latitude!, c.longitude!] as [number, number]
  })), [comunidades]);

  // Todos os pontos visíveis no mapa (para fitBounds)
  const todosOsPontos = useMemo(() => {
    const pts: [number, number][] = [];
    if (mostrarComunidades) comunidadesNoMapa.forEach(c => pts.push(c.coords));
    if (mostrarEleitores || mostrarLideres) {
      eleitoresComCoords.forEach(e => {
        if (e.nivel === 'lider' && !mostrarLideres) return;
        if (e.nivel !== 'lider' && !mostrarEleitores) return;
        pts.push([e.latitude!, e.longitude!]);
      });
    }
    return pts;
  }, [comunidadesNoMapa, eleitoresComCoords, mostrarComunidades, mostrarEleitores, mostrarLideres]);

  useEffect(() => {
    if (filtroComunidade) {
      const c = comunidadesNoMapa.find(c => c.id === filtroComunidade);
      if (c) setFlyTo(c.coords);
    } else { setFlyTo(null); }
  }, [filtroComunidade, comunidadesNoMapa]);

  const stats = useMemo(() => {
    const total = eleitoresFiltrados.length;
    const lideres = eleitoresFiltrados.filter(e => e.nivel === 'lider').length;
    const ativos = eleitoresFiltrados.filter(e => e.status === 'ativo').length;
    const pendentes = eleitoresFiltrados.filter(e => e.status === 'pendente').length;
    const comCoords = eleitoresComCoords.length;
    return { total, lideres, ativos, pendentes, comCoords };
  }, [eleitoresFiltrados, eleitoresComCoords]);

  // Top bairros (concentração geográfica) — só eleitores COM bairro preenchido
  const topBairros = useMemo(() => {
    const contagem = new Map<string, number>();
    eleitoresComCoords.forEach(e => {
      const bairro = e.bairro?.trim();
      if (!bairro) return; // Ignora eleitores sem bairro
      contagem.set(bairro, (contagem.get(bairro) || 0) + 1);
    });
    return Array.from(contagem.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [eleitoresComCoords]);

  const centroBrasil: [number, number] = [-14.2350, -51.9253];
  const loading = loadingEleitores || loadingComunidades;
  const temFiltros = filtroComunidade || filtroNivel || filtroStatus || buscaNome;

  const limparFiltros = () => { setFiltroComunidade(null); setFiltroNivel(null); setFiltroStatus(null); setBuscaNome(''); };
  const centralizarMapa = useCallback(() => setFitTrigger(t => t + 1), []);

  return (
    <div className="space-y-3">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Mapa Territorial
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {stats.total} eleitor{stats.total > 1 ? 'es' : ''} visíveis · {stats.comCoords} com coordenadas
            </p>
          </div>
        </div>
      </motion.div>

      {/* StatCards */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
          <StatCard label="Total no Mapa" value={stats.total} icon={Users} color="blue" delay={0} />
          <StatCard label="Com Coordenadas" value={stats.comCoords} icon={MapPin} color="green" delay={1} />
          <StatCard label="Líderes no Mapa" value={stats.lideres} icon={Crown} color="purple" delay={2} />
          <StatCard label="Comunidades" value={comunidadesNoMapa.length} icon={BuildingCommunity} color="cyan" delay={3} />
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <PanelCard title="Filtros" icon={Search} iconColor="text-blue-600" iconBg="bg-blue-50" delay={4}>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={buscaNome} onChange={e => setBuscaNome(e.target.value)} placeholder="Buscar eleitor..." className="pl-9 h-9 text-sm" />
              {buscaNome && <button onClick={() => setBuscaNome('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
            </div>
            <select value={filtroComunidade || ''} onChange={e => setFiltroComunidade(e.target.value || null)} className="h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600">
              <option value="">Todas comunidades</option>
              {comunidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select value={filtroNivel || ''} onChange={e => setFiltroNivel(e.target.value || null)} className="h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600">
              <option value="">Todos níveis</option>
              <option value="lider">Líder</option>
              <option value="eleitor">Eleitor</option>
            </select>
            <select value={filtroStatus || ''} onChange={e => setFiltroStatus(e.target.value || null)} className="h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-600">
              <option value="">Todos status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="pendente">Pendente</option>
            </select>
            {temFiltros && (
              <button onClick={limparFiltros} className="h-9 px-2.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm hover:shadow-md transition-all flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Limpar
              </button>
            )}
          </div>
        </PanelCard>
      </motion.div>

      {/* Mapa Base + Camadas */}
      <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PanelCard title="Mapa Base" icon={MapPinned} iconColor="text-emerald-600" iconBg="bg-emerald-50" delay={5}>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCamadaBase('voyager')} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${camadaBase === 'voyager' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <MapPinned className="w-3 h-3" /> Ruas
              </button>
              <button onClick={() => setCamadaBase('satellite')} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${camadaBase === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <World className="w-3 h-3" /> Satélite
              </button>
              <button onClick={() => setCamadaBase('dark')} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${camadaBase === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <MapPin className="w-3 h-3" /> Escuro
              </button>
            </div>
          </PanelCard>
          <PanelCard title="Camadas" icon={Layers} iconColor="text-purple-600" iconBg="bg-purple-50" delay={6}>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setMostrarLideres(!mostrarLideres)} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mostrarLideres ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Crown className="w-3 h-3" /> Líderes
              </button>
              <button onClick={() => setMostrarEleitores(!mostrarEleitores)} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mostrarEleitores ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <User className="w-3 h-3" /> Eleitores
              </button>
              <button onClick={() => setMostrarComunidades(!mostrarComunidades)} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mostrarComunidades ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <BuildingCommunity className="w-3 h-3" /> Comunidades
              </button>
            </div>
          </PanelCard>
        </div>
      </motion.div>

      {/* Mapa - largura total, altura aumentada */}
      <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
        <Card className="h-[65vh] min-h-[500px]">
          <CardContent className="p-0 h-full relative">
            {loading ? (
              <div className="h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm">Carregando mapa...</p>
                <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-pulse rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            ) : todosOsPontos.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState icon={MapPin} title="Nenhum ponto no mapa" description="Cadastre eleitores com endereço ou comunidades com coordenadas para visualizar no mapa" action={{ label: 'Cadastrar eleitor', onClick: () => navigate('/dashboard/eleitores') }} />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <MapContainer center={centroBrasil} zoom={4} minZoom={3} maxBounds={BOUNDS_BRASIL} maxBoundsViscosity={1.0} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayerController camada={camadaBase} />
                  <TileLayer attribution={tileLayers[camadaBase].attribution} url={tileLayers[camadaBase].url} subdomains={tileLayers[camadaBase].subdomains} maxZoom={19} key={camadaBase} />
                  <MapController flyTo={flyTo} />
                  <MapBoundsController points={todosOsPontos} trigger={fitTrigger} />

                  {/* Comunidades — com cluster separado */}
                  {mostrarComunidades && (
                    <MarkerClusterGroup chunkedLoading iconCreateFunction={(cluster) => createClusterIcon(cluster, clusterColors.comunidade, 'comunidade')} maxClusterRadius={80} spiderfyOnMaxZoom showCoverageOnHover={false}>
                      {comunidadesNoMapa.map(c => (
                        <Marker key={`comunidade-${c.id}`} position={c.coords} icon={createComunidadeIcon(c.cor)} zIndexOffset={1000} eventHandlers={{ click: () => setComunidadeSelecionada(c), mouseover: (ev) => ev.target.openPopup(), mouseout: (ev) => ev.target.closePopup() }}>
                      <Popup>
                        <div className="text-xs min-w-[180px]">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                            <Building2 className="w-3.5 h-3.5" style={{ color: c.cor }} />
                            {c.nome}
                          </div>
                          <div className="text-slate-500">{c.bairro ? `${c.bairro}, ${c.cidade}` : c.cidade}</div>
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-500">{c.total_eleitores || 0} eleitores</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                      ))}
                    </MarkerClusterGroup>
                  )}

                  {/* Líderes */}
                  {mostrarLideres && (
                    <MarkerClusterGroup chunkedLoading iconCreateFunction={(cluster) => createClusterIcon(cluster, clusterColors.lider, 'lider')} maxClusterRadius={70} spiderfyOnMaxZoom showCoverageOnHover={false}>
                      {eleitoresComCoords.filter(e => e.nivel === 'lider').map(e => (
                        <Marker key={e.id} position={[e.latitude!, e.longitude!]} icon={createLiderIcon(e.status)} eventHandlers={{ click: () => setEleitorSelecionado(e), mouseover: (ev) => ev.target.openPopup(), mouseout: (ev) => ev.target.closePopup() }}>
                        <Popup>
                          <div className="text-xs min-w-[200px]">
                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center"><Crown className="w-2.5 h-2.5 text-white" /></span>
                              {e.nome}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-[10px] capitalize border-purple-200 text-purple-700 bg-purple-50">{e.nivel}</Badge>
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
                          </div>
                        </Popup>
                      </Marker>
                      ))}
                    </MarkerClusterGroup>
                  )}

                  {/* Eleitores */}
                  {mostrarEleitores && (
                    <MarkerClusterGroup chunkedLoading iconCreateFunction={(cluster) => createClusterIcon(cluster, clusterColors.ativo, 'eleitor')} maxClusterRadius={60} spiderfyOnMaxZoom showCoverageOnHover={false}>
                      {eleitoresComCoords.filter(e => e.nivel !== 'lider').map(e => (
                        <Marker key={e.id} position={[e.latitude!, e.longitude!]} icon={createEleitorIcon(e.status)} eventHandlers={{ click: () => setEleitorSelecionado(e), mouseover: (ev) => ev.target.openPopup(), mouseout: (ev) => ev.target.closePopup() }}>
                        <Popup>
                          <div className="text-xs min-w-[200px]">
                            <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                              {e.nome}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge variant="outline" className="text-[10px] capitalize border-blue-200 text-blue-700 bg-blue-50">{e.nivel}</Badge>
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
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                    </MarkerClusterGroup>
                  )}
                </MapContainer>

                {/* Botão Centralizar — DEPOIS do MapContainer no DOM = fica por cima */}
                <button
                  onClick={centralizarMapa}
                  className="absolute top-3 right-3 z-[1000] bg-white rounded-lg shadow-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-1.5"
                  title="Centralizar no conteúdo"
                >
                  <Target className="w-3.5 h-3.5" /> Centralizar
                </button>

                {/* Legenda flutuante — DEPOIS do MapContainer no DOM = fica por cima */}
                <div className="absolute bottom-6 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 px-3 py-2.5 space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Legenda</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="w-3.5 h-3.5 rounded-full bg-purple-600 border border-white shadow-sm inline-block" /> Líder
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shadow-sm inline-block" /> Eleitor
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <span className="w-3.5 h-3.5 rounded-full bg-green-600 border border-white shadow-sm inline-block" /> Comunidade
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats abaixo do mapa */}
      <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Concentração por Bairro */}
          <PanelCard title="Concentração por Bairro" icon={Home} iconColor="text-orange-600" iconBg="bg-orange-50" delay={5}>
            {topBairros.length > 0 ? (
              <div className="space-y-2.5">
                {topBairros.map(([bairro, count], i) => {
                  const percent = stats.comCoords > 0 ? (count / stats.comCoords) * 100 : 0;
                  const colors = ['bg-orange-500', 'bg-orange-400', 'bg-orange-300', 'bg-orange-200', 'bg-orange-100'];
                  return (
                    <div key={bairro}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 truncate max-w-[70%]">{bairro}</span>
                        <span className="font-semibold text-slate-800">{count}</span>
                      </div>
                      <AnimatedBar progress={percent} color={colors[i] || 'bg-orange-200'} height="h-1.5" delay={0.1 * i} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nenhum bairro identificado nos eleitores com coordenadas.</p>
            )}
          </PanelCard>

          {/* Cobertura — só mostra se não for 100% */}
          {stats.total > 0 && stats.comCoords < stats.total && (
            <PanelCard title="Cobertura Geográfica" icon={MapPin} iconColor="text-green-600" iconBg="bg-green-50" delay={6}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Com coordenadas</span>
                  <span className="font-semibold text-blue-600">{stats.comCoords}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sem coordenadas</span>
                  <span className="font-semibold text-slate-600">{stats.total - stats.comCoords}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 mb-1">Mapeamento</div>
                  <AnimatedBar progress={stats.total > 0 ? (stats.comCoords / stats.total) * 100 : 0} color="bg-green-500" height="h-2" delay={0.7} />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Mapeado</span>
                    <span>{stats.total > 0 ? Math.round((stats.comCoords / stats.total) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </PanelCard>
          )}
        </div>
      </motion.div>

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
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => { const id = eleitorSelecionado.id; setEleitorSelecionado(null); navigate(`/dashboard/eleitores?preview=${id}`); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
                >
                  <Eye className="w-3.5 h-3.5" /> Ver ficha completa
                </button>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
