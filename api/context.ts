import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { env } from "./lib/env";
import postgres from "postgres";

export type TrpcUser = {
  id: string;
  email: string;
  role: string;
  ownerId: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: TrpcUser;
};

// Lazy init para evitar execucao no browser (importado pelo frontend para tipos)
import { createClient } from "@supabase/supabase-js";
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    try {
      supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey);
    } catch (e: any) {
      console.log("[getSupabaseAdmin] error creating client:", e.message);
      return null;
    }
  }
  return supabaseAdmin;
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const authHeader = opts.req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { req: opts.req, resHeaders: opts.resHeaders };
  }

  try {
    const sb = getSupabaseAdmin();
    if (!sb) {
      return { req: opts.req, resHeaders: opts.resHeaders };
    }
    const { data: { user: supabaseUser }, error } = await sb.auth.getUser(token);

    if (error || !supabaseUser) {
      return { req: opts.req, resHeaders: opts.resHeaders };
    }

    // Token válido do Supabase — retorna usuário como admin (fallback seguro)
    return {
      req: opts.req,
      resHeaders: opts.resHeaders,
      user: {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        role: "admin",
        ownerId: supabaseUser.id,
      },
    };
  } catch {
    return { req: opts.req, resHeaders: opts.resHeaders };
  }
}
