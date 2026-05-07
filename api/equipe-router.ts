import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, and } from "drizzle-orm";
import { env } from "./lib/env";

let supabaseAdmin: ReturnType<typeof import("@supabase/supabase-js").createClient> | null = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const { createClient } = require("@supabase/supabase-js");
    supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey);
  }
  return supabaseAdmin;
}

export const equipeRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(schema.equipe)
      .where(eq(schema.equipe.userId, ctx.user.id))
      .limit(1);
    return rows[0] ?? null;
  }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(schema.equipe)
      .where(eq(schema.equipe.ownerId, ctx.user.ownerId));
  }),

  create: adminQuery
    .input(
      z.object({
        nome: z.string().min(1),
        email: z.string().email(),
        cargo: z.string().optional(),
        role: z.enum(["admin", "editor", "visualizador"]),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const sb = getSupabaseAdmin();
      if (!sb) {
        throw new Error("Serviço de autenticação indisponível");
      }
      const { data, error } = await sb.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { nome: input.nome },
      });

      if (error || !data.user) {
        throw new Error(error?.message ?? "Erro ao criar usuário");
      }
      if (!data.user) {
        throw new Error("Erro ao criar usuário: resposta vazia");
      }

      const db = getDb();
      await db.insert(schema.equipe).values({
        userId: data.user.id,
        ownerId: ctx.user.ownerId,
        nome: input.nome,
        email: input.email,
        cargo: input.cargo ?? "",
        role: input.role,
        status: "ativo",
      });

      return { success: true, userId: data.user.id };
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["admin", "editor", "visualizador"]).optional(),
        status: z.enum(["ativo", "inativo"]).optional(),
        cargo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const { id, ...updates } = input;

      await db
        .update(schema.equipe)
        .set(updates)
        .where(
          and(
            eq(schema.equipe.id, id),
            eq(schema.equipe.ownerId, ctx.user.ownerId)
          )
        );

      return { success: true };
    }),

  remove: adminQuery
    .input(z.object({ id: z.number(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .delete(schema.equipe)
        .where(
          and(
            eq(schema.equipe.id, input.id),
            eq(schema.equipe.ownerId, ctx.user.ownerId)
          )
        );

      const sb = getSupabaseAdmin();
      if (sb) {
        await sb.auth.admin.deleteUser(input.userId);
      }

      return { success: true };
    }),
});
