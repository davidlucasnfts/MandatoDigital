import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, ClipboardList, Download, FileText,
  Calendar, AlertTriangle, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useRelatoriosData, type PeriodFilter } from '@/hooks/useRelatoriosData';
import { exportReportToPDF } from '@/lib/exportPDF';
import { exportToCSV } from '@/lib/exportCSV';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
};

const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3ED'];
const STATUS_COLORS: Record<string, string> = {
  pendente: '#F59E0B', andamento: '#3B82F6', concluido: '#22C55E', cancelado: '#EF4444',
};

const periodLabels: Record<PeriodFilter, string> = {
  '30d': 'Últimos 30 dias', '3m': 'Últimos 3 meses', '6m': 'Últimos 6 meses', '1y': 'Último ano', 'all': 'Todo período',
};

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [pdfConfig, setPdfConfig] = useState({ title: 'Relatório de Gestão Política', includeKPIs: true, includeCharts: true, includeTables: true });
  const [csvConfig, setCsvConfig] = useState({
    title: 'Relatorio de Gestao Politica',
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
        eleitoresPorComunidade.map(c => ({ comunidade: c.nome, total: c.total })),
        [{ key: 'comunidade', label: 'Comunidade' }, { key: 'total', label: 'Total de Eleitores' }],
        `${csvConfig.title}-eleitores-comunidade-${period}`
      );
    }
    if (csvConfig.solicitacoesCategoria && solicitacoesPorCategoria.length > 0) {
      exportToCSV(
        solicitacoesPorCategoria.map(c => ({ categoria: c.categoria, total: c.total })),
        [{ key: 'categoria', label: 'Categoria' }, { key: 'total', label: 'Total de Solicitacoes' }],
        `${csvConfig.title}-solicitacoes-categoria-${period}`
      );
    }
    if (csvConfig.statusSolicitacoes && statusSolicitacoes.length > 0) {
      exportToCSV(
        statusSolicitacoes.map(s => ({ status: s.status, total: s.total })),
        [{ key: 'status', label: 'Status' }, { key: 'total', label: 'Total' }],
        `${csvConfig.title}-status-solicitacoes-${period}`
      );
    }
    if (csvConfig.crescimentoMensal && crescimentoMensal.length > 0) {
      exportToCSV(
        crescimentoMensal.map(c => ({ mes: c.mes, eleitores: c.eleitores, solicitacoes: c.solicitacoes })),
        [{ key: 'mes', label: 'Mes' }, { key: 'eleitores', label: 'Eleitores' }, { key: 'solicitacoes', label: 'Solicitacoes' }],
        `${csvConfig.title}-crescimento-mensal-${period}`
      );
    }
    if (csvConfig.eleitoresNivel && eleitoresPorNivel.length > 0) {
      exportToCSV(
        eleitoresPorNivel.map(e => ({ nivel: e.nivel, total: e.total })),
        [{ key: 'nivel', label: 'Nivel' }, { key: 'total', label: 'Total' }],
        `${csvConfig.title}-eleitores-nivel-${period}`
      );
    }
    if (csvConfig.tarefasPrioridade && tarefasPorPrioridade.length > 0) {
      exportToCSV(
        tarefasPorPrioridade.map(t => ({ prioridade: t.prioridade, total: t.total })),
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Relatórios
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as PeriodFilter)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {Object.entries(periodLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={() => setShowCsvDialog(true)}>
              <FileText className="w-4 h-4 mr-1.5" /> CSV
            </Button>
            <Button size="sm" className="bg-blue-600" onClick={() => setShowPdfDialog(true)}>
              <Download className="w-4 h-4 mr-1.5" /> PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Report Content (captured for PDF) */}
      <div ref={reportRef} className="space-y-6 bg-white p-4 rounded-xl">
        {/* KPIs */}
        {pdfConfig.includeKPIs && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-xs text-green-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{loading ? '...' : totalEleitores.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">Total de eleitores</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <ClipboardList className="w-5 h-5 text-amber-500" />
                    <span className="text-xs text-amber-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{loading ? '...' : totalSolicitacoes.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 mt-1">Solicitações registradas</div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-xs text-green-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Taxa</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{loading ? '...' : `${taxaResolucao}%`}</div>
                  <div className="text-xs text-slate-500 mt-1">Taxa de resolução</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Charts */}
        {pdfConfig.includeCharts && (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Solicitações por Categoria</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={solicitacoesPorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Eleitores por Comunidade</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={eleitoresPorComunidade} cx="50%" cy="50%" outerRadius={90} dataKey="total" nameKey="nome"
                        label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                        {eleitoresPorComunidade.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Status das Solicitações</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={statusSolicitacoes} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="total" nameKey="status">
                        {statusSolicitacoes.map((s, i) => <Cell key={i} fill={STATUS_COLORS[s.status] || COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Crescimento ao Longo do Ano</CardTitle></CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={8} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Eleitores por Nível</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={eleitoresPorNivel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="nivel" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="total" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={9} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Tarefas por Prioridade</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={tarefasPorPrioridade}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="prioridade" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="total" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Tables */}
        {pdfConfig.includeTables && (
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div custom={10} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Solicitações Pendentes (+7 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {solicitacoesPendentes.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Nenhuma solicitação pendente antiga</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100"><th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Título</th><th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Categoria</th><th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Data</th></tr></thead>
                        <tbody>
                          {solicitacoesPendentes.map((s: any) => (
                            <tr key={s.id} className="border-b border-slate-50">
                              <td className="py-2 px-3 text-slate-700">{s.titulo}</td>
                              <td className="py-2 px-3 text-slate-500 text-xs">{s.categoria}</td>
                              <td className="py-2 px-3 text-slate-500 text-xs">{s.created_at?.split('T')[0]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div custom={11} variants={fadeIn} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    Tarefas Atrasadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tarefasAtrasadas.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Nenhuma tarefa atrasada</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100"><th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Título</th><th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Responsável</th><th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Prazo</th></tr></thead>
                        <tbody>
                          {tarefasAtrasadas.map((t: any) => (
                            <tr key={t.id} className="border-b border-slate-50">
                              <td className="py-2 px-3 text-slate-700">{t.titulo}</td>
                              <td className="py-2 px-3 text-slate-500 text-xs">{t.responsavel}</td>
                              <td className="py-2 px-3 text-red-500 text-xs">{t.data_prazo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>

      {/* PDF Config Dialog */}
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Exportar Relatório em PDF</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Título do relatório</label>
              <Input value={pdfConfig.title} onChange={e => setPdfConfig({ ...pdfConfig, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 block">Seções a incluir</label>
              <div className="flex items-center gap-2">
                <Checkbox checked={pdfConfig.includeKPIs} onCheckedChange={v => setPdfConfig({ ...pdfConfig, includeKPIs: !!v })} />
                <span className="text-sm">Resumo executivo (KPIs)</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={pdfConfig.includeCharts} onCheckedChange={v => setPdfConfig({ ...pdfConfig, includeCharts: !!v })} />
                <span className="text-sm">Gráficos</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={pdfConfig.includeTables} onCheckedChange={v => setPdfConfig({ ...pdfConfig, includeTables: !!v })} />
                <span className="text-sm">Tabelas detalhadas</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPdfDialog(false)}>Cancelar</Button>
              <Button className="flex-1 bg-blue-600" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-1.5" /> Gerar PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSV Config Dialog */}
      <Dialog open={showCsvDialog} onOpenChange={setShowCsvDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Exportar Dados em CSV</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nome do arquivo</label>
              <Input value={csvConfig.title} onChange={e => setCsvConfig({ ...csvConfig, title: e.target.value })} placeholder="Relatorio de Gestao Politica" />
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
            ].map(item => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  checked={csvConfig[item.key as keyof typeof csvConfig]}
                  onCheckedChange={v => setCsvConfig({ ...csvConfig, [item.key]: !!v })}
                />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCsvDialog(false)}>Cancelar</Button>
              <Button className="flex-1 bg-blue-600" onClick={handleExportCSV}>
                <FileText className="w-4 h-4 mr-1.5" /> Exportar CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
