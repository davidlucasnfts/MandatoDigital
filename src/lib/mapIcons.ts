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

// ============= ÍCONES INTERNOS (20x20) — SVGs PREENCHIDOS =============

// 👑 COROA DOURADA — LÍDER
const crownIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M1 15h18L16.5 6l-4 2.5L10 3.5 7.5 8.5l-4-2.5L1 15z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.2"/>
  <circle cx="3" cy="5" r="2" fill="#fbbf24"/>
  <circle cx="10" cy="2.5" r="2" fill="#fbbf24"/>
  <circle cx="17" cy="5" r="2" fill="#fbbf24"/>
  <rect x="3" y="12" width="14" height="2.5" rx="0.5" fill="#fbbf24"/>
</svg>`;

// 👤 PESSOA PREENCHIDA — ELEITOR ATIVO
const personIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="7" r="4" fill="#93c5fd"/>
  <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="#60a5fa"/>
</svg>`;

// ⚠️ PESSOA PREENCHIDA — ELEITOR PENDENTE (borda laranja)
const personPendingIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="7" r="4" fill="#fde68a"/>
  <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="#fbbf24"/>
</svg>`;

// 🏢 PRÉDIO PREENCHIDO — COMUNIDADE
const buildingIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
  <rect x="2" y="1" width="20" height="22" rx="2" fill="#4ade80"/>
  <rect x="2" y="1" width="20" height="22" rx="2" fill="none" stroke="white" stroke-width="1.5"/>
  <rect x="5" y="4" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
  <rect x="14" y="4" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
  <rect x="5" y="11" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
  <rect x="14" y="11" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
  <rect x="8" y="18" width="8" height="5" rx="1" fill="white" opacity="0.9"/>
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
