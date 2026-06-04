import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TemplateMensagem } from '@/lib/supabase';

export function useTemplates() {
  const [data, setData] = useState<TemplateMensagem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('templates_mensagem')
      .select('*')
      .order('created_at', { ascending: false });
    setData(rows || []);
    setLoading(false);
  }, []);

  const insert = async (row: Omit<TemplateMensagem, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'owner_id'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    const { data: inserted } = await supabase
      .from('templates_mensagem')
      .insert({ ...row, user_id: ownerId, owner_id: ownerId })
      .select()
      .single();
    if (inserted) setData(prev => [inserted, ...prev]);
    return inserted;
  };

  const update = async (id: string, changes: Partial<TemplateMensagem>) => {
    const { data: updated } = await supabase
      .from('templates_mensagem')
      .update(changes)
      .eq('id', id)
      .select()
      .single();
    if (updated) setData(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const remove = async (id: string) => {
    await supabase.from('templates_mensagem').delete().eq('id', id);
    setData(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, fetch, insert, update, remove };
}
