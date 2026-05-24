# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 23/05/2026
> **Sessão atual:** Migração completa para Tabler Icons — Deploy em produção

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Migração para Tabler Icons — 23/05**

### O que foi feito:
1. **Decidido Tabler Icons** — biblioteca escolhida após testes (Carbon, Material, Tabler)
2. **Criada página de sugestões** `/icones-sugestoes` — 140+ ícones mapeados por função
3. **Criada página de preview** `/preview-sidebar` — visualização do menu com Tabler
4. **Atualizado `src/lib/icons.ts`** — 200 ícones Tabler com aliases mantidos
5. **Atualizado `src/components/DashboardLayout.tsx`** — stroke 2px, tamanho 20px
6. **Corrigidos ícones inexistentes** — `IconDotsHorizontal`, `IconLayers`, `IconVote`, `IconMessageSquare`, etc.
7. **Build limpo** — `npx tsc --noEmit` zero erros
8. **Deploy em produção** — Vercel, status Ready

### Configuração visual dos ícones:
| Propriedade | Valor |
|---|---|
| Biblioteca | `@tabler/icons-react` |
| Stroke | 2px |
| Tamanho | 20px |

### Ícones do menu lateral (atualizados):
| Aba | Ícone Tabler |
|---|---|
| Dashboard | `IconLayoutDashboard` |
| Eleitores | `IconUsers` |
| Comunidades | `IconBuildingCommunity` |
| Solicitações | `IconClipboardList` |
| Comunicação | `IconMessageCircle` |
| Mapa | `IconMapPin` |
| Agenda | `IconCalendar` |
| Tarefas | `IconFileText` |
| Documentos | `IconFolder` |
| Proposições | `IconGavel` |
| Produtividade | `IconTrendingUp` |
| Líderes | `IconCrown` |
| Enquetes | `IconChartBar` |
| Relatórios | `IconReportAnalytics` |
| Equipe | `IconShield` |
| Configurações | `IconSettings` |

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-c5e5w98ys-mandatodiigital-1923s-projects.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |
| **VPS (SSH)** | ssh -p 2222 root@82.197.73.101 |

---

## Decisões Pendentes (Ações Manuais)

| # | Ação | Onde fazer | Prioridade |
|---|---|---|---|
| 1 | **Aplicar migration 020 no Supabase (estimativa_votos)** | SQL Editor do Supabase | 🔴 ALTA |
| 2 | Comprar domínio (Registro.br, Porkbun ou KingHost) | Site do registrador | Média |
| 3 | Configurar DNS para apontar VPS | Painel do registrador | Média |
| 4 | Configurar Certbot (HTTPS) | VPS (quando tiver domínio) | Média |
| 5 | Configurar Cloudflare Tunnel | Cloudflare (opcional) | Baixa |

### ⚠️ AÇÃO URGENTE: Aplicar migration 020 no Supabase

**Por que:** A coluna `estimativa_votos` não existe no banco de produção, causando erro 500 na aba "Produtividade dos Líderes".

**Como fazer:**
1. Acesse https://app.supabase.com → seu projeto → SQL Editor
2. Cole o comando abaixo e clique em **Run**:
   ```sql
   ALTER TABLE eleitores ADD COLUMN IF NOT EXISTS estimativa_votos INTEGER;
   COMMENT ON COLUMN eleitores.estimativa_votos IS 'Estimativa de votos que o líder pode mobilizar';
   ```
3. Verifique se a aba "Líderes → Produtividade" carrega sem erro 500

---

## Variáveis de Ambiente (Vercel)

```
DATABASE_URL=postgresql://... (Supabase)
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_HERE_API_KEY=bPFahqLf6LlNCV9bq4k7pDB9iTiRj_twmAeRf06-lUM
CNEFE_API_URL=http://82.197.73.101
```

---

## Checklist Próxima Sessão — PRIORIDADE 1

```
□ VERIFICAR ÍCONES EM PRODUÇÃO
  → Acessar https://mandato-digital-c5e5w98ys-mandatodiigital-1923s-projects.vercel.app
  → Navegar por todas as abas do dashboard
  → Verificar se algum ícone ficou estranho ou faltando
  → Reportar prints se houver erro

□ Testar cadastro de eleitor com geocodificação CNEFE
  → Cadastrar eleitor com CEP e número
  → Verificar se aparece no mapa na posição correta

□ Verificar se Here API está sendo usada como fallback
  → Cadastrar endereço fora do CE/MA (ex: São Paulo)
  → Confirmar se Here API geocodifica

□ Comprar/configurar domínio (se decidir)
□ Importar mais estados se necessário (PB, RN, PI)
```

> **LEMBRETE:** Prioridade é verificar se os ícones Tabler estão corretos em produção.

---

## Erros Registrados (Self-Healing)

| # | Erro | Data | Prevenção |
|---|---|---|---|
| 008 | API Proxy sem rate limiting / rodando como root | 19/05/2026 | Sempre usar usuário dedicado, rate limiting, systemd |
| 009 | Ícones Tabler inexistentes causando crash | 23/05/2026 | Sempre verificar existência no pacote antes de usar (`node -e "require('@tabler/icons-react').IconNome"`) |
