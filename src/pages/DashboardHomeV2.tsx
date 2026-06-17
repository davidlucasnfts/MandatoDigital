import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardList, Clock, MessageSquare, Calendar, TrendingUp, TrendingDown } from '@/lib/icons';
import { StatCard, PanelCard, CommandMenu } from '@/components/dashboard';
import { useStats, useDashboardData } from '@/hooks/useSupabaseData';
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

const COLORS = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export default function DashboardHomeV2() {
  const navigate = useNavigate();
  const { stats, tendencias } = useStats();
  const {
    crescimentoMensal,
    solicitacoesPorCategoria,
    tarefasUrgentes,
    solicitacoesPendentes,
    eventosHoje,
    loading: dashLoading,
  } = useDashboardData();
  const totalEleitores = useCountUp(stats.eleitores || 0, 1000);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header - Mobile: empilhado, Desktop: lado a lado */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Bem-vindo ao Mandato Digital</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">Aqui está o resumo da sua gestão hoje.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CommandMenu />
            <button
              onClick={() => navigate('/dashboard/eleitores')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg
                text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 w-fit
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                shadow-sm hover:shadow-md transition-all"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Novo Eleitor
            </button>
          </div>
        </div>
      </motion.div>

      {/* Cards de Stats + Meta - Grid uniforme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        <StatCard
          label="Total de Eleitores"
          value={totalEleitores}
          icon={Users}
          color="blue"
          trend={{ value: tendencias.eleitores.valor, positive: tendencias.eleitores.positivo }}
          onClick={() => navigate('/dashboard/eleitores')}
          delay={0}
        />
        <StatCard
          label="Solicitações Pendentes"
          value={stats.pendentes || 0}
          icon={ClipboardList}
          color="amber"
          trend={{ value: tendencias.pendentes.valor, positive: tendencias.pendentes.positivo }}
          invertTrend
          onClick={() => navigate('/dashboard/solicitacoes')}
          delay={1}
        />
        <StatCard
          label="Tarefas em Aberto"
          value={stats.tarefas || 0}
          icon={Clock}
          color="red"
          trend={{ value: tendencias.tarefas.valor, positive: tendencias.tarefas.positivo }}
          invertTrend
          onClick={() => navigate('/dashboard/tarefas')}
          delay={2}
        />
        <MetaEleitoralPanel totalAtual={stats.eleitores || 0} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <AlertasPanel
          tarefasUrgentes={tarefasUrgentes}
          solicitacoesPendentes={solicitacoesPendentes}
          eventosHoje={eventosHoje}
        />
      </motion.div>

      {/* Gráficos - Mobile: empilhados, Desktop: lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2"
        >
          <PanelCard
            title="Crescimento da Base"
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            action={{ label: 'Ver relatório', onClick: () => navigate('/dashboard/relatorios') }}
            delay={5}
          >
            {dashLoading ? (
              <div className="h-[200px] lg:h-[250px] bg-slate-50 rounded animate-pulse" />
            ) : crescimentoMensal.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">Nenhum dado de crescimento</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={crescimentoMensal} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{fontSize:10, fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize:10, fill:'#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'11px'}} />
                  <Area type="monotone" dataKey="eleitores" stroke="#2563EB" strokeWidth={2} fill="url(#cE)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </PanelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <PanelCard
            title="Solicitações por Categoria"
            icon={ClipboardList}
            iconColor="text-cyan-600"
            iconBg="bg-cyan-50"
            delay={6}
          >
            {dashLoading ? (
              <div className="h-[200px] lg:h-[250px] bg-slate-50 rounded animate-pulse" />
            ) : solicitacoesPorCategoria.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-slate-400">Nenhuma solicitação cadastrada</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={solicitacoesPorCategoria} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="total" nameKey="categoria">
                      {solicitacoesPorCategoria.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius:'8px',fontSize:'11px'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-2 justify-center">
                  {solicitacoesPorCategoria.map((item,i)=>
                    <div key={i} className="flex items-center gap-1 text-[10px] lg:text-xs">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor:COLORS[i%COLORS.length]}} />
                      <span className="text-slate-500 truncate">{item.categoria}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </PanelCard>
        </motion.div>
      </div>

      {/* Painéis - Mobile: 1 coluna, Desktop: 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <TerritorioPanel />
        <LideresPanel />
        <ConvitesPendentesPanel />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <ProposicoesPanel />
        <EnquetesPanel />
        <ComunicacaoPanel />
      </div>

      {/* Atividade + Eventos + Aniversariantes - Desktop: 3 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <AtividadeRecentePanel />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        >
          <PanelCard
            title="Próximos Eventos"
            icon={Calendar}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            action={{ label: 'Ver agenda', onClick: () => navigate('/dashboard/agenda') }}
            delay={14}
          >
            {eventosHoje.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">Nenhum evento para hoje</div>
            ) : (
              <div className="space-y-2">
                {eventosHoje.map(e => (
                  <div
                    key={e.id}
                    className="p-2 lg:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    tabIndex={0}
                    role="button"
                  >
                    <p className="text-xs lg:text-sm font-semibold text-slate-800 truncate">{e.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {e.hora_inicio}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">{e.local}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.4 }}
        >
          <AniversariantesPanel />
        </motion.div>
      </div>
    </div>
  );
}
