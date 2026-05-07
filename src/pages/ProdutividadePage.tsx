import { motion } from 'framer-motion';
import { BarChart3, FileText, CheckCircle, TrendingUp, Target, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/providers/trpc';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

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

const statusColors: Record<string, string> = {
  em_elaboracao: 'bg-slate-100',
  protocolado: 'bg-blue-50',
  em_tramitacao: 'bg-amber-50',
  em_comissao: 'bg-purple-50',
  aprovado: 'bg-green-50',
  rejeitado: 'bg-red-50',
  sancionado: 'bg-emerald-50',
  arquivado: 'bg-gray-100',
  vetoado: 'bg-orange-50',
  retirado: 'bg-stone-100',
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

export default function ProdutividadePage() {
  const { data, isLoading } = trpc.proposicoes.produtividade.useQuery();

  const total = data?.total ?? 0;
  const aprovados = data?.porStatus.find(s => s.status === 'aprovado')?.count ?? 0;
  const taxaAprovacao = total > 0 ? Math.round((aprovados / total) * 100) : 0;
  const emTramitacao = data?.porStatus.filter(s => ['protocolado', 'em_tramitacao', 'em_comissao'].includes(s.status)).reduce((a, b) => a + b.count, 0) ?? 0;

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Produtividade Legislativa
          </h2>
          <p className="text-sm text-slate-500 mt-1">Métricas e indicadores de desempenho</p>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total de Proposições</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{isLoading ? '...' : total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Aprovados</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{isLoading ? '...' : aprovados}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Taxa de Aprovação</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{isLoading ? '...' : `${taxaAprovacao}%`}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Em Tramitação</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{isLoading ? '...' : emTramitacao}</p>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Status */}
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Por Status
              </h3>
              {isLoading || !data ? (
                <div className="py-8 text-center text-slate-400 text-sm">Carregando...</div>
              ) : data.porStatus.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">Sem dados</div>
              ) : (
                <div className="space-y-3">
                  {data.porStatus.map((s) => {
                    const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                    return (
                      <div key={s.status}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">{statusLabels[s.status] || s.status}</span>
                          <span className="font-medium text-slate-800">{s.count} <span className="text-slate-400 text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${statusBarColors[s.status] || 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Por Tipo */}
        <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Por Tipo
              </h3>
              {isLoading || !data ? (
                <div className="py-8 text-center text-slate-400 text-sm">Carregando...</div>
              ) : data.porTipo.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">Sem dados</div>
              ) : (
                <div className="space-y-3">
                  {data.porTipo.map((t) => {
                    const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
                    return (
                      <div key={t.tipo}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">{tipoLabels[t.tipo] || t.tipo}</span>
                          <span className="font-medium text-slate-800">{t.count} <span className="text-slate-400 text-xs">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Por Tema */}
        <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Por Tema
              </h3>
              {isLoading || !data ? (
                <div className="py-8 text-center text-slate-400 text-sm">Carregando...</div>
              ) : data.porTema.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">Sem dados</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.porTema.map((t) => (
                    <div key={t.tema} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-sm font-medium text-slate-700">{t.tema}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{t.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Aprovados por Ano */}
        <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Aprovados por Ano
              </h3>
              {isLoading || !data ? (
                <div className="py-8 text-center text-slate-400 text-sm">Carregando...</div>
              ) : data.aprovadosPorAno.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">Sem dados</div>
              ) : (
                <div className="space-y-3">
                  {data.aprovadosPorAno.map((a) => (
                    <div key={a.ano} className="flex items-center gap-3">
                      <span className="text-sm text-slate-500 w-12">{a.ano}</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden relative">
                        <div className="h-full bg-green-500 rounded-md flex items-center justify-end pr-2" style={{ width: `${Math.min(100, a.count * 10)}%` }}>
                          <span className="text-xs font-medium text-white">{a.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
