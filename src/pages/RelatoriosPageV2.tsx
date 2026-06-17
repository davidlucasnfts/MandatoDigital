import { useRef, useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, ClipboardList, Download, FileText, Calendar, AlertTriangle, Clock } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PageHeader, StatCard, PanelCard, SearchFilterBar, SkeletonList } from '@/components/dashboard';
import { useRelatoriosData, type PeriodFilter } from '@/hooks/useRelatoriosData';
import { exportReportToPDF } from '@/lib/exportPDF';
import { exportToCSV } from '@/lib/exportCSV';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777'];
const STATUS_COLORS: Record<string, string> = {
  pendente: '#F59E0B', andamento: '#3B82F6', concluido: '#22C55E', cancelado: '#EF4444',
};

const periodLabels: Record<PeriodFilter, string> = {
  '30d': 'Últimos 30 dias', '3m': 'Últimos 3 meses', '6m': 'Últimos 6 meses', '1y': 'Último ano', 'all': 'Todo período',
};

const tabs = [
  { value: 'geral', label: 'Geral', count: undefined },
  { value: 'eleitores', label: 'Eleitores', count: undefined },
  { value: 'solicitacoes', label: 'Solicitações', count: undefined },
  { value: 'tarefas', label: 'Tarefas', count: undefined },
];

export default function RelatoriosPageV2() {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [tab, setTab] = useState('geral');
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [pdfConfig, setPdfConfig] = useState({ title: 'Relatório de Gestão Política', includeKPIs: true, includeCharts: true, includeTables: true });
  const [csvConfig, setCsvConfig] = useState({
    title: 'Relatorio de gestao politica',
    eleitoresComunidade: false,
    solicitacoesCategoria: false,
    statusSolicitacoes: false,
    crescimentoMensal: false,
    eleitoresNivel: false,
    tarefasPrioridade: false,
    solicitacoesPendentes: false,
    tarefasAtrasadas: false,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const {
    totalEleitores, totalSolicitacoes, taxaResolucao,
    eleitoresPorComunidade, solicitacoesPorCategoria, statusSolicitacoes,
    crescimentoMensal, eleitoresPorNivel, tarefasPorPrioridade,
    solicitacoesPendentes, tarefasAtrasadas, loading,
  } = useRelatoriosData(period);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    await exportReportToPDF(reportRef.current, {
      title: pdfConfig.title,
      period: periodLabels[period],
      filename: `relatorio-${period}`,
    });
    setShowPdfDialog(false);
  };

  const handleExportCSV = () => {
    if (csvConfig.eleitoresComunidade && eleitoresPorComunidade.length > 0) {
      exportToCSV(
        eleitoresPorComunidade.map((c) => ({ comunidade: c.nome, total: c.total })),
        [{ key: 'comunidade', label: 'Comunidade' }, { key: 'total', label: 'Total de Eleitores' }],
        `${csvConfig.title}-eleitores-comunidade-${period}`
      );
    }
    if (csvConfig.solicitacoesCategoria && solicitacoesPorCategoria.length > 0) {
      exportToCSV(
        solicitacoesPorCategoria.map((c) => ({ categoria: c.categoria, total: c.total })),
        [{ key: 'categoria', label: 'Categoria' }, { key: 'total', label: 'Total de Solicitacoes' }],
        `${csvConfig.title}-solicitacoes-categoria-${period}`
      );
    }
    if (csvConfig.statusSolicitacoes && statusSolicitacoes.length > 0) {
      exportToCSV(
        statusSolicitacoes.map((s) => ({ status: s.status, total: s.total })),
        [{ key: 'status', label: 'Status' }, { key: 'total', label: 'Total' }],
        `${csvConfig.title}-status-solicitacoes-${period}`
      );
    }
    if (csvConfig.crescimentoMensal && crescimentoMensal.length > 0) {
      exportToCSV(
        crescimentoMensal.map((c) => ({ mes: c.mes, eleitores: c.eleitores, solicitacoes: c.solicitacoes })),
        [{ key: 'mes', label: 'Mes' }, { key: 'eleitores', label: 'Eleitores' }, { key: 'solicitacoes', label: 'Solicitacoes' }],
        `${csvConfig.title}-crescimento-mensal-${period}`
      );
    }
    if (csvConfig.eleitoresNivel && eleitoresPorNivel.length > 0) {
      exportToCSV(
        eleitoresPorNivel.map((e) => ({ nivel: e.nivel, total: e.total })),
        [{ key: 'nivel', label: 'Nivel' }, { key: 'total', label: 'Total' }],
        `${csvConfig.title}-eleitores-nivel-${period}`
      );
    }
    if (csvConfig.tarefasPrioridade && tarefasPorPrioridade.length > 0) {
      exportToCSV(
        tarefasPorPrioridade.map((t) => ({ prioridade: t.prioridade, total: t.total })),
        [{ key: 'prioridade', label: 'Prioridade' }, { key: 'total', label: 'Total' }],
        `${csvConfig.title}-tarefas-prioridade-${period}`
      );
    }
    if (csvConfig.solicitacoesPendentes && solicitacoesPendentes.length > 0) {
      exportToCSV(
        solicitacoesPendentes.map((s: any) => ({ titulo: s.titulo, categoria: s.categoria, data: s.created_at?.split('T')[0], prioridade: s.prioridade })),
        [{ key: 'titulo', label: 'Titulo' }, { key: 'categoria', label: 'Categoria' }, { key: 'data', label: 'Data' }, { key: 'prioridade', label: 'Prioridade' }],
        `${csvConfig.title}-solicitacoes-pendentes-${period}`
      );
    }
    if (csvConfig.tarefasAtrasadas && tarefasAtrasadas.length > 0) {
      exportToCSV(
        tarefasAtrasadas.map((t: any) => ({ titulo: t.titulo, responsavel: t.responsavel, prazo: t.data_prazo, prioridade: t.prioridade })),
        [{ key: 'titulo', label: 'Titulo' }, { key: 'responsavel', label: 'Responsavel' }, { key: 'prazo', label: 'Prazo' }, { key: 'prioridade', label: 'Prioridade' }],
        `${csvConfig.title}-tarefas-atrasadas-${period}`
      );
    }
    setShowCsvDialog(false);
  };

  const extraActions = (
    <>
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        {Object.entries(periodLabels).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <Button variant="outline" size="sm" onClick={() => setShowCsvDialog(true)}>
        <FileText className="w-4 h-4 mr-1.5" strokeWidth={2} /> CSV
      </Button>
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowPdfDialog(true)}>
        <Download className="w-4 h-4 mr-1.5" strokeWidth={2} /> PDF
      </Button>
    </>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Relatórios"
        subtitle="Acompanhe indicadores e exporte relatórios da gestão."
        icon={BarChart3}
        extraActions={extraActions}
        delay={0}
      />

      <SearchFilterBar
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
        showSearch={false}
        searchWidth="w-48"
        delay={1}
      />

      {loading ? (
        <SkeletonList count={4} delay={2} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <StatCard label="Total de Eleitores" value={totalEleitores.toLocaleString()} icon={Users} color="blue" delay={2} />
          <StatCard label="Solicitações Registradas" value={totalSolicitacoes.toLocaleString()} icon={ClipboardList} color="amber" delay={3} />
          <StatCard label="Taxa de Resolução" value={`${taxaResolucao}%`} icon={TrendingUp} color="green" delay={4} />
        </div>
      )}

      <div ref={reportRef} className="space-y-4 lg:space-y-6 bg-white p-4 rounded-xl border border-slate-200">
        {(tab === 'geral' || tab === 'solicitacoes') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <PanelCard title="Solicitações por Categoria" icon={ClipboardList} iconColor="text-blue-600" iconBg="bg-blue-50" delay={5}>
              {loading ? (
                <div className="h-[280px] bg-slate-50 rounded-lg animate-pulse" />
              ) : solicitacoesPorCategoria.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={solicitacoesPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </PanelCard>

            <PanelCard title="Status das Solicitações" icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" delay={6}>
              {loading ? (
                <div className="h-[280px] bg-slate-50 rounded-lg animate-pulse" />
              ) : statusSolicitacoes.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusSolicitacoes} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="total" nameKey="status">
                      {statusSolicitacoes.map((s, i) => <Cell key={i} fill={STATUS_COLORS[s.status] || COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </PanelCard>
          </div>
        )}

        {(tab === 'geral' || tab === 'eleitores') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <PanelCard title="Eleitores por Comunidade" icon={Users} iconColor="text-green-600" iconBg="bg-green-50" delay={7}>
              {loading ? (
                <div className="h-[280px] bg-slate-50 rounded-lg animate-pulse" />
              ) : eleitoresPorComunidade.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={eleitoresPorComunidade} cx="50%" cy="50%" outerRadius={90} dataKey="total" nameKey="nome"
                      label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                      {eleitoresPorComunidade.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </PanelCard>

            <PanelCard title="Eleitores por Nível" icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50" delay={8}>
              {loading ? (
                <div className="h-[280px] bg-slate-50 rounded-lg animate-pulse" />
              ) : eleitoresPorNivel.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={eleitoresPorNivel}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="nivel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </PanelCard>

            <PanelCard title="Crescimento ao Longo do Ano" icon={Calendar} iconColor="text-blue-600" iconBg="bg-blue-50" delay={9} className="lg:col-span-2">
              {loading ? (
                <div className="h-[280px] bg-slate-50 rounded-lg animate-pulse" />
              ) : crescimentoMensal.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={crescimentoMensal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="eleitores" stroke="#2563EB" strokeWidth={2} dot={false} name="Eleitores" />
                    <Line type="monotone" dataKey="solicitacoes" stroke="#D97706" strokeWidth={2} dot={false} name="Solicitações" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </PanelCard>
          </div>
        )}

        {(tab === 'geral' || tab === 'tarefas') && (
          <>
            <PanelCard title="Tarefas por Prioridade" icon={Clock} iconColor="text-red-600" iconBg="bg-red-50" delay={10}>
              {loading ? (
                <div className="h-[280px] bg-slate-50 rounded-lg animate-pulse" />
              ) : tarefasPorPrioridade.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">Sem dados</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={tarefasPorPrioridade}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="prioridade" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="total" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </PanelCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <PanelCard title="Solicitações Pendentes (+7 dias)" icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" delay={11}>
                {solicitacoesPendentes.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Nenhuma solicitação pendente antiga</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Título</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Categoria</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {solicitacoesPendentes.map((s: any) => (
                          <tr key={s.id} className="border-b border-slate-50">
                            <td className="py-2 px-3 text-slate-700 break-all">{s.titulo}</td>
                            <td className="py-2 px-3 text-slate-500 text-xs">{s.categoria}</td>
                            <td className="py-2 px-3 text-slate-500 text-xs">{s.created_at?.split('T')[0]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </PanelCard>

              <PanelCard title="Tarefas Atrasadas" icon={Clock} iconColor="text-red-600" iconBg="bg-red-50" delay={12}>
                {tarefasAtrasadas.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">Nenhuma tarefa atrasada</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Título</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Responsável</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Prazo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tarefasAtrasadas.map((t: any) => (
                          <tr key={t.id} className="border-b border-slate-50">
                            <td className="py-2 px-3 text-slate-700 break-all">{t.titulo}</td>
                            <td className="py-2 px-3 text-slate-500 text-xs">{t.responsavel}</td>
                            <td className="py-2 px-3 text-red-500 text-xs">{t.data_prazo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </PanelCard>
            </div>
          </>
        )}
      </div>

      {/* PDF Config Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Exportar relatório em PDF</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Título do relatório</label>
              <Input value={pdfConfig.title} onChange={(e) => setPdfConfig({ ...pdfConfig, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Seções a incluir</label>
              <div className="flex items-center gap-2">
                <Checkbox checked={pdfConfig.includeKPIs} onCheckedChange={(v) => setPdfConfig({ ...pdfConfig, includeKPIs: !!v })} />
                <span className="text-sm">Resumo executivo (KPIs)</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={pdfConfig.includeCharts} onCheckedChange={(v) => setPdfConfig({ ...pdfConfig, includeCharts: !!v })} />
                <span className="text-sm">Gráficos</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={pdfConfig.includeTables} onCheckedChange={(v) => setPdfConfig({ ...pdfConfig, includeTables: !!v })} />
                <span className="text-sm">Tabelas detalhadas</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPdfDialog(false)}>Cancelar</Button>
              <Button className="flex-1 bg-blue-600" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-1.5" strokeWidth={2} /> Gerar PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Config Dialog */}
      <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Exportar dados em CSV</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nome do arquivo</label>
              <Input value={csvConfig.title} onChange={(e) => setCsvConfig({ ...csvConfig, title: e.target.value })} placeholder="Relatorio de gestao politica" />
            </div>
            <label className="text-xs font-medium text-slate-500 block">Dados a exportar</label>
            {[
              { key: 'eleitoresComunidade', label: 'Eleitores por Comunidade' },
              { key: 'solicitacoesCategoria', label: 'Solicitações por Categoria' },
              { key: 'statusSolicitacoes', label: 'Status das Solicitações' },
              { key: 'crescimentoMensal', label: 'Crescimento Mensal' },
              { key: 'eleitoresNivel', label: 'Eleitores por Nível' },
              { key: 'tarefasPrioridade', label: 'Tarefas por Prioridade' },
              { key: 'solicitacoesPendentes', label: 'Solicitações Pendentes (+7 dias)' },
              { key: 'tarefasAtrasadas', label: 'Tarefas Atrasadas' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  checked={!!csvConfig[item.key as keyof typeof csvConfig]}
                  onCheckedChange={(v) => setCsvConfig({ ...csvConfig, [item.key]: !!v })}
                />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCsvDialog(false)}>Cancelar</Button>
              <Button className="flex-1 bg-blue-600" onClick={handleExportCSV}>
                <FileText className="w-4 h-4 mr-1.5" strokeWidth={2} /> Exportar CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
