import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle2, Clock, XCircle, Loader2 } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMockData } from '@/lib/mockData';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  em_elaboracao: { label: 'Em elaboração', color: 'text-slate-600', bg: 'bg-slate-100', icon: Loader2 },
  em_tramitacao: { label: 'Em tramitação', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock },
  aprovada: { label: 'Aprovada', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  arquivada: { label: 'Arquivada', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

export default function ProposicoesPanel() {
  const navigate = useNavigate();
  const { proposicoesResumo: resumo, proposicoesRecentes: recentes, loading } = useMockData();

  const total = resumo.reduce((sum: number, r: any) => sum + r.total, 0);

  return (
    <Card>
      <CardHeader className="pb-0 px-3 lg:px-6 pt-3 lg:pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Proposições
          </CardTitle>
          <button onClick={() => navigate('/dashboard/proposicoes')} className="text-[10px] lg:text-xs text-blue-600 hover:underline">
            Ver todas
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-3 lg:px-6 pt-0 pb-2 lg:pb-3">
        {loading ? (
          <div className="h-[160px] lg:h-[200px] bg-slate-50 rounded animate-pulse" />
        ) : total === 0 ? (
          <div className="text-center py-4 lg:py-6">
            <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-slate-300 mx-auto mb-1 lg:mb-2" />
            <p className="text-[10px] lg:text-xs text-slate-400">Nenhuma proposição cadastrada</p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {/* Resumo por status */}
            <div className="flex flex-wrap gap-2">
              {resumo.map((r: any) => {
                const cfg = statusConfig[r.status] || statusConfig.em_elaboracao;
                const Icon = cfg.icon;
                return (
                  <div key={r.status} className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${cfg.bg}`}>
                    <Icon className={`w-3 h-3 ${cfg.color}`} />
                    <span className={`text-[10px] font-medium ${cfg.color}`}>
                      {cfg.label}: {r.total}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recentes */}
            {recentes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  <p className="text-[10px] lg:text-xs font-medium text-slate-500 uppercase tracking-wide">Recentes</p>
                </div>
                {recentes.map((p: any) => {
                  const cfg = statusConfig[p.status] || statusConfig.em_elaboracao;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => navigate('/dashboard/proposicoes')}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{p.titulo}</p>
                        <p className="text-[10px] text-slate-500">
                          {p.tipo}{p.numero ? ` ${p.numero}` : ''}{p.ano ? `/${p.ano}` : ''}
                        </p>
                      </div>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/proposicoes')}
              className="w-full flex items-center justify-center gap-1 text-[10px] lg:text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors mt-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
