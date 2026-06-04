import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowRight, Activity } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface EnqueteAtiva {
  id: string;
  titulo: string;
  status: string;
  total_respostas: number;
}

export default function EnquetesPanel() {
  const navigate = useNavigate();
  const [enquetes, setEnquetes] = useState<EnqueteAtiva[]>([]);
  const [totalAtivas, setTotalAtivas] = useState(0);
  const [totalRespostas, setTotalRespostas] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) { setLoading(false); return; }

    // Enquetes ativas/publicadas
    const { data: enquetesRows } = await supabase
      .from('enquetes')
      .select('id, titulo, status')
      .eq('owner_id', ownerId)
      .in('status', ['publicada', 'ativa'])
      .order('updated_at', { ascending: false })
      .limit(3);

    if (!enquetesRows) { setLoading(false); return; }

    // Contar respostas para cada enquete
    const enquetesComRespostas = await Promise.all(
      enquetesRows.map(async (e) => {
        const { count } = await supabase
          .from('enquete_respostas')
          .select('*', { count: 'exact', head: true })
          .eq('enquete_id', e.id);
        return {
          id: e.id,
          titulo: e.titulo,
          status: e.status,
          total_respostas: count || 0,
        };
      })
    );

    setEnquetes(enquetesComRespostas);
    setTotalAtivas(enquetesRows.length);

    // Total de respostas do owner
    const { count: totalResp } = await supabase
      .from('enquete_respostas')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId);

    setTotalRespostas(totalResp || 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Enquetes
          </CardTitle>
          <button onClick={() => navigate('/dashboard/enquetes')} className="text-xs text-blue-600 hover:underline">
            Ver todas
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[180px] bg-slate-50 rounded animate-pulse" />
        ) : (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="flex gap-3">
              <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-blue-600">{totalAtivas}</p>
                <p className="text-[10px] text-slate-500">Ativas</p>
              </div>
              <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-green-600">{totalRespostas}</p>
                <p className="text-[10px] text-slate-500">Respostas</p>
              </div>
            </div>

            {/* Enquetes ativas */}
            {enquetes.length === 0 ? (
              <div className="text-center py-4">
                <Activity className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Nenhuma enquete ativa</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600">Enquetes ativas</p>
                {enquetes.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => navigate('/dashboard/enquetes')}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{e.titulo}</p>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600">
                      {e.total_respostas} respostas
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/enquetes')}
              className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors"
            >
              Gerenciar enquetes <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
