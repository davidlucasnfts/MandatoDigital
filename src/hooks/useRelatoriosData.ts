import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type PeriodFilter = '30d' | '3m' | '6m' | '1y' | 'all';

function getPeriodDate(filter: PeriodFilter): string | null {
  const now = new Date();
  switch (filter) {
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '3m':
      now.setMonth(now.getMonth() - 3);
      break;
    case '6m':
      now.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      now.setFullYear(now.getFullYear() - 1);
      break;
    case 'all':
      return null;
  }
  return now.toISOString();
}

export function useRelatoriosData(filter: PeriodFilter = 'all') {
  const [data, setData] = useState({
    totalEleitores: 0,
    totalSolicitacoes: 0,
    solicitacoesConcluidas: 0,
    taxaResolucao: 0,
    eleitoresPorComunidade: [] as { nome: string; total: number }[],
    solicitacoesPorCategoria: [] as { categoria: string; total: number }[],
    statusSolicitacoes: [] as { status: string; total: number }[],
    crescimentoMensal: [] as { mes: string; eleitores: number; solicitacoes: number }[],
    eleitoresPorNivel: [] as { nivel: string; total: number }[],
    tarefasPorPrioridade: [] as { prioridade: string; total: number }[],
    solicitacoesPendentes: [] as any[],
    tarefasAtrasadas: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const since = getPeriodDate(filter);

    // Eleitores
    let eleitoresQuery = supabase.from('eleitores').select('*', { count: 'exact', head: true });
    if (since) eleitoresQuery = eleitoresQuery.gte('created_at', since);
    const { count: totalEleitores } = await eleitoresQuery;

    // Solicitações
    let solQuery = supabase.from('solicitacoes').select('*', { count: 'exact', head: true });
    if (since) solQuery = solQuery.gte('created_at', since);
    const { count: totalSolicitacoes } = await solQuery;

    const { count: solicitacoesConcluidas } = await supabase
      .from('solicitacoes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluido')
      .maybeSingle()
      .then(r => ({ count: r.count }));

    const taxaResolucao = totalSolicitacoes && totalSolicitacoes > 0
      ? Math.round(((solicitacoesConcluidas || 0) / totalSolicitacoes) * 100)
      : 0;

    // Eleitores por comunidade
    const { data: eleitores } = await supabase.from('eleitores').select('comunidade_id, comunidade:comunidade_id(nome)');
    const comunidadeCounts: Record<string, number> = {};
    eleitores?.forEach((e: any) => {
      const nome = e.comunidade?.nome || 'Sem comunidade';
      comunidadeCounts[nome] = (comunidadeCounts[nome] || 0) + 1;
    });
    const eleitoresPorComunidade = Object.entries(comunidadeCounts)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total);

    // Solicitações por categoria
    const { data: solicitacoes } = await supabase.from('solicitacoes').select('categoria');
    const catCounts: Record<string, number> = {};
    solicitacoes?.forEach((s: any) => {
      const cat = s.categoria || 'Sem categoria';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const solicitacoesPorCategoria = Object.entries(catCounts).map(([categoria, total]) => ({ categoria, total }));

    // Status das solicitações
    const statusCounts: Record<string, number> = {};
    solicitacoes?.forEach((s: any) => {
      const st = s.status || 'pendente';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });
    const statusSolicitacoes = Object.entries(statusCounts).map(([status, total]) => ({ status, total }));

    // Crescimento mensal
    const { data: eleitoresMes } = await supabase.from('eleitores').select('created_at');
    const { data: solMes } = await supabase.from('solicitacoes').select('created_at');
    const meses: Record<string, { eleitores: number; solicitacoes: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      meses[key] = { eleitores: 0, solicitacoes: 0 };
    }
    eleitoresMes?.forEach((e: any) => {
      const m = new Date(e.created_at).toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      if (meses[m]) meses[m].eleitores++;
    });
    solMes?.forEach((s: any) => {
      const m = new Date(s.created_at).toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      if (meses[m]) meses[m].solicitacoes++;
    });
    const crescimentoMensal = Object.entries(meses).map(([mes, vals]) => ({ mes, ...vals }));

    // Eleitores por nível
    const { data: eleitoresNivel } = await supabase.from('eleitores').select('nivel');
    const nivelCounts: Record<string, number> = {};
    eleitoresNivel?.forEach((e: any) => {
      const n = e.nivel || 'eleitor';
      nivelCounts[n] = (nivelCounts[n] || 0) + 1;
    });
    const eleitoresPorNivel = Object.entries(nivelCounts).map(([nivel, total]) => ({ nivel, total }));

    // Tarefas por prioridade
    const { data: tarefas } = await supabase.from('tarefas').select('prioridade');
    const prioCounts: Record<string, number> = {};
    tarefas?.forEach((t: any) => {
      const p = t.prioridade || 'media';
      prioCounts[p] = (prioCounts[p] || 0) + 1;
    });
    const tarefasPorPrioridade = Object.entries(prioCounts).map(([prioridade, total]) => ({ prioridade, total }));

    // Solicitações pendentes antigas
    const dataLimite = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const { data: solPendentes } = await supabase
      .from('solicitacoes')
      .select('*')
      .eq('status', 'pendente')
      .lte('created_at', dataLimite)
      .order('created_at')
      .limit(10);

    // Tarefas atrasadas
    const hoje = new Date().toISOString().split('T')[0];
    const { data: tarefasAtrasadas } = await supabase
      .from('tarefas')
      .select('*')
      .lt('data_prazo', hoje)
      .neq('status', 'concluida')
      .order('data_prazo')
      .limit(10);

    setData({
      totalEleitores: totalEleitores || 0,
      totalSolicitacoes: totalSolicitacoes || 0,
      solicitacoesConcluidas: solicitacoesConcluidas || 0,
      taxaResolucao,
      eleitoresPorComunidade,
      solicitacoesPorCategoria,
      statusSolicitacoes,
      crescimentoMensal,
      eleitoresPorNivel,
      tarefasPorPrioridade,
      solicitacoesPendentes: solPendentes || [],
      tarefasAtrasadas: tarefasAtrasadas || [],
    });
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...data, loading, refetch: fetch };
}
