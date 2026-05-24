import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, editorQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { sql } from "drizzle-orm";

export const lideresRouter = createRouter({
  // Lista todos os líderes com métricas de produtividade
  produtividade: editorQuery.query(async ({ ctx }) => {
    try {
    const db = getDb();
    const ownerId = ctx.user.ownerId;
    console.log("[lideres.produtividade] ownerId:", ownerId);

    // Busca todos os líderes com estimativa e conta eleitores vinculados
    const result = await db.execute(sql`
      SELECT 
        e.id,
        e.nome,
        e.estimativa_votos,
        e.status,
        e.cidade,
        e.bairro,
        e.comunidade_id,
        c.nome as comunidade_nome,
        c.cor as comunidade_cor,
        COUNT(el.id) as eleitores_vinculados
      FROM eleitores e
      LEFT JOIN eleitores el ON el.lider_id = e.id AND el.nivel = 'eleitor'
      LEFT JOIN comunidades c ON c.id = e.comunidade_id
      WHERE e.nivel = 'lider'
        AND e.owner_id = ${ownerId}
      GROUP BY e.id, e.nome, e.estimativa_votos, e.status, e.cidade, e.bairro, e.comunidade_id, c.nome, c.cor
      ORDER BY e.nome
    `);

    const lideres = result as unknown as Array<{
      id: string;
      nome: string;
      estimativa_votos: number | null;
      status: string;
      cidade: string | null;
      bairro: string | null;
      comunidade_id: string | null;
      comunidade_nome: string | null;
      comunidade_cor: string | null;
      eleitores_vinculados: number;
    }>;

    // Calcula métricas
    const lideresComMetricas = lideres.map(l => {
      const estimativa = l.estimativa_votos || 0;
      const vinculados = parseInt(String(l.eleitores_vinculados), 10) || 0;
      const taxaConversao = estimativa > 0 ? Math.round((vinculados / estimativa) * 100) : 0;
      
      return {
        ...l,
        eleitores_vinculados: vinculados,
        taxa_conversao: taxaConversao,
        progresso: Math.min(100, taxaConversao),
        status_meta: taxaConversao >= 100 ? 'atingida' : taxaConversao >= 50 ? 'em_andamento' : 'abaixo',
      };
    });

    // Ordena por taxa de conversao (ranking)
    const lideresOrdenados = [...lideresComMetricas].sort((a, b) => b.taxa_conversao - a.taxa_conversao);
    
    // Adiciona ranking
    const lideresComRanking = lideresOrdenados.map((l, index) => ({
      ...l,
      ranking: index + 1,
    }));

    // Totais
    const totalEstimativa = lideresComMetricas.reduce((sum, l) => sum + (l.estimativa_votos || 0), 0);
    const totalVinculados = lideresComMetricas.reduce((sum, l) => sum + l.eleitores_vinculados, 0);
    const mediaConversao = lideresComMetricas.length > 0 
      ? Math.round(lideresComMetricas.reduce((sum, l) => sum + l.taxa_conversao, 0) / lideresComMetricas.length)
      : 0;

    // Projeção de votos (soma das estimativas = potencial total)
    const projecaoVotos = totalEstimativa;

    // Lista única de comunidades e bairros para filtros
    const comunidades = [...new Map(lideresComMetricas.filter(l => l.comunidade_id).map(l => [l.comunidade_id, { id: l.comunidade_id, nome: l.comunidade_nome, cor: l.comunidade_cor }])).values()];
    const bairros = [...new Set(lideresComMetricas.map(l => l.bairro).filter(Boolean))].sort();

    return {
      lideres: lideresComRanking,
      totais: {
        total_lideres: lideresComMetricas.length,
        total_estimativa: totalEstimativa,
        total_vinculados: totalVinculados,
        media_conversao: mediaConversao,
        projecao_votos: projecaoVotos,
      },
      filtros: {
        comunidades,
        bairros,
      },
    };
    } catch (e: any) {
      console.error("[lideres.produtividade] ERROR:", e.message);
      console.error("[lideres.produtividade] STACK:", e.stack);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao buscar produtividade: " + e.message,
      });
    }
  }),

  // Atualizar estimativa de votos de um líder
  atualizarEstimativa: editorQuery
    .input(z.object({
      liderId: z.string().uuid(),
      estimativaVotos: z.number().min(0).nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      
      await db.execute(sql`
        UPDATE eleitores
        SET estimativa_votos = ${input.estimativaVotos},
            updated_at = NOW()
        WHERE id = ${input.liderId}
          AND nivel = 'lider'
          AND owner_id = ${ctx.user.ownerId}
      `);

      return { success: true };
    }),
});
