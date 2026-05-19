import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { rateLimiter } from "hono-rate-limiter";
import { secureHeaders } from "hono/secure-headers";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";


const app = new Hono<{ Bindings: HttpBindings }>();

// Headers de segurança (CSP, HSTS, X-Frame-Options, etc.)
app.use(
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
    strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
    crossOriginEmbedderPolicy: false, // Desabilitado para compatibilidade com recursos externos
  })
);

// Rate limiting: 100 requests por IP a cada 15 minutos
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 100,
    standardHeaders: "draft-6",
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "anonymous",
    skipSuccessfulRequests: false,
  })
);

// Rate limiting mais restritivo para auth: 10 tentativas por IP a cada 15 minutos
app.use(
  "/api/trpc/auth/*",
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-6",
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "anonymous",
  })
);

// Rate limiting por usuário autenticado em rotas sensíveis (mutações)
app.use(
  "/api/trpc/equipe/*",
  rateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    limit: 30,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      const authHeader = c.req.header("authorization");
      const token = authHeader?.replace("Bearer ", "");
      // Usa token truncado como identificador de usuário
      return token ? `user:${token.slice(0, 16)}` : c.req.header("x-forwarded-for") || "anonymous";
    },
  })
);

// Limite de tamanho do body: 50MB
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite.js");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
