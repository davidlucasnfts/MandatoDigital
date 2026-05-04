import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Calendar, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useSupabaseData';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useCountUp } from '@/hooks/useCountUp';
import AlertasPanel from '@/components/AlertasPanel';
import AniversariantesPanel from '@/components/AniversariantesPanel';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }) };
const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export default function DashboardHome() {
  const navigate = useNavigate();
  const { stats } = useStats();
  const { crescimentoMensal, solicitacoesPorCategoria, tarefasUrgentes, solicitacoesPendentes, eventosHoje, loading: dashLoading } = useDashboardData();
  const totalEleitores = useCountUp(stats.eleitores || 0, 1000);

  const statCards = [
    { label: 'Total de Eleitores', value: totalEleitores, icon: Users, color: 'blue', route: '/dashboard/eleitores' },
    { label: 'Solicitações Pendentes', value: stats.pendentes || 0, icon: ClipboardList, color: 'amber', route: '/dashboard/solicitacoes' },
    { label: 'Tarefas em Aberto', value: stats.tarefas || 0, icon: Clock, color: 'orange', route: '/dashboard/tarefas' },
    { label: 'Eventos Agendados', value: stats.eventos || 0, icon: Calendar, color: 'emerald', route: '/dashboard/agenda' },
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

      <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
        <AlertasPanel
          tarefasUrgentes={tarefasUrgentes}
          solicitacoesPendentes={solicitacoesPendentes}
          eventosHoje={eventosHoje}
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base font-semibold">Crescimento da Base</CardTitle><span className="text-xs text-slate-400">Últimos 12 meses</span></div></CardHeader>
            <CardContent>
              {dashLoading ? <div className="h-[250px] bg-slate-50 rounded animate-pulse"/> : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={crescimentoMensal}>
                    <defs><linearGradient id="cE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="mes" tick={{fontSize:12}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:12}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'12px'}}/>
                    <Area type="monotone" dataKey="eleitores" stroke="#2563EB" strokeWidth={2} fill="url(#cE)"/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
          <Card><CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Solicitações por Categoria</CardTitle></CardHeader>
            <CardContent>
              {dashLoading ? <div className="h-[250px] bg-slate-50 rounded animate-pulse"/> : solicitacoesPorCategoria.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-xs text-slate-400">Nenhuma solicitação cadastrada</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={solicitacoesPorCategoria} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="total" nameKey="categoria">
                        {solicitacoesPorCategoria.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'8px',fontSize:'12px'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {solicitacoesPorCategoria.map((item,i)=><div key={i} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor:COLORS[i%COLORS.length]}}/><span className="text-slate-500">{item.categoria}</span></div>)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div custom={8} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-600"/>Próximos Eventos</CardTitle><button onClick={()=>navigate('/dashboard/agenda')} className="text-xs text-blue-600 hover:underline">Ver agenda</button></div></CardHeader>
            <CardContent>
              {eventosHoje.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">Nenhum evento para hoje</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {eventosHoje.map(e => (
                    <div key={e.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-800">{e.titulo}</p>
                      <p className="text-xs text-slate-500 mt-1">{e.hora_inicio} — {e.local}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={9} variants={fadeIn} initial="hidden" animate="visible">
          <Card><CardContent className="p-4"><AniversariantesPanel /></CardContent></Card>
        </motion.div>
      </div>
    </div>
  );
}
