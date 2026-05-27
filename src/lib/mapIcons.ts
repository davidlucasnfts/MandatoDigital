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

// Pin base: gotinha com contorno
function pinBase(color: string, inner: string): string {
  return `<svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 14 18 28 18 28s18-14 18-28C36 8.059 27.941 0 18 0z" fill="${color}"/>
    <path d="M18 2C9.164 2 2 9.164 2 18c0 12.2 16 26 16 26s16-13.8 16-26C34 9.164 26.836 2 18 2z" fill="white" opacity="0.15"/>
    <g transform="translate(8, 6)">${inner}</g>
  </svg>`;
}

// ============= ÍCONES INTERNOS (20x20) =============

// 👑 COROA — LÍDER
const crownIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M1 15h18L16.5 6l-4 2.5L10 3.5 7.5 8.5l-4-2.5L1 15z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.2"/>
  <circle cx="3" cy="5" r="2" fill="#fbbf24"/>
  <circle cx="10" cy="2.5" r="2" fill="#fbbf24"/>
  <circle cx="17" cy="5" r="2" fill="#fbbf24"/>
  <rect x="3" y="12" width="14" height="2.5" rx="0.5" fill="#fbbf24"/>
</svg>`;

// 👤 PESSOA — ELEITOR
const personIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="5.5" r="4" fill="white" stroke="white" stroke-width="1.5"/>
  <path d="M1 18.5C1 13.5 5 10.5 10 10.5s9 3 9 8.5" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
</svg>`;

// ⚠️ PENDENTE — pessoa com sinal
const personPendingIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="9" cy="5" r="3.5" fill="white"/>
  <path d="M1 16c0-4 3-7 8-7s8 3 8 7" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
  <circle cx="16.5" cy="3.5" r="3.5" fill="#ef4444"/>
  <text x="16.5" y="5.5" text-anchor="middle" fill="white" font-size="5" font-weight="bold">!</text>
</svg>`;

// 🏢 COMUNIDADE — prédio com múltiplos andares
const buildingIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <rect x="1" y="3" width="18" height="16" rx="1.5" fill="white" opacity="0.95"/>
  <rect x="3.5" y="6" width="4" height="4" rx="0.5" fill="#0891b2" opacity="0.85"/>
  <rect x="12.5" y="6" width="4" height="4" rx="0.5" fill="#0891b2" opacity="0.85"/>
  <rect x="3.5" y="12" width="4" height="4" rx="0.5" fill="#0891b2" opacity="0.85"/>
  <rect x="12.5" y="12" width="4" height="4" rx="0.5" fill="#0891b2" opacity="0.85"/>
  <rect x="7" y="0" width="6" height="4" rx="1" fill="white" opacity="0.95"/>
</svg>`;

// ============= FUNÇÕES EXPORTADAS =============

// Eleitor
export function createEleitorIcon(status: string = 'ativo'): L.DivIcon {
  const color = status === 'pendente' ? '#f59e0b' : status === 'inativo' ? '#94a3b8' : '#3b82f6';
  const inner = status === 'pendente' ? personPendingIcon : personIcon;
  return divIcon(pinBase(color, inner), 36);
}

// Líder
export function createLiderIcon(_status: string = 'ativo'): L.DivIcon {
  return divIcon(pinBase('#7c3aed', crownIcon), 36);
}

// Comunidade
export function createComunidadeIcon(color: string): L.DivIcon {
  return divIcon(pinBase(color, buildingIcon), 36);
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
