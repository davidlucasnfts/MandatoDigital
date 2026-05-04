import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useDashboardData() {
  const [crescimentoMensal, setCrescimentoMensal] = useState<{ mes: string; eleitores: number }[]>([]);
  const [solicitacoesPorCategoria, setSolicitacoesPorCategoria] = useState<{ categoria: string; total: number }[]>([]);
  const [tarefasUrgentes, setTarefasUrgentes] = useState<any[]>([]);
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState<any[]>([]);
  const [eventosHoje, setEventosHoje] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Eleitores por mês (últimos 12 meses)
    const { data: eleitores } = await supabase.from('eleitores').select('created_at');
    const meses: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      meses[key] = 0;
    }
    eleitores?.forEach(e => {
      const m = new Date(e.created_at).toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      if (meses[m] !== undefined) meses[m]++;
    });
    setCrescimentoMensal(Object.entries(meses).map(([mes, eleitores]) => ({ mes, eleitores })));

    // Solicitações por categoria
    const { data: solicitacoes } = await supabase.from('solicitacoes').select('categoria');
    const cats: Record<string, number> = {};
    solicitacoes?.forEach(s => {
      const cat = s.categoria || 'Sem categoria';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    setSolicitacoesPorCategoria(Object.entries(cats).map(([categoria, total]) => ({ categoria, total })));

    // Tarefas urgentes (prazo hoje ou atrasadas)
    const { data: tarefas } = await supabase.from('tarefas').select('*').lte('data_prazo', amanha).neq('status', 'concluida').order('data_prazo');
    setTarefasUrgentes(tarefas || []);

    // Solicitações pendentes antigas (mais de 7 dias)
    const dataLimite = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const { data: solPendentes } = await supabase.from('solicitacoes').select('*').eq('status', 'pendente').lte('created_at', dataLimite).order('created_at');
    setSolicitacoesPendentes(solPendentes || []);

    // Eventos de hoje
    const { data: eventos } = await supabase.from('eventos').select('*').eq('data', hoje).order('hora_inicio');
    setEventosHoje(eventos || []);

    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    crescimentoMensal,
    solicitacoesPorCategoria,
    tarefasUrgentes,
    solicitacoesPendentes,
    eventosHoje,
    loading,
    fetch,
  };
}
