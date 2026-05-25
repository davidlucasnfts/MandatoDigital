import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight, Users } from 'lucide-react';
import { PanelCard, EmptyState } from '@/components/dashboard';
import { useMockDashboardData } from '@/hooks/useMockData';

export default function LideresPanel() {
  const navigate = useNavigate();
  const { lideres, loading } = useMockDashboardData();

  const medalColors = [
    'text-amber-500',   // 1º
    'text-slate-400',   // 2º
    'text-amber-700',   // 3º
  ];

  if (loading) {
    return (
      <PanelCard title="Produtividade dos Líderes" icon={Award} iconColor="text-amber-500" iconBg="bg-amber-50" delay={8}>
        <div className="h-[140px] lg:h-[180px] bg-slate-50 rounded animate-pulse" />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title="Produtividade dos Líderes"
      icon={Award}
      iconColor="text-amber-500"
      iconBg="bg-amber-50"
      action={{ label: 'Ver todos', onClick: () => navigate('/dashboard/lideres') }}
      delay={8}
    >
      {lideres.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum líder cadastrado"
          description="Cadastre líderes para acompanhar a produtividade"
          action={{ label: 'Cadastrar líder', onClick: () => navigate('/dashboard/lideres') }}
        />
      ) : (
        <div className="space-y-2 lg:space-y-3">
          {lideres.map((l, i) => (
            <div
              key={l.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer"
              tabIndex={0}
              role="button"
              onClick={() => navigate('/dashboard/lideres')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/lideres')}
            >
              <div className="flex-shrink-0 w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center">
                <Award className={`w-4 h-4 lg:w-5 lg:h-5 ${medalColors[i] || 'text-slate-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-semibold text-slate-800 truncate">{l.nome}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">{l.eleitores_vinculados} indicados</span>
                  {l.estimativa_votos ? (
                    <span className="text-[10px] text-slate-400">· {l.taxa_conversao}% conversão</span>
                  ) : null}
                </div>
              </div>
              <div className="flex-shrink-0 w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="text-[10px] lg:text-xs font-bold text-blue-600">{l.eleitores_vinculados}</span>
              </div>
            </div>
          ))}

          <button
            onClick={() => navigate('/dashboard/lideres')}
            className="w-full flex items-center justify-center gap-1 text-[10px] lg:text-xs text-blue-600
              hover:text-blue-700 font-medium py-1.5 rounded-lg hover:bg-blue-50 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Ver ranking <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </PanelCard>
  );
}
