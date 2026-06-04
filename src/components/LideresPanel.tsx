import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Users } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface LiderRank {
  id: string;
  nome: string;
  eleitores_vinculados: number;
  estimativa_votos: number | null;
  taxa_conversao: number;
}

export default function LideresPanel() {
  const navigate = useNavigate();
  const [lideres, setLideres] = useState<LiderRank[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) { setLoading(false); return; }

    // Busca líderes com contagem de eleitores vinculados
    const { data: rows } = await supabase
      .from('eleitores')
      .select('id, nome, estimativa_votos, eleitores!lider_id(count)')
      .eq('nivel', 'lider')
      .eq('owner_id', ownerId)
      .order('nome');

    if (!rows) { setLoading(false); return; }

    const parsed: LiderRank[] = rows.map((l: any) => {
      const vinculados = Array.isArray(l.eleitores) ? l.eleitores.length : (l.eleitores?.count || 0);
      const estimativa = l.estimativa_votos || 0;
      return {
        id: l.id,
        nome: l.nome,
        eleitores_vinculados: vinculados,
        estimativa_votos: l.estimativa_votos,
        taxa_conversao: estimativa > 0 ? Math.round((vinculados / estimativa) * 100) : 0,
      };
    });

    // Ordena por eleitores vinculados (desc) e pega top 3
    const top3 = parsed.sort((a, b) => b.eleitores_vinculados - a.eleitores_vinculados).slice(0, 3);
    setLideres(top3);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const medalColors = [
    'text-amber-500',   // 1º
    'text-slate-400',   // 2º
    'text-amber-700',   // 3º
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Produtividade dos Líderes
          </CardTitle>
          <button onClick={() => navigate('/dashboard/lideres')} className="text-xs text-blue-600 hover:underline">
            Ver todos
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[180px] bg-slate-50 rounded animate-pulse" />
        ) : lideres.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhum líder cadastrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lideres.map((l, i) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <Trophy className={`w-4 h-4 ${medalColors[i] || 'text-slate-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{l.nome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">{l.eleitores_vinculados} indicados</span>
                    {l.estimativa_votos ? (
                      <span className="text-[10px] text-slate-400">
                        meta: {l.estimativa_votos} · {l.taxa_conversao}%
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{l.eleitores_vinculados}</span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/dashboard/lideres')}
              className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors"
            >
              Ver ranking completo <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
