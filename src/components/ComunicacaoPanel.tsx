import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, MessageCircle, Send, Users } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function ComunicacaoPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEleitores: 0,
    comEmail: 0,
    comTelefone: 0,
    enviosAniversario: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) { setLoading(false); return; }

    const { count: total } = await supabase
      .from('eleitores')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId);

    const { count: comEmail } = await supabase
      .from('eleitores')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .not('email', 'is', null)
      .neq('email', '');

    const { count: comTelefone } = await supabase
      .from('eleitores')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .not('telefone', 'is', null)
      .neq('telefone', '');

    const { count: envios } = await supabase
      .from('envios_aniversario')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId);

    setStats({
      totalEleitores: total || 0,
      comEmail: comEmail || 0,
      comTelefone: comTelefone || 0,
      enviosAniversario: envios || 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            Comunicação
          </CardTitle>
          <button onClick={() => navigate('/dashboard/comunicacao')} className="text-xs text-blue-600 hover:underline">
            Enviar
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[180px] bg-slate-50 rounded animate-pulse" />
        ) : (
          <div className="space-y-4">
            {/* Canais disponíveis */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <Mail className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-600">{stats.comEmail}</p>
                <p className="text-[10px] text-slate-500">com e-mail</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <MessageCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-600">{stats.comTelefone}</p>
                <p className="text-[10px] text-slate-500">com WhatsApp</p>
              </div>
            </div>

            {/* Resumo de envios */}
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Envios de aniversário</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{stats.enviosAniversario} mensagens</p>
              <p className="text-[10px] text-slate-400">enviadas este ano</p>
            </div>

            {/* Base segmentável */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <p className="text-xs font-medium text-slate-600">Base segmentável</p>
                <p className="text-[10px] text-slate-400">
                  {stats.comEmail + stats.comTelefone > stats.totalEleitores
                    ? stats.totalEleitores
                    : stats.comEmail + stats.comTelefone} de {stats.totalEleitores} eleitores com contato
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/comunicacao')}
              className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors"
            >
              Nova campanha <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
