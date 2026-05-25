import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { PanelCard, EmptyState } from '@/components/dashboard';
import { useMockData } from '@/lib/mockData';

export default function ConvitesPendentesPanel() {
  const navigate = useNavigate();
  const { convites, totalPendentes, loading } = useMockData();

  const formatarTempo = (dataStr: string): string => {
    const data = new Date(dataStr);
    const agora = new Date();
    const diffDias = Math.floor((agora.getTime() - data.getTime()) / 86400000);
    if (diffDias === 0) return 'hoje';
    if (diffDias === 1) return 'ontem';
    return `${diffDias} dias`;
  };

  if (loading) {
    return (
      <PanelCard title="Convites" icon={UserPlus} iconColor="text-purple-600" iconBg="bg-purple-50" badge={0} delay={9}>
        <div className="h-[120px] lg:h-[160px] bg-slate-50 rounded animate-pulse" />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title="Convites"
      icon={UserPlus}
      iconColor="text-purple-600"
      iconBg="bg-purple-50"
      badge={totalPendentes > 0 ? totalPendentes : undefined}
      badgeColor="bg-purple-100 text-purple-700"
      action={{ label: 'Gerenciar', onClick: () => navigate('/dashboard/eleitores?tab=convites') }}
      delay={9}
    >
      {totalPendentes === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nenhum convite pendente"
          description="Todos os convites foram processados"
        />
      ) : (
        <div className="space-y-2 lg:space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-slate-500 bg-slate-50 rounded-md px-2 py-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>{totalPendentes} eleitor{totalPendentes > 1 ? 'es' : ''} aguardando aprovação</span>
          </div>

          {convites.slice(0, 3).map((c: any) => (
            <div
              key={c.id}
              className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              tabIndex={0}
              role="button"
              onClick={() => navigate('/dashboard/eleitores?tab=convites')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/eleitores?tab=convites')}
            >
              <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{c.nome || 'Sem nome'}</p>
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
            className="w-full flex items-center justify-center gap-1 text-[10px] lg:text-xs text-blue-600
              hover:text-blue-700 font-medium py-1.5 rounded-lg hover:bg-blue-50 transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Aprovar convites <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </PanelCard>
  );
}
