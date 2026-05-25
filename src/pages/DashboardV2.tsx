import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  Clock,
  MapPin,
  Award,
  UserPlus,
  FileText,
  Vote,
  MessageSquare,
  Activity,
  Calendar,
  Gift,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { StatCard, PanelCard, MetaPanel, EmptyState, CommandMenu } from "@/components/dashboard-v2";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const crescimentoMensal = [
  { mes: "Jan", eleitores: 180 },
  { mes: "Fev", eleitores: 320 },
  { mes: "Mar", eleitores: 450 },
  { mes: "Abr", eleitores: 580 },
  { mes: "Mai", eleitores: 720 },
  { mes: "Jun", eleitores: 890 },
  { mes: "Jul", eleitores: 950 },
  { mes: "Ago", eleitores: 1050 },
  { mes: "Set", eleitores: 1120 },
  { mes: "Out", eleitores: 1180 },
  { mes: "Nov", eleitores: 1210 },
  { mes: "Dez", eleitores: 1247 },
];

const solicitacoesPorCategoria = [
  { categoria: "Saúde", total: 45 },
  { categoria: "Infraestrutura", total: 38 },
  { categoria: "Educação", total: 32 },
  { categoria: "Segurança", total: 28 },
  { categoria: "Outros", total: 15 },
];

const bairros = [
  { bairro: "Centro", total: 245 },
  { bairro: "Jardim América", total: 189 },
  { bairro: "Vila Nova", total: 156 },
  { bairro: "Boa Vista", total: 134 },
  { bairro: "São José", total: 98 },
];

const lideres = [
  { id: "1", nome: "Carlos Silva", eleitores_vinculados: 45, estimativa_votos: 38, taxa_conversao: 84 },
  { id: "2", nome: "Maria Oliveira", eleitores_vinculados: 38, estimativa_votos: 32, taxa_conversao: 84 },
  { id: "3", nome: "João Pereira", eleitores_vinculados: 32, estimativa_votos: 28, taxa_conversao: 88 },
];

const atividades = [
  { tipo: "eleitor", titulo: "João da Silva cadastrado", descricao: "Bairro Centro", data: "2026-05-25T10:30:00" },
  { tipo: "solicitacao", titulo: "Solicitação resolvida", descricao: "Posto de Saúde Jardim América", data: "2026-05-25T09:15:00" },
  { tipo: "interacao", titulo: "Ligação realizada", descricao: "Carlos Mendes", data: "2026-05-24T16:45:00" },
  { tipo: "proposicao", titulo: "PL 123/2026", descricao: "Aprovado em comissão", data: "2026-05-24T14:20:00" },
];

const eventos = [
  { id: "1", titulo: "Reunião com vereadores", hora_inicio: "14:00", local: "Câmara Municipal" },
  { id: "2", titulo: "Visita à comunidade", hora_inicio: "16:30", local: "Bairro Vila Nova" },
];

const aniversariantes = [
  { id: "1", nome: "Maria José", telefone: "(11) 98765-4321", cidade: "São Paulo", data_nascimento: "1990-05-25", enviado: false },
  { id: "2", nome: "Carlos Mendes", telefone: "(11) 91234-5678", cidade: "São Paulo", data_nascimento: "1985-05-25", enviado: true },
];

const COLORS = ["#2563EB", "#0891B2", "#059669", "#D97706", "#DC2626"];

const tipoConfig: Record<string, { icon: any; color: string; bg: string }> = {
  eleitor: { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" },
  solicitacao: { icon: ClipboardList, color: "text-green-600", bg: "bg-green-50" },
  interacao: { icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
  proposicao: { icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
};

function formatarTempo(dataStr: string): string {
  const data = new Date(dataStr);
  const agora = new Date();
  const diffMin = Math.floor((agora.getTime() - data.getTime()) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const diffHora = Math.floor(diffMin / 60);
  if (diffHora < 24) return `${diffHora}h`;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function DashboardV2() {
  const navigate = useNavigate();

  const maxBairroTotal = Math.max(...bairros.map((b) => b.total));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
        
        {/* ─── HEADER ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              Bem-vindo ao Mandato Digital
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Aqui está o resumo da sua gestão hoje.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CommandMenu />
            <button
              onClick={() => navigate("/dashboard/eleitores")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white 
                text-sm font-semibold hover:bg-blue-700 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                shadow-sm hover:shadow-md"
            >
              <Users className="w-4 h-4" />
              Novo Eleitor
            </button>
          </div>
        </motion.div>

        {/* ─── STATS GRID ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            label="Total de Eleitores"
            value={1247}
            icon={Users}
            color="blue"
            trend={{ value: 15, positive: true }}
            onClick={() => navigate("/dashboard/eleitores")}
            delay={0}
          />
          <StatCard
            label="Solicitações Pendentes"
            value={12}
            icon={ClipboardList}
            color="amber"
            trend={{ value: 8, positive: false }}
            invertTrend
            onClick={() => navigate("/dashboard/solicitacoes")}
            delay={1}
          />
          <StatCard
            label="Tarefas em Aberto"
            value={5}
            icon={Clock}
            color="red"
            trend={{ value: 3, positive: false }}
            invertTrend
            onClick={() => navigate("/dashboard/tarefas")}
            delay={2}
          />
          <MetaPanel totalAtual={1247} metaInicial={1500} delay={3} />
        </div>

        {/* ─── CHARTS ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Area Chart */}
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
              action={{ label: "Ver relatório", onClick: () => navigate("/dashboard/relatorios") }}
              delay={5}
            >
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={crescimentoMensal} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEleitores" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="eleitores"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#colorEleitores)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </PanelCard>
          </motion.div>

          {/* Pie Chart */}
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
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={solicitacoesPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="total"
                    nameKey="categoria"
                  >
                    {solicitacoesPorCategoria.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {solicitacoesPorCategoria.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-slate-500">{item.categoria}</span>
                  </div>
                ))}
              </div>
            </PanelCard>
          </motion.div>
        </div>

        {/* ─── PANEL GRID 1: Território / Líderes / Convites ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Território */}
          <PanelCard
            title="Território"
            icon={MapPin}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            action={{ label: "Ver mapa", onClick: () => navigate("/dashboard/mapa") }}
            delay={7}
          >
            <div className="space-y-4">
              {/* Cobertura */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">Cobertura geográfica</span>
                  <span className="font-semibold text-slate-700">892 de 1.247</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  72% dos eleitores estão geolocalizados no mapa
                </p>
              </div>

              {/* Top bairros */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Top bairros
                  </p>
                </div>
                {bairros.map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold text-slate-400 w-4 text-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-700 font-medium truncate">{b.bairro}</span>
                        <span className="text-slate-500 font-semibold">{b.total}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(b.total / maxBairroTotal) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.9 + i * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/dashboard/mapa")}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 
                  hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Abrir mapa <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </PanelCard>

          {/* Líderes */}
          <PanelCard
            title="Produtividade dos Líderes"
            icon={Award}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
            action={{ label: "Ver todos", onClick: () => navigate("/dashboard/lideres") }}
            delay={8}
          >
            <div className="space-y-3">
              {lideres.map((l, i) => {
                const medalColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
                return (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center">
                      <Award className={`w-5 h-5 ${medalColors[i] || "text-slate-300"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{l.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500">{l.eleitores_vinculados} indicados</span>
                        <span className="text-[10px] text-slate-400">· {l.taxa_conversao}% conversão</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{l.eleitores_vinculados}</span>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => navigate("/dashboard/lideres")}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 
                  hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Ver ranking <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </PanelCard>

          {/* Convites Pendentes */}
          <PanelCard
            title="Convites Pendentes"
            icon={UserPlus}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            action={{ label: "Gerenciar", onClick: () => navigate("/dashboard/equipe") }}
            delay={9}
          >
            <EmptyState
              icon={UserPlus}
              title="Nenhum convite pendente"
              description="Convide membros para sua equipe"
              action={{ label: "Convidar membro", onClick: () => navigate("/dashboard/equipe") }}
            />
          </PanelCard>
        </div>

        {/* ─── PANEL GRID 2: Proposições / Enquetes / Comunicação ───────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Proposições */}
          <PanelCard
            title="Proposições"
            icon={FileText}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            action={{ label: "Ver todas", onClick: () => navigate("/dashboard/proposicoes") }}
            delay={10}
          >
            <div className="space-y-2">
              {[
                { titulo: "PL 123/2026", status: "Aprovado", cor: "green" },
                { titulo: "PL 124/2026", status: "Em tramitação", cor: "amber" },
                { titulo: "PL 125/2026", status: "Protocolado", cor: "blue" },
              ].map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate("/dashboard/proposicoes")}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.titulo}</p>
                      <p className="text-[10px] text-slate-500">Câmara Municipal</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.cor === "green"
                        ? "bg-green-50 text-green-600"
                        : p.cor === "amber"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Enquetes */}
          <PanelCard
            title="Enquetes Ativas"
            icon={Vote}
            iconColor="text-cyan-600"
            iconBg="bg-cyan-50"
            action={{ label: "Ver todas", onClick: () => navigate("/dashboard/enquetes") }}
            delay={11}
          >
            <div className="space-y-3">
              {[
                { titulo: "Qual prioridade para 2026?", votos: 234, status: "Ativa" },
                { titulo: "Satisfação com atendimento", votos: 189, status: "Ativa" },
              ].map((e, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-800">{e.titulo}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                      {e.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Vote className="w-3 h-3" />
                    {e.votos} votos
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Comunicação */}
          <PanelCard
            title="Comunicação"
            icon={MessageSquare}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
            action={{ label: "Enviar", onClick: () => navigate("/dashboard/comunicacao") }}
            delay={12}
          >
            <div className="space-y-3">
              {[
                { tipo: "WhatsApp", enviados: 456, abertos: 89, cor: "green" },
                { tipo: "E-mail", enviados: 234, abertos: 67, cor: "blue" },
              ].map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{c.tipo}</span>
                    <span className="text-slate-500">{c.enviados} enviados</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${c.cor === "green" ? "bg-green-500" : "bg-blue-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.abertos / c.enviados) * 100}%` }}
                      transition={{ duration: 0.6, delay: 1.2 + i * 0.1 }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{c.abertos} abertos ({Math.round((c.abertos / c.enviados) * 100)}%)</p>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>

        {/* ─── PANEL GRID 3: Atividade / Eventos / Aniversariantes ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Atividade Recente */}
          <PanelCard
            title="Atividade Recente"
            icon={Activity}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            delay={13}
          >
            <div className="space-y-1">
              {atividades.map((a, i) => {
                const cfg = tipoConfig[a.tipo];
                const Icon = cfg.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    tabIndex={0}
                    role="button"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.titulo}</p>
                      <p className="text-[10px] text-slate-500">{a.descricao}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 font-medium">
                      {formatarTempo(a.data)}
                    </span>
                  </div>
                );
              })}
            </div>
          </PanelCard>

          {/* Próximos Eventos */}
          <PanelCard
            title="Próximos Eventos"
            icon={Calendar}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            action={{ label: "Ver agenda", onClick: () => navigate("/dashboard/agenda") }}
            delay={14}
          >
            <div className="space-y-2">
              {eventos.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  tabIndex={0}
                  role="button"
                >
                  <p className="text-sm font-semibold text-slate-800">{e.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {e.hora_inicio}
                    </span>
                    <span className="text-[10px] text-slate-500">{e.local}</span>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Aniversariantes - REFATORADO para seguir o padrão */}
          <PanelCard
            title="Aniversariantes"
            icon={Gift}
            iconColor="text-pink-500"
            iconBg="bg-pink-50"
            action={{ label: "Ver todos", onClick: () => navigate("/dashboard/eleitores") }}
            delay={15}
          >
            <div className="space-y-2">
              {aniversariantes.map((a) => {
                const dn = a.data_nascimento.split("-")[2];
                const mn = a.data_nascimento.split("-")[1];
                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                      a.enviado ? "opacity-60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{a.nome}</p>
                      <p className="text-[10px] text-slate-500">
                        {a.cidade} · <span className="text-pink-500 font-semibold">{dn}/{mn}</span>
                      </p>
                    </div>
                    {a.enviado ? (
                      <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        Enviado
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://wa.me/55${a.telefone.replace(/\D/g, "")}`, "_blank");
                        }}
                        className="text-[10px] font-semibold text-green-600 bg-green-50 hover:bg-green-100 
                          px-2 py-1 rounded-full transition-colors flex-shrink-0
                          focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        WhatsApp
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </PanelCard>
        </div>

        {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="pt-4 border-t border-slate-200"
        >
          <p className="text-xs text-slate-400 text-center">
            Mandato Digital v2.0 · Dashboard premium
          </p>
        </motion.div>
      </div>
    </div>
  );
}
