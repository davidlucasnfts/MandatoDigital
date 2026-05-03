import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, ClipboardList, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { chartData } from '@/data/mockData';
import { useCountUp } from '@/hooks/useCountUp';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
};

const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export default function RelatoriosPage() {
  const totalEleitores = useCountUp(2450, 1500);
  const totalSolicitacoes = useCountUp(342, 1500);
  const taxaResolucao = useCountUp(87, 1500);

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Relatórios
          </h2>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1.5" /> Exportar
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-green-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12%</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{totalEleitores.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Total de eleitores</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                <span className="text-xs text-amber-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +5%</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{totalSolicitacoes.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Solicitações este mês</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-xs text-green-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +3%</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{taxaResolucao}%</div>
              <div className="text-xs text-slate-500 mt-1">Taxa de resolução</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Solicitações por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData.solicitacoesPorCategoria}>
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Eleitores por Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData.eleitoresPorComunidade}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="valor"
                    nameKey="nome"
                    label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.eleitoresPorComunidade.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Status das Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData.statusSolicitacoes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="valor"
                    nameKey="status"
                  >
                    <Cell fill="#F59E0B" />
                    <Cell fill="#3B82F6" />
                    <Cell fill="#22C55E" />
                    <Cell fill="#EF4444" />
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Crescimento ao Longo do Ano</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData.crescimentoMensal}>
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
      </div>
    </div>
  );
}
