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

// ============= ÍCONES INTERNOS — SVGs ESCOLHIDOS PELO USUÁRIO =============
// Eleitor: E13 (degradê radial) | Comunidade: C13 (prédio 3D colorido)

// 👤 ELEITOR — E13: Silhueta com degradê radial azul
const personIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
  <defs><radialGradient id="gradE" cx="30%" cy="30%"><stop offset="0%" stop-color="#bfdbfe"/><stop offset="100%" stop-color="#1d4ed8"/></radialGradient></defs>
  <circle cx="12" cy="7" r="4" fill="url(#gradE)" stroke="white" stroke-width="1.5"/>
  <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="url(#gradE)" stroke="white" stroke-width="1.5"/>
</svg>`;

// ⚠️ ELEITOR PENDENTE — mesmo SVG, cor do círculo muda no container
const personPendingIcon = personIcon;

// 👑 LÍDER — mesmo estilo degradê do eleitor, cor roxa
const crownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
  <defs><radialGradient id="gradL" cx="30%" cy="30%"><stop offset="0%" stop-color="#ddd6fe"/><stop offset="100%" stop-color="#6d28d9"/></radialGradient></defs>
  <circle cx="12" cy="7" r="4" fill="url(#gradL)" stroke="white" stroke-width="1.5"/>
  <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="url(#gradL)" stroke="white" stroke-width="1.5"/>
</svg>`;

// 🏢 COMUNIDADE — C13: Prédio 3D colorido
const buildingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
  <rect x="4" y="3" width="16" height="18" rx="2" fill="#22c55e" stroke="white" stroke-width="1.5"/>
  <rect x="7" y="6" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="13" y="6" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="7" y="12" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="13" y="12" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="9" y="18" width="6" height="3" rx="1" fill="#14532d"/>
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
