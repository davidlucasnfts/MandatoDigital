import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Campanha, EnvioCampanha, Eleitor } from '@/lib/supabase';

export function useCampanhas() {
  const [data, setData] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('campanhas')
      .select('*')
      .order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (row: Omit<Campanha, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'owner_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    const { data: inserted } = await supabase
      .from('campanhas')
      .insert({ ...row, user_id: ownerId, owner_id: ownerId })
      .select()
      .single();
    if (inserted) setData(prev => [inserted, ...prev]);
    return inserted;
  };

  const update = async (id: string, changes: Partial<Campanha>) => {
    const { data: updated } = await supabase
      .from('campanhas')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (updated) setData(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const remove = async (id: string) => {
    await supabase.from('campanhas').delete().eq('id', id);
    setData(prev => prev.filter(c => c.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, update, remove };
}

export function useEnviosCampanha(campanhaId?: string) {
  const [data, setData] = useState<EnvioCampanha[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('envios_campanha').select('*').order('created_at', { ascending: false });
    if (campanhaId) query = query.eq('campanha_id', campanhaId);
    const { data: rows } = await query;
    setData(rows || []);
    setLoading(false);
  }, [campanhaId]);

  const criarEnvios = async (campanhaId: string, eleitores: Eleitor[], conteudo: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;

    const envios = eleitores.map(e => ({
      campanha_id: campanhaId,
      eleitor_id: e.id,
      tipo: 'whatsapp' as const,
      status: 'pendente' as const,
      user_id: ownerId,
      owner_id: ownerId,
    }));

    const { data: inserted } = await supabase.from('envios_campanha').insert(envios).select();
    if (inserted) setData(prev => [...inserted, ...prev]);
    return inserted;
  };

  const marcarEnviado = async (id: string) => {
    const { data: updated } = await supabase
      .from('envios_campanha')
      .update({ status: 'enviado', data_envio: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (updated) setData(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  const marcarErro = async (id: string, erro: string) => {
    const { data: updated } = await supabase
      .from('envios_campanha')
      .update({ status: 'erro', erro })
      .eq('id', id)
      .select()
      .single();
    if (updated) setData(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, criarEnvios, marcarEnviado, marcarErro };
}
