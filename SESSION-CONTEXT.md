# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 24/05/2026
> **Sessão atual:** Correções críticas + Novas funcionalidades Eleitores

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Correções críticas + Novos campos Eleitorais — 24/05**

### ✅ O que foi entregue hoje:

#### 1. Correção crítica: DATABASE_URL corrompida
- **Problema:** `DATABASE_URL` na Vercel estava com valor placeholder (`postgres://user:pass@db.example.com`)
- **Causa:** Senha com `!` quebrava a URL + uso de Direct Connection (IPv6) em vez de Session Pooler
- **Solução:**
  - Atualizou `DATABASE_URL` para Session Pooler do Supabase
  - Adicionou codificação automática de senha em `api/lib/env.ts`
  - Adicionou regra no `AGENTS.md`: senhas sem caracteres especiais

#### 2. Correção: schema_safe.sql desatualizado
- **Problema:** Faltavam migrations 011-025 no schema_safe.sql
- **Solução:**
  - Criado script `scripts/build-schema-safe.ts` para consolidar migrations automaticamente
  - Comando: `npm run db:schema-safe`
  - Atualizado com todas as 26 migrations

#### 3. Correção: Erro 500 na aba Líderes → Produtividade
- **Problema:** `lideres.produtividade` retornava 500 (coluna `estimativa_votos` não existia)
- **Solução:**
  - Aplicada migration 020 no Supabase
  - Corrigido `editorQuery`/`adminQuery` para verificar autenticação primeiro
  - Usado cliente postgres direto para SQL raw no `lideres-router.ts`

#### 4. Nova funcionalidade: Campos eleitorais no cadastro
- **Migration 026:** `supabase/migrations/026-eleitor-secao-zona-titulo-lider-vinculado.sql`
- **Campos adicionados:**
  - `titulo_eleitor` (VARCHAR 12) — Título de eleitor (12 dígitos)
  - `zona` (VARCHAR 3) — Zona eleitoral (até 3 dígitos)
  - `secao` (VARCHAR 4) — Seção eleitoral (até 4 dígitos)
  - `lider_vinculado_id` (UUID) — Vincula líder com outro líder
- **Validação:** Apenas números, limites conforme padrão Brasil
- **Preview card:** Mostra dados eleitorais e líder superior quando preenchidos

#### 5. Melhorias na página Produtividade dos Líderes
- Edição de estimativa de votos inline (lápis sempre visível)
- Cores do ranking corrigidas (1º=âmbar, 2º=prata, 3º=bronze)
- Responsividade mobile (podium horizontal, textos encurtados)

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |
| **VPS (SSH)** | ssh -p 2222 root@82.197.73.101 |

---

## Decisões Pendentes (Ações Manuais)

| # | Ação | Onde fazer | Prioridade |
|---|---|---|---|
| 1 | Comprar domínio (Registro.br, Porkbun ou KingHost) | Site do registrador | Média |
| 2 | Configurar DNS para apontar VPS | Painel do registrador | Média |
| 3 | Configurar Certbot (HTTPS) | VPS (quando tiver domínio) | Média |
| 4 | Configurar Cloudflare Tunnel | Cloudflare (opcional) | Baixa |

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

## Checklist Próxima Sessão

```
□ Testar vinculo de lider com lider em producao
□ Testar campos eleitorais (secao, zona, titulo) em producao
□ Verificar se ícones Tabler estão corretos em todas as abas
□ Comprar/configurar domínio próprio (se decidir)
□ Importar mais estados CNEFE se necessário (PB, RN, PI)
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
