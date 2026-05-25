import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, Users } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMockDashboardData } from '@/hooks/useMockData';

export default function LideresPanel() {
  const navigate = useNavigate();
  const { lideres, loading } = useMockDashboardData();

  const medalColors = [
    'text-amber-500',   // 1º
    'text-slate-400',   // 2º
    'text-amber-700',   // 3º
  ];

  return (
    <Card>
      <CardHeader className="pb-0 px-3 lg:px-6 pt-3 lg:pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-base font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Produtividade dos Líderes
          </CardTitle>
          <button onClick={() => navigate('/dashboard/lideres')} className="text-[10px] lg:text-xs text-blue-600 hover:underline">
            Ver todos
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-3 lg:px-6 pt-0 pb-2 lg:pb-3">
        {loading ? (
          <div className="h-[140px] lg:h-[180px] bg-slate-50 rounded animate-pulse" />
        ) : lideres.length === 0 ? (
          <div className="text-center py-4 lg:py-6">
            <Users className="w-6 h-6 lg:w-8 lg:h-8 text-slate-300 mx-auto mb-1 lg:mb-2" />
            <p className="text-[10px] lg:text-xs text-slate-400">Nenhum líder cadastrado</p>
          </div>
        ) : (
          <div className="space-y-2 lg:space-y-3">
            {lideres.map((l, i) => (
              <div key={l.id} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <Award className={`w-4 h-4 ${medalColors[i] || 'text-slate-300'}`} />
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
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-[10px] lg:text-xs font-bold text-blue-600">{l.eleitores_vinculados}</span>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigate('/dashboard/lideres')}
              className="w-full flex items-center justify-center gap-1 text-[10px] lg:text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors mt-1"
            >
              Ver ranking <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
