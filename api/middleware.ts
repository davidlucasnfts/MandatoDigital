import { ErrorMessages } from "../contracts/constants.js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext, TrpcUser } from "./context.js";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

export type AuthenticatedContext = Omit<TrpcContext, "user"> & { user: TrpcUser };

const ta = initTRPC.context<AuthenticatedContext>().create({
  transformer: superjson,
});

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx: { ...ctx, user: ctx.user } as AuthenticatedContext });
});

function requireRole(...roles: string[]) {
  return ta.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx });
  });
}

// Middleware de validação de origem para proteção CSRF básica
const validateOrigin = ta.middleware(async (opts) => {
  const { ctx, next } = opts;
  const req = ctx.req;

  // Só validar em produção e para mutações (POST/PUT/DELETE)
  if (process.env.NODE_ENV === "production") {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const host = req.headers.get("host");

    // Lista de origens permitidas (adicionar domínios de produção)
const allowedOrigins = [
  `https://${host}`,
  "https://mandato-digital-xl.vercel.app",  // substitua pelo seu domínio real da Vercel
];

    // Se tem origin, deve ser da lista permitida
    if (origin && !allowedOrigins.includes(origin)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Origin não permitida",
      });
    }
  }

  return next({ ctx });
});

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = ta.procedure.use(requireRole("admin")).use(validateOrigin);
export const editorQuery = ta.procedure.use(requireRole("admin", "editor")).use(validateOrigin);
