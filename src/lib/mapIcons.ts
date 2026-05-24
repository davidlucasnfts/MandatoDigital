import L from 'leaflet';

// ============================================================
// ÍCONES DO MAPA — SVG Profissionais (Tabler Icons base)
// Cores consistentes com o design system do projeto
// ============================================================

const STATUS_COLORS: Record<string, string> = {
  ativo: '#22c55e',
  inativo: '#94a3b8',
  pendente: '#f59e0b',
};

/**
 * Cria um ícone SVG customizado para o Leaflet
 * Usa SVG inline em vez de imagem externa — mais rápido e profissional
 */
function createSvgIcon(svgContent: string, size: number = 32): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${svgContent}</div>`,
    className: 'custom-svg-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// --- ELEITOR (pessoa/user) ---
export function createEleitorIcon(status: string = 'ativo'): L.DivIcon {
  const color = STATUS_COLORS[status] || STATUS_COLORS.ativo;
  return createSvgIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
    </svg>
  `, 32);
}

// --- LÍDER (coroa/crown) ---
export function createLiderIcon(status: string = 'ativo'): L.DivIcon {
  const color = status === 'ativo' ? '#9333ea' : STATUS_COLORS[status] || '#9333ea';
  return createSvgIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 6l4 6 5-4-2 10H5L3 8l5 4z"/>
      <circle cx="12" cy="6" r="2" fill="${color}" stroke="none"/>
    </svg>
  `, 36);
}

// --- COMUNIDADE (grupo de pessoas) ---
export function createComunidadeIcon(color: string = '#3b82f6'): L.DivIcon {
  return createSvgIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="8" r="2"/>
      <circle cx="15" cy="8" r="2"/>
      <path d="M6 15c0-2 2-3 4-3s4 1 4 3"/>
      <path d="M18 15c0-2-2-3-4-3"/>
      <circle cx="12" cy="5" r="2" fill="${color}" stroke="none"/>
      <path d="M12 12c-2 0-4 1-4 3v2h8v-2c0-2-2-3-4-3z" fill="${color}" opacity="0.2"/>
    </svg>
  `, 36);
}

// --- CIDADE FALLBACK (pin padrão) ---
export const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// --- HEATMAP (fogo/chama) ---
export function createHeatmapIcon(): L.DivIcon {
  return createSvgIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  `, 28);
}

// --- ROTA (navegação) ---
export function createRouteIcon(): L.DivIcon {
  return createSvgIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="19" r="3"/>
      <circle cx="18" cy="5" r="3"/>
      <path d="M12 19h4.5a3.5 3.5 0 0 0 0-7h-8a3.5 3.5 0 0 1 0-7H12"/>
    </svg>
  `, 28);
}

// Função utilitária: retorna o ícone correto baseado no tipo
export function getIconForType(
  type: 'eleitor' | 'lider' | 'comunidade' | 'heatmap' | 'route',
  statusOrColor: string = ''
): L.DivIcon | L.Icon {
  switch (type) {
    case 'lider':
      return createLiderIcon(statusOrColor);
    case 'eleitor':
      return createEleitorIcon(statusOrColor);
    case 'comunidade':
      return createComunidadeIcon(statusOrColor);
    case 'heatmap':
      return createHeatmapIcon();
    case 'route':
      return createRouteIcon();
    default:
      return defaultIcon;
  }
}
