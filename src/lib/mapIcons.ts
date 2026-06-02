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

// Formato Sticker (adesivo inclinado) — escolha do usuário
function stickerBase(color: string, inner: string, size: number = 40): string {
  return `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 8%;background:${color};border:3px solid white;box-shadow:2px 3px 10px rgba(0,0,0,0.25), inset 0 -3px 8px rgba(0,0,0,0.15), inset 0 3px 8px rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;transform:rotate(-12deg);">
    <div style="transform:rotate(12deg);display:flex;align-items:center;justify-content:center;">${inner}</div>
  </div>`;
}

// ============= ÍCONES INTERNOS — SVGs ESCOLHIDOS PELO USUÁRIO =============
// Eleitor: original outline branco | Comunidade: C13 (prédio 3D colorido)

// 👤 ELEITOR — original outline branco (aumentado para 24x24)
const personIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="7" r="4" fill="rgba(255,255,255,0.3)"/>
  <path d="M6 21v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" fill="rgba(255,255,255,0.2)"/>
  <path d="M10 14l-1-2h6l-1 2" stroke-width="1.5"/>
</svg>`;

// ⚠️ ELEITOR PENDENTE — mesmo ícone original
const personPendingIcon = personIcon;

// 👑 LÍDER — original outline branco
const crownIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="6" r="4" fill="rgba(255,255,255,0.3)"/>
  <path d="M4 22v-3a4 4 0 0 1 4-4h2.5" fill="rgba(255,255,255,0.2)"/>
  <path d="M10.5 15h3l-1-3 4 2-2 3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 22l1.5-7" stroke-linecap="round"/>
</svg>`;

// 🏢 COMUNIDADE — C13: Prédio 3D colorido
const buildingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
  <rect x="4" y="3" width="16" height="18" rx="2" fill="#22c55e" stroke="white" stroke-width="1.5"/>
  <rect x="7" y="6" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="13" y="6" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="7" y="12" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="13" y="12" width="4" height="4" rx="1" fill="#86efac"/>
  <rect x="9" y="18" width="6" height="3" rx="1" fill="#14532d"/>
</svg>`;

// ============= FUNÇÕES EXPORTADAS =============

// Eleitor — formato sticker com ícone original
export function createEleitorIcon(status: string = 'ativo'): L.DivIcon {
  const color = status === 'pendente' ? '#f59e0b' : status === 'inativo' ? '#94a3b8' : '#2563eb';
  const inner = status === 'pendente' ? personPendingIcon : personIcon;
  return divIcon(stickerBase(color, inner, 40), 40, [20, 20]);
}

// Líder — formato sticker com ícone original
export function createLiderIcon(_status: string = 'ativo'): L.DivIcon {
  return divIcon(stickerBase('#7c3aed', crownIcon, 40), 40, [20, 20]);
}

// Comunidade — formato sticker com prédio 3D
export function createComunidadeIcon(_color: string): L.DivIcon {
  return divIcon(stickerBase('#16a34a', buildingIcon, 40), 40, [20, 20]);
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
