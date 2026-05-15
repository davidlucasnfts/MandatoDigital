import { authRouter } from "./auth-router";
import { equipeRouter } from "./equipe-router";
import { proposicoesRouter } from "./proposicoes-router";
import { enquetesRouter } from "./enquetes-router";
import { geocodingRouter } from "./geocoding-router";
import { cnefeRouter } from "./cnefe-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  equipe: equipeRouter,
  proposicoes: proposicoesRouter,
  enquetes: enquetesRouter,
  geocoding: geocodingRouter,
  cnefe: cnefeRouter,
});

export type AppRouter = typeof appRouter;
