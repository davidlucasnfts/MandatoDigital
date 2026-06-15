# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 15/06/2026  
> **Sessão atual:** Melhorias de Design System e UX nas abas restantes do dashboard

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (WAHA Core + CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Páginas V2 das abas restantes — 15/06**

### ✅ O que foi entregue:
1. **Componentes base do Design System criados/adaptados**
   - `PageHeader`, `DataList`, `ModalPreview`, `SkeletonList`, `SearchFilterBar`
   - `StatCard`, `PanelCard`, `EmptyState` adaptados para aceitar ícones Tabler (`@/lib/icons`)

2. **Páginas V2 criadas e com rotas de teste ativas**
   - Comunidades V2 (`/dashboard/comunidades/teste-v2`)
   - Produtividade V2 (`/dashboard/produtividade/teste-v2`)
   - Equipe V2 (`/dashboard/equipe/teste-v2`)
   - Tarefas V2 (`/dashboard/tarefas/teste-v2`)
   - Proposições V2 (`/dashboard/proposicoes/teste-v2`)
   - Enquetes V2 (`/dashboard/enquetes/teste-v2`)
   - Relatórios V2 (`/dashboard/relatorios/teste-v2`)
   - Documentos V2 (`/dashboard/documentos/teste-v2`)

3. **Comunicação V2 reativada**
   - Corrigidos imports de `lucide-react` para `@/lib/icons`
   - Rota e link de teste ativos em `/dashboard/comunicacao/teste-v2`

4. **Correções aplicadas**
   - `EquipePageV2` remove dropdown proibido; botões de alterar cargo são sempre visíveis
   - `DocumentosPageV2` implementa upload/download/exclusão real via Supabase Storage
   - `NovoEventoDialog` corrigido para não resetar formulário durante digitação
   - Preview modal da Agenda corrigido para textos longos (`break-all`, `min-w-0`)

5. **Checklist pré-commit parcial executado**
   - `npx tsc --noEmit` passou sem erros
   - Rotas/links de teste mantidos ativos para validação visual do usuário

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes de commit.

| Página | Arquivo | Rota de Teste | Status |
|---|---|---|---|
| **Agenda V2** | `AgendaPageV2.tsx` | `/dashboard/agenda/teste-v2` | Em teste — aguardando aprovação |
| **Configurações V2** | `ConfiguracoesPageV2.tsx` | `/dashboard/configuracoes/teste-v2` | Em teste — aguardando aprovação |
| **Comunicação V2** | `ComunicacaoPageV2.tsx` | `/dashboard/comunicacao/teste-v2` | Em teste — reativada |
| **Comunidades V2** | `ComunidadesPageV2.tsx` | `/dashboard/comunidades/teste-v2` | Em teste — aguardando aprovação |
| **Produtividade V2** | `ProdutividadePageV2.tsx` | `/dashboard/produtividade/teste-v2` | Em teste — aguardando aprovação |
| **Equipe V2** | `EquipePageV2.tsx` | `/dashboard/equipe/teste-v2` | Em teste — aguardando aprovação |
| **Tarefas V2** | `TarefasPageV2.tsx` | `/dashboard/tarefas/teste-v2` | Em teste — aguardando aprovação |
| **Proposições V2** | `ProposicoesPageV2.tsx` | `/dashboard/proposicoes/teste-v2` | Em teste — aguardando aprovação |
| **Enquetes V2** | `EnquetesPageV2.tsx` | `/dashboard/enquetes/teste-v2` | Em teste — aguardando aprovação |
| **Relatórios V2** | `RelatoriosPageV2.tsx` | `/dashboard/relatorios/teste-v2` | Em teste — aguardando aprovação |
| **Documentos V2** | `DocumentosPageV2.tsx` | `/dashboard/documentos/teste-v2` | Em teste — aguardando aprovação |

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |
| **WAHA Core (VPS)** | http://82.197.73.101:8080 |

---

## Decisões Pendentes

### ⚠️ Ações manuais necessárias
- **Testar cada página V2 localmente** e decidir quais serão promovidas à produção
- **Configurar bucket `documentos` no Supabase Storage** se ainda não estiver ativo (migration 007 já existe)
- **Verificar políticas RLS do bucket `documentos`** — a policy atual exige `auth.uid() = owner`; testar se upload funciona com usuário autenticado
- **Revisar configuração de CORS do Supabase Storage** se houver erro de upload

### 🔴 Problemas críticos ainda pendentes (fora do escopo desta sessão)
1. **Fallback admin perigoso**: `api/context.ts` retorna `role="admin"` se o banco falhar
2. **`db/schema.ts` incompleto**: Drizzle não conhece várias tabelas principais
3. **21 arquivos >400 linhas**, sendo 13 no `src/`
4. **Páginas de teste órfãs**: `DashboardHomeV2.tsx`, `DashboardV2.tsx`, `MapaPageV1.tsx`, `MapaPageV2.tsx`, `SolicitacoesPageV3.tsx`, `SolicitacoesPageV4.tsx`
5. **Mistura de bibliotecas de ícones**: `lucide-react` ainda usado em `DashboardHomeV2.tsx` e `CommandMenu.tsx` (não quebra build, mas viola Design System)
6. **Sem soft delete** em tabelas de cidadãos
7. **Falta de índices** em várias FKs críticas

---

## Próxima Sessão — Sugestões

1. **Testar visualmente todas as páginas V2** e aprovar uma a uma
2. **Promover páginas aprovadas à produção**:
   - Copiar conteúdo de `*PageV2.tsx` para `*Page.tsx`
   - Remover rotas `/teste-v2` do `App.tsx`
   - Remover links "V2" do sidebar
3. **Limpar arquivos órfãos** após confirmação
4. **Executar checklist pré-commit** (tsc, rotas, links, documentação)
