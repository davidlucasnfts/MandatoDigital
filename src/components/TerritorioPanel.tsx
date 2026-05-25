import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { PanelCard, EmptyState, AnimatedBar, AnimatedMiniBar } from '@/components/dashboard';
import { useMockDashboardData } from '@/hooks/useMockData';

export default function TerritorioPanel() {
  const navigate = useNavigate();
  const { bairros, totalGeo, totalEleitores, loading } = useMockDashboardData();

  const cobertura = totalEleitores > 0 ? Math.round((totalGeo / totalEleitores) * 100) : 0;
  const maxTotal = bairros[0]?.total || 1;

  if (loading) {
    return (
      <PanelCard title="Território" icon={MapPin} iconColor="text-blue-600" iconBg="bg-blue-50" delay={7}>
        <div className="h-[160px] lg:h-[200px] bg-slate-50 rounded animate-pulse" />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title="Território"
      icon={MapPin}
      iconColor="text-blue-600"
      iconBg="bg-blue-50"
      action={{ label: 'Ver mapa', onClick: () => navigate('/dashboard/mapa') }}
      delay={7}
    >
      <div className="space-y-3 lg:space-y-4">
        {/* Cobertura geográfica */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Cobertura geográfica</span>
            <span className="font-semibold text-slate-700">{totalGeo} de {totalEleitores}</span>
          </div>
          <AnimatedBar progress={cobertura} delay={0.8} />
          <p className="text-[10px] text-slate-400 mt-1">
            {cobertura}% dos eleitores estão geolocalizados no mapa
          </p>
        </div>

        {/* Top bairros */}
        {bairros.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="Nenhum bairro cadastrado"
            description="Cadastre eleitores com endereço para ver o território"
          />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Top bairros</p>
            </div>
            {bairros.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 w-4 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="text-slate-700 font-medium truncate">{b.bairro}</span>
                    <span className="text-slate-500 font-semibold">{b.total}</span>
                  </div>
                  <AnimatedMiniBar progress={(b.total / maxTotal) * 100} delay={0.9 + i * 0.1} />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard/mapa')}
          className="w-full flex items-center justify-center gap-1 text-[10px] lg:text-xs text-blue-600
            hover:text-blue-700 font-medium py-1.5 rounded-lg hover:bg-blue-50 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Abrir mapa <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </PanelCard>
  );
}
