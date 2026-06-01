import L from 'leaflet';

// ============================================================
// ÍCONES DO MAPA — DivIcons SVG customizados e reconhecíveis
// ============================================================

function divIcon(html: string, size: number, anchor?: [number, number]): L.DivIcon {
  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: anchor || [size / 2, size],
    popupAnchor: [0, -size + 4],
  });
}

// Círculo com borda branca (mesmo padrão dos clusters)
function circleBase(color: string, inner: string, size: number = 36): string {
  const r = size / 2;
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.3), inset 0 -3px 8px rgba(0,0,0,0.2), inset 0 3px 8px rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;">
    ${inner}
  </div>`;
}

// ============= ÍCONES INTERNOS (20x20) — SVGs ESTILO CLUSTER =============
// Mesmos SVGs usados nos clusters, para manter consistência visual

// 👤 ELEITOR — outline branco (igual cluster eleitor)
const personIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="7" r="4" fill="rgba(255,255,255,0.3)"/>
  <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="rgba(255,255,255,0.2)"/>
  <path d="M10 14l-1-2h6l-1 2" stroke-width="1.5"/>
</svg>`;

// ⚠️ ELEITOR PENDENTE — mesmo ícone, cor do círculo muda no container
const personPendingIcon = personIcon;

// 👑 LÍDER — outline branco (igual cluster líder)
const crownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="6" r="4" fill="rgba(255,255,255,0.3)"/>
  <path d="M4 22v-3a4 4 0 0 1 4-4h2.5" fill="rgba(255,255,255,0.2)"/>
  <path d="M10.5 15h3l-1-3 4 2-2 3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 22l1.5-7" stroke-linecap="round"/>
</svg>`;

// 🏢 COMUNIDADE — outline branco (igual cluster comunidade)
const buildingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="9" cy="7" r="3.5" fill="rgba(255,255,255,0.3)"/>
  <circle cx="17" cy="7" r="3.5" fill="rgba(255,255,255,0.3)"/>
  <path d="M5 21v-2a3.5 3.5 0 0 1 3.5-3.5h1A3.5 3.5 0 0 1 13 19v2" fill="rgba(255,255,255,0.2)"/>
  <path d="M13 21v-2a3.5 3.5 0 0 1 3.5-3.5h1A3.5 3.5 0 0 1 21 19v2" fill="rgba(255,255,255,0.2)"/>
</svg>`;

// ============= FUNÇÕES EXPORTADAS =============

// Eleitor — círculo com borda branca (igual cluster)
export function createEleitorIcon(status: string = 'ativo'): L.DivIcon {
  const color = status === 'pendente' ? '#f59e0b' : status === 'inativo' ? '#94a3b8' : '#3b82f6';
  const inner = status === 'pendente' ? personPendingIcon : personIcon;
  return divIcon(circleBase(color, inner, 36), 36, [18, 18]);
}

// Líder — círculo com borda branca (igual cluster)
export function createLiderIcon(_status: string = 'ativo'): L.DivIcon {
  return divIcon(circleBase('#7c3aed', crownIcon, 36), 36, [18, 18]);
}

// Comunidade — círculo com borda branca (igual cluster)
export function createComunidadeIcon(_color: string): L.DivIcon {
  return divIcon(circleBase('#16a34a', buildingIcon, 32), 32, [16, 16]);
}

// Cluster
export function createClusterIcon(cluster: any, color: string = '#3b82f6'): L.DivIcon {
  const count = cluster.getChildCount();
  let size = 30;
  if (count >= 100) size = 44;
  else if (count >= 50) size = 38;
  else if (count >= 20) size = 34;
  return L.divIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:${count >= 100 ? 13 : count >= 50 ? 12 : 11}px;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${count}</div>`,
    className: 'marker-cluster-custom',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Fallback
export const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Função utilitária
export function getIconForType(
  type: 'eleitor' | 'lider' | 'comunidade',
  statusOrColor: string
): L.Icon | L.DivIcon {
  switch (type) {
    case 'lider':
      return createLiderIcon(statusOrColor);
    case 'eleitor':
      return createEleitorIcon(statusOrColor);
    case 'comunidade':
      return createComunidadeIcon(statusOrColor);
    default:
      return defaultIcon;
  }
}
