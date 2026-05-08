import { z } from "zod";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { createRouter, authedQuery, editorQuery } from "./middleware";
import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { logAudit } from "./lib/audit";
import { TRPCError } from "@trpc/server";

const opcaoInput = z.object({
  id: z.string().uuid().optional(),
  texto: z.string().min(1).max(500),
  ordem: z.number().int().min(0).default(0),
});

const enqueteInput = z.object({
  titulo: z.string().min(1).max(500),
  descricao: z.string().optional(),
  status: z.enum(["rascunho", "publicada", "encerrada", "arquivada"]).optional(),
  dataPublicacao: z.coerce.date().optional(),
  dataEncerramento: z.coerce.date().optional(),
  permiteMultiplaEscolha: z.number().int().min(0).max(1).optional(),
  opcoes: z.array(opcaoInput).min(2).max(10),
});

const respostaInput = z.object({
  enqueteId: z.string().uuid(),
  opcaoIds: z.array(z.string().uuid()).min(1),
  eleitorId: z.string().uuid().optional(),
  nomeRespondente: z.string().max(255).optional(),
  telefoneRespondente: z.string().max(20).optional(),
  observacao: z.string().optional(),
});

export const enquetesRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          status: z.enum(["rascunho", "publicada", "encerrada", "arquivada"]).optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const ownerId = ctx.user.ownerId;

      const conditions = [eq(schema.enquetes.ownerId, ownerId)];

      if (input?.status) conditions.push(eq(schema.enquetes.status, input.status));
      if (input?.search) {
        const search = `%${input.search}%`;
        conditions.push(
          sql`${schema.enquetes.titulo} ILIKE ${search} OR ${schema.enquetes.descricao} ILIKE ${search}`,
        );
      }

      const rows = await db
        .select()
        .from(schema.enquetes)
        .where(and(...conditions))
        .orderBy(desc(schema.enquetes.createdAt));

      return rows;
    }),

  byId: authedQuery
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.enquetes)
        .where(
          and(
            eq(schema.enquetes.id, input.id),
            eq(schema.enquetes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const opcoes = await db
        .select()
        .from(schema.enqueteOpcoes)
        .where(
          and(
            eq(schema.enqueteOpcoes.enqueteId, input.id),
            eq(schema.enqueteOpcoes.ownerId, ctx.user.ownerId),
          ),
        )
        .orderBy(schema.enqueteOpcoes.ordem);

      return { ...rows[0], opcoes };
    }),

  create: editorQuery.input(enqueteInput).mutation(async ({ ctx, input }) => {
    const db = getDb();

    const enqueteRows = await db
      .insert(schema.enquetes)
      .values({
        ownerId: ctx.user.ownerId,
        userId: ctx.user.id,
        titulo: input.titulo,
        descricao: input.descricao ?? null,
        status: input.status ?? "rascunho",
        dataPublicacao: input.dataPublicacao ?? null,
        dataEncerramento: input.dataEncerramento ?? null,
        permiteMultiplaEscolha: input.permiteMultiplaEscolha ?? 0,
      })
      .returning();
    const enquete = enqueteRows[0];

    for (const opcao of input.opcoes) {
      await db.insert(schema.enqueteOpcoes).values({
        enqueteId: enquete.id,
        ownerId: ctx.user.ownerId,
        texto: opcao.texto,
        ordem: opcao.ordem,
      });
    }

    await logAudit({
      userId: ctx.user.id,
      action: "create",
      tableName: "enquetes",
      recordId: enquete.id,
      newData: enquete as Record<string, unknown>,
    });

    return enquete;
  }),

  update: editorQuery
    .input(
      z.object({
        id: z.string().uuid(),
        data: enqueteInput.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(schema.enquetes)
        .where(
          and(
            eq(schema.enquetes.id, input.id),
            eq(schema.enquetes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: Record<string, unknown> = {};
      if (input.data.titulo !== undefined) updateData.titulo = input.data.titulo;
      if (input.data.descricao !== undefined) updateData.descricao = input.data.descricao ?? null;
      if (input.data.status !== undefined) updateData.status = input.data.status;
      if (input.data.dataPublicacao !== undefined)
        updateData.dataPublicacao = input.data.dataPublicacao ?? null;
      if (input.data.dataEncerramento !== undefined)
        updateData.dataEncerramento = input.data.dataEncerramento ?? null;
      if (input.data.permiteMultiplaEscolha !== undefined)
        updateData.permiteMultiplaEscolha = input.data.permiteMultiplaEscolha;

      const rows = await db
        .update(schema.enquetes)
        .set(updateData)
        .where(eq(schema.enquetes.id, input.id))
        .returning();
      const updated = rows[0];

      // Atualiza opções se fornecidas
      if (input.data.opcoes && input.data.opcoes.length > 0) {
        // Remove opções antigas
        await db
          .delete(schema.enqueteOpcoes)
          .where(
            and(
              eq(schema.enqueteOpcoes.enqueteId, input.id),
              eq(schema.enqueteOpcoes.ownerId, ctx.user.ownerId),
            ),
          );
        // Insere novas
        for (const opcao of input.data.opcoes) {
          await db.insert(schema.enqueteOpcoes).values({
            enqueteId: input.id,
            ownerId: ctx.user.ownerId,
            texto: opcao.texto,
            ordem: opcao.ordem,
          });
        }
      }

      await logAudit({
        userId: ctx.user.id,
        action: "update",
        tableName: "enquetes",
        recordId: input.id,
        oldData: existing[0] as Record<string, unknown>,
        newData: updated as Record<string, unknown>,
      });

      return updated;
    }),

  delete: editorQuery
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(schema.enquetes)
        .where(
          and(
            eq(schema.enquetes.id, input.id),
            eq(schema.enquetes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(schema.enquetes).where(eq(schema.enquetes.id, input.id));

      await logAudit({
        userId: ctx.user.id,
        action: "delete",
        tableName: "enquetes",
        recordId: input.id,
        oldData: existing[0] as Record<string, unknown>,
      });

      return { success: true };
    }),

  // Estatísticas de uma enquete
  estatisticas: authedQuery
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const ownerId = ctx.user.ownerId;

      const enquete = await db
        .select()
        .from(schema.enquetes)
        .where(
          and(
            eq(schema.enquetes.id, input.id),
            eq(schema.enquetes.ownerId, ownerId),
          ),
        )
        .limit(1);

      if (!enquete[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const opcoes = await db
        .select()
        .from(schema.enqueteOpcoes)
        .where(
          and(
            eq(schema.enqueteOpcoes.enqueteId, input.id),
            eq(schema.enqueteOpcoes.ownerId, ownerId),
          ),
        )
        .orderBy(schema.enqueteOpcoes.ordem);

      const totalRespostas = await db
        .select({ count: sql<number>`count(DISTINCT ${schema.enqueteRespostas.eleitorId} || '-' || COALESCE(${schema.enqueteRespostas.nomeRespondente}, 'anon'))` })
        .from(schema.enqueteRespostas)
        .where(
          and(
            eq(schema.enqueteRespostas.enqueteId, input.id),
            eq(schema.enqueteRespostas.ownerId, ownerId),
          ),
        );

      const votosPorOpcao = await db
        .select({
          opcaoId: schema.enqueteRespostas.opcaoId,
          count: sql<number>`count(*)`,
        })
        .from(schema.enqueteRespostas)
        .where(
          and(
            eq(schema.enqueteRespostas.enqueteId, input.id),
            eq(schema.enqueteRespostas.ownerId, ownerId),
          ),
        )
        .groupBy(schema.enqueteRespostas.opcaoId);

      const votosMap = new Map(votosPorOpcao.map((v) => [v.opcaoId, v.count]));

      return {
        enquete: enquete[0],
        opcoes: opcoes.map((o) => ({
          ...o,
          votos: votosMap.get(o.id) ?? 0,
        })),
        totalRespostas: totalRespostas[0]?.count ?? 0,
      };
    }),

  // Registrar resposta/voto
  responder: authedQuery.input(respostaInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const ownerId = ctx.user.ownerId;

    const enquete = await db
      .select()
      .from(schema.enquetes)
      .where(
        and(
          eq(schema.enquetes.id, input.enqueteId),
          eq(schema.enquetes.ownerId, ownerId),
        ),
      )
      .limit(1);

    if (!enquete[0]) throw new TRPCError({ code: "NOT_FOUND" });
    if (enquete[0].status !== "publicada") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Enquete não está publicada" });
    }

    const opcoes = await db
      .select()
      .from(schema.enqueteOpcoes)
      .where(
        and(
          eq(schema.enqueteOpcoes.enqueteId, input.enqueteId),
          eq(schema.enqueteOpcoes.ownerId, ownerId),
          inArray(schema.enqueteOpcoes.id, input.opcaoIds),
        ),
      );

    if (opcoes.length !== input.opcaoIds.length) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Opção inválida" });
    }

    if (!enquete[0].permiteMultiplaEscolha && input.opcaoIds.length > 1) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Esta enquete permite apenas uma opção" });
    }

    const respostas = [];
    for (const opcaoId of input.opcaoIds) {
      const rows = await db
        .insert(schema.enqueteRespostas)
        .values({
          enqueteId: input.enqueteId,
          opcaoId,
          ownerId,
          eleitorId: input.eleitorId ?? null,
          nomeRespondente: input.nomeRespondente ?? null,
          telefoneRespondente: input.telefoneRespondente ?? null,
          observacao: input.observacao ?? null,
        })
        .returning();
      respostas.push(rows[0]);
    }

    return { success: true, respostas };
  }),
});
