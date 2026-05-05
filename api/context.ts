import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { env } from "./lib/env";
import { findUserByUnionId } from "./queries/users";
import { getDb } from "./queries/connection";
import { eq } from "drizzle-orm";
import * as schema from "@db/schema";

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
let supabaseAdmin: ReturnType<typeof import("@supabase/supabase-js").createClient> | null = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const { createClient } = require("@supabase/supabase-js");
    supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey);
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
    const { data: { user: supabaseUser }, error } = await getSupabaseAdmin().auth.getUser(token);

    if (error || !supabaseUser) {
      return { req: opts.req, resHeaders: opts.resHeaders };
    }

    // Buscar na tabela equipe: o usuario é membro de alguma equipe?
    const db = getDb();
    const membros = await db
      .select()
      .from(schema.equipe)
      .where(eq(schema.equipe.userId, supabaseUser.id))
      .limit(1);

    if (membros.length > 0) {
      const membro = membros[0];
      return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email ?? "",
          role: membro.role,
          ownerId: membro.ownerId,
        },
      };
    }

    // Não é membro de equipe — é dono (owner). Buscar na tabela users.
    const dbUser = await findUserByUnionId(supabaseUser.id);
    if (dbUser) {
      return {
        req: opts.req,
        resHeaders: opts.resHeaders,
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email ?? "",
          role: dbUser.role,
          ownerId: supabaseUser.id,
        },
      };
    }

    // Usuario autenticado mas sem registro nas tabelas — trata como admin/dono
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
