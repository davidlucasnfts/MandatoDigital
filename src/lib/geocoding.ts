// Geocodificacao usando apenas CNEFE (IBGE) — dados proprios na VPS
// Sem dependencia de servicos externos

interface GeoCoords {
  lat: number;
  lng: number;
  source: "cnefe";
  displayName?: string;
}

/**
 * Faz chamada tRPC MUTATION via HTTP POST
 */
async function trpcCall<T>(path: string, payload: unknown): Promise<T | null> {
  try {
    const res = await fetch(`/api/trpc/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ json: payload }),
    });

    if (!res.ok) {
      console.error(`[geocoding] tRPC error ${res.status}:`, await res.text());
      return null;
    }

    const json = await res.json();
    // tRPC response format: { result: { data: T } }
    return json.result?.data ?? null;
  } catch (err) {
    console.error("[geocoding] fetch error:", err);
    return null;
  }
}

/**
 * Faz chamada tRPC QUERY via HTTP GET
 */
async function trpcQuery<T>(path: string, payload: unknown): Promise<T | null> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: payload }));
    const res = await fetch(`/api/trpc/${path}?input=${input}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      console.error(`[geocoding] tRPC query error ${res.status}:`, await res.text());
      return null;
    }

    const json = await res.json();
    // tRPC response format: { result: { data: T } }
    return json.result?.data ?? null;
  } catch (err) {
    console.error("[geocoding] fetch error:", err);
    return null;
  }
}

/**
 * Geocodifica um endereco usando CNEFE (local)
 * Chamada via tRPC — os dados sao salvos no banco, sem restricoes de armazenamento
 */
export async function geocodeEndereco(
  endereco: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  const result = await trpcCall<{
    source: "cnefe";
    lat: number;
    lng: number;
    enderecoEncontrado: string;
  }>("cnefe.geocodificar", {
    endereco,
    bairro,
    municipio: cidade,
    uf: estado,
    cep,
  });

  if (!result) return null;

  return {
    lat: result.lat,
    lng: result.lng,
    source: "cnefe",
    displayName: result.enderecoEncontrado,
  };
}

/**
 * Geocodifica por CEP usando apenas CNEFE (dados proprios na VPS)
 * Se logradouro for informado, filtra por ele para maior precisao
 */
export async function geocodeCep(
  cep: string,
  cidade?: string,
  estado?: string,
  logradouro?: string
): Promise<GeoCoords | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;

  const result = await trpcQuery<{
    latitude: string;
    longitude: string;
    tipoLogradouro: string | null;
    nomeLogradouro: string | null;
    numero: string | null;
  }>("cnefe.buscarPorCep", {
    cep: clean,
    logradouro,
  });

  console.log("[geocodeCep] Resultado bruto:", result);

  if (!result) return null;

  console.log("[geocodeCep] latitude:", result.latitude, "longitude:", result.longitude);

  const lat = parseFloat(result.latitude);
  const lng = parseFloat(result.longitude);

  console.log("[geocodeCep] lat parseFloat:", lat, "lng parseFloat:", lng);

  // Verifica se as coordenadas sao validas
  if (isNaN(lat) || isNaN(lng)) {
    console.log("[geocodeCep] Coordenadas invalidas do CNEFE, retornando null");
    return null;
  }

  return {
    lat,
    lng,
    source: "cnefe",
    displayName: `${result.tipoLogradouro || ""} ${result.nomeLogradouro}, ${result.numero || "S/N"}`,
  };
}

// Cache em memoria para evitar requisicoes duplicadas na mesma sessao
const cache = new Map<string, GeoCoords | null>();

export async function geocodeWithCache(
  key: string,
  fn: () => Promise<GeoCoords | null>
): Promise<GeoCoords | null> {
  if (cache.has(key)) return cache.get(key)!;
  const result = await fn();
  cache.set(key, result);
  return result;
}
