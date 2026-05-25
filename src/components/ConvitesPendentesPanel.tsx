import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, Clock, CheckCircle2, XCircle } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface ConvitePendente {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  created_at: string;
  indicador: { nome: string } | null;
}

export default function ConvitesPendentesPanel() {
  const navigate = useNavigate();
  const [convites, setConvites] = useState<ConvitePendente[]>([]);
  const [totalPendentes, setTotalPendentes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) { setLoading(false); return; }

    const { data, count } = await supabase
      .from('convites_eleitores')
      .select('id, nome, email, telefone, created_at, indicador:indicador_id(nome)', { count: 'exact' })
      .eq('owner_id', ownerId)
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })
      .limit(3);

    setConvites(data || []);
    setTotalPendentes(count || 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const formatarTempo = (dataStr: string): string => {
    const data = new Date(dataStr);
    const agora = new Date();
    const diffDias = Math.floor((agora.getTime() - data.getTime()) / 86400000);
    if (diffDias === 0) return 'hoje';
    if (diffDias === 1) return 'ontem';
    return `${diffDias} dias`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-purple-600" />
            Convites Pendentes
            {totalPendentes > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                {totalPendentes}
              </span>
            )}
          </CardTitle>
          <button onClick={() => navigate('/dashboard/eleitores?tab=convites')} className="text-xs text-blue-600 hover:underline">
            Ver todos
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[160px] bg-slate-50 rounded animate-pulse" />
        ) : totalPendentes === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum convite pendente</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              {totalPendentes} eleitor{totalPendentes > 1 ? 'es' : ''} aguardando aprovação
            </p>

            {convites.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => navigate('/dashboard/eleitores?tab=convites')}
              >
                <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">
                    {c.nome || 'Sem nome'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {c.telefone || c.email || 'Sem contato'}
                    {c.indicador?.nome && ` · indicado por ${c.indicador.nome}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-amber-600 font-medium">{formatarTempo(c.created_at)}</span>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/dashboard/eleitores?tab=convites')}
              className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors"
            >
              Aprovar convites <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
