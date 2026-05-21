import L from 'leaflet';

// ============================================================
// ÍCONES DO MAPA — Icons8 (PNG colorido gratuito)
// Base URL: https://img.icons8.com/color/48/{icon-name}.png
// ============================================================

const ICONS8_BASE = 'https://img.icons8.com/color/48';

function createIcons8Icon(iconName: string, size: number = 32): L.Icon {
  return new L.Icon({
    iconUrl: `${ICONS8_BASE}/${iconName}.png`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });
}

// --- ELEITOR (pessoa verde) ---
export function createEleitorIcon(_status: string = 'ativo'): L.Icon {
  return createIcons8Icon('user', 32);
}

// --- LÍDER (coroa/roxo) ---
export function createLiderIcon(_status: string = 'ativo'): L.Icon {
  return createIcons8Icon('crown', 36);
}

// --- COMUNIDADE (grupo de pessoas) ---
export function createComunidadeIcon(_color: string): L.Icon {
  return createIcons8Icon('conference', 36);
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

// Função utilitária: retorna o ícone correto baseado no tipo
export function getIconForType(
  type: 'eleitor' | 'lider' | 'comunidade',
  _statusOrColor: string
): L.Icon {
  switch (type) {
    case 'lider':
      return createLiderIcon();
    case 'eleitor':
      return createEleitorIcon();
    case 'comunidade':
      return createComunidadeIcon('');
    default:
      return defaultIcon;
  }
}
