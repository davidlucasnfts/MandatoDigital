import { useMemo } from 'react';
import { BarChart3, FileText, CheckCircle2, TrendingUp, Target, Award, Calendar } from '@/lib/icons';
import { PageHeader, StatCard, PanelCard, SkeletonList } from '@/components/dashboard';
import { trpc } from '@/providers/trpc';

const tipoLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei',
  emenda: 'Emenda',
  indicacao: 'Indicação',
  requerimento: 'Requerimento',
  parecer: 'Parecer',
  mocao: 'Moção',
  decreto: 'Decreto',
};

const statusLabels: Record<string, string> = {
  em_elaboracao: 'Em elaboração',
  protocolado: 'Protocolado',
  em_tramitacao: 'Em tramitação',
  em_comissao: 'Em comissão',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  sancionado: 'Sancionado',
  arquivado: 'Arquivado',
  vetoado: 'Vetado',
  retirado: 'Retirado',
};

const statusBarColors: Record<string, string> = {
  em_elaboracao: 'bg-slate-400',
  protocolado: 'bg-blue-500',
  em_tramitacao: 'bg-amber-500',
  em_comissao: 'bg-purple-500',
  aprovado: 'bg-green-500',
  rejeitado: 'bg-red-500',
  sancionado: 'bg-emerald-500',
  arquivado: 'bg-gray-400',
  vetoado: 'bg-orange-500',
  retirado: 'bg-stone-400',
};

const tipoBarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-cyan-500',
  'bg-pink-500',
];

export default function ProdutividadePageV2() {
  const { data, isLoading } = trpc.proposicoes.produtividade.useQuery();

  const { total, aprovados, taxaAprovacao, emTramitacao, maxAnoCount } = useMemo(() => {
    const total = data?.total ?? 0;
    const aprovados = data?.porStatus.find((s) => s.status === 'aprovado')?.count ?? 0;
    const taxaAprovacao = total > 0 ? Math.round((aprovados / total) * 100) : 0;
    const emTramitacao =
      data?.porStatus
        .filter((s) => ['protocolado', 'em_tramitacao', 'em_comissao'].includes(s.status))
        .reduce((a, b) => a + b.count, 0) ?? 0;
    const maxAnoCount = Math.max(...(data?.aprovadosPorAno.map((a) => a.count) ?? [0]), 1);
    return { total, aprovados, taxaAprovacao, emTramitacao, maxAnoCount };
  }, [data]);

  const sortedPorStatus = useMemo(
    () => [...(data?.porStatus ?? [])].sort((a, b) => b.count - a.count),
    [data?.porStatus]
  );

  const sortedPorTipo = useMemo(
    () => [...(data?.porTipo ?? [])].sort((a, b) => b.count - a.count),
    [data?.porTipo]
  );

  const sortedPorTema = useMemo(
    () => [...(data?.porTema ?? [])].sort((a, b) => b.count - a.count),
    [data?.porTema]
  );

  const sortedAprovadosPorAno = useMemo(
    () => [...(data?.aprovadosPorAno ?? [])].sort((a, b) => a.ano - b.ano),
    [data?.aprovadosPorAno]
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Produtividade Legislativa"
        subtitle="Métricas e indicadores de desempenho parlamentar."
        icon={BarChart3}
        delay={0}
      />

      {isLoading ? (
        <SkeletonList count={4} delay={1} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard label="Total de Proposições" value={total} icon={FileText} color="blue" delay={1} />
          <StatCard label="Aprovadas" value={aprovados} icon={CheckCircle2} color="green" delay={2} />
          <StatCard label="Taxa de Aprovação" value={`${taxaAprovacao}%`} icon={TrendingUp} color="blue" delay={3} />
          <StatCard label="Em Tramitação" value={emTramitacao} icon={Target} color="amber" delay={4} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <PanelCard title="Por Status" icon={Award} iconColor="text-blue-600" iconBg="bg-blue-50" delay={3}>
          {isLoading || !data ? (
            <div className="py-8 text-center text-sm text-slate-400">Carregando...</div>
          ) : sortedPorStatus.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Sem dados</div>
          ) : (
            <div className="space-y-3">
              {sortedPorStatus.map((s) => {
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{statusLabels[s.status] || s.status}</span>
                      <span className="font-medium text-slate-800">
                        {s.count} <span className="text-slate-400 text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${statusBarColors[s.status] || 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Por Tipo" icon={FileText} iconColor="text-purple-600" iconBg="bg-purple-50" delay={4}>
          {isLoading || !data ? (
            <div className="py-8 text-center text-sm text-slate-400">Carregando...</div>
          ) : sortedPorTipo.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Sem dados</div>
          ) : (
            <div className="space-y-3">
              {sortedPorTipo.map((t, i) => {
                const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
                const color = tipoBarColors[i % tipoBarColors.length];
                return (
                  <div key={t.tipo}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{tipoLabels[t.tipo] || t.tipo}</span>
                      <span className="font-medium text-slate-800">
                        {t.count} <span className="text-slate-400 text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Por Tema" icon={Target} iconColor="text-amber-600" iconBg="bg-amber-50" delay={5}>
          {isLoading || !data ? (
            <div className="py-8 text-center text-sm text-slate-400">Carregando...</div>
          ) : sortedPorTema.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Sem dados</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sortedPorTema.map((t) => (
                <div key={t.tema} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-slate-700 break-all">{t.tema}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                    {t.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Aprovados por Ano" icon={Calendar} iconColor="text-green-600" iconBg="bg-green-50" delay={6}>
          {isLoading || !data ? (
            <div className="py-8 text-center text-sm text-slate-400">Carregando...</div>
          ) : sortedAprovadosPorAno.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Sem dados</div>
          ) : (
            <div className="space-y-3">
              {sortedAprovadosPorAno.map((a) => (
                <div key={a.ano} className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 w-12 flex-shrink-0">{a.ano}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-green-500 rounded-md flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.min(100, (a.count / maxAnoCount) * 100)}%` }}
                    >
                      <span className="text-xs font-medium text-white">{a.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      </div>
    </div>
  );
}
