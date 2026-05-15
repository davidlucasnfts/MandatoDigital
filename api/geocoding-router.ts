import { z } from "zod";
import { createRouter, editorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sql, eq, and, ilike } from "drizzle-orm";
import { cnefeEnderecos } from "../db/schema";

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
  source: "cnefe" | "nominatim";
}

/**
 * Busca endereco no CNEFE (IBGE) primeiro, fallback para Nominatim
 */
async function geocodeEndereco(
  endereco: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  const db = getDb();
  const cepLimpo = cep.replace(/\D/g, "");
  const temCepValido = cepLimpo.length === 8;
  const temCidadeEstado = cidade && cidade.trim().length > 0 && estado && estado.trim().length > 0;

  if (!temCepValido && !temCidadeEstado) {
    return null;
  }

  // 1. Tenta CNEFE por CEP (mais preciso)
  if (temCepValido) {
    const porCep = await db
      .select()
      .from(cnefeEnderecos)
      .where(eq(cnefeEnderecos.cep, cepLimpo))
      .limit(1);

    if (porCep.length > 0) {
      return {
        lat: parseFloat(porCep[0].latitude),
        lng: parseFloat(porCep[0].longitude),
        source: "cnefe",
      };
    }
  }

  // 2. Tenta CNEFE por logradouro + municipio
  if (endereco && endereco.trim().length >= 3 && cidade) {
    const logradouroNorm = endereco
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const municipioNorm = cidade
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const porLogradouro = await db
      .select()
      .from(cnefeEnderecos)
      .where(
        and(
          ilike(cnefeEnderecos.nomeLogradouro, `%${logradouroNorm}%`),
          ilike(cnefeEnderecos.municipio, `%${municipioNorm}%`),
          estado ? eq(cnefeEnderecos.uf, estado.toUpperCase()) : undefined
        )
      )
      .limit(1);

    if (porLogradouro.length > 0) {
      return {
        lat: parseFloat(porLogradouro[0].latitude),
        lng: parseFloat(porLogradouro[0].longitude),
        source: "cnefe",
      };
    }
  }

  // 3. Fallback Nominatim (OpenStreetMap)
  if (temCepValido) {
    const coords = await buscarNominatim(`${cepLimpo}, ${cidade || ""}, ${estado || ""}, Brasil`);
    if (coords) return { ...coords, source: "nominatim" };
  }

  if (endereco && endereco.trim().length > 0) {
    const coords = await buscarNominatim(`${endereco}, ${bairro || ""}, ${cidade}, ${estado}, Brasil`);
    if (coords) return { ...coords, source: "nominatim" };
  }

  const coords = await buscarNominatim(`${cidade}, ${estado}, Brasil`);
  return coords ? { ...coords, source: "nominatim" } : null;
}

async function buscarNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
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
  // Geocodifica um bairro (cidade + estado + bairro)
  geocodeBairro: editorQuery
    .input(z.object({ bairro: z.string(), cidade: z.string(), estado: z.string().optional() }))
    .mutation(async ({ input }) => {
      const query = `${input.bairro}, ${input.cidade}, ${input.estado || ""}, Brasil`;
      const coords = await buscarNominatim(query);
      return coords;
    }),

  // Geocodifica endereco completo de comunidade (rua, numero, bairro, cidade, estado, cep)
  geocodeComunidade: editorQuery
    .input(z.object({
      logradouro: z.string().optional(),
      numero: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string(),
      estado: z.string(),
      cep: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const coords = await geocodeEndereco(
        input.logradouro || "",
        input.bairro || "",
        input.cidade,
        input.estado,
        input.cep || ""
      );
      return coords;
    }),

  // Lista eleitores sem coordenadas (para debug)
  pending: editorQuery.query(async () => {
    const db = getDb();
    const result = await db.execute(sql`
      SELECT id, nome, endereco, bairro, cidade, estado, cep
      FROM eleitores
      WHERE latitude IS NULL AND longitude IS NULL
      ORDER BY nome
    `);
    return result as unknown as Array<{
      id: string;
      nome: string;
      endereco: string | null;
      bairro: string | null;
      cidade: string | null;
      estado: string | null;
      cep: string | null;
    }>;
  }),

  // Geocodifica TODOS os eleitores sem coordenadas (batch com throttle)
  geocodeAll: editorQuery.mutation(async ({ ctx }) => {
    console.log("[geocodeAll] iniciado por:", ctx.user.email, "role:", ctx.user.role);
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
    let processedCnefe = 0;
    let processedNominatim = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const e of rows) {
      console.log("[geocodeAll] tentando:", e.id, e.endereco, e.cidade, e.estado, e.cep);
      const coords = await geocodeEndereco(
        e.endereco || "",
        e.bairro || "",
        e.cidade || "",
        e.estado || "",
        e.cep || ""
      );
      console.log("[geocodeAll] resultado:", e.id, coords);

      if (coords) {
        try {
          await db.execute(sql`
            UPDATE eleitores
            SET latitude = ${coords.lat}, longitude = ${coords.lng}
            WHERE id = ${e.id}
          `);
          processed++;
          if (coords.source === "cnefe") processedCnefe++;
          else processedNominatim++;
        } catch (err: any) {
          failed++;
          errors.push(`${e.id}: ${err?.message || "erro ao atualizar"}`);
        }
      } else {
        failed++;
        const motivo = !e.cidade || !e.estado 
          ? "cidade/estado ausente" 
          : !e.cep && !e.endereco 
            ? "CEP ou endereco ausente" 
            : "endereco nao encontrado (CNEFE + Nominatim)";
        errors.push(`${e.id}: ${motivo}`);
      }

      // Só delay se usou Nominatim (CNEFE é local, não precisa)
      if (!coords || coords.source === "nominatim") {
        await delay(1200);
      }
    }

    return {
      success: true,
      processed,
      processedCnefe,
      processedNominatim,
      failed,
      total: rows.length,
      errors: errors.slice(0, 10),
      message: processed > 0 
        ? `Geocodificacao concluida: ${processed} sucesso (${processedCnefe} CNEFE, ${processedNominatim} Nominatim), ${failed} falha(s)` 
        : `Nenhum endereco encontrado. Verifique se os eleitores tem CEP, endereco, cidade e estado preenchidos.`,
    };
  }),
});
