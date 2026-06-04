# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 04/06/2026
> **Sessão atual:** Dashboard — Dados reais restaurados, mock removido

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Dashboard com Dados Reais — 04/06**

### ✅ O que foi entregue:
- **DashboardHome.tsx restaurado para dados reais do Supabase**
  - `useStats()` — contagem real de eleitores, solicitações, tarefas, eventos, pendentes
  - `useDashboardData()` — crescimento mensal, solicitações por categoria, tarefas urgentes, eventos de hoje
  - Painéis restaurados: Território, Líderes, Atividade, Proposições, Enquetes, Comunicação, Convites
  - Meta Eleitoral com dados reais
  - Gráficos de crescimento e categorias com dados do banco
  - Layout responsivo mantido (StatCard, PanelCard, CommandMenu)

- **Dados mockados removidos do Dashboard:**
  - `useMockData` → `useStats` + `useDashboardData`
  - `useMockDashboardData` removido dos painéis
  - Painéis buscam diretamente do Supabase

### ⚠️ Arquivos mockados mantidos (para conta demo):
- `src/lib/demoData.ts` — dados demo para `demo@mandato.digital`
- `src/lib/mockData.ts` — mock do dashboard (não mais usado pelo DashboardHome)
- `src/hooks/useMockData.ts` — hook mock (não mais usado pelo DashboardHome)
- Hooks em `useSupabaseData.ts` ainda verificam `isDemoUser()` para outras páginas

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Restaurar `useDashboardData.ts` do commit a82b127 (dados reais)
- [x] Restaurar painéis para buscar do Supabase (Território, Líderes, Atividade, Proposições, Enquetes, Comunicação, Convites)
- [x] Criar `DashboardHomeV2.tsx` com dados reais
- [x] Testar localmente (`npm run dev`)
- [x] Copiar V2 → `DashboardHome.tsx` (produção)
- [x] Remover rota `/dashboard/teste-v2` do App.tsx
- [x] Remover link "Dashboard V2 (Real)" do sidebar
- [x] Type check passando
- [x] Atualizar SESSION-CONTEXT.md

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes do commit.
> Na próxima sessão, pedir ao Kimi para reativar se quiser testar.

| Página | Arquivo | Última atualização | Status |
|---|---|---|---|
| Dashboard V2 | `DashboardV2.tsx` | 25/05 | Arquivado — funcionalidades migradas para v2.3 |
| DashboardHomeV2 | `DashboardHomeV2.tsx` | 04/06 | **Promovido à produção** — arquivo mantido para histórico |
| Solicitações V3 | `SolicitacoesPageV3.tsx` | 01/06 | **Promovida à produção** — arquivo mantido para histórico |
| Mapa V1 | `MapaPageV1.tsx` | 28/05 | Arquivado — teste de clusters com ícones |
| Mapa V2 | `MapaPageV2.tsx` | 01/06 | **Em produção** — cópia de trabalho mantida |

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |

---

## Decisões Pendentes
- Nenhuma. Dashboard com dados reais em produção.

---

## Próxima Sessão — Sugestões
1. Testar Dashboard em produção após deploy
2. Revisar outras páginas que precisam de refatoração (Equipe, Enquetes, etc.)
3. App mobile / PWA para campo
