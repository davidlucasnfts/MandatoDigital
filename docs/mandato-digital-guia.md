# 📗 MandatoDigital — Guia de Arquitetura e Desenvolvimento

> **Versão:** 1.0.0 | **Data:** 06/05/2026 | **Status:** Ativo
>
> Este documento adapta as práticas do claude-spec-toolkit para a stack específica do projeto MandatoDigital.

---

## 📑 Índice

1. [Stack Tecnológica](#1-stack-tecnológica)
2. [Decisões Arquiteturais (ADRs)](#2-decisões-arquiteturais)
3. [Padrões de Código](#3-padrões-de-código)
4. [Frontend — React + TypeScript + Tailwind](#4-frontend)
5. [API — tRPC + Express](#5-api)
6. [Banco de Dados — Supabase (PostgreSQL)](#6-banco-de-dados)
7. [Autenticação e Autorização](#7-autenticação)
8. [Segurança e LGPD](#8-segurança)
9. [Deploy — Vercel](#9-deploy)
10. [Testes e Qualidade](#10-testes)
11. [Documentação do Projeto](#11-documentação)
12. [Checklist de Funcionalidades](#12-checklist)

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React | 18+ |
| **Linguagem** | TypeScript | 5.x (strict mode) |
| **Estilização** | Tailwind CSS | 3.x |
| **Componentes UI** | shadcn/ui | latest |
| **Build** | Vite | 5.x |
| **Roteamento** | React Router | 6.x |
| **Estado Cliente** | Zustand | 4.x |
| **Estado Servidor** | TanStack Query (React Query) | 5.x |
| **Formulários** | React Hook Form + Zod | latest |
| **API** | tRPC + Express | 11.x / 4.x |
| **ORM** | Drizzle ORM | latest |
| **Banco** | PostgreSQL (Supabase) | 15+ |
| **Auth** | Supabase Auth (JWT) | latest |
| **Deploy** | Vercel | latest |
| **Testes** | Vitest + React Testing Library | latest |

---

## 2. Decisões Arquiteturais (ADRs)

### ADR-001: Monolito Full-Stack com Separação Lógica

**Status:** Aceita | **Data:** 06/05/2026

**Decisão:** Manter frontend e API no mesmo repositório (monorepo leve), com separação lógica entre `src/` (frontend) e `api/` (backend).

**Contexto:**
- Time de 1-2 desenvolvedores (Kimi + David)
- Necessidade de velocidade e simplicidade
- Deploy unificado na Vercel

**Alternativas consideradas:**
- Microsserviços: rejeitado — complexidade desnecessária para time pequeno
- Repositórios separados: rejeitado — overhead de sincronização

**Consequências:**
- ✅ Deploy simplificado, compartilhamento de types
- ✅ Menor complexidade cognitiva
- ⚠️ Risco de acoplamento se não houver disciplina nas camadas

---

### ADR-002: tRPC em vez de REST tradicional

**Status:** Aceita | **Data:** 06/05/2026

**Decisão:** Usar tRPC para comunicação frontend-backend, aproveitando type safety end-to-end.

**Contexto:**
- TypeScript em ambos os lados
- Necessidade de contratos tipados sem boilerplate
- Equipe pequena, produtividade importa

**Consequências:**
- ✅ Type safety automático frontend → backend
- ✅ Autocompletion no editor
- ✅ Menos código de validação (Zod integrado)
- ⚠️ Lock-in em TypeScript (aceitável para stack atual)
- ⚠️ Documentação de API menos acessível para terceiros

---

### ADR-003: Supabase como Backend-as-a-Service

**Status:** Aceita | **Data:** 06/05/2026

**Decisão:** Usar Supabase para PostgreSQL hospedado, autenticação, storage e real-time.

**Contexto:**
- Reduzir overhead de infraestrutura
- Auth, RLS, storage e banco em uma plataforma
- Free tier generoso para startup

**Consequências:**
- ✅ Menos código de infraestrutura
- ✅ Auth pronto com JWT
- ✅ RLS para segurança em nível de banco
- ⚠️ Vendor lock-in (mitigável com PostgreSQL padrão)
- ⚠️ Limites de free tier para escala

---

### ADR-004: Tailwind CSS + shadcn/ui

**Status:** Aceita | **Data:** 06/05/2026

**Decisão:** Tailwind para estilização utilitária + shadcn/ui para componentes base.

**Contexto:**
- Velocidade de desenvolvimento
- Consistência visual sem design system próprio
- Customização completa via Tailwind

**Consequências:**
- ✅ Sem runtime de CSS-in-JS (performance)
- ✅ Componentes copiáveis, não dependência
- ✅ Design consistente com Radix UI
- ⚠️ HTML mais verboso (mitigado com componentes)

### ADR-006: Estratégia WhatsApp API para Múltiplos Clientes

**Status:** Proposto | **Data:** 04/06/2026

**Decisão:** Manter WAHA API (CORE/grátis) para 1 cliente atual. Avaliar migração para serviço cloud (WasenderAPI/Wappfly) ou Evolution API quando houver múltiplos clientes.

**Contexto:**
- WAHA CORE suporta apenas 1 sessão (`default`)
- Cada vereador (cliente) precisa de seu próprio WhatsApp isolado
- VPS atual (2 CPUs, 3.8GB RAM, Ubuntu 20.04) é insuficiente para Evolution API

**Alternativas consideradas:**
- 1 VPS por cliente com WAHA: rejeitado para escala — custo linear, manutenção distribuída
- Evolution API na VPS atual: rejeitado — requer Ubuntu 22.04+, PostgreSQL, Redis, RAM insuficiente
- Serviço cloud (WasenderAPI/Wappfly): aceito para futuro — $6-7/mês por número, zero infra

**Consequências:**
- ✅ Fase 1 (agora): WAHA na VPS atual — custo zero
- ✅ Fase 2 (2-10 clientes): Serviço cloud — setup em minutos
- ✅ Fase 3 (10+ clientes): Reavaliar Evolution API vs cloud
- ⚠️ Dados passam por terceiro se usar cloud
- ⚠️ Custo mensal por cliente adicional

**Referência completa:** `docs/adr-006-whatsapp-api-multi-cliente.md`

---

## 3. Padrões de Código

### TypeScript — Regras Obrigatórias

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Proibido:**
- `any` em qualquer contexto — usar `unknown` + type guard
- `// @ts-ignore` — usar `// @ts-expect-error` com justificativa
- `as` sem type guard — preferir narrowing

### Estrutura de Pastas

```
MandatoDigital/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   │   └── ui/            # shadcn/ui (não editar)
│   ├── pages/             # Páginas/rotas
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários e configurações
│   ├── providers/         # Context providers
│   ├── data/              # Dados estáticos/mock
│   ├── types/             # Tipos TypeScript
│   ├── sections/          # Seções de página
│   ├── App.tsx
│   └── main.tsx
├── api/                    # Backend tRPC/Express
│   ├── lib/               # Utilitários backend
│   ├── queries/           # Queries Drizzle
│   ├── auth-router.ts     # Rotas de autenticação
│   ├── equipe-router.ts   # Rotas de equipe
│   ├── router.ts          # Router principal tRPC
│   ├── context.ts         # Contexto tRPC
│   ├── middleware.ts      # Middlewares
│   ├── boot.ts            # Inicialização
│   └── index.ts           # Entrypoint
├── db/                     # Schema e migrations
│   ├── schema.ts          # Schema Drizzle
│   ├── relations.ts       # Relações
│   ├── migrations/        # Migrations geradas
│   └── seed.ts            # Dados iniciais
├── contracts/              # Tipos compartilhados
│   ├── types.ts
│   ├── errors.ts
│   └── constants.ts
├── public/                 # Assets estáticos
└── docs/                   # Documentação
```

### Nomenclatura Específica

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Componentes React | PascalCase | `UserProfileCard` |
| Hooks customizados | camelCase com prefixo `use` | `useAuth` |
| Funções utilitárias | camelCase | `formatDate` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Tipos/interfaces | PascalCase com sufixo | `UserProps`, `AuthState` |
| Routers tRPC | camelCase com sufixo `Router` | `userRouter` |
| Tabelas DB | snake_case | `user_profile` |
| Colunas DB | snake_case | `created_at` |

### Commits e Branches

**Padrão de commit:**
```
feat(auth):[MD-123] - adicionar login com Google
fix(dashboard):[MD-456] - corrigir layout mobile
refactor(api):[MD-789] - extrair validacao de schema
```

**Branches:**
```
feature-MD-123-adicionar-login-google
bugfix-MD-456-layout-mobile
hotfix-MD-789-correcao-urgente
```

---

## 4. Frontend — React + TypeScript + Tailwind

### Componentes

- **Funcionais com hooks** — nunca classes
- **Props tipadas** — interface explícita, nunca `any`
- **Composição sobre herança** — children, slots
- **Máximo 400 linhas** — extrair em subcomponentes se ultrapassar

```tsx
// ✅ Bom
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card>
      <CardHeader>{user.name}</CardHeader>
      <CardFooter>
        <Button onClick={() => onEdit(user.id)}>Editar</Button>
      </CardFooter>
    </Card>
  );
}

// ❌ Ruim
export function UserCard(props: any) {  // any proibido
  // ...
}
```

### Estado

| Tipo | Ferramenta | Quando usar |
|------|-----------|-------------|
| Estado local | `useState` | Dados de um componente |
| Estado compartilhado | Zustand | Auth, tema, sidebar, filtros globais |
| Estado servidor | TanStack Query | Dados da API, cache, loading/error |
| Formulários | React Hook Form + Zod | Todo formulário com validação |

### shadcn/ui

- **Nunca editar** componentes em `src/components/ui/`
- Para customizar, criar wrapper em `src/components/` ou usar `cn()`
- Adicionar novos via CLI: `npx shadcn add <componente>`

### Tailwind

- Usar classes utilitárias diretamente
- Extrair padrões repetidos em componentes, não em classes CSS
- Usar `cn()` para condicionais:

```tsx
import { cn } from "@/lib/utils";

<button className={cn(
  "px-4 py-2 rounded",
  variant === "primary" && "bg-blue-600 text-white",
  variant === "secondary" && "bg-gray-200 text-gray-800",
  isLoading && "opacity-50 cursor-not-allowed"
)}>
```

### Requisitos de Acessibilidade

- Todo input precisa de `<label>` associado
- Botões com `type="button"` ou `type="submit"` explícito
- Cores com contraste WCAG AA mínimo
- Focus visible em elementos interativos
- Testar navegação por teclado

---

## 5. API — tRPC + Express

### Estrutura de Router

```ts
// api/router.ts
import { router } from "./context";
import { authRouter } from "./auth-router";
import { equipeRouter } from "./equipe-router";

export const appRouter = router({
  auth: authRouter,
  equipe: equipeRouter,
  // ...
});

export type AppRouter = typeof appRouter;
```

### Procedures

```ts
// api/equipe-router.ts
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./context";

export const equipeRouter = router({
  list: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.db.select().from(equipe);
    }),

  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(2).max(100),
      email: z.string().email(),
      cargo: z.enum(["assessor", "coordenador", "voluntario"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validação de permissão no ctx
      return ctx.db.insert(equipe).values(input).returning();
    }),
});
```

### Contexto e Middleware

```ts
// api/context.ts
import { initTRPC } from "@trpc/server";
import { db } from "./lib/db";

export const createContext = async (opts: { req: Request }) => {
  const token = opts.req.headers.get("authorization")?.replace("Bearer ", "");
  const user = token ? await verifyToken(token) : null;
  return { db, user };
};

const t = initTRPC.context<typeof createContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);
```

### Erros

- Usar `TRPCError` com códigos padronizados
- Nunca expor stack trace em produção
- Logar erros no servidor com contexto

---

## 6. Banco de Dados — Supabase (PostgreSQL)

### Schema com Drizzle ORM

```ts
// db/schema.ts
import { pgTable, uuid, varchar, timestamp, text, enum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "assessor", "coordenador", "voluntario"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("voluntario"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### Row Level Security (RLS)

**Obrigatório em toda tabela com dados sensíveis:**

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: usuário vê apenas seu próprio registro
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Política: admin vê tudo
CREATE POLICY "Admins can view all" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
```

### Migrations

- Sempre usar `schema_safe.sql` (idempotent)
- Nunca editar migrations já aplicadas em produção
- Comentar data + descrição no topo de cada alteração

```sql
-- 06/05/2026 — Adiciona tabela de equipe política
CREATE TABLE IF NOT EXISTS equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- ...
);
```

---

## 7. Autenticação e Autorização

### Fluxo de Auth

```
Usuário → Login (email/senha ou OAuth) → Supabase Auth
                                              ↓
                                    JWT Token (access + refresh)
                                              ↓
                                    Frontend armazena em memory / httpOnly cookie
                                              ↓
                                    Cada request envia Bearer token
                                              ↓
                                    tRPC middleware valida JWT
                                              ↓
                                    Contexto com user disponível nas procedures
```

### RBAC — Roles do Sistema

| Role | Permissões |
|------|-----------|
| `admin` | Acesso total, gerenciamento de usuários |
| `coordenador` | Gerencia assessores e voluntários, relatórios |
| `assessor` | Cadastra cidadãos, registra atendimentos |
| `voluntario` | Visualiza dados, cadastra cidadãos (limitado) |

### Implementação no tRPC

```ts
export const requireRole = (...roles: UserRole[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
    if (!roles.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({ ctx });
  });

// Uso
const adminProcedure = protectedProcedure.use(requireRole("admin"));
```

---

## 8. Segurança e LGPD

### Checklist de Segurança

| # | Regra | Status |
|---|-------|--------|
| 1 | Nunca commitar `.env` com valores reais | ✅ |
| 2 | Variáveis `VITE_*` nunca contêm secrets | ✅ |
| 3 | RLS habilitado em todas as tabelas com PII | ⬜ |
| 4 | Senhas hasheadas (bcrypt/Argon2) | ✅ (Supabase) |
| 5 | JWT com expiração curta (15min access, 7d refresh) | ✅ (Supabase) |
| 6 | HTTPS em todos os ambientes | ✅ (Vercel) |
| 7 | Rate limiting na API | ⬜ |
| 8 | Headers de segurança (CSP, HSTS, X-Frame-Options) | ⬜ |
| 9 | Sanitização de inputs (Zod em todas as procedures) | ✅ |
| 10 | Auditoria de acessos (logs de quem acessou o quê) | ⬜ |

### LGPD — Dados de Cidadãos

**Dados sensíveis tratados:**
- Nome completo
- CPF
- Endereço
- Telefone
- Dados de atendimento

**Medidas obrigatórias:**
- [ ] Consentimento explícito no cadastro
- [ ] Finalidade clara informada
- [ ] Retenção mínima (apagar após prazo legal)
- [ ] Direito de acesso, correção e exclusão
- [ ] Registro de operações (log de quem acessou)
- [ ] Anonimização para relatórios agregados

---

## 9. Deploy — Vercel

### Configuração

```json
// vercel.json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Variáveis de Ambiente (Vercel)

| Nome | Tipo | Descrição |
|------|------|-----------|
| `VITE_SUPABASE_URL` | Público | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Público | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Privado | Service role (server-only) |
| `DATABASE_URL` | Privado | Connection string PostgreSQL |
| `JWT_SECRET` | Privado | Secret para verificação de tokens |

**⚠️ Atenção:** `VITE_*` são expostas no bundle. Nunca colocar secrets nessas variáveis.

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 10. Testes e Qualidade

### Pirâmide de Testes (MandatoDigital)

```
       /\
      /  \
     / E2E \        ← Playwright — fluxos críticos (login, cadastro)
    /--------\
   /Integração\     ← Vitest + MSW — routers tRPC, hooks
  /------------\
 / Unitários    \   ← Vitest — utilitários, parsers, validações
/--------------/
```

### Configuração Vitest

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
```

### Testes de Componente

```tsx
// src/components/UserCard.test.tsx
import { render, screen } from "@testing-library/react";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  it("renderiza nome do usuário", () => {
    render(<UserCard user={{ name: "João Silva", email: "joao@email.com" }} onEdit={vi.fn()} />);
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });
});
```

### Testes de Router tRPC

```ts
// api/equipe-router.test.ts
import { createCaller } from "./test-utils";

const caller = createCaller({ user: { id: "1", role: "admin" } });

describe("equipe.create", () => {
  it("cria membro da equipe com dados válidos", async () => {
    const result = await caller.equipe.create({
      nome: "Maria Souza",
      email: "maria@email.com",
      cargo: "assessor",
    });
    expect(result.nome).toBe("Maria Souza");
  });

  it("rejeita email inválido", async () => {
    await expect(
      caller.equipe.create({ nome: "Test", email: "invalid", cargo: "assessor" })
    ).rejects.toThrow("Invalid email");
  });
});
```

---

## 11. Documentação do Projeto

### Arquivos de Documentação

| Arquivo | Propósito | Atualizar quando |
|---------|-----------|------------------|
| `README.md` | Visão geral, setup, scripts | Sempre que mudar setup |
| `AGENTS.md` | Regras para o Kimi Code | Novas regras ou convenções |
| `MEMORY.md` | Decisões, contexto, funcionalidades | Cada funcionalidade entregue |
| `roadmap.html` | Roadmap visual do projeto | Novas funcionalidades |
| `docs/mandato-digital-guia.md` | Este documento | Mudanças na arquitetura |
| `docs/adr-*.md` | Decisões arquiteturais | Novas decisões |

### Template de Funcionalidade (MEMORY.md)

```markdown
## Funcionalidade: Nome — DD/MM/YYYY

### Contexto
[Por que foi construída, problema que resolve]

### Decisões
- [Decisão 1 com justificativa]
- [Decisão 2 com justificativa]

### Estrutura
- `src/pages/NovaPagina.tsx` — página principal
- `src/components/ComponenteX.tsx` — componente reutilizável
- `api/novo-router.ts` — rotas da API

### Pendências
- [ ] Testes E2E
- [ ] Documentação de uso
```

---

## 12. Checklist de Funcionalidades

### Em Produção

- [x] Autenticação (login/logout) — 06/05
- [x] Dashboard inicial — 06/05
- [x] Cadastro de cidadãos — 06/05
- [x] Gestão de equipe — 06/05

### Em Desenvolvimento

- [ ] Relatórios e analytics
- [ ] Integração com WhatsApp
- [ ] Notificações push
- [ ] App mobile (PWA)

### Backlog

- [ ] IA para análise de demandas
- [ ] Integração com sistemas governamentais
- [ ] API pública para parceiros

---

> **Nota**: Este guia é específico do MandatoDigital. Para referência geral do toolkit, consulte `claude-spec-toolkit-mestre.md`.
