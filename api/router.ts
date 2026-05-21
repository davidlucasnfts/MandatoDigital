import { authRouter } from "./auth-router.js";
import { equipeRouter } from "./equipe-router.js";
import { proposicoesRouter } from "./proposicoes-router.js";
import { enquetesRouter } from "./enquetes-router.js";
import { geocodingRouter } from "./geocoding-router.js";
import { cnefeRouter } from "./cnefe-router.js";
import { lideresRouter } from "./lideres-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  equipe: equipeRouter,
  proposicoes: proposicoesRouter,
  enquetes: enquetesRouter,
  geocoding: geocodingRouter,
  cnefe: cnefeRouter,
  lideres: lideresRouter,
});

export type AppRouter = typeof appRouter;
