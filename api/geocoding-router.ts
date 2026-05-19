import { z } from "zod";
import { createRouter, editorQuery } from "./middleware";
import { getDb, getCnefeDb } from "./queries/connection";
import { sql, eq, and, ilike } from "drizzle-orm";
import { cnefeEnderecos } from "../db/schema";

interface GeoCoords {
  lat: number;
  lng: number;
  source: "cnefe";
}

/**
 * Busca endereco no CNEFE (IBGE) — dados proprios na VPS
 * 100% CNEFE, sem fallback externo
 * Retorna coordenadas MEDIAS do CEP (mais preciso que 1 registro so)
 */
async function geocodeEndereco(
  endereco: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string
): Promise<GeoCoords | null> {
  const db = getCnefeDb();
  const cepLimpo = cep.replace(/\D/g, "");
  const temCepValido = cepLimpo.length === 8;
  const temCidadeEstado = cidade && cidade.trim().length > 0 && estado && estado.trim().length > 0;

  if (!temCepValido && !temCidadeEstado) {
    return null;
  }

  // 1. Tenta CNEFE por CEP (mais preciso) — busca TODOS os registros e calcula media
  if (temCepValido) {
    const porCep = await db
      .select()
      .from(cnefeEnderecos)
      .where(eq(cnefeEnderecos.cep, cepLimpo));

    if (porCep.length > 0) {
      const lats = porCep.map(r => parseFloat(r.latitude)).filter(n => !isNaN(n));
      const lngs = porCep.map(r => parseFloat(r.longitude)).filter(n => !isNaN(n));
      
      if (lats.length > 0 && lngs.length > 0) {
        return {
          lat: lats.reduce((a, b) => a + b, 0) / lats.length,
          lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
          source: "cnefe",
        };
      }
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

  // Nao encontrou no CNEFE
  return null;
}

export const geocodingRouter = createRouter({
  // Geocodifica um bairro (cidade + estado + bairro) — usa CNEFE
  geocodeBairro: editorQuery
    .input(z.object({ bairro: z.string(), cidade: z.string(), estado: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getCnefeDb();
      const bairroNorm = input.bairro
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const cidadeNorm = input.cidade
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const result = await db
        .select()
        .from(cnefeEnderecos)
        .where(
          and(
            ilike(cnefeEnderecos.bairro, `%${bairroNorm}%`),
            ilike(cnefeEnderecos.municipio, `%${cidadeNorm}%`)
          )
        )
        .limit(1);

      if (result.length > 0) {
        return {
          lat: parseFloat(result[0].latitude),
          lng: parseFloat(result[0].longitude),
        };
      }
      return null;
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

  // Geocodifica TODOS os eleitores sem coordenadas (batch)
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
