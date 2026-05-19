// Hook para geocodificacao inteligente no cadastro de eleitores
// Cascata: Here API -> CNEFE -> Centro da cidade

import { useState, useCallback } from "react";
import { geocodeSmart, geocodeCepSmart, getHereStatus } from "@/lib/here-geocoding";

interface GeocodeResult {
  lat: number;
  lng: number;
  source: "here" | "cnefe" | "fallback";
  displayName?: string;
  confidence?: number;
}

interface UseGeocodingReturn {
  geocode: (
    endereco: string,
    numero: string,
    bairro: string,
    cidade: string,
    estado: string,
    cep: string
  ) => Promise<GeocodeResult | null>;
  geocodeByCep: (
    cep: string,
    cidade?: string,
    estado?: string,
    logradouro?: string
  ) => Promise<GeocodeResult | null>;
  isLoading: boolean;
  hereEnabled: boolean;
  hereHasKey: boolean;
}

export function useGeocoding(): UseGeocodingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const status = getHereStatus();

  const geocode = useCallback(
    async (
      endereco: string,
      numero: string,
      bairro: string,
      cidade: string,
      estado: string,
      cep: string
    ): Promise<GeocodeResult | null> => {
      setIsLoading(true);
      try {
        const result = await geocodeSmart(
          endereco,
          numero,
          bairro,
          cidade,
          estado,
          cep
        );
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const geocodeByCep = useCallback(
    async (
      cep: string,
      cidade?: string,
      estado?: string,
      logradouro?: string
    ): Promise<GeocodeResult | null> => {
      setIsLoading(true);
      try {
        const result = await geocodeCepSmart(cep, cidade, estado, logradouro);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    geocode,
    geocodeByCep,
    isLoading,
    hereEnabled: status.enabled,
    hereHasKey: status.hasKey,
  };
}
