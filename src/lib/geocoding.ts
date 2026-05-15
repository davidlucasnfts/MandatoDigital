// Geocodificacao hibrida: CNEFE (IBGE) primario + Nominatim (OSM) fallback
// CNEFE = dados oficiais do Censo 2022, gratuitos, armazenaveis
// Nominatim = fallback para enderecos nao cobertos pelo CNEFE

import { trpc } from "@/providers/trpc";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

interface GeoCoords {
  lat: number;
  lng: number;
  source: "cnefe" | "nominatim";
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
    // Fallback direto para Nominatim se tRPC falhar
    return geocodeNominatimFallback(endereco, bairro, cidade, estado, cep);
  }
}

/**
 * Geocodifica apenas por CEP
 */
export async function geocodeCep(
  cep: string,
  cidade?: string,
  estado?: string
): Promise<GeoCoords | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;

  // Tenta CNEFE por CEP primeiro
  try {
    const response = await fetch(
      `/api/trpc/cnefe.buscarPorCep?input=${encodeURIComponent(JSON.stringify({ cep: clean }))}`
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
    // continua para fallback
  }

  // Fallback Nominatim
  const query =
    cidade && estado
      ? `${clean}, ${cidade}, ${estado}, Brasil`
      : `${clean}, Brasil`;
  return geocodeNominatimFallback("", "", cidade || "", estado || "", cep);
}

/**
 * Fallback direto para Nominatim (quando CNEFE nao tem o endereco)
 */
async function geocodeNominatimFallback(
  endereco: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  let query: string;
  if (cep && cep.replace(/\D/g, "").length === 8) {
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
        "User-Agent": "MandatoDigital/1.0 (contato@mandatodigital.com.br)",
        "Accept-Language": "pt-BR",
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      source: "nominatim",
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
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
