// Geocodificacao via Nominatim (OpenStreetMap)
// Converte endereco/CEP em coordenadas lat/lng reais
// https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
}

interface GeoCoords {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Geocodifica um endereco completo (rua, bairro, cidade, estado, CEP)
 * Retorna null se nao encontrar ou em caso de erro
 */
export async function geocodeEndereco(endereco: string, bairro: string, cidade: string, estado: string, cep: string): Promise<GeoCoords | null> {
  // Monta query: prioriza CEP se disponivel, senao endereco completo
  let query: string;
  if (cep && cep.replace(/\D/g, '').length === 8) {
    query = `${cep}, ${cidade}, ${estado}, Brasil`;
  } else if (endereco && cidade && estado) {
    query = `${endereco}, ${bairro}, ${cidade}, ${estado}, Brasil`;
  } else if (cidade && estado) {
    query = `${cidade}, ${estado}, Brasil`;
  } else {
    return null;
  }

  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MandatoDigital/1.0 (contato@mandatodigital.com.br)',
        'Accept-Language': 'pt-BR',
      },
    });

    if (!res.ok) return null;

    const data: NominatimResult[] = await res.json();
    if (!data || data.length === 0) return null;

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch {
    return null;
  }
}

/**
 * Geocodifica apenas por CEP (mais rapido, menos preciso que endereco completo)
 */
export async function geocodeCep(cep: string, cidade?: string, estado?: string): Promise<GeoCoords | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;

  const query = cidade && estado
    ? `${clean}, ${cidade}, ${estado}, Brasil`
    : `${clean}, Brasil`;

  return geocodeEndereco('', '', cidade || '', estado || '', cep);
}

// Cache em memoria para evitar requisicoes duplicadas na mesma sessao
const cache = new Map<string, GeoCoords | null>();

export async function geocodeWithCache(key: string, fn: () => Promise<GeoCoords | null>): Promise<GeoCoords | null> {
  if (cache.has(key)) return cache.get(key)!;
  const result = await fn();
  cache.set(key, result);
  return result;
}
