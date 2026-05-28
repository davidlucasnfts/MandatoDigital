# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 27/05/2026
> **Sessão atual:** Solicitações V3 — Preview inline + Modal refatorado

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Solicitações V3 — 27/05**

### ✅ O que foi entregue:
- **Modal Nova Solicitação refatorado:**
  - Busca de eleitor com autocomplete (nome/telefone)
  - Prioridade como botões visuais (Urgente/Alta/Média/Baixa)
  - Seções organizadas: Informações Básicas, Prazo, Evento, Local
  - Campo Local/Endereço novo (migration 029/030/031)
  - Responsável movido para Informações Básicas
  - Datas futuras corrigidas (prazo e evento permitem futuro)
  - Ícone no botão primário, loading com spinner

- **Preview inline na tabela (accordion):**
  - Preview aparece **embaixo da linha clicada** (não no topo)
  - Linha selecionada fica com fundo azul destacado
  - Toggle: clique abre/fecha, clique em outra troca
  - Header com círculo de prioridade + título + badges + ações
  - Grid 2col mobile / 3col desktop com todos os campos
  - Toggle de status rápido no preview

- **Cards de stats no topo:**
  - Total, Pendentes, Em Andamento, Concluídas
  - Clicáveis para filtrar
  - Contador de urgentes no subtítulo

- **Filtros avançados:**
  - Painel colapsável
  - Chips de status e prioridade
  - Botão limpar filtros

- **Design System aplicado:**
  - Botões todos sólidos (nunca outline+sólido misturados)
  - Labels em text-slate-400 (padrão preview)
  - Ícones Lucide, nunca emoji
  - Grid simétrico

- **Correções de bug:**
  - Erro 400: colunas data_solicitacao, data_evento, local, owner_id faltando
  - Migrations 029, 030, 031 criadas e aplicadas
  - Erro MapaPageV2: `)` fora do lugar corrigido

### ❌ Problemas pendentes:
- **Atualização automática:** Lista não atualiza imediatamente após criar solicitação (precisa F5)
- **Descrição longa:** Quebra layout na tabela (line-clamp não está funcionando perfeitamente)
- **Scroll do preview:** Quando abre, não faz scroll automático para ficar visível

### 📋 Checklist próxima sessão:
- [ ] Corrigir atualização automática da lista após insert
- [ ] Corrigir descrição longa que extrapola célula da tabela
- [ ] Adicionar scroll automático ao abrir preview
- [ ] Testar preview em mobile (responsividade)
- [ ] Aprovar V3 → copiar para SolicitacoesPage.tsx
- [ ] Remover rota de teste `/solicitacoes/teste-v3`

---

## Histórico
**Mapa V3 + Cache de CEP + Comunidades — 27/05**

### ✅ O que foi entregue:
- **Cache de CEP:** Tabela `cep_cache` no Supabase com RLS — reduz chamadas Here API em 90%
- **Comunidades:** Cadastro com geocodificação CNEFE → Here API → cache
- **Mapa:** Legenda flutuante, cluster separado, zIndex, ícones
- **Build passando**, zero erros TypeScript

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |
| **VPS (SSH)** | ssh -p 2222 root@82.197.73.101 |
| **Solicitações V3 (teste)** | /dashboard/solicitacoes/teste-v3 |

---

## Decisões Pendentes (Ações Manuais)

| # | Ação | Onde fazer | Prioridade |
|---|---|---|---|
| 1 | Rodar migration 031 no Supabase (se ainda não rodou) | SQL Editor | Alta |
| 2 | Comprar domínio (Registro.br, Porkbun ou KingHost) | Site do registrador | Média |
| 3 | Configurar DNS para apontar VPS | Painel do registrador | Média |
| 4 | Configurar Certbot (HTTPS) | VPS (quando tiver domínio) | Média |

---

## Variáveis de Ambiente (Vercel)

```
DATABASE_URL=postgresql://postgres.fawzdzfazmudolggtfno:[SENHA]@aws-1-us-west-2.pooler.supabase.com:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_HERE_API_KEY=bPFahqLf6LlNCV9bq4k7pDB9iTiRj_twmAeRf06-lUM
CNEFE_API_URL=http://82.197.73.101
```

---

## Dashboard V2 Premium (Skill Design System)

> **Criado em:** 25/05/2026
> **Status:** Salvo para análise/comparação futura
> **Local:** `src/pages/DashboardV2.tsx` + `src/components/dashboard-v2/`

### Componentes criados:
- `StatCard` — Cards de stats com hover animado (-translate-y-0.5)
- `PanelCard` — Cards padronizados com header + content
- `MetaPanel` — Meta eleitoral com barra de progresso animada
- `EmptyState` — Estados vazios com ícone + descrição + CTA
- `CommandMenu` — Busca global (Ctrl+K)
- `SkeletonCard` — Skeletons anatômicos para loading

---

## Checklist Próxima Sessão

```
□ Corrigir atualização automática da lista após criar solicitação
□ Corrigir descrição longa que extrapola célula da tabela
□ Adicionar scroll automático ao abrir preview inline
□ Testar preview em mobile (responsividade)
□ Aprovar/rejeitar Solicitacoes V3 → copiar para SolicitacoesPage.tsx
□ Remover rota de teste /solicitacoes/teste-v3
□ Testar dashboard v2.2 em produção (todos os painéis)
□ Verificar performance das queries
□ Testar meta eleitoral (editar e salvar)
□ Testar vinculo de lider com lider em producao
□ Testar campos eleitorais (secao, zona, titulo) em producao
□ Verificar se ícones Tabler estão corretos em todas as abas
```

---

## Erros Registrados (Self-Healing)

| # | Erro | Data | Prevenção |
|---|---|---|---|
| 008 | API Proxy sem rate limiting / rodando como root | 19/05/2026 | Sempre usar usuário dedicado, rate limiting, systemd |
| 009 | Ícones Tabler inexistentes causando crash | 23/05/2026 | Sempre verificar existência no pacote antes de usar |
| 010 | DATABASE_URL com valor placeholder na Vercel | 24/05/2026 | Sempre verificar se env vars estão corretas após qualquer mudança |
| 011 | Senha com `!` quebra URL PostgreSQL | 24/05/2026 | Usar encodeURIComponent na senha ou evitar caracteres especiais |
| 012 | schema_safe.sql desatualizado | 24/05/2026 | Sempre rodar `npm run db:schema-safe` após nova migration |
| 013 | Preview fora do padrão do projeto | 27/05/2026 | Sempre seguir padrão de Líderes: círculo + título + badges + grid 3col |
| 014 | Campo `local` não existe no banco | 27/05/2026 | Sempre verificar schema antes de adicionar campo novo |
| 015 | Erro 400 por coluna faltante | 27/05/2026 | Sempre rodar migration no Supabase antes de testar |
| 016 | `)` fora do lugar em JSX | 27/05/2026 | Sempre verificar fechamento de tags em map/filter |
