import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Users, X, Building2, Navigation, MapPinned, Loader2,
  Eye, Layers, Search, Crown, User, BuildingCommunity,
  World, BarChart3, ChevronDown, ChevronUp, CheckCircle2
} from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCoordenadasCidade } from '@/data/coordenadasCidades';
import { createComunidadeIcon, createEleitorIcon, createLiderIcon } from '@/lib/mapIcons';
import { StatCard, PanelCard, EmptyState, AnimatedBar } from '@/components/dashboard';
import type { Eleitor, Comunidade } from '@/lib/supabase';

import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const BOUNDS_BRASIL = L.latLngBounds(L.latLng(-33.75, -73.99), L.latLng(5.27, -34.79));
const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

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

function TileLayerController({ camada }: { camada: 'voyager' | 'satellite' | 'dark' }) {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); }, [camada, map]);
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

  // FlyTo
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

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

  const centroBrasil: [number, number] = [-14.2350, -51.9253];
  const loading = loadingEleitores || loadingComunidades;
  const temFiltros = filtroComunidade || filtroNivel || filtroStatus || buscaNome;

  const limparFiltros = () => { setFiltroComunidade(null); setFiltroNivel(null); setFiltroStatus(null); setBuscaNome(''); };

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

      {/* Toolbar de controles */}
      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <PanelCard title="Controles" icon={Layers} iconColor="text-blue-600" iconBg="bg-blue-50" delay={4}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Busca */}
            <div className="relative flex-1 min-w-[180px] max-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={buscaNome} onChange={e => setBuscaNome(e.target.value)} placeholder="Buscar eleitor..." className="pl-9 h-9 text-sm" />
              {buscaNome && <button onClick={() => setBuscaNome('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-1.5">
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

            {/* Grupo: Mapa Base */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mapa Base</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCamadaBase('voyager')} className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${camadaBase === 'voyager' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <MapPinned className="w-3 h-3" /> Ruas
                </button>
                <button onClick={() => setCamadaBase('satellite')} className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${camadaBase === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <World className="w-3 h-3" /> Satélite
                </button>
                <button onClick={() => setCamadaBase('dark')} className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${camadaBase === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <MapPin className="w-3 h-3" /> Escuro
                </button>
              </div>
            </div>

            {/* Grupo: Camadas */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Camadas</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setMostrarLideres(!mostrarLideres)} className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mostrarLideres ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <Crown className="w-3 h-3" /> Líderes
                </button>
                <button onClick={() => setMostrarEleitores(!mostrarEleitores)} className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mostrarEleitores ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <User className="w-3 h-3" /> Eleitores
                </button>
                <button onClick={() => setMostrarComunidades(!mostrarComunidades)} className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold rounded-lg transition-all ${mostrarComunidades ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <BuildingCommunity className="w-3 h-3" /> Comunidades
                </button>
              </div>
            </div>
          </div>
        </PanelCard>
      </motion.div>

      {/* Mapa - largura total */}
      <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
        <Card className="h-[500px] lg:h-[600px]">
          <CardContent className="p-0 h-full overflow-visible relative">
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
            ) : eleitoresComCoords.length === 0 && comunidadesNoMapa.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState icon={MapPin} title="Nenhum ponto no mapa" description="Cadastre eleitores com endereço ou comunidades com coordenadas para visualizar no mapa" action={{ label: 'Cadastrar eleitor', onClick: () => navigate('/dashboard/eleitores') }} />
              </div>
            ) : (
              <MapContainer center={centroBrasil} zoom={4} minZoom={3} maxBounds={BOUNDS_BRASIL} maxBoundsViscosity={1.0} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayerController camada={camadaBase} />
                <TileLayer attribution={tileLayers[camadaBase].attribution} url={tileLayers[camadaBase].url} subdomains={tileLayers[camadaBase].subdomains} maxZoom={19} key={camadaBase} />
                <MapController flyTo={flyTo} />

                {/* Comunidades */}
                {mostrarComunidades && comunidadesNoMapa.map(c => (
                  <Marker key={`comunidade-${c.id}`} position={c.coords} icon={createComunidadeIcon(c.cor)} eventHandlers={{ click: () => setComunidadeSelecionada(c) }}>
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

                {/* Eleitores e Líderes */}
                {(mostrarEleitores || mostrarLideres) && (
                  <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon} maxClusterRadius={60} spiderfyOnMaxZoom showCoverageOnHover={false}>
                    {eleitoresComCoords.filter(e => {
                      if (e.nivel === 'lider') return mostrarLideres;
                      return mostrarEleitores;
                    }).map(e => (
                      <Marker key={e.id} position={[e.latitude!, e.longitude!]} icon={e.nivel === 'lider' ? createLiderIcon(e.status) : createEleitorIcon(e.status)} eventHandlers={{ click: () => setEleitorSelecionado(e) }}>
                      <Popup>
                        <div className="text-xs min-w-[200px]">
                          <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                            {e.nivel === 'lider' && <span className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center"><Crown className="w-2.5 h-2.5 text-white" /></span>}
                            {e.nome}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
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
                        </div>
                      </Popup>
                    </Marker>
                    ))}
                  </MarkerClusterGroup>
                )}
              </MapContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats abaixo do mapa */}
      <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Distribuição */}
          <PanelCard title="Distribuição" icon={BarChart3} iconColor="text-purple-600" iconBg="bg-purple-50" delay={5}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-semibold text-slate-800">{stats.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Líderes</span>
                <span className="font-semibold text-purple-600">{stats.lideres}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ativos</span>
                <span className="font-semibold text-green-600">{stats.ativos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pendentes</span>
                <span className="font-semibold text-amber-600">{stats.pendentes}</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 mb-1">Por nível</div>
                <AnimatedBar progress={stats.total > 0 ? (stats.lideres / stats.total) * 100 : 0} color="bg-purple-500" height="h-2" delay={0.5} />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" />Líderes {stats.lideres}</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" />Eleitores {stats.total - stats.lideres}</span>
                </div>
              </div>
            </div>
          </PanelCard>

          {/* Cobertura */}
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
              {/* Botão para ver ficha completa */}
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
