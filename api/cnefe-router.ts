import { z } from "zod";
import { createRouter, publicQuery, editorQuery } from "./middleware.js";
import {
  getCnefeStatus,
  buscarCnefeEndereco,
  buscarCnefePorCep,
  geocodificarCnefe,
} from "./lib/cnefe-client.js";

export const cnefeRouter = createRouter({
  // Busca endereco no CNEFE por logradouro + municipio
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
      return buscarCnefeEndereco({
        logradouro: input.logradouro,
        municipio: input.municipio,
        uf: input.uf,
        cep: input.cep,
        limite: input.limite,
      });
    }),

  // Busca por CEP — retorna coordenadas MEDIAS do CEP
  buscarPorCep: publicQuery
    .input(z.object({
      cep: z.string().min(8).max(9),
      logradouro: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return buscarCnefePorCep(input.cep);
    }),

  // Geocodifica um endereco
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
      return geocodificarCnefe({
        endereco: input.endereco,
        bairro: input.bairro,
        municipio: input.municipio,
        uf: input.uf,
        cep: input.cep,
        numero: input.numero,
      });
    }),

  // Status da importacao CNEFE
  status: publicQuery.query(async () => {
    return getCnefeStatus();
  }),
});
