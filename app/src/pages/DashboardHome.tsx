import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, ClipboardList, Calendar, MessageSquare, TrendingUp,
  ArrowRight, Clock, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountUp } from '@/hooks/useCountUp';
import { solicitacoes, tarefas, eventos, atividadesRecentes, chartData, comunicacoes } from '@/data/mockData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } })
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const totalEleitores = useCountUp(2450, 1000);

  const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#EC4899', '#14B8A6'];

  const stats = [
    { label: 'Total de Eleitores', value: totalEleitores, icon: Users, color: 'blue', route: '/dashboard/eleitores' },
    { label: 'Solicitações Pendentes', value: solicitacoes.filter(s => s.status === 'pendente').length, icon: ClipboardList, color: 'amber', route: '/dashboard/solicitacoes' },
    { label: 'Tarefas em Aberto', value: tarefas.filter(t => t.status !== 'concluida').length, icon: Clock, color: 'orange', route: '/dashboard/tarefas' },
    { label: 'Eventos Agendados', value: eventos.length, icon: Calendar, color: 'emerald', route: '/dashboard/agenda' },
  ];

  const urgenteSolicitacoes = solicitacoes.filter(s => s.prioridade === 'urgente' && s.status !== 'concluido').slice(0, 3);
  const proximasTarefas = tarefas.filter(t => t.status !== 'concluida').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo ao Mandato Digital</h2>
            <p className="text-slate-500 mt-1">Aqui está o resumo da sua gestão hoje.</p>
          </div>
          <Button onClick={() => navigate('/dashboard/eleitores')} className="bg-blue-600 hover:bg-blue-700">
            <Users className="w-4 h-4 mr-2" /> Novo Eleitor
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-t-[3px]"
              style={{ borderTopColor: stat.color === 'blue' ? '#2563EB' : stat.color === 'amber' ? '#F59E0B' : stat.color === 'orange' ? '#F97316' : '#059669' }}
              onClick={() => navigate(stat.route)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5 text-slate-400" />
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{stat.value.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Crescimento da Base
                </CardTitle>
                <span className="text-xs text-slate-400">Últimos 12 meses</span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData.crescimentoMensal}>
                  <defs>
                    <linearGradient id="colorEleitores" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="eleitores" stroke="#2563EB" strokeWidth={2} fill="url(#colorEleitores)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Solicitações por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.solicitacoesPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="total"
                    nameKey="categoria"
                  >
                    {chartData.solicitacoesPorCategoria.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {chartData.solicitacoesPorCategoria.map((item, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-500">{item.categoria}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Urgent Solicitations */}
        <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Urgentes
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/dashboard/solicitacoes')}>
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgenteSolicitacoes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhuma solicitação urgente</p>
              ) : (
                urgenteSolicitacoes.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{s.titulo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Prazo: {s.dataPrazo}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div custom={8} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Próximas Tarefas</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/dashboard/tarefas')}>
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {proximasTarefas.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.prioridade === 'urgente' ? 'bg-red-500' : t.prioridade === 'alta' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.titulo}</p>
                    <p className="text-xs text-slate-500">{t.responsavel} - {t.dataPrazo}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div custom={9} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {atividadesRecentes.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">{a.acao}</p>
                    <p className="text-xs text-slate-400">{a.usuario} - {a.data.split(' ')[0]}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Comunications */}
      <motion.div custom={10} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Comunicações Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/dashboard/comunicacao')}>
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Tipo</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Assunto</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Destinatários</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Data</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comunicacoes.slice(0, 4).map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.tipo === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                          {c.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{c.assunto}</td>
                      <td className="py-2.5 px-3 text-slate-500">{c.destinatarios.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-500">{c.dataEnvio}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'enviado' ? 'bg-green-50 text-green-600' : c.status === 'programado' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
