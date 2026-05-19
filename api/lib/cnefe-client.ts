/**
 * Cliente HTTP para a API Proxy CNEFE na VPS
 * Substitui conexao direta PostgreSQL por HTTPS
 */

import { env } from "./env.js";

const CNEFE_API_URL = env.cnefeApiUrl || "http://82.197.73.101";

interface CnefeEndereco {
  id: number;
  uf: string;
  codigo_municipio: string | null;
  municipio: string | null;
  bairro: string | null;
  tipo_logradouro: string | null;
  nome_logradouro: string;
  numero: string | null;
  cep: string | null;
  latitude: string;
  longitude: string;
  nivel_geocodificacao: number;
  codigo_unico: string | null;
}

interface CnefeStatus {
  total: number;
  ufs: Array<{ uf: string; count: number }>;
  offline: boolean;
  error?: string;
}

interface GeocodeResult {
  source: "cnefe";
  lat: number;
  lng: number;
  enderecoEncontrado: string;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
}

async function fetchCnefe(path: string, options?: RequestInit): Promise<any> {
  const url = `${CNEFE_API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`CNEFE API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getCnefeStatus(): Promise<CnefeStatus> {
  return fetchCnefe("/cnefe/status");
}

export async function buscarCnefeEndereco(params: {
  logradouro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  limite?: number;
}): Promise<CnefeEndereco[]> {
  const query = new URLSearchParams();
  if (params.logradouro) query.set("logradouro", params.logradouro);
  if (params.municipio) query.set("municipio", params.municipio);
  if (params.uf) query.set("uf", params.uf);
  if (params.cep) query.set("cep", params.cep);
  if (params.limite) query.set("limite", String(params.limite));
  return fetchCnefe(`/cnefe/buscar?${query.toString()}`);
}

export async function buscarCnefePorCep(cep: string): Promise<CnefeEndereco | null> {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length !== 8) return null;
  return fetchCnefe(`/cnefe/cep/${limpo}`);
}

export async function geocodificarCnefe(params: {
  endereco?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
}): Promise<GeocodeResult | null> {
  return fetchCnefe("/cnefe/geocodificar", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
