# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 13/06/2026  
> **Sessão atual:** Consolidação estratégica — infraestrutura, custos e precificação

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (WAHA Core + CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Consolidação estratégica — 13/06**

### ✅ O que foi entregue:
1. **Consolidação de documentos em 3 arquivos únicos**
   - `docs/analise-concorrente-oassessor.md` — análise do concorrente O Assessor
   - `docs/estrategia-infra-escala.md` — custos, gatilhos de upgrade e opções de infraestrutura
   - `docs/proposta-planos-precificacao.md` — proposta de 2 planos (R$ 249 / R$ 499)
   - Deletados 5 documentos redundantes por duplicidade

2. **Decisões de precificação**
   - 2 planos: Profissional (R$ 249/mês, até 5k eleitores) e Premium (R$ 499/mês, até 15k eleitores)
   - Ponto de partida mínimo: 3.000 eleitores
   - Margem estimada: 70-80%

3. **Decisões de infraestrutura**
   - Supabase Pro até ~15 clientes
   - Self-hosted PostgreSQL em VPS 32GB para 15-30 clientes
   - WhatsApp: WasenderAPI (R$ 33/sessão)
   - Storage: Cloudflare R2
   - Backup: GitHub Action → R2

### 🔴 Problemas críticos identificados (sessão anterior — ainda pendentes):
1. **Fallback admin perigoso**: `api/context.ts` retorna `role="admin"` se o banco falhar
2. **`schema_safe.sql` desatualizado**: não inclui migration 032 (`templates_mensagem`, `campanhas`, `envios_campanha`)
3. **`db/schema.ts` incompleto**: Drizzle não conhece várias tabelas principais
4. **21 arquivos >400 linhas**, sendo 13 no `src/`
5. **7 páginas de teste órfãs** não importadas no `App.tsx`
6. **Mistura de bibliotecas de ícones**: `lucide-react` e Tabler convivendo
7. **Só 4 arquivos de teste** no projeto inteiro
8. **Sem soft delete** em tabelas de cidadãos
9. **Falta de índices** em várias FKs críticas
10. **`EquipePage`** usa `DropdownMenu` com `MoreHorizontal` (proibido pelo Design System)

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes de commit.
> Na próxima sessão, pedir ao Kimi para reativar se quiser testar.

| Página | Arquivo | Última atualização | Status |
|---|---|---|---|
| Dashboard V2 | `DashboardV2.tsx` | 25/05 | Arquivado — funcionalidades migradas para v2.3 |
| DashboardHomeV2 | `DashboardHomeV2.tsx` | 04/06 | **Promovido à produção** — arquivo mantido para histórico |
| Solicitações V3 | `SolicitacoesPageV3.tsx` | 01/06 | **Promovida à produção** — arquivo mantido para histórico |
| Mapa V1 | `MapaPageV1.tsx` | 28/05 | Arquivado — teste de clusters com ícones |
| Mapa V2 | `MapaPageV2.tsx` | 01/06 | **Em produção** — cópia de trabalho mantida |
| Comunicação V2 | `ComunicacaoPageV2.tsx` | 06/06 | **Promovida à produção** — arquivo mantido para histórico |
| **Agenda V2** | **`AgendaPageV2.tsx`** | **08/06** | **Em teste** — aguardando aprovação para produção |
| Configurações V2 | `ConfiguracoesPageV2.tsx` | 04/06 | Em teste — aguardando aprovação |

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
- **Validar preços dos planos sugeridos** — conversar com 3–5 vereadores potenciais sobre R$ 249 / R$ 499
- **Decidir sobre infraestrutura para 15+ clientes** — Supabase Team vs self-hosted PostgreSQL
- **Aprovar Agenda V2** — testar em `/dashboard/agenda/teste-v2` e decidir se promove à produção
- **Aprovar Configurações V2** — testar em `/dashboard/configuracoes/teste-v2` e decidir se promove à produção
- **Aprovar o plano de refatoração** — decidir se segue os 4 sprints propostos ou se quer ajustar prioridades
- **Decidir sobre arquivos de teste órfãos** — manter como histórico ou deletar
- **Backup do banco** antes de aplicar migrations de soft delete e índices (Sprint 2)

### 🔐 Segurança — WAHA API
- Porta 8080 exposta na internet (necessário para Vercel serverless acessar VPS)
- **Quando comprar domínio:** implementar Cloudflare Tunnel ou Nginx proxy para fechar porta 8080
- API Key forte configurada no `.env` da VPS

---

## Próxima Sessão — Sugestões

1. **Promover Agenda V2 à produção** (se aprovada):
   - Copiar conteúdo de `AgendaPageV2.tsx` para `AgendaPage.tsx`
   - Remover rota `/agenda/teste-v2` do `App.tsx`
   - Remover link "Agenda V2" do sidebar

2. **Iniciar Sprint 1 — Higiene e Segurança**:
   - Corrigir fallback admin em `api/context.ts`
   - Remover rotas/links de teste aprovados
   - Deletar páginas de teste órfãs (após confirmação)
   - Regenerar `supabase/schema_safe.sql`
   - Revisar RLS da tabela `equipe`

3. **Implementar infraestrutura de backup e storage**:
   - Criar conta Cloudflare + bucket R2
   - Configurar backup automático (GitHub Action)
   - Migrar storage de fotos/docs para R2
