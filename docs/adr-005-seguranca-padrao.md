# ADR-005: Padrão de Segurança — MandatoDigital

**Data:** 2026-05-10
**Status:** Aceita
**Decisores:** David Lucas, Kimi Code

---

## Contexto

O projeto lida com dados pessoais de cidadãos (nome, CPF, endereço, telefone) sob LGPD. Um vazamento ou ataque comprometeria a credibilidade do mandato e exporia o político a sanções legais. Precisamos de um padrão de segurança documentado, replicável e auditável.

## Decisão

Adotar o **"Security-First Checklist"** como padrão obrigatório em todos os projetos. Dividido em 5 camadas: Infraestrutura, Transporte, Aplicação, Banco de Dados e Processos.

---

## 1. Infraestrutura (Deploy + Rede)

| # | Regra | Como verificar |
|---|-------|----------------|
| 1.1 | HTTPS obrigatório em todos os ambientes | Vercel/Cloudflare força SSL |
| 1.2 | HSTS com preload | `strictTransportSecurity: max-age=63072000; includeSubDomains; preload` |
| 1.3 | Headers de segurança em todas as respostas | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| 1.4 | Rate limiting por IP + por usuário | `hono-rate-limiter` ou similar |
| 1.5 | Body limit (max 10MB padrão, 50MB só para upload) | `hono/body-limit` |
| 1.6 | WAF ou proteção DDoS | Cloudflare (free) ou Vercel Edge |

## 2. Transporte (HTTP + Headers)

| # | Regra | Valor padrão |
|---|-------|--------------|
| 2.1 | Content-Security-Policy | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co` |
| 2.2 | X-Frame-Options | `DENY` |
| 2.3 | X-Content-Type-Options | `nosniff` |
| 2.4 | Referrer-Policy | `strict-origin-when-cross-origin` |
| 2.5 | Permissions-Policy | `camera=(), microphone=(), geolocation=(self)` |
| 2.6 | Cache-Control em dados sensíveis | `no-store, no-cache, must-revalidate` |

## 3. Aplicação (Código)

| # | Regra | Obrigatório |
|---|-------|-------------|
| 3.1 | **NUNCA** hardcodear credenciais, URLs de banco, chaves API | ✅ |
| 3.2 | **NUNCA** usar fallback de secret em variável de ambiente | ✅ |
| 3.3 | **NUNCA** expor `service_role_key` no frontend | ✅ |
| 3.4 | Validar TODOS os inputs com Zod (tRPC) ou similar | ✅ |
| 3.5 | Sanitizar saída (React escapa por padrão, mas validar inputs) | ✅ |
| 3.6 | RBAC funcional — buscar role do banco, não assumir | ✅ |
| 3.7 | Middleware de autenticação em TODAS as rotas privadas | ✅ |
| 3.8 | Verificar `Origin`/`Referer` em mutações sensíveis | ✅ |
| 3.9 | Token JWT: preferir cookie `httpOnly` sobre localStorage | Recomendado |
| 3.10 | Refresh token rotation (Supabase já faz) | ✅ |
| 3.11 | Log de auditoria: quem, o quê, quando, de onde | ✅ |

## 4. Banco de Dados

| # | Regra | Obrigatório |
|---|-------|-------------|
| 4.1 | RLS habilitado em TODAS as tabelas com dados sensíveis | ✅ |
| 4.2 | Políticas RLS testadas (não só `auth.uid() = user_id`) | ✅ |
| 4.3 | Índices em campos de busca frequente | ✅ |
| 4.4 | Senhas hasheadas (nunca plaintext) | ✅ (Supabase) |
| 4.5 | Connection string com SSL obrigatório | ✅ |
| 4.6 | Backup automático configurado | ✅ |

## 5. Processos (Dev + Deploy)

| # | Regra | Obrigatório |
|---|-------|-------------|
| 5.1 | `.env` no `.gitignore` — nunca commitar secrets | ✅ |
| 5.2 | `npm audit` no CI/CD — falhar em vulnerabilidades HIGH/CRITICAL | ✅ |
| 5.3 | TypeScript strict — `noImplicitAny`, `strictNullChecks` | ✅ |
| 5.4 | Code review obrigatório para rotas de auth/admin | ✅ |
| 5.5 | Rotação de secrets a cada 90 dias (ou após incidente) | Recomendado |
| 5.6 | Testes de segurança: brute force, XSS, SQL injection | Recomendado |

---

## Consequências

- ✅ Segurança replicável em todos os projetos futuros
- ✅ Checklist de auditoria rápida antes de deploy
- ✅ Conformidade LGPD minimizada
- ⚠️ Overhead de desenvolvimento levemente maior (validações, logs)
- ⚠️ Necessidade de revisar este ADR a cada 6 meses

---

## Notas

- O Kimi Code deve consultar este ADR antes de escrever qualquer rota de API
- David deve revisar este documento a cada deploy em produção
- Para regras rápidas de codificação, ver `AGENTS.md` (seção Segurança)
- Para padrão global de todos os projetos, ver `MestreProjects.md` (seção 2)
