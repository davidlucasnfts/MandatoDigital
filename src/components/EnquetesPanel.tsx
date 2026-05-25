import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowRight, Activity } from 'lucide-react';
import { PanelCard, EmptyState } from '@/components/dashboard';
import { useMockData } from '@/lib/mockData';

export default function EnquetesPanel() {
  const navigate = useNavigate();
  const { enquetes, totalAtivas, totalRespostas, loading } = useMockData();

  if (loading) {
    return (
      <PanelCard title="Enquetes" icon={BarChart3} iconColor="text-blue-600" iconBg="bg-blue-50" delay={11}>
        <div className="h-[140px] lg:h-[180px] bg-slate-50 rounded animate-pulse" />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title="Enquetes"
      icon={BarChart3}
      iconColor="text-blue-600"
      iconBg="bg-blue-50"
      action={{ label: 'Ver todas', onClick: () => navigate('/dashboard/enquetes') }}
      delay={11}
    >
      <div className="space-y-3 lg:space-y-4">
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
          <EmptyState
            icon={Activity}
            title="Nenhuma enquete ativa"
            description="Crie enquetes para ouvir a base"
            action={{ label: 'Criar enquete', onClick: () => navigate('/dashboard/enquetes') }}
          />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <p className="text-[10px] lg:text-xs font-medium text-slate-500 uppercase tracking-wide">Ativas</p>
            </div>
            {enquetes.map((e: any) => (
              <div
                key={e.id}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                tabIndex={0}
                role="button"
                onClick={() => navigate('/dashboard/enquetes')}
                onKeyDown={(k) => k.key === 'Enter' && navigate('/dashboard/enquetes')}
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
          className="w-full flex items-center justify-center gap-1 text-[10px] lg:text-xs text-blue-600
            hover:text-blue-700 font-medium py-1.5 rounded-lg hover:bg-blue-50 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          Ver todas <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </PanelCard>
  );
}
