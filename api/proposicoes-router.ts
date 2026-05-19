import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRouter, authedQuery, editorQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import * as schema from "../db/schema.js";
import { logAudit } from "./lib/audit.js";
import { TRPCError } from "@trpc/server";

const proposicaoInput = z.object({
  tipo: z.enum([
    "projeto_lei",
    "emenda",
    "indicacao",
    "requerimento",
    "parecer",
    "mocao",
    "decreto",
  ]),
  numero: z.string().max(50).optional(),
  ano: z.number().int().min(2000).max(2100).optional(),
  titulo: z.string().min(1).max(500),
  ementa: z.string().optional(),
  tema: z.string().max(100).optional(),
  status: z
    .enum([
      "em_elaboracao",
      "protocolado",
      "em_tramitacao",
      "em_comissao",
      "aprovado",
      "rejeitado",
      "sancionado",
      "arquivado",
      "veteado",
      "retirado",
    ])
    .optional(),
  dataApresentacao: z.coerce.date().optional(),
  dataAprovacao: z.coerce.date().optional(),
  orgaoAtual: z.string().max(200).optional(),
  relator: z.string().max(255).optional(),
  linkOficial: z.string().url().optional().or(z.literal("")),
  observacoes: z.string().optional(),
});

const tramitacaoInput = z.object({
  proposicaoId: z.string().uuid(),
  data: z.coerce.date(),
  orgao: z.string().min(1).max(200),
  status: z.enum([
    "em_elaboracao",
    "protocolado",
    "em_tramitacao",
    "em_comissao",
    "aprovado",
    "rejeitado",
    "sancionado",
    "arquivado",
    "veteado",
    "retirado",
  ]),
  descricao: z.string().optional(),
});

export const proposicoesRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          tipo: z.enum([
            "projeto_lei",
            "emenda",
            "indicacao",
            "requerimento",
            "parecer",
            "mocao",
            "decreto",
          ]).optional(),
          status: z
            .enum([
              "em_elaboracao",
              "protocolado",
              "em_tramitacao",
              "em_comissao",
              "aprovado",
              "rejeitado",
              "sancionado",
              "arquivado",
              "veteado",
              "retirado",
            ])
            .optional(),
          tema: z.string().optional(),
          ano: z.number().optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const ownerId = ctx.user.ownerId;

      const conditions = [eq(schema.proposicoes.ownerId, ownerId)];

      if (input?.tipo) conditions.push(eq(schema.proposicoes.tipo, input.tipo));
      if (input?.status) conditions.push(eq(schema.proposicoes.status, input.status));
      if (input?.tema) conditions.push(eq(schema.proposicoes.tema, input.tema));
      if (input?.ano) conditions.push(eq(schema.proposicoes.ano, input.ano));
      if (input?.search) {
        const search = `%${input.search}%`;
        conditions.push(
          sql`${schema.proposicoes.titulo} ILIKE ${search} OR ${schema.proposicoes.ementa} ILIKE ${search} OR ${schema.proposicoes.numero} ILIKE ${search}`,
        );
      }

      const rows = await db
        .select()
        .from(schema.proposicoes)
        .where(and(...conditions))
        .orderBy(desc(schema.proposicoes.createdAt));

      return rows;
    }),

  byId: authedQuery
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.proposicoes)
        .where(
          and(
            eq(schema.proposicoes.id, input.id),
            eq(schema.proposicoes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!rows[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return rows[0];
    }),

  create: editorQuery.input(proposicaoInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const values = {
      ownerId: ctx.user.ownerId,
      userId: ctx.user.id,
      tipo: input.tipo,
      numero: input.numero ?? null,
      ano: input.ano ?? null,
      titulo: input.titulo,
      ementa: input.ementa ?? null,
      tema: input.tema ?? null,
      status: input.status ?? "em_elaboracao",
      dataApresentacao: input.dataApresentacao ?? null,
      dataAprovacao: input.dataAprovacao ?? null,
      orgaoAtual: input.orgaoAtual ?? null,
      relator: input.relator ?? null,
      linkOficial: input.linkOficial || null,
      observacoes: input.observacoes ?? null,
    };

    const rows = await db.insert(schema.proposicoes).values(values).returning();
    const created = rows[0];

    await logAudit({
      userId: ctx.user.id,
      action: "create",
      tableName: "proposicoes",
      recordId: created.id,
      newData: created as Record<string, unknown>,
    });

    return created;
  }),

  update: editorQuery
    .input(
      z.object({
        id: z.string().uuid(),
        data: proposicaoInput.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(schema.proposicoes)
        .where(
          and(
            eq(schema.proposicoes.id, input.id),
            eq(schema.proposicoes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: Record<string, unknown> = {};
      if (input.data.tipo !== undefined) updateData.tipo = input.data.tipo;
      if (input.data.numero !== undefined) updateData.numero = input.data.numero ?? null;
      if (input.data.ano !== undefined) updateData.ano = input.data.ano ?? null;
      if (input.data.titulo !== undefined) updateData.titulo = input.data.titulo;
      if (input.data.ementa !== undefined) updateData.ementa = input.data.ementa ?? null;
      if (input.data.tema !== undefined) updateData.tema = input.data.tema ?? null;
      if (input.data.status !== undefined) updateData.status = input.data.status;
      if (input.data.dataApresentacao !== undefined)
        updateData.dataApresentacao = input.data.dataApresentacao ?? null;
      if (input.data.dataAprovacao !== undefined)
        updateData.dataAprovacao = input.data.dataAprovacao ?? null;
      if (input.data.orgaoAtual !== undefined) updateData.orgaoAtual = input.data.orgaoAtual ?? null;
      if (input.data.relator !== undefined) updateData.relator = input.data.relator ?? null;
      if (input.data.linkOficial !== undefined)
        updateData.linkOficial = input.data.linkOficial || null;
      if (input.data.observacoes !== undefined)
        updateData.observacoes = input.data.observacoes ?? null;

      const rows = await db
        .update(schema.proposicoes)
        .set(updateData)
        .where(eq(schema.proposicoes.id, input.id))
        .returning();
      const updated = rows[0];

      await logAudit({
        userId: ctx.user.id,
        action: "update",
        tableName: "proposicoes",
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
        .from(schema.proposicoes)
        .where(
          and(
            eq(schema.proposicoes.id, input.id),
            eq(schema.proposicoes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(schema.proposicoes).where(eq(schema.proposicoes.id, input.id));

      await logAudit({
        userId: ctx.user.id,
        action: "delete",
        tableName: "proposicoes",
        recordId: input.id,
        oldData: existing[0] as Record<string, unknown>,
      });

      return { success: true };
    }),

  // Dashboard de produtividade
  produtividade: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const ownerId = ctx.user.ownerId;

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.proposicoes)
      .where(eq(schema.proposicoes.ownerId, ownerId));

    const porStatus = await db
      .select({
        status: schema.proposicoes.status,
        count: sql<number>`count(*)`,
      })
      .from(schema.proposicoes)
      .where(eq(schema.proposicoes.ownerId, ownerId))
      .groupBy(schema.proposicoes.status);

    const porTipo = await db
      .select({
        tipo: schema.proposicoes.tipo,
        count: sql<number>`count(*)`,
      })
      .from(schema.proposicoes)
      .where(eq(schema.proposicoes.ownerId, ownerId))
      .groupBy(schema.proposicoes.tipo);

    const porTema = await db
      .select({
        tema: schema.proposicoes.tema,
        count: sql<number>`count(*)`,
      })
      .from(schema.proposicoes)
      .where(
        and(
          eq(schema.proposicoes.ownerId, ownerId),
          sql`${schema.proposicoes.tema} IS NOT NULL`,
        ),
      )
      .groupBy(schema.proposicoes.tema);

    const aprovadosPorAno = await db
      .select({
        ano: schema.proposicoes.ano,
        count: sql<number>`count(*)`,
      })
      .from(schema.proposicoes)
      .where(
        and(
          eq(schema.proposicoes.ownerId, ownerId),
          eq(schema.proposicoes.status, "aprovado"),
          sql`${schema.proposicoes.ano} IS NOT NULL`,
        ),
      )
      .groupBy(schema.proposicoes.ano)
      .orderBy(schema.proposicoes.ano);

    return {
      total: total[0]?.count ?? 0,
      porStatus,
      porTipo,
      porTema,
      aprovadosPorAno,
    };
  }),

  // Tramitações
  listTramitacoes: authedQuery
    .input(z.object({ proposicaoId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(schema.tramitacoes)
        .where(
          and(
            eq(schema.tramitacoes.proposicaoId, input.proposicaoId),
            eq(schema.tramitacoes.ownerId, ctx.user.ownerId),
          ),
        )
        .orderBy(desc(schema.tramitacoes.data));

      return rows;
    }),

  createTramitacao: editorQuery
    .input(tramitacaoInput)
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Verifica se a proposição existe e pertence ao owner
      const prop = await db
        .select()
        .from(schema.proposicoes)
        .where(
          and(
            eq(schema.proposicoes.id, input.proposicaoId),
            eq(schema.proposicoes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!prop[0]) throw new TRPCError({ code: "NOT_FOUND" });

      const rows = await db
        .insert(schema.tramitacoes)
        .values({
          proposicaoId: input.proposicaoId,
          ownerId: ctx.user.ownerId,
          userId: ctx.user.id,
          data: input.data,
          orgao: input.orgao,
          status: input.status,
          descricao: input.descricao ?? null,
        })
        .returning();
      const created = rows[0];

      // Atualiza status e órgão atual da proposição
      await db
        .update(schema.proposicoes)
        .set({
          status: input.status,
          orgaoAtual: input.orgao,
        })
        .where(eq(schema.proposicoes.id, input.proposicaoId));

      await logAudit({
        userId: ctx.user.id,
        action: "create",
        tableName: "tramitacoes",
        recordId: created.id,
        newData: created as Record<string, unknown>,
      });

      return created;
    }),

  deleteTramitacao: editorQuery
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(schema.tramitacoes)
        .where(
          and(
            eq(schema.tramitacoes.id, input.id),
            eq(schema.tramitacoes.ownerId, ctx.user.ownerId),
          ),
        )
        .limit(1);

      if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(schema.tramitacoes).where(eq(schema.tramitacoes.id, input.id));

      await logAudit({
        userId: ctx.user.id,
        action: "delete",
        tableName: "tramitacoes",
        recordId: input.id,
        oldData: existing[0] as Record<string, unknown>,
      });

      return { success: true };
    }),
});
