import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Calendar, MessageSquare, ArrowRight, Clock, TrendingUp, TrendingDown } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMockData } from '@/lib/mockData';
import { useCountUp } from '@/hooks/useCountUp';
import AlertasPanel from '@/components/AlertasPanel';
import AniversariantesPanel from '@/components/AniversariantesPanel';
import TerritorioPanel from '@/components/TerritorioPanel';
import LideresPanel from '@/components/LideresPanel';
import ProposicoesPanel from '@/components/ProposicoesPanel';
import EnquetesPanel from '@/components/EnquetesPanel';
import AtividadeRecentePanel from '@/components/AtividadeRecentePanel';
import ComunicacaoPanel from '@/components/ComunicacaoPanel';
import ConvitesPendentesPanel from '@/components/ConvitesPendentesPanel';
import MetaEleitoralPanel from '@/components/MetaEleitoralPanel';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }) };
const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export default function DashboardHome() {
  const navigate = useNavigate();
  const mock = useMockData();
  const { stats, tendencias } = mock;
  const totalEleitores = useCountUp(stats.eleitores || 0, 1000);
  
  // Dados mockados para gráficos
  const crescimentoMensal = [
    { mes: 'Jan', eleitores: 180 },
    { mes: 'Fev', eleitores: 320 },
    { mes: 'Mar', eleitores: 450 },
    { mes: 'Abr', eleitores: 580 },
    { mes: 'Mai', eleitores: 720 },
    { mes: 'Jun', eleitores: 890 },
    { mes: 'Jul', eleitores: 950 },
    { mes: 'Ago', eleitores: 1050 },
    { mes: 'Set', eleitores: 1120 },
    { mes: 'Out', eleitores: 1180 },
    { mes: 'Nov', eleitores: 1210 },
    { mes: 'Dez', eleitores: 1247 },
  ];
  const solicitacoesPorCategoria = [
    { categoria: 'Saúde', total: 45 },
    { categoria: 'Infraestrutura', total: 38 },
    { categoria: 'Educação', total: 32 },
    { categoria: 'Segurança', total: 28 },
    { categoria: 'Outros', total: 15 },
  ];
  const dashLoading = false;
  const tarefasUrgentes = [
    { id: '1', titulo: 'Reunião com lideranças', prazo: '2026-05-26', prioridade: 'alta' },
    { id: '2', titulo: 'Visita ao bairro Centro', prazo: '2026-05-27', prioridade: 'alta' },
  ];
  const solicitacoesPendentes = [
    { id: '1', titulo: 'Pavimentação Rua das Flores', eleitor_nome: 'Carlos Mendes', data_solicitacao: '2026-05-20' },
    { id: '2', titulo: 'Posto de Saúde Jardim América', eleitor_nome: 'Maria José', data_solicitacao: '2026-05-22' },
  ];
  const eventosHoje = [
    { id: '1', titulo: 'Reunião com vereadores', hora_inicio: '14:00', local: 'Câmara Municipal' },
    { id: '2', titulo: 'Visita à comunidade', hora_inicio: '16:30', local: 'Bairro Vila Nova' },
  ];

  const statCards = [
    { label: 'Total de Eleitores', value: totalEleitores, icon: Users, color: 'blue', route: '/dashboard/eleitores', tendencia: tendencias.eleitores },
    { label: 'Solicitações Pendentes', value: stats.pendentes || 0, icon: ClipboardList, color: 'amber', route: '/dashboard/solicitacoes', tendencia: tendencias.pendentes, invertido: true },
    { label: 'Tarefas em Aberto', value: stats.tarefas || 0, icon: Clock, color: 'orange', route: '/dashboard/tarefas', tendencia: tendencias.tarefas, invertido: true },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Mobile: empilhado, Desktop: lado a lado */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Bem-vindo ao Mandato Digital</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Aqui está o resumo da sua gestão hoje.</p>
          </div>
          <button onClick={() => navigate('/dashboard/eleitores')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 w-fit">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Novo Eleitor
          </button>
        </div>
      </motion.div>

      {/* Cards de Stats + Meta - Grid uniforme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {statCards.map((s, i) => {
          const t = s.tendencia;
          const isGood = s.invertido ? !t.positivo : t.positivo;
          const TrendIcon = t.positivo ? TrendingUp : TrendingDown;
          const trendColor = isGood ? 'text-green-600' : 'text-red-600';
          const trendBg = isGood ? 'bg-green-50' : 'bg-red-50';
          return (
            <motion.div key={i} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-t-[3px] h-full" style={{borderTopColor: s.color==='blue'?'#2563EB':s.color==='amber'?'#F59E0B':s.color==='orange'?'#F97316':'#059669'}} onClick={() => navigate(s.route)}>
                <CardContent className="px-3 py-2 lg:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                    <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4 text-slate-300 hidden sm:block" />
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-slate-800">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-[10px] lg:text-xs text-slate-500 leading-tight">{s.label}</div>
                    <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] lg:text-[10px] font-medium ${trendBg} ${trendColor}`}>
                      <TrendIcon className="w-2.5 h-2.5 lg:w-3 lg:h-3" />{t.valor}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
          <MetaEleitoralPanel totalAtual={stats.eleitores || 0} />
        </motion.div>
      </div>

      <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
        <AlertasPanel
          tarefasUrgentes={tarefasUrgentes}
          solicitacoesPendentes={solicitacoesPendentes}
          eventosHoje={eventosHoje}
        />
      </motion.div>

      {/* Gráficos - Mobile: empilhados, Desktop: lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-5">
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-0 px-3 lg:px-6 pt-3 lg:pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm lg:text-base font-semibold">Crescimento da Base</CardTitle>
                <span className="text-[10px] lg:text-xs text-slate-400">Últimos 12 meses</span>
              </div>
            </CardHeader>
            <CardContent className="px-3 lg:px-6 pt-0 pb-2 lg:pb-3">
              {dashLoading ? <div className="h-[200px] lg:h-[250px] bg-slate-50 rounded animate-pulse"/> : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={crescimentoMensal}>
                    <defs><linearGradient id="cE" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="mes" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'11px'}}/>
                    <Area type="monotone" dataKey="eleitores" stroke="#2563EB" strokeWidth={2} fill="url(#cE)"/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
          <Card>
            <CardHeader className="pb-0 px-3 lg:px-6 pt-3 lg:pt-4">
              <CardTitle className="text-sm lg:text-base font-semibold">Solicitações por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="px-3 lg:px-6 pt-0 pb-2 lg:pb-3">
              {dashLoading ? <div className="h-[200px] lg:h-[250px] bg-slate-50 rounded animate-pulse"/> : solicitacoesPorCategoria.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">Nenhuma solicitação cadastrada</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={solicitacoesPorCategoria} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="total" nameKey="categoria">
                        {solicitacoesPorCategoria.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'8px',fontSize:'11px'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-2 justify-center">
                    {solicitacoesPorCategoria.map((item,i)=><div key={i} className="flex items-center gap-1 text-[10px] lg:text-xs"><div className="w-2 h-2 rounded-full" style={{backgroundColor:COLORS[i%COLORS.length]}}/><span className="text-slate-500">{item.categoria}</span></div>)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Painéis - Mobile: 1 coluna, Desktop: 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
        <motion.div custom={8} variants={fadeIn} initial="hidden" animate="visible">
          <TerritorioPanel />
        </motion.div>
        <motion.div custom={9} variants={fadeIn} initial="hidden" animate="visible">
          <LideresPanel />
        </motion.div>
        <motion.div custom={10} variants={fadeIn} initial="hidden" animate="visible">
          <ConvitesPendentesPanel />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
        <motion.div custom={11} variants={fadeIn} initial="hidden" animate="visible">
          <ProposicoesPanel />
        </motion.div>
        <motion.div custom={12} variants={fadeIn} initial="hidden" animate="visible">
          <EnquetesPanel />
        </motion.div>
        <motion.div custom={13} variants={fadeIn} initial="hidden" animate="visible">
          <ComunicacaoPanel />
        </motion.div>
      </div>

      {/* Atividade + Eventos + Aniversariantes - Desktop: 3 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-5">
        <motion.div custom={14} variants={fadeIn} initial="hidden" animate="visible">
          <AtividadeRecentePanel />
        </motion.div>
        <motion.div custom={16} variants={fadeIn} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardHeader className="pb-0 px-3 lg:px-6 pt-3 lg:pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm lg:text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600"/>Próximos Eventos
                </CardTitle>
                <button onClick={()=>navigate('/dashboard/agenda')} className="text-[10px] lg:text-xs text-blue-600 hover:underline">Ver agenda</button>
              </div>
            </CardHeader>
            <CardContent className="px-3 lg:px-6 pt-0 pb-2 lg:pb-3">
              {eventosHoje.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">Nenhum evento para hoje</div>
              ) : (
                <div className="grid grid-cols-1 gap-2 lg:gap-3">
                  {eventosHoje.map(e => (
                    <div key={e.id} className="p-2 lg:p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs lg:text-sm font-medium text-slate-800">{e.titulo}</p>
                      <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5 lg:mt-1">{e.hora_inicio} — {e.local}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div custom={17} variants={fadeIn} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardContent className="p-3 lg:p-4">
              <AniversariantesPanel />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
