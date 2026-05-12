import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq } from "drizzle-orm";

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

// Lazy init para evitar execucao no browser (importado pelo frontend para tipos)
import { createClient } from "@supabase/supabase-js";
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
export function getSupabaseAdmin() {
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

    // Busca role real do usuário na tabela equipe (RBAC funcional)
    const db = getDb();
    const equipeRows = await db
      .select()
      .from(schema.equipe)
      .where(eq(schema.equipe.userId, supabaseUser.id))
      .limit(1);

    const equipe = equipeRows[0];

    // Se não tem registro na equipe, assume visualizador (menor privilégio)
    // EXCEÇÃO: o próprio dono da conta (quem criou) sempre é admin
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
    return { req: opts.req, resHeaders: opts.resHeaders };
  }
}
