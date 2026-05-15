import { z } from "zod";
import { createRouter, publicQuery, editorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cnefeEnderecos } from "../db/schema";
import { sql, eq, and, like, ilike } from "drizzle-orm";

export const cnefeRouter = createRouter({
  // Busca endereco no CNEFE por logradouro + municipio (usado no cadastro)
  buscarEndereco: publicQuery
    .input(
      z.object({
        logradouro: z.string().min(3),
        municipio: z.string().min(2),
        uf: z.string().length(2).optional(),
        numero: z.string().optional(),
        cep: z.string().optional(),
        limite: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Normaliza termos de busca
      const logradouroNorm = input.logradouro
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const municipioNorm = input.municipio
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      // Busca por CEP primeiro (mais preciso)
      if (input.cep) {
        const cepLimpo = input.cep.replace(/\D/g, "");
        if (cepLimpo.length === 8) {
          const porCep = await db
            .select()
            .from(cnefeEnderecos)
            .where(eq(cnefeEnderecos.cep, cepLimpo))
            .limit(input.limite);
          if (porCep.length > 0) return porCep;
        }
      }

      // Busca por logradouro + municipio
      const conditions = [
        ilike(cnefeEnderecos.nomeLogradouro, `%${logradouroNorm}%`),
        ilike(cnefeEnderecos.municipio, `%${municipioNorm}%`),
      ];

      if (input.uf) {
        conditions.push(eq(cnefeEnderecos.uf, input.uf.toUpperCase()));
      }

      const result = await db
        .select()
        .from(cnefeEnderecos)
        .where(and(...conditions))
        .limit(input.limite);

      return result;
    }),

  // Busca por CEP (para preencher endereco automaticamente no cadastro)
  buscarPorCep: publicQuery
    .input(z.object({ cep: z.string().min(8).max(9) }))
    .query(async ({ input }) => {
      const db = getDb();
      const cepLimpo = input.cep.replace(/\D/g, "");

      const result = await db
        .select()
        .from(cnefeEnderecos)
        .where(eq(cnefeEnderecos.cep, cepLimpo))
        .limit(1);

      return result[0] || null;
    }),

  // Geocodifica um endereco: busca no CNEFE, fallback para Nominatim
  geocodificar: publicQuery
    .input(
      z.object({
        endereco: z.string().optional(),
        bairro: z.string().optional(),
        municipio: z.string().min(2),
        uf: z.string().length(2),
        cep: z.string().optional(),
        numero: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // 1. Tenta buscar no CNEFE primeiro
      const logradouroNorm = (input.endereco || "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const municipioNorm = input.municipio
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (logradouroNorm.length >= 3) {
        const cnefeResult = await db
          .select()
          .from(cnefeEnderecos)
          .where(
            and(
              ilike(cnefeEnderecos.nomeLogradouro, `%${logradouroNorm}%`),
              ilike(cnefeEnderecos.municipio, `%${municipioNorm}%`),
              eq(cnefeEnderecos.uf, input.uf.toUpperCase())
            )
          )
          .limit(1);

        if (cnefeResult.length > 0) {
          const r = cnefeResult[0];
          return {
            source: "cnefe" as const,
            lat: parseFloat(r.latitude),
            lng: parseFloat(r.longitude),
            enderecoEncontrado: `${r.tipoLogradouro || ""} ${r.nomeLogradouro}, ${r.numero || "S/N"}`,
            bairro: r.bairro,
            municipio: r.municipio,
            uf: r.uf,
            cep: r.cep,
          };
        }
      }

      // 2. Fallback para Nominatim (OpenStreetMap)
      const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
      const query = input.cep
        ? `${input.cep.replace(/\D/g, "")}, ${input.municipio}, ${input.uf}, Brasil`
        : `${input.endereco || ""}, ${input.bairro || ""}, ${input.municipio}, ${input.uf}, Brasil`;

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
          source: "nominatim" as const,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          enderecoEncontrado: data[0].display_name,
          bairro: null,
          municipio: input.municipio,
          uf: input.uf,
          cep: input.cep || null,
        };
      } catch {
        return null;
      }
    }),

  // Status da importacao CNEFE (quantos enderecos temos no banco)
  status: publicQuery.query(async () => {
    const db = getDb();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(cnefeEnderecos);
    const ufs = await db
      .select({ uf: cnefeEnderecos.uf, count: sql<number>`count(*)` })
      .from(cnefeEnderecos)
      .groupBy(cnefeEnderecos.uf);

    return {
      total: result[0]?.count || 0,
      ufs: ufs.map((u) => ({ uf: u.uf, count: u.count })),
    };
  }),
});
