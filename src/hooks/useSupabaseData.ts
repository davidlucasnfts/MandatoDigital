import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Eleitor, Comunidade, Solicitacao, Tarefa, Evento, Interacao } from '@/lib/supabase';

// ===================== ELEITORES =====================
export function useEleitores() {
  const [data, setData] = useState<Eleitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('eleitores').select('*').order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (row: Omit<Eleitor, 'id' | 'created_at' | 'user_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: inserted } = await supabase.from('eleitores').insert({ ...row, user_id: userData.user?.id }).select().single();
    if (inserted) setData(prev => [inserted, ...prev]);
    return inserted;
  };

  const update = async (id: string, changes: Partial<Eleitor>) => {
    const { data: updated } = await supabase.from('eleitores').update(changes).eq('id', id).select().single();
    if (updated) setData(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  const remove = async (id: string) => {
    await supabase.from('eleitores').delete().eq('id', id);
    setData(prev => prev.filter(e => e.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, update, remove };
}

// ===================== COMUNIDADES =====================
export function useComunidades() {
  const [data, setData] = useState<Comunidade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('comunidades').select('*').order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (row: Omit<Comunidade, 'id' | 'created_at' | 'user_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: inserted } = await supabase.from('comunidades').insert({ ...row, user_id: userData.user?.id }).select().single();
    if (inserted) setData(prev => [inserted, ...prev]);
    return inserted;
  };

  useEffect(() => { fetch(); }, [fetch]);
  const update = async (id: string, changes: Partial<Comunidade>) => {
    const { data: updated } = await supabase.from('comunidades').update(changes).eq('id', id).select().single();
    if (updated) setData(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const remove = async (id: string) => {
    await supabase.from('comunidades').delete().eq('id', id);
    setData(prev => prev.filter(c => c.id !== id));
  };

  return { data, loading, fetch, insert, update, remove };
}

// ===================== SOLICITACOES =====================
export function useSolicitacoes() {
  const [data, setData] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('solicitacoes').select('*').order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (row: Omit<Solicitacao, 'id' | 'created_at' | 'user_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: inserted } = await supabase.from('solicitacoes').insert({ ...row, user_id: userData.user?.id }).select().single();
    if (inserted) setData(prev => [inserted, ...prev]);
    return inserted;
  };

  const update = async (id: string, changes: Partial<Solicitacao>) => {
    const { data: updated } = await supabase.from('solicitacoes').update(changes).eq('id', id).select().single();
    if (updated) setData(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const remove = async (id: string) => {
    await supabase.from('solicitacoes').delete().eq('id', id);
    setData(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, update, remove };
}

// ===================== TAREFAS =====================
export function useTarefas() {
  const [data, setData] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('tarefas').select('*').order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (row: Omit<Tarefa, 'id' | 'created_at' | 'user_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: inserted } = await supabase.from('tarefas').insert({ ...row, user_id: userData.user?.id }).select().single();
    if (inserted) setData(prev => [inserted, ...prev]);
    return inserted;
  };

  const update = async (id: string, changes: Partial<Tarefa>) => {
    const { data: updated } = await supabase.from('tarefas').update(changes).eq('id', id).select().single();
    if (updated) setData(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const remove = async (id: string) => {
    await supabase.from('tarefas').delete().eq('id', id);
    setData(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, update, remove };
}

// ===================== EVENTOS =====================
export function useEventos() {
  const [data, setData] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('eventos').select('*').order('data', { ascending: true });
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (row: Omit<Evento, 'id' | 'created_at' | 'user_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: inserted } = await supabase.from('eventos').insert({ ...row, user_id: userData.user?.id }).select().single();
    if (inserted) setData(prev => [...prev, inserted].sort((a, b) => a.data.localeCompare(b.data)));
    return inserted;
  };

  useEffect(() => { fetch(); }, [fetch]);
  const update = async (id: string, changes: Partial<Evento>) => {
    const { data: updated } = await supabase.from('eventos').update(changes).eq('id', id).select().single();
    if (updated) setData(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  const remove = async (id: string) => {
    await supabase.from('eventos').delete().eq('id', id);
    setData(prev => prev.filter(e => e.id !== id));
  };

  return { data, loading, fetch, insert, update, remove };
}

// ===================== INTERACOES =====================
export function useInteracoes(eleitorId?: string) {
  const [data, setData] = useState<Interacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('interacoes').select('*').order('data', { ascending: false });
    if (eleitorId) query = query.eq('eleitor_id', eleitorId);
    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  }, [eleitorId]);

  const insert = async (row: Omit<Interacao, 'id' | 'created_at' | 'user_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: inserted } = await supabase.from('interacoes').insert({ ...row, user_id: userData.user?.id }).select().single();
    if (inserted) setData(prev => [inserted, ...prev]);
    return inserted;
  };

  const remove = async (id: string) => {
    await supabase.from('interacoes').delete().eq('id', id);
    setData(prev => prev.filter(i => i.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, remove };
}

// ===================== STATS =====================
export function useStats() {
  const [stats, setStats] = useState({ eleitores: 0, solicitacoes: 0, tarefas: 0, eventos: 0, pendentes: 0 });

  const fetch = useCallback(async () => {
    const { count: eleitores } = await supabase.from('eleitores').select('*', { count: 'exact', head: true });
    const { count: solicitacoes } = await supabase.from('solicitacoes').select('*', { count: 'exact', head: true });
    const { count: tarefas } = await supabase.from('tarefas').select('*', { count: 'exact', head: true });
    const { count: eventos } = await supabase.from('eventos').select('*', { count: 'exact', head: true });
    const { count: pendentes } = await supabase.from('solicitacoes').select('*', { count: 'exact', head: true }).eq('status', 'pendente');
    setStats({ eleitores: eleitores || 0, solicitacoes: solicitacoes || 0, tarefas: tarefas || 0, eventos: eventos || 0, pendentes: pendentes || 0 });
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, fetch };
}

// ===================== CONFIGURACOES =====================
export function useConfiguracoes() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('configuracoes').select('*');
    const map: Record<string, string> = {};
    (rows || []).forEach(r => { map[r.chave] = r.valor; });
    setData(map);
    setLoading(false);
  }, []);

  const set = async (chave: string, valor: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: upserted } = await supabase.from('configuracoes').upsert({ chave, valor, user_id: userData.user?.id }).select().single();
    if (upserted) setData(prev => ({ ...prev, [chave]: valor }));
    return upserted;
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, set };
}

// ===================== ENVIOS ANIVERSARIO =====================
export function useEnviosAniversario() {
  const [data, setData] = useState<EnvioAniversario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase.from('envios_aniversario').select('*');
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (eleitor_id: string, ano: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const { data: inserted } = await supabase.from('envios_aniversario').insert({ eleitor_id, ano, user_id: userData.user?.id }).select().single();
    if (inserted) setData(prev => [...prev, inserted]);
    return inserted;
  };

  const jaEnviouEsteAno = (eleitor_id: string, ano: number) => {
    return data.some(e => e.eleitor_id === eleitor_id && e.ano === ano);
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, jaEnviouEsteAno };
}
