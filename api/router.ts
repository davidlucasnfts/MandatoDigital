import { authRouter } from "./auth-router";
import { equipeRouter } from "./equipe-router";
import { proposicoesRouter } from "./proposicoes-router";
import { enquetesRouter } from "./enquetes-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  equipe: equipeRouter,
  proposicoes: proposicoesRouter,
  enquetes: enquetesRouter,
});

export type AppRouter = typeof appRouter;
