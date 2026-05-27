import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, MapPin, Calendar, FolderOpen,
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Bell,
  Search, Shield, ClipboardList, FileText, MessageSquare, Menu, X,
  Gavel, TrendingUp, Crown, BuildingCommunity, ChartBar, ReportAnalytics
} from '@/lib/icons';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { User } from '@supabase/supabase-js';
import { usePermissions } from '@/hooks/usePermissions';

interface DashboardLayoutProps {
  user: User | null;
  signOut: () => Promise<void>;
}

// ============================================
// CONFIGURAÇÃO DOS ÍCONES TABLER
// Stroke: 2px | Tamanho: 20px
// ============================================
const ICON_STROKE = 2;
const ICON_SIZE = 20;

function useNavGroups() {
  const { can } = usePermissions();

  return [
    {
      label: 'Principal',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/dashboard/eleitores', icon: Users, label: 'Eleitores' },
        { to: '/dashboard/lideres', icon: Crown, label: 'Líderes' },
        { to: '/dashboard/mapa', icon: MapPin, label: 'Mapa' },
        { to: '/dashboard/mapa/teste-v1', icon: MapPin, label: 'Mapa V1', end: true },
        { to: '/dashboard/mapa/teste-v2', icon: MapPin, label: 'Mapa V2', end: true },
        { to: '/dashboard/solicitacoes', icon: ClipboardList, label: 'Solicitações' },
        { to: '/dashboard/solicitacoes/teste-v3', icon: ClipboardList, label: 'Solicitações V3', end: true },
        { to: '/dashboard/comunicacao', icon: MessageSquare, label: 'Comunicação' },
      ],
    },
    {
      label: 'Gestão',
      items: [
        { to: '/dashboard/agenda', icon: Calendar, label: 'Agenda' },
        { to: '/dashboard/tarefas', icon: FileText, label: 'Tarefas' },
        { to: '/dashboard/proposicoes', icon: Gavel, label: 'Proposições' },
        { to: '/dashboard/produtividade', icon: TrendingUp, label: 'Produtividade' },
        { to: '/dashboard/relatorios', icon: ReportAnalytics, label: 'Relatórios' },
        { to: '/dashboard/enquetes', icon: ChartBar, label: 'Enquetes' },
        { to: '/dashboard/comunidades', icon: BuildingCommunity, label: 'Comunidades' },
        { to: '/dashboard/documentos', icon: FolderOpen, label: 'Documentos' },
      ],
    },
    ...(can.manageTeam ? [{
      label: 'Configurações' as const,
      items: [
        { to: '/dashboard/equipe', icon: Shield, label: 'Equipe' },
        { to: '/dashboard/configuracoes', icon: Settings, label: 'Configurações' },
      ],
    }] : []),
  ];
}

export default function DashboardLayout({ user, signOut }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navGroups = useNavGroups();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { setCollapsed(false); setMobileOpen(false); }
      else if (window.innerWidth < 1024) setCollapsed(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageTitle = navGroups.flatMap(g => g.items).find(i => {
    if (i.end) return location.pathname === i.to;
    return location.pathname.startsWith(i.to);
  })?.label || 'Dashboard';

  const userName = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed md:static top-0 left-0 z-50 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[264px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {!collapsed && <span className="ml-3 font-bold text-lg whitespace-nowrap"><span className="text-slate-800">Mandato</span><span className="text-blue-600">Digital</span></span>}
          <button onClick={() => setMobileOpen(false)} className="ml-auto md:hidden p-1"><X size={20} stroke={ICON_STROKE} className="text-slate-400" /></button>
        </div>

        {/* Navegação */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map(group => (
            <div key={group.label}>
              {!collapsed && <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">{group.label}</div>}
              <div className="space-y-1">
                {group.items.map(item => (
                  <NavLink key={item.to} to={item.to} end={item.end}
                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                    {({ isActive }) => (<>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />}
                      <item.icon size={ICON_SIZE} stroke={ICON_STROKE} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                      {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                    </>)}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex w-full items-center justify-center py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            {collapsed ? <ChevronRight size={ICON_SIZE} stroke={ICON_STROKE} /> : <ChevronLeft size={ICON_SIZE} stroke={ICON_STROKE} />}
          </button>
          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1">
            <LogOut size={ICON_SIZE} stroke={ICON_STROKE} className="flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => { if (window.innerWidth < 768) setMobileOpen(true); else setCollapsed(!collapsed); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Menu size={ICON_SIZE} stroke={ICON_STROKE} className="text-slate-500" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Busca */}
            <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64">
              <Search size={16} stroke={ICON_STROKE} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Buscar..." className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400" />
            </div>
            {/* Notificações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Bell size={ICON_SIZE} stroke={ICON_STROKE} className="text-slate-500" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-3 text-sm text-slate-500">Nova solicitação de Maria Aparecida</div>
                <div className="p-3 text-sm text-slate-500 border-t">Tarefa "Visita ao posto" vence amanhã</div>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-slate-700">{userName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/configuracoes')}>
                  <Settings size={16} stroke={ICON_STROKE} className="mr-2" />Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="text-red-500">
                  <LogOut size={16} stroke={ICON_STROKE} className="mr-2" />Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
