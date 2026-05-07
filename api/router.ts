import { authRouter } from "./auth-router";
import { equipeRouter } from "./equipe-router";
import { proposicoesRouter } from "./proposicoes-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  equipe: equipeRouter,
  proposicoes: proposicoesRouter,
});

export type AppRouter = typeof appRouter;
