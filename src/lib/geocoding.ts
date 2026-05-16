// Geocodificacao usando apenas CNEFE (IBGE) — dados proprios na VPS
// Sem dependencia de servicos externos

interface GeoCoords {
  lat: number;
  lng: number;
  source: "cnefe";
  displayName?: string;
}

/**
 * Geocodifica um endereco usando CNEFE (local) + Nominatim (fallback)
 * Chamada via tRPC — os dados sao salvos no banco, sem restricoes de armazenamento
 */
export async function geocodeEndereco(
  endereco: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  // Usa a API tRPC que faz CNEFE + fallback Nominatim
  try {
    const response = await fetch("/api/trpc/cnefe.geocodificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        json: {
          endereco,
          bairro,
          municipio: cidade,
          uf: estado,
          cep,
        },
      }),
    });

    const json = await response.json();
    const result = json.result?.data;

    if (!result) return null;

    return {
      lat: result.lat,
      lng: result.lng,
      source: result.source,
      displayName: result.enderecoEncontrado,
    };
  } catch {
    return null;
  }
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

  try {
    const params: Record<string, string> = { cep: clean };
    if (logradouro) params.logradouro = logradouro;
    
    const response = await fetch(
      `/api/trpc/cnefe.buscarPorCep?input=${encodeURIComponent(JSON.stringify(params))}`
    );
    const json = await response.json();
    const result = json.result?.data;

    if (result) {
      return {
        lat: parseFloat(result.latitude),
        lng: parseFloat(result.longitude),
        source: "cnefe",
        displayName: `${result.tipoLogradouro || ""} ${result.nomeLogradouro}, ${result.numero || "S/N"}`,
      };
    }
  } catch {
    // ignora erro
  }

  return null;
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
