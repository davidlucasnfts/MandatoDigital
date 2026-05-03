import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Eleitor, Comunidade, Solicitacao, Tarefa, Evento } from '@/lib/supabase';

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
  return { data, loading, fetch, insert };
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

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, update };
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

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, update };
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
  return { data, loading, fetch, insert };
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
