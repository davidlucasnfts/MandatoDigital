import { Activity, UserPlus, CheckCircle2, MessageSquare, FileText, Vote } from 'lucide-react';
import { PanelCard } from '@/components/dashboard';
import { useMockData } from '@/lib/mockData';

const tipoConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  eleitor: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Eleitor' },
  solicitacao: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Solicitação' },
  interacao: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Interação' },
  proposicao: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Proposição' },
  enquete: { icon: Vote, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Enquete' },
};

function formatarTempo(dataStr: string): string {
  const data = new Date(dataStr);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHora = Math.floor(diffMin / 60);
  const diffDia = Math.floor(diffHora / 24);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHora < 24) return `${diffHora}h`;
  if (diffDia < 7) return `${diffDia}d`;
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function AtividadeRecentePanel() {
  const { atividades, loading } = useMockData();

  if (loading) {
    return (
      <PanelCard title="Atividade" icon={Activity} iconColor="text-blue-600" iconBg="bg-blue-50" badge={0} delay={13}>
        <div className="h-[160px] lg:h-[200px] bg-slate-50 rounded animate-pulse" />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title="Atividade"
      icon={Activity}
      iconColor="text-blue-600"
      iconBg="bg-blue-50"
      badge={atividades.length > 0 ? atividades.length : undefined}
      delay={13}
    >
      {atividades.length === 0 ? (
        <div className="text-center py-4 lg:py-6">
          <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-slate-300 mx-auto mb-1 lg:mb-2" />
          <p className="text-[10px] lg:text-xs text-slate-400">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="space-y-1">
          {atividades.map((a: any, i: number) => {
            const cfg = tipoConfig[a.tipo];
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 cursor-pointer"
                tabIndex={0}
                role="button"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{a.titulo}</p>
                  <p className="text-[10px] text-slate-500">{a.descricao}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">{formatarTempo(a.data)}</span>
              </div>
            );
          })}
        </div>
      )}
    </PanelCard>
  );
}
