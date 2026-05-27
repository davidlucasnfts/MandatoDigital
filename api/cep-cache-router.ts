import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { sql } from "drizzle-orm";

export const cepCacheRouter = createRouter({
  // Busca coordenadas no cache por CEP
  buscar: publicQuery
    .input(z.object({ cep: z.string().min(8).max(9) }))
    .query(async ({ input }) => {
      const clean = input.cep.replace(/\D/g, "");
      const db = getDb();
      const result = await db.execute(sql`
        SELECT latitude, longitude, source
        FROM cep_cache
        WHERE cep = ${clean}
        LIMIT 1
      `);
      const row = result.rows[0];
      if (!row) return null;
      return {
        lat: parseFloat(row.latitude as string),
        lng: parseFloat(row.longitude as string),
        source: row.source as string,
      };
    }),

  // Salva coordenadas no cache
  salvar: publicQuery
    .input(z.object({
      cep: z.string().min(8).max(9),
      latitude: z.number(),
      longitude: z.number(),
      source: z.string().default("here"),
      logradouro: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const clean = input.cep.replace(/\D/g, "");
      const db = getDb();
      await db.execute(sql`
        INSERT INTO cep_cache (cep, latitude, longitude, source, logradouro, bairro, cidade, estado)
        VALUES (${clean}, ${input.latitude.toString()}, ${input.longitude.toString()}, ${input.source}, ${input.logradouro || null}, ${input.bairro || null}, ${input.cidade || null}, ${input.estado || null})
        ON CONFLICT (cep) DO UPDATE SET
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          source = EXCLUDED.source,
          logradouro = EXCLUDED.logradouro,
          bairro = EXCLUDED.bairro,
          cidade = EXCLUDED.cidade,
          estado = EXCLUDED.estado,
          created_at = NOW()
      `);
      return { success: true };
    }),
});
