// Geocodificacao Here API (free tier: 30k/mes)
// Fallback: CNEFE -> centro da cidade

import { geocodeCep, geocodeEndereco as geocodeCnefe } from "./geocoding";
import { trackGeocodingRequest, getRecommendedProvider } from "./geocoding-monitor";

interface HereConfig {
  apiKey: string;
  enabled: boolean;
}

interface GeoCoords {
  lat: number;
  lng: number;
  source: "here" | "cnefe" | "fallback";
  displayName?: string;
  confidence?: number; // 0-1, maior = mais preciso
}

// Configuracao Here (troque para key real quando tiver)
const HERE_CONFIG: HereConfig = {
  apiKey: import.meta.env.VITE_HERE_API_KEY || "",
  enabled: !!import.meta.env.VITE_HERE_API_KEY,
};

/**
 * Geocodifica endereco completo usando Here API
 * Free tier: 30.000 requisicoes/mes
 * Documentacao: https://developer.here.com/documentation/geocoding-search-api/
 */
async function geocodeHere(
  endereco: string,
  numero: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  console.log("[Here] Config:", HERE_CONFIG);
  
  if (!HERE_CONFIG.enabled || !HERE_CONFIG.apiKey) {
    console.log("[Here] Desabilitado - sem API key");
    return null;
  }

  // Monta query no formato Here
  // Formato: "numero rua, bairro, cidade, estado, CEP, Brasil"
  const parts = [
    numero,
    endereco,
    bairro,
    cidade,
    estado,
    cep.replace(/\D/g, ""),
    "Brasil",
  ].filter(Boolean);

  const query = parts.join(", ");
  console.log("[Here] Query:", query);

  try {
    const url = new URL("https://geocode.search.hereapi.com/v1/geocode");
    url.searchParams.set("q", query);
    url.searchParams.set("apiKey", HERE_CONFIG.apiKey);
    url.searchParams.set("limit", "1");
    url.searchParams.set("lang", "pt-BR");

    console.log("[Here] URL:", url.toString().replace(HERE_CONFIG.apiKey, "***"));

    const res = await fetch(url.toString());
    console.log("[Here] Response status:", res.status);
    
    if (!res.ok) {
      console.error("[Here] HTTP error:", res.status);
      return null;
    }

    const data = await res.json();
    console.log("[Here] Response:", data);
    
    // Monitora requisicao (mesmo se falhar)
    const tracking = trackGeocodingRequest("here");
    if (tracking.shouldAlert && tracking.alertMessage) {
      console.warn("[Here Monitor]", tracking.alertMessage);
      // Aqui poderia enviar para um servico de logging ou email
    }
    
    const item = data.items?.[0];
    if (!item || !item.position) {
      return null;
    }

    // Calcula confianca baseada no resultado
    // houseNumber = precisao de numero de casa (melhor)
    // street = precisao de rua
    // district = precisao de bairro
    const resultType = item.resultType || "";
    const houseNumber = item.houseNumberType || "";
    const confidence =
      resultType === "houseNumber" || houseNumber
        ? 0.95
        : resultType === "street"
          ? 0.7
          : resultType === "locality"
            ? 0.4
            : 0.3;

    return {
      lat: item.position.lat,
      lng: item.position.lng,
      source: "here",
      displayName: item.title || query,
      confidence,
    };
  } catch (err) {
    console.error("[Here] error:", err);
    return null;
  }
}

/**
 * Fallback: retorna coordenadas aproximadas do centro da cidade
 * Usado quando Here e CNEFE falham
 */
async function geocodeFallback(
  cidade: string,
  estado: string
): Promise<GeoCoords | null> {
  // Tabela hardcoded de centros de cidade para CE e MA
  // Futuramente pode vir de uma API ou banco de dados
  const centros: Record<string, { lat: number; lng: number }> = {
    // Ceara
    "SAO LUIS": { lat: -2.5297, lng: -44.3028 },
    "TERESINA": { lat: -5.0892, lng: -42.8016 },
    "FORTALEZA": { lat: -3.7327, lng: -38.527 },
    "JUAZEIRO DO NORTE": { lat: -7.2131, lng: -39.3153 },
    "SOBRAL": { lat: -3.6842, lng: -40.3562 },
    "CRATO": { lat: -7.234, lng: -39.4103 },
    "IGUATU": { lat: -6.359, lng: -39.298 },
    "QUIXADA": { lat: -4.9713, lng: -39.0157 },
    // Maranhao
    "IMPERATRIZ": { lat: -5.5185, lng: -47.4775 },
    "CAXIAS": { lat: -4.8589, lng: -43.3565 },
    "SAO JOSE DE RIBAMAR": { lat: -2.5617, lng: -44.0539 },
    "BACABAL": { lat: -4.2915, lng: -44.7567 },
    "BALSAS": { lat: -7.5321, lng: -46.0356 },
    "CHAPADINHA": { lat: -3.7396, lng: -43.3603 },
    "CODO": { lat: -4.455, lng: -43.8856 },
  };

  const key = (cidade + "," + estado).toUpperCase().replace(/\s+/g, " ");
  const coords = centros[key] || centros[cidade.toUpperCase().trim()];

  if (coords) {
    return {
      lat: coords.lat,
      lng: coords.lng,
      source: "fallback",
      displayName: "Centro de " + cidade,
      confidence: 0.1,
    };
  }

  return null;
}

/**
 * Geocodificacao para CADASTRO DE ELEITOR
 * Fluxo otimizado para economizar Here API:
 * 1. CNEFE (dados proprios, custo zero) — sempre que tiver CEP
 * 2. Here API (precisao de numero) — apenas quando o numero e informado/alterado
 * 3. Centro da cidade (fallback)
 *
 * Uso: chame esta funcao no cadastro de eleitores
 */
export async function geocodeSmart(
  endereco: string,
  numero: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  console.log("[geocodeSmart] Input:", { endereco, numero, bairro, cidade, estado, cep });

  // 1. SEMPRE tenta CNEFE primeiro (custo zero, tem todos os CEPs)
  console.log("[geocodeSmart] Tentando CNEFE...");
  const cnefeResult = await geocodeCnefe(endereco, bairro, cidade, estado, cep);
  console.log("[geocodeSmart] CNEFE result:", cnefeResult);

  if (cnefeResult) {
    console.log("[geocodeSmart] CNEFE sucesso:", cnefeResult.displayName);
    return {
      ...cnefeResult,
      confidence: 0.6,
    };
  }

  // 2. Here API como fallback (quando CNEFE nao encontra)
  console.log("[geocodeSmart] Tentando Here API...");
  const hereResult = await geocodeHere(
    endereco,
    numero,
    bairro,
    cidade,
    estado,
    cep
  );
  console.log("[geocodeSmart] Here result:", hereResult);

  if (hereResult && hereResult.confidence && hereResult.confidence > 0.5) {
    console.log("[geocodeSmart] Here API sucesso:", hereResult.displayName);
    return hereResult;
  }

  // 3. Fallback: centro da cidade
  console.log("[geocodeSmart] Tentando fallback...");
  const fallbackResult = await geocodeFallback(cidade, estado);
  console.log("[geocodeSmart] Fallback result:", fallbackResult);

  if (fallbackResult) {
    console.log("[geocodeSmart] Fallback sucesso:", fallbackResult.displayName);
    return fallbackResult;
  }

  console.log("[geocodeSmart] Nenhum resultado encontrado");
  return null;
}

/**
 * Geocodificacao com precisao de NUMERO (Here API)
 * Chamada APENAS quando o usuario digita/altera o numero da casa
 * Economiza o free tier da Here (30k/mes)
 */
export async function geocodeWithNumber(
  endereco: string,
  numero: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string,
  coordsBase?: { lat: number; lng: number } | null
): Promise<GeoCoords | null> {
  console.log("[geocodeWithNumber] Input:", { endereco, numero, bairro, cidade, estado, cep, coordsBase });

  // Se nao tem numero valido, retorna coordenadas base (do CEP)
  if (!numero || numero.trim() === "" || numero === "S/N") {
    console.log("[geocodeWithNumber] Sem numero valido, retornando coords base");
    if (coordsBase) {
      return {
        lat: coordsBase.lat,
        lng: coordsBase.lng,
        source: "cnefe",
        displayName: `${endereco}, S/N`,
        confidence: 0.5,
      };
    }
    return null;
  }

  // Tenta Here API para precisao de numero
  console.log("[geocodeWithNumber] Tentando Here API com numero...");
  const hereResult = await geocodeHere(
    endereco,
    numero,
    bairro,
    cidade,
    estado,
    cep
  );
  console.log("[geocodeWithNumber] Here result:", hereResult);

  if (hereResult && hereResult.confidence && hereResult.confidence > 0.7) {
    console.log("[geocodeWithNumber] Here API sucesso:", hereResult.displayName);
    return hereResult;
  }

  // Se Here falhar, retorna coords base (do CEP) com o numero
  if (coordsBase) {
    console.log("[geocodeWithNumber] Here falhou, retornando coords base");
    return {
      lat: coordsBase.lat,
      lng: coordsBase.lng,
      source: "cnefe",
      displayName: `${endereco}, ${numero}`,
      confidence: 0.5,
    };
  }

  return null;
}

/**
 * Geocodifica por CEP com cascata Here -> CNEFE
 */
export async function geocodeCepSmart(
  cep: string,
  cidade?: string,
  estado?: string,
  logradouro?: string
): Promise<GeoCoords | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;

  // 1. Tenta Here API por CEP
  if (HERE_CONFIG.enabled) {
    try {
      const url = new URL("https://geocode.search.hereapi.com/v1/geocode");
      url.searchParams.set("qq", "postalCode=" + clean);
      url.searchParams.set("apiKey", HERE_CONFIG.apiKey);
      url.searchParams.set("limit", "1");

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const item = data.items?.[0];
        if (item?.position) {
          return {
            lat: item.position.lat,
            lng: item.position.lng,
            source: "here",
            displayName: item.title || cep,
            confidence: 0.9,
          };
        }
      }
    } catch (err) {
      console.error("[Here CEP] error:", err);
    }
  }

  // 2. Fallback: CNEFE
  const cnefeResult = await geocodeCep(cep, cidade, estado, logradouro);
  if (cnefeResult) {
    return {
      ...cnefeResult,
      confidence: 0.6,
    };
  }

  return null;
}

// Exporta status da configuracao Here
export function getHereStatus(): { enabled: boolean; hasKey: boolean } {
  return {
    enabled: HERE_CONFIG.enabled,
    hasKey: !!HERE_CONFIG.apiKey,
  };
}
