import { Activity, UserPlus, CheckCircle2, MessageSquare, FileText, Vote, ArrowRight } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <Card>
      <CardHeader className="pb-0 px-3 lg:px-6 pt-3 lg:pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-base font-semibold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Atividade</span>
            {atividades.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full font-semibold ml-0.5">
                {atividades.length}
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 lg:px-6 pt-0 pb-2 lg:pb-3">
        {loading ? (
          <div className="h-[160px] lg:h-[200px] bg-slate-50 rounded animate-pulse" />
        ) : atividades.length === 0 ? (
          <div className="text-center py-4 lg:py-6">
            <Activity className="w-6 h-6 lg:w-8 lg:h-8 text-slate-300 mx-auto mb-1 lg:mb-2" />
            <p className="text-[10px] lg:text-xs text-slate-400">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-1.5 lg:space-y-2">
            {atividades.map((a: any, i: number) => {
              const cfg = tipoConfig[a.tipo];
              const Icon = cfg.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{a.titulo}</p>
                    <p className="text-[10px] text-slate-500">{a.descricao}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{formatarTempo(a.data)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
