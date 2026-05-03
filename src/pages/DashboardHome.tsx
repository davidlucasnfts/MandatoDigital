import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Calendar, MessageSquare, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useSupabaseData';
import { useCountUp } from '@/hooks/useCountUp';
import { atividadesRecentes, comunicacoes, chartData } from '@/data/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }) };
const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export default function DashboardHome() {
  const navigate = useNavigate();
  const { stats } = useStats();
  const totalEleitores = useCountUp(stats.eleitores || 2450, 1000);

  const statCards = [
    { label: 'Total de Eleitores', value: totalEleitores, icon: Users, color: 'blue', route: '/dashboard/eleitores' },
    { label: 'Solicitações Pendentes', value: stats.pendentes || 4, icon: ClipboardList, color: 'amber', route: '/dashboard/solicitacoes' },
    { label: 'Tarefas em Aberto', value: stats.tarefas || 5, icon: Clock, color: 'orange', route: '/dashboard/tarefas' },
    { label: 'Eventos Agendados', value: stats.eventos || 5, icon: Calendar, color: 'emerald', route: '/dashboard/agenda' },
  ];

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold text-slate-800">Bem-vindo ao Mandato Digital</h2><p className="text-slate-500 mt-1">Aqui está o resumo da sua gestão hoje.</p></div>
          <button onClick={() => navigate('/dashboard/eleitores')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4" />Novo Eleitor</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-t-[3px]" style={{borderTopColor: s.color==='blue'?'#2563EB':s.color==='amber'?'#F59E0B':s.color==='orange'?'#F97316':'#059669'}} onClick={() => navigate(s.route)}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3"><s.icon className="w-5 h-5 text-slate-400" /><ArrowRight className="w-4 h-4 text-slate-300" /></div>
                <div className="text-2xl font-bold text-slate-800">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base font-semibold">Crescimento da Base</CardTitle><span className="text-xs text-slate-400">Últimos 12 meses</span></div></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={250}><AreaChart data={chartData.crescimentoMensal}><defs><linearGradient id="cE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="mes" tick={{fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:12}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'12px'}}/><Area type="monotone" dataKey="eleitores" stroke="#2563EB" strokeWidth={2} fill="url(#cE)"/></AreaChart></ResponsiveContainer></CardContent>
          </Card>
        </motion.div>
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Solicitações por Categoria</CardTitle></CardHeader>
            <CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={chartData.solicitacoesPorCategoria} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="total" nameKey="categoria">{chartData.solicitacoesPorCategoria.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px'}}/></PieChart></ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">{chartData.solicitacoesPorCategoria.map((item,i)=><div key={i} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor:COLORS[i%COLORS.length]}}/><span className="text-slate-500">{item.categoria}</span></div>)}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
        <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-600"/>Comunicações Recentes</CardTitle><button onClick={()=>navigate('/dashboard/comunicacao')} className="text-xs text-blue-600 hover:underline">Ver todas</button></div></CardHeader>
          <CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-100 bg-slate-50">{['Tipo','Assunto','Destinatários','Data','Status'].map(h=><th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead><tbody>{comunicacoes.slice(0,4).map(c=><tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50"><td className="py-2.5 px-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.tipo==='email'?'bg-blue-50 text-blue-600':'bg-green-50 text-green-600'}`}>{c.tipo.toUpperCase()}</span></td><td className="py-2.5 px-3 text-slate-700">{c.assunto}</td><td className="py-2.5 px-3 text-slate-500">{c.destinatarios.toLocaleString()}</td><td className="py-2.5 px-3 text-slate-500">{c.dataEnvio}</td><td className="py-2.5 px-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.status==='enviado'?'bg-green-50 text-green-600':'bg-amber-50 text-amber-600'}`}>{c.status}</span></td></tr>)}</tbody></table></div></CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
