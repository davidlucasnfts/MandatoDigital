import { z } from "zod";
import { createRouter, editorQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { sql } from "drizzle-orm";
import { geocodificarCnefe } from "./lib/cnefe-client.js";

interface GeoCoords {
  lat: number;
  lng: number;
  source: "cnefe";
}

/**
 * Busca endereco no CNEFE via API Proxy na VPS
 * Retorna coordenadas MEDIAS do CEP (mais preciso que 1 registro so)
 */
async function geocodeEndereco(
  endereco: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  const cepLimpo = cep.replace(/\D/g, "");
  const temCepValido = cepLimpo.length === 8;
  const temCidadeEstado = cidade && cidade.trim().length > 0 && estado && estado.trim().length > 0;

  if (!temCepValido && !temCidadeEstado) {
    return null;
  }

  try {
    const result = await geocodificarCnefe({
      endereco: endereco || undefined,
      bairro: bairro || undefined,
      municipio: cidade,
      uf: estado,
      cep: cepLimpo || undefined,
    });

    if (result) {
      return {
        lat: result.lat,
        lng: result.lng,
        source: "cnefe",
      };
    }
  } catch (err: any) {
    console.error("[geocodeEndereco] CNEFE erro:", err?.message || err);
  }

  return null;
}

export const geocodingRouter = createRouter({
  // Geocodifica um bairro (cidade + estado + bairro)
  geocodeBairro: editorQuery
    .input(z.object({ bairro: z.string(), cidade: z.string(), estado: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const result = await geocodificarCnefe({
          bairro: input.bairro,
          municipio: input.cidade,
          uf: input.estado,
        });
        if (result) {
          return { lat: result.lat, lng: result.lng };
        }
      } catch {
        // CNEFE offline ou nao encontrou
      }
      return null;
    }),

  // Geocodifica endereco completo de comunidade
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
      return geocodeEndereco(
        input.logradouro || "",
        input.bairro || "",
        input.cidade,
        input.estado,
        input.cep || ""
      );
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

  // Geocodifica TODOS os eleitores sem coordenadas (batch)
  geocodeAll: editorQuery.mutation(async ({ ctx }) => {
    console.log("[geocodeAll] iniciado por:", ctx.user.email, "role:", ctx.user.role);
    const db = getDb();

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
            : "endereco nao encontrado no CNEFE";
        errors.push(`${e.id}: ${motivo}`);
      }
    }

    return {
      success: true,
      processed,
      failed,
      total: rows.length,
      errors: errors.slice(0, 10),
      message: processed > 0
        ? `Geocodificacao concluida: ${processed} sucesso, ${failed} falha(s) (100% CNEFE)`
        : `Nenhum endereco encontrado no CNEFE. Verifique se os eleitores tem CEP, endereco, cidade e estado preenchidos.`,
    };
  }),
});
