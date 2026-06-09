# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 08/06/2026  
> **Sessão atual:** Correção WhatsApp QR Code + Agenda V2 com Design System

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (WAHA Core + CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Correção WhatsApp QR Code + Agenda V2 — 08/06**

### ✅ O que foi entregue:
1. **Correção QR Code WhatsApp**
   - Endpoint corrigido: POST → GET `/api/default/auth/qr` (WAHA Core)
   - Polling a cada 8s apenas quando status = SCAN_QR_CODE
   - Removido loop infinito que gerava 36.500 requisições
   - Hook `useWhatsApp` retorna `Promise<string | null>` corretamente
   - Modal mostra QR code automaticamente ao entrar em SCAN_QR_CODE

2. **Agenda V2 — Design System aplicado**
   - Stats cards com borda superior colorida (Total, Este Mês, Próximos 7 dias, Hoje)
   - Tabs por tipo de evento: Todos / Reuniões / Eventos
   - Calendário interativo — clique no dia seleciona e filtra eventos
   - Data dinâmica (não mais hardcoded para abril/2025)
   - "Hoje" detecta dia real + botão para voltar ao mês atual
   - Preview modal padrão Design System (avatar + título + grid 2 colunas + ações)
   - Eventos passados com opacidade reduzida
   - Indicadores coloridos no calendário por tipo de evento

3. **Processo de ícones documentado no AGENTS.md**
   - Regra #013 atualizada com processo obrigatório passo a passo
   - Lista completa de ícones disponíveis no projeto
   - Lista de nomes comuns que NÃO existem (para evitar erros)

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

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes do commit.
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

3. **Revisar e ajustar o plano de refatoração** se necessário
