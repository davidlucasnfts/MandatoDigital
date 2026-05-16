import { z } from "zod";
import { createRouter, publicQuery, editorQuery } from "./middleware";
import { getCnefeDb } from "./queries/connection";
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
      const db = getCnefeDb();

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

  // Busca por CEP — USA APENAS CNEFE (dados proprios na VPS)
  // Se logradouro for informado, filtra por ele para maior precisao
  buscarPorCep: publicQuery
    .input(z.object({ 
      cep: z.string().min(8).max(9),
      logradouro: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = getCnefeDb();
      const cepLimpo = input.cep.replace(/\D/g, "");

      // Se tem logradouro, busca CEP + logradouro
      if (input.logradouro && input.logradouro.length >= 3) {
        const logradouroNorm = input.logradouro
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        // Remove o tipo do logradouro (RUA, AVENIDA, etc.)
        const tiposLogradouro = [
          "RUA", "AVENIDA", "AV", "TRAVESSA", "TRAV", "ALAMEDA", "AL",
          "ESTRADA", "EST", "RODOVIA", "ROD", "VIELA", "VIA", "PASSAGEM",
          "BECO", "LARGO", "PRACA", "PC", "QUADRA", "QD", "BLOCO", "BL"
        ];
        
        let nomeSemTipo = logradouroNorm;
        for (const tipo of tiposLogradouro) {
          if (nomeSemTipo.startsWith(tipo + " ")) {
            nomeSemTipo = nomeSemTipo.slice(tipo.length).trim();
            break;
          }
        }
        
        // Busca CEP + nome do logradouro (sem tipo)
        if (nomeSemTipo.length >= 2) {
          const result = await db
            .select()
            .from(cnefeEnderecos)
            .where(
              and(
                eq(cnefeEnderecos.cep, cepLimpo),
                ilike(cnefeEnderecos.nomeLogradouro, `%${nomeSemTipo}%`)
              )
            )
            .limit(1);
          
          if (result.length > 0) return result[0];
        }
      }

      // Fallback: busca so por CEP
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
      const db = getCnefeDb();

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

      // Nao encontrou no CNEFE
      return null;
    }),

  // Status da importacao CNEFE (quantos enderecos temos no banco)
  status: publicQuery.query(async () => {
    const db = getCnefeDb();
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
