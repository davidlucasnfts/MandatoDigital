<!-- 20/05/2026 - Runbook operacional do projeto -->

# Runbook — Mandato Digital

| Campo | Valor |
|-------|-------|
| Versao | 1.0.0 |
| Data | 2026-05-20 |
| Stack | React 18 + Vite + tRPC + Drizzle ORM + Supabase PostgreSQL |
| Deploy | Vercel (frontend) + Supabase (banco) |

---

## 1. Subir Localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Variaveis de ambiente
cp .env.example .env
# Preencher: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, DATABASE_URL

# 3. Banco de dados (opcional — pode usar Supabase remoto)
npm run db:push        # Aplicar schema
npm run db:seed        # Dados iniciais

# 4. Iniciar dev server
npm run dev            # http://localhost:5173
```

---

## 2. Estrutura do Projeto

```
MandatoDigital/
├── api/               # tRPC routers (backend serverless)
├── app/               # Entrypoint Vercel
├── src/
│   ├── components/    # Componentes React
│   ├── pages/         # Paginas (rotas)
│   ├── hooks/         # Custom hooks
│   └── lib/           # Utilitarios
├── db/
│   ├── schema.ts      # Drizzle ORM schema
│   ├── relations.ts   # Relacoes (placeholder)
│   └── seed.ts        # Dados iniciais
├── contracts/         # Tipos compartilhados
├── docs/              # Documentacao
└── supabase/
    └── migrations/    # Migrations SQL
```

---

## 3. Troubleshooting

### Problema: Erro 500 na API tRPC

**Investigacao:**
```bash
# Ver logs no Vercel Dashboard
# ou local:
npm run dev
# Observar erro no terminal
```

**Causas comuns:**
1. `DATABASE_URL` invalida ou expirada
2. Schema do banco desatualizado (rodar `npm run db:push`)
3. Variavel de ambiente faltando no Vercel

---

### Problema: Login nao funciona

**Investigacao:**
```bash
# Verificar Supabase Auth
# 1. Console do Supabase → Authentication → Users
# 2. Verificar se usuario existe
# 3. Verificar se email foi confirmado (se required)
```

**Causas comuns:**
1. `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` incorretos
2. Usuario nao existe no Supabase Auth
3. RLS (Row Level Security) bloqueando acesso

---

### Problema: Dados nao aparecem (vazio)

**Investigacao:**
```bash
# Verificar owner_id
# No console do Supabase, executar:
SELECT * FROM equipe WHERE owner_id = '<uuid-do-usuario>';

# Verificar RLS policies
# Supabase → Table Editor → equipe → Policies
```

**Causas comuns:**
1. `owner_id` nao corresponde ao usuario logado
2. RLS policy bloqueando (verificar politicas do Supabase)
3. Dados inseridos com `owner_id` errado

---

### Problema: Geocodificacao falha

**Investigacao:**
```bash
# Verificar configuracao
# Admin → Configuracoes → Geocodificacao
# Verificar: API key, provedor (Here/OpenStreetMap), quota
```

**Causas comuns:**
1. API key expirada ou invalida
2. Quota excedida (Here: 250k/mes free)
3. Servico externo indisponivel

---

### Problema: Build falha no Vercel

**Investigacao:**
```bash
# Local:
npm run build

# Verificar erros de TypeScript
npm run typecheck
```

**Causas comuns:**
1. Erro de TypeScript (tipos inconsistentes)
2. Import ciclico
3. Variavel de ambiente faltando no Vercel

---

## 4. Deploy

### Deploy em Staging (Preview)

```bash
# Push para qualquer branch gera preview automatico no Vercel
# URL: https://<branch>-<project>.vercel.app
```

### Deploy em Producao

```bash
# Merge para main dispara deploy automatico
# URL: https://<project>.vercel.app
```

### Variaveis de Ambiente (Vercel)

| Variavel | Onde encontrar |
|----------|---------------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection String |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → service_role key |

---

## 5. Banco de Dados

### Aplicar migrations

```bash
# Drizzle (recomendado para desenvolvimento)
npm run db:push

# Ou SQL puro no Supabase SQL Editor
# Arquivos em: supabase/migrations/
```

### Backup

```bash
# Supabase faz backup automatico (PITR em planos pagos)
# Para exportar manualmente:
pg_dump $DATABASE_URL > backup.sql
```

---

## 6. Checklist de Incidente

| Severidade | Quando | Acao |
|------------|--------|------|
| P1 | Sistema fora do ar | Verificar status Vercel/Supabase, verificar logs |
| P2 | Funcionalidade degradada | Isolar router afetado, verificar tRPC errors |
| P3 | Bug menor | Registrar issue, priorizar proximo sprint |

---

## 7. Links Uteis

| Recurso | URL |
|---------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Console | https://app.supabase.com |
| Drizzle Docs | https://orm.drizzle.team |
| tRPC Docs | https://trpc.io |
| shadcn/ui | https://ui.shadcn.com |
