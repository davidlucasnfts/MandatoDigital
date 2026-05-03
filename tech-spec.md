# Mandato Digital - Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | DOM renderer |
| `react-router-dom` | ^7.0.0 | Client-side routing |
| `framer-motion` | ^12.0.0 | Animations and page transitions |
| `recharts` | ^2.15.0 | Charts and data visualization |
| `lucide-react` | ^0.460.0 | Icon library |
| `@radix-ui/react-dialog` | ^1.1.0 | Modal primitive |
| `@radix-ui/react-dropdown-menu` | ^2.1.0 | Dropdown menu |
| `@radix-ui/react-tooltip` | ^1.1.0 | Tooltip |
| `@radix-ui/react-tabs` | ^1.1.0 | Tabs |
| `@radix-ui/react-toast` | ^1.2.0 | Toast notifications |
| `@radix-ui/react-avatar` | ^1.1.0 | Avatar |
| `@radix-ui/react-progress` | ^1.1.0 | Progress bar |
| `@radix-ui/react-switch` | ^1.1.0 | Toggle switch |
| `@radix-ui/react-checkbox` | ^1.1.0 | Checkbox |
| `@radix-ui/react-select` | ^2.1.0 | Select dropdown |
| `@radix-ui/react-scroll-area` | ^1.1.0 | Custom scrollbar |
| `@radix-ui/react-collapsible` | ^1.1.0 | Collapsible panel |
| `@radix-ui/react-label` | ^2.1.0 | Form label |
| `@radix-ui/react-separator` | ^1.1.0 | Separator |
| `class-variance-authority` | ^0.7.0 | Component variant utility |
| `clsx` | ^2.1.0 | Conditional classnames |
| `tailwind-merge` | ^2.6.0 | Tailwind class merging |
| `tailwindcss` | ^3.4.0 | CSS framework |
| `typescript` | ^5.7.0 | Type system |
| `vite` | ^6.0.0 | Build tool |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React plugin |
| `@types/react` | ^19.0.0 | React types |
| `@types/react-dom` | ^19.0.0 | ReactDOM types |
| `autoprefixer` | ^10.4.0 | CSS autoprefixer |
| `postcss` | ^8.4.0 | CSS processor |

## Component Inventory

### Layout Components (Both)
| Component | Source | Notes |
|-----------|--------|-------|
| `LandingNavbar` | Custom | Fixed nav with scroll transition, mobile drawer |
| `DashboardLayout` | Custom | Sidebar + topbar + main content flex layout |
| `Sidebar` | Custom | Collapsible 264px/72px, nav groups, active states |
| `Topbar` | Custom | Breadcrumb, search, notifications, user dropdown |
| `Footer` | Custom | Landing page footer |

### Landing Page Sections
| Component | Source | Notes |
|-----------|--------|-------|
| `HeroSection` | Custom | Full viewport, CTA buttons, dashboard preview image |
| `FeaturesSection` | Custom | 3x2 grid of FeatureCard, scroll reveal |
| `BenefitsSection` | Custom | Alternating image + text layout |
| `StatsSection` | Custom | 4 animated stat counters |
| `TestimonialsSection` | Custom | 3 testimonial cards |
| `PricingSection` | Custom | 3 pricing cards (monthly/annual toggle) |
| `FAQSection` | Custom | Accordion using Radix Collapsible |
| `CTASection` | Custom | Final call-to-action |
| `ContactSection` | Custom | Contact form + info |

### Dashboard Pages
| Component | Source | Notes |
|-----------|--------|-------|
| `DashboardHome` | Custom | Stats cards, charts, recent activity |
| `EleitoresPage` | Custom | Table with filters, search, bulk actions |
| `ComunidadesPage` | Custom | Grid/list of communities |
| `SolicitacoesPage` | Custom | Kanban + table view, priority badges |
| `ComunicacaoPage` | Custom | Email/SMS composer, templates, history |
| `MapaPage` | Custom | Interactive map (static with styled markers) |
| `AgendaPage` | Custom | Calendar view (monthly/weekly) |
| `TarefasPage` | Custom | Kanban board + list view |
| `DocumentosPage` | Custom | File grid/list with folder navigation |
| `RelatoriosPage` | Custom | Chart dashboard with filters |
| `EquipePage` | Custom | Team members table with permissions |
| `ConfiguracoesPage` | Custom | Settings tabs: profile, account, integrations |

### Reusable Components
| Component | Source | Used By |
|-----------|--------|---------|
| `FeatureCard` | Custom | FeaturesSection |
| `StatCard` | Custom | DashboardHome, StatsSection |
| `DataTable` | Custom | EleitoresPage, ComunidadesPage, EquipePage |
| `StatusBadge` | Custom | All dashboard pages |
| `Modal` | Custom + Radix Dialog | All forms |
| `Toast` | Custom + Radix Toast | Global |
| `Tooltip` | Custom + Radix Tooltip | Global |
| `ConfirmDialog` | Custom + Radix Dialog | Delete actions |
| `EmptyState` | Custom | All data pages |
| `SkeletonCard` | Custom | Loading states |
| `SkeletonTable` | Custom | Loading states |
| `SearchInput` | Custom | Multiple pages |
| `PageHeader` | Custom | All dashboard pages |
| `FilterBar` | Custom | Data pages |
| `AnimatedCounter` | Custom | StatsSection, DashboardHome |

### Modals (Form Dialogs)
| Component | Trigger |
|-----------|---------|
| `LoginModal` | Navbar CTA, "Entrar" |
| `RegisterModal` | "Começar Agora", "Criar Conta" |
| `NovoEleitorModal` | EleitoresPage "Adicionar" |
| `NovaSolicitacaoModal` | SolicitacoesPage "Nova" |
| `NovaTarefaModal` | TarefasPage "Adicionar" |
| `EnviarComunicacaoModal` | ComunicacaoPage "Enviar" |
| `ImportarModal` | EleitoresPage "Importar" |
| `ConvidarMembroModal` | EquipePage "Convidar" |

## Animation Implementation Table

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Scroll reveal (fade+translateY) | Framer Motion | `motion.div` with `whileInView`, threshold 0.1, stagger children | Medium |
| Hero text entrance | Framer Motion | Sequential `motion.div` with `initial`/`animate`, stagger delay | Low |
| Stat counter animation | Custom hook | `useCountUp` with requestAnimationFrame, easeOut, 1200ms | Medium |
| Navbar scroll transition | CSS + React | Scroll listener >100px adds class, CSS transition on bg/shadow | Low |
| Card hover lift | CSS | `transition` + `hover:translateY(-4px) hover:shadow-lg` | Low |
| Modal open/close | Framer Motion + Radix | AnimatePresence + motion.div scale(0.95→1) + opacity, overlay fade | Medium |
| Toast slide-in | Framer Motion | AnimatePresence + motion.div x: 100% → 0 | Low |
| Sidebar collapse | CSS | `transition: width 300ms ease`, icon rotation | Low |
| Button hover | CSS | `transition: all 200ms ease`, translateY(-1px) | Low |
| Page transition (landing sections) | Framer Motion | whileInView variants with staggerChildren | Medium |
| Mobile menu drawer | Framer Motion | AnimatePresence + motion.div x: -100% → 0 | Low |
| Number animation on dashboard | Custom hook | Same useCountUp, triggered on mount | Low |
| Chart animations | Recharts | `animationBegin`, `animationDuration` props | Low |
| Tab content switch | Framer Motion | AnimatePresence + motion.div opacity crossfade | Low |

## State & Logic Plan

### Authentication State
- `useAuth` custom hook managing login/register state
- Fields: `user`, `isAuthenticated`, `isLoading`
- Persist to localStorage for demo
- Login form: email + password validation
- Register form: name, email, phone, password, plan selection

### Dashboard Data State
- `useDashboardData` hook with React state
- Mock data for all entities (eleitores, comunidades, solicitacoes, etc.)
- CRUD operations via state updates
- Search/filter via computed values (useMemo)

### UI State
- `useSidebar` hook: collapsed state, mobile open state
- `useModal` hook: modal open/close management
- `useToast` hook: toast queue, add/remove toasts
- `useFilters` hook: filter state for data tables

### Route Structure
```
/                    → LandingPage
/dashboard           → DashboardHome
/dashboard/eleitores → EleitoresPage
/dashboard/comunidades → ComunidadesPage
/dashboard/solicitacoes → SolicitacoesPage
/dashboard/comunicacao → ComunicacaoPage
/dashboard/mapa      → MapaPage
/dashboard/agenda    → AgendaPage
/dashboard/tarefas   → TarefasPage
/dashboard/documentos → DocumentosPage
/dashboard/relatorios → RelatoriosPage
/dashboard/equipe    → EquipePage
/dashboard/configuracoes → ConfiguracoesPage
```

### Mock Data Architecture
- Central mock data file with all entities
- Relationships: eleitores belong to comunidades, have solicitacoes and tarefas
- Pre-populated with realistic Brazilian political data (names, cities, bairros)
- 50+ eleitores, 8 comunidades, 20+ solicitacoes, 15+ tarefas for rich demo

## Other Key Decisions

### Map Implementation
- Use a static stylized map image of Brazil (generated asset)
- Overlay interactive markers using absolute positioning
- Markers are clickable, show tooltip with voter info
- Filter markers by community, priority, status
- No external map library needed for MVP

### Calendar Implementation
- Custom calendar grid using CSS Grid
- Month/Week view toggle
- Events rendered as positioned blocks
- Click to add/edit event (modal)
- No external calendar library

### Charts
- Recharts for all chart types (line, bar, pie, area)
- ResponsiveContainer for responsive sizing
- Custom tooltip styling to match design system
- Custom colors from design tokens

### Image Assets Strategy
- Generate 5 key images: hero-bg, dashboard-preview, and 3 feature images
- Use CSS gradients + patterns as fallbacks
- All images optimized and placed in public/assets/
