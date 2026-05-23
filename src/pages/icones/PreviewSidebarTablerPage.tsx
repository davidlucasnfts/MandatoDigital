import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard, IconUsers, IconBuildingCommunity, IconClipboardList,
  IconMessageCircle, IconMapPin, IconCalendar, IconFileText, IconFolder,
  IconGavel, IconTrendingUp, IconCrown, IconChartBar, IconReportAnalytics,
  IconShield, IconSettings, IconChevronLeft, IconChevronRight, IconLogout,
  IconBell, IconSearch, IconMenu2, IconX, IconUser,
  IconPlus, IconFileExport, IconEdit, IconTrash
} from '@tabler/icons-react';

// ============================================
// CONFIGURAÇÃO DAS ABAS COM ÍCONES TABLER
// ============================================

interface NavItem {
  to: string;
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
  label: string;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Principal',
    items: [
      { to: '#dashboard', icon: IconLayoutDashboard, label: 'Dashboard', end: true },
      { to: '#eleitores', icon: IconUsers, label: 'Eleitores' },
      { to: '#comunidades', icon: IconBuildingCommunity, label: 'Comunidades' },
      { to: '#solicitacoes', icon: IconClipboardList, label: 'Solicitações' },
      { to: '#comunicacao', icon: IconMessageCircle, label: 'Comunicação' },
      { to: '#mapa', icon: IconMapPin, label: 'Mapa' },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { to: '#agenda', icon: IconCalendar, label: 'Agenda' },
      { to: '#tarefas', icon: IconFileText, label: 'Tarefas' },
      { to: '#documentos', icon: IconFolder, label: 'Documentos' },
      { to: '#proposicoes', icon: IconGavel, label: 'Proposições' },
      { to: '#produtividade', icon: IconTrendingUp, label: 'Produtividade' },
      { to: '#lideres', icon: IconCrown, label: 'Líderes' },
      { to: '#enquetes', icon: IconChartBar, label: 'Enquetes' },
      { to: '#relatorios', icon: IconReportAnalytics, label: 'Relatórios' },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { to: '#equipe', icon: IconShield, label: 'Equipe' },
      { to: '#configuracoes', icon: IconSettings, label: 'Configurações' },
    ],
  },
];

export default function PreviewSidebarTablerPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [iconSize, setIconSize] = useState(20);
  const [activeItem, setActiveItem] = useState('#dashboard');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header da página de preview */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Preview — Sidebar com Tabler Icons</h1>
            <p className="text-sm text-slate-500">Visualização real de como ficaria o menu lateral</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Controles */}
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Stroke</span>
              {[1, 1.5, 2].map((w) => (
                <button
                  key={w}
                  onClick={() => setStrokeWidth(w)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    strokeWidth === w ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tamanho</span>
              {[18, 20, 22].map((s) => (
                <button
                  key={s}
                  onClick={() => setIconSize(s)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    iconSize === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* SIDEBAR PREVIEW */}
          <div className="relative">
            {/* Overlay mobile */}
            {mobileOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                onClick={() => setMobileOpen(false)} 
              />
            )}

            <aside 
              className={`bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col transition-all duration-300 h-[700px] ${
                collapsed ? 'w-[72px]' : 'w-[264px]'
              } ${mobileOpen ? 'fixed left-4 top-20 z-50' : ''}`}
            >
              {/* Logo */}
              <div className="h-16 flex items-center px-4 border-b border-slate-100">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                {!collapsed && (
                  <span className="ml-3 font-bold text-lg whitespace-nowrap">
                    <span className="text-slate-800">Mandato</span>
                    <span className="text-blue-600">Digital</span>
                  </span>
                )}
                {mobileOpen && (
                  <button 
                    onClick={() => setMobileOpen(false)} 
                    className="ml-auto md:hidden p-1"
                  >
                    <IconX className="w-5 h-5 text-slate-400" stroke={strokeWidth} />
                  </button>
                )}
              </div>

              {/* Navegação */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    {!collapsed && (
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                        {group.label}
                      </div>
                    )}
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = activeItem === item.to;
                        return (
                          <button
                            key={item.to}
                            onClick={() => setActiveItem(item.to)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative w-full text-left ${
                              isActive 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-600 rounded-r-full" />
                            )}
                            <item.icon 
                              size={iconSize} 
                              stroke={strokeWidth} 
                              className={`flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} 
                            />
                            {!collapsed && (
                              <span className="whitespace-nowrap">{item.label}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-100">
                <button 
                  onClick={() => setCollapsed(!collapsed)} 
                  className="hidden md:flex w-full items-center justify-center py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {collapsed ? (
                    <IconChevronRight className="w-4 h-4" stroke={strokeWidth} />
                  ) : (
                    <IconChevronLeft className="w-4 h-4" stroke={strokeWidth} />
                  )}
                </button>
                <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1">
                  <IconLogout 
                    className="w-5 h-5 flex-shrink-0" 
                    size={iconSize} 
                    stroke={strokeWidth} 
                  />
                  {!collapsed && <span>Sair</span>}
                </button>
              </div>
            </aside>
          </div>

          {/* CONTEÚDO SIMULADO */}
          <div className="flex-1">
            {/* Simulação do header */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-16 flex items-center justify-between px-4 lg:px-6 mb-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileOpen(true)} 
                  className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <IconMenu2 className="w-5 h-5 text-slate-500" stroke={strokeWidth} />
                </button>
                <h1 className="text-lg font-semibold text-slate-800">
                  {navGroups.flatMap(g => g.items).find(i => i.to === activeItem)?.label || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64">
                  <IconSearch className="w-4 h-4 text-slate-400 mr-2" stroke={strokeWidth} />
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400" 
                  />
                </div>
                <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <IconBell className="w-5 h-5 text-slate-500" stroke={strokeWidth} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <button className="flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">D</span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-slate-700">David</span>
                </button>
              </div>
            </div>

            {/* Simulação do conteúdo */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                {(() => {
                  const item = navGroups.flatMap(g => g.items).find(i => i.to === activeItem);
                  if (!item) return null;
                  const Icon = item.icon;
                  return (
                    <>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Icon size={24} stroke={strokeWidth} className="text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">{item.label}</h2>
                        <p className="text-sm text-slate-500">Ícone: <code className="text-blue-600">{Icon.name}</code></p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Cards de exemplo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <IconUsers size={18} stroke={strokeWidth} className="text-blue-600" />
                    <span className="text-sm font-medium text-slate-600">Total de Eleitores</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">1.247</div>
                  <div className="text-xs text-green-600 mt-1">+12% este mês</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <IconClipboardList size={18} stroke={strokeWidth} className="text-amber-600" />
                    <span className="text-sm font-medium text-slate-600">Solicitações Pendentes</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">23</div>
                  <div className="text-xs text-amber-600 mt-1">5 urgentes</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <IconTrendingUp size={18} stroke={strokeWidth} className="text-green-600" />
                    <span className="text-sm font-medium text-slate-600">Produtividade</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">87%</div>
                  <div className="text-xs text-green-600 mt-1">Meta atingida</div>
                </div>
              </div>

              {/* Tabela de exemplo */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Exemplo de Tabela</span>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded">
                      <IconPlus size={12} stroke={strokeWidth} /> Novo
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 rounded">
                      <IconFileExport size={12} stroke={strokeWidth} /> Exportar
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { nome: 'Maria Aparecida', status: 'Ativo', comunidade: 'Centro' },
                    { nome: 'João Silva', status: 'Pendente', comunidade: 'Bairro Novo' },
                    { nome: 'Ana Paula', status: 'Ativo', comunidade: 'Jardim' },
                  ].map((row, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconUser size={14} stroke={strokeWidth} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-700">{row.nome}</div>
                          <div className="text-xs text-slate-400">{row.comunidade}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          row.status === 'Ativo' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {row.status}
                        </span>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded">
                          <IconEdit size={10} stroke={strokeWidth} /> Editar
                        </button>
                        <button className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded">
                          <IconTrash size={10} stroke={strokeWidth} /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm">Como usar este preview</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Clique nos itens do menu para simular navegação</li>
                <li>• Use o botão de recolher (↓) para testar sidebar collapsed</li>
                <li>• Ajuste stroke e tamanho para ver diferentes estilos</li>
                <li>• A tabela e cards mostram os ícones em contexto real</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


