import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sql } from "drizzle-orm";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "MandatoDigital/1.0 (contato@mandatodigital.com.br)";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeoCoords {
  lat: number;
  lng: number;
}

async function geocodeEndereco(
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
        "User-Agent": USER_AGENT,
        "Accept-Language": "pt-BR",
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as NominatimResult[];
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

// Delay helper para respeitar rate limit do Nominatim (1 req/segundo)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const geocodingRouter = createRouter({
  // Geocodifica TODOS os eleitores sem coordenadas (batch com throttle)
  geocodeAll: adminQuery.mutation(async () => {
    const db = getDb();

    // Busca eleitores sem coordenadas
    const result = await db.execute(sql`
      SELECT id, endereco, bairro, cidade, estado, cep
      FROM eleitores
      WHERE latitude IS NULL AND longitude IS NULL
    `);

    const rows = result as unknown as Array<{
      id: string;
      endereco: string | null;
      bairro: string | null;
      cidade: string | null;
      estado: string | null;
      cep: string | null;
    }>;

    if (rows.length === 0) {
      return { success: true, processed: 0, failed: 0, message: "Nenhum eleitor pendente" };
    }

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const e of rows) {
      const coords = await geocodeEndereco(
        e.endereco || "",
        e.bairro || "",
        e.cidade || "",
        e.estado || "",
        e.cep || ""
      );

      if (coords) {
        try {
          await db.execute(sql`
            UPDATE eleitores
            SET latitude = ${coords.lat}, longitude = ${coords.lng}
            WHERE id = ${e.id}
          `);
          processed++;
        } catch (err: any) {
          failed++;
          errors.push(`${e.id}: ${err?.message || "erro ao atualizar"}`);
        }
      } else {
        failed++;
        errors.push(`${e.id}: geocodificacao falhou`);
      }

      // Respeita rate limit do Nominatim: 1.2 segundos entre requisicoes
      await delay(1200);
    }

    return {
      success: true,
      processed,
      failed,
      total: rows.length,
      errors: errors.slice(0, 10),
    };
  }),
});
