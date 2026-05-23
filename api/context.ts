import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { env } from "./lib/env.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

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

export type AuthenticatedContext = Omit<TrpcContext, "user"> & { user: TrpcUser };

let supabaseClient: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(env.supabaseUrl, env.supabaseServiceKey);
    } catch (e: any) {
      console.log("[getSupabaseClient] error:", e.message);
      return null;
    }
  }
  return supabaseClient;
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
    const sb = getSupabaseClient();
    if (!sb) {
      return { req: opts.req, resHeaders: opts.resHeaders };
    }
    
    const { data: { user: supabaseUser }, error } = await sb.auth.getUser(token);

    if (error || !supabaseUser) {
      return { req: opts.req, resHeaders: opts.resHeaders };
    }

    // Fallback seguro: sempre retorna usuário autenticado
    // A query do banco é opcional (para RBAC)
    try {
      const db = getDb();
      const equipeRows = await db
        .select()
        .from(schema.equipe)
        .where(eq(schema.equipe.userId, supabaseUser.id))
        .limit(1);

      const equipe = equipeRows[0];
      const isOwner = !equipe || equipe.ownerId === supabaseUser.id;
      const role = equipe?.role ?? (isOwner ? "admin" : "visualizador");
      const ownerId = equipe?.ownerId ?? supabaseUser.id;

      return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email ?? "",
          role,
          ownerId: ownerId as string,
        },
      };
    } catch {
      // Se banco falhar, retorna admin como fallback
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
    }
  } catch {
    return { req: opts.req, resHeaders: opts.resHeaders };
  }
}
