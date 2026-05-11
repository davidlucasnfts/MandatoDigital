# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 10/05/2026
> **Sessão atual:** Geocodificacao real no mapa (Nominatim/OpenStreetMap)

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Vínculo Comunidade-Cidade + Mapa** — concluído em 10/05

### O que foi entregue:
- **Migration 013**: `comunidades.cidade TEXT` + `comunidades.icone TEXT DEFAULT 'Users'`
- **Tipos atualizados**: `Comunidade` em `src/lib/supabase.ts` inclui `cidade` e `icone`
- **NovaComunidadeDialog.tsx**: Campo cidade, layout em grid, bug bairros duplicado corrigido
- **MapaPage.tsx**: Comunidades aparecem como marcadores coloridos (SVG com cor da comunidade)
- **src/lib/mapIcons.ts**: `createColorIcon()` gera marcador SVG dinâmico
- Tooltip no marcador mostra nome da comunidade + cidade
- Clique no marcador de comunidade aplica filtro
- Contador de comunidades no mapa na sidebar

### Arquivos criados/modificados:
- `supabase/migrations/013-comunidade-cidade-icone.sql` — novo
- `src/lib/supabase.ts` — adicionado `cidade` e `icone` no tipo Comunidade
- `src/lib/mapIcons.ts` — novo (createColorIcon, defaultIcon)
- `src/components/NovaComunidadeDialog.tsx` — campo cidade, layout grid
- `src/pages/MapaPage.tsx` — marcadores de comunidade coloridos

Type check passando. Testes passando (12/12).

---

## Próximo passo definido
**Aguardando definição do David** — opções:
1. Prestação de Contas Pública (portal de transparência)
2. App mobile / PWA para campo
3. Integração WhatsApp API oficial
4. Mais hardening (cookie httpOnly, WAF Cloudflare, testes de penetração)

---

## Bloqueios
Nenhum.

---

## Estrutura de pastas (resumida)
```
src/           → Frontend React (pages, components, hooks, lib)
api/           → Backend tRPC/Hono (routers, middleware, context, lib/audit.ts)
db/            → Schema Drizzle + migrations
contracts/     → Tipos e constantes compartilhados
docs/          → ADRs + guia do projeto
supabase/      → schema_safe.sql + migrations/ (001-013)
.github/       → Workflows CI/CD
```

---

## Decisões pendentes
- [x] Aplicar `schema_safe.sql` no Supabase
- [x] Configurar secrets no GitHub (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [x] Rodar migrations 006-011 no Supabase
- [x] Rodar migration 010 no Supabase (enquetes)
- [x] Rodar migration 011 no Supabase (lider_id)
- [x] Revisar `DATABASE_URL` hardcoded em `api/lib/env.ts` — REMOVIDO em 10/05
- [x] Rodar migration 012 no Supabase (campos_personalizados na tabela convites_eleitores)
- [x] **Rodar migration 013 no Supabase** (cidade + icone na tabela comunidades)
- [x] **Rodar migration 014 no Supabase** (latitude + longitude na tabela eleitores)
- [x] **Geocodificar eleitores existentes** via botao no mapa
- [ ] Criar mais testes para atingir cobertura 80% (backlog técnico, não bloqueante)
- [ ] Adicionar mais cidades ao dataset de bairros (expansão futura)
- [ ] Configurar `DATABASE_URL` no Vercel (ver SECURITY.md → Ações Manuais)
- [ ] Trocar senha do banco Supabase (ver SECURITY.md → Ações Manuais)
- [ ] Adicionar domínio na whitelist (ver SECURITY.md → Ações Manuais)

---

## Ações Manuais — REGRA PARA O KIMI
> Sempre que uma funcionalidade exigir ação manual (rodar SQL no Supabase, configurar secret no GitHub/Vercel, criar bucket, env var, etc.), **adicionar na seção "Decisões pendentes" acima** e **avisar David no final da resposta** com destaque em negrito e emoji ⚠️.

---

## Como atualizar este arquivo
No final de cada sessão, substitua:
1. **Data** no topo
2. **Última funcionalidade trabalhada** — o que foi feito
3. **Próximo passo definido** — o que faremos na próxima sessão
4. **Bloqueios** — se houver
5. **Decisões pendentes** — marcar como [x] quando concluído
