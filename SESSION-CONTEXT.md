# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 01/06/2026
> **Sessão atual:** Deploy — Mapa V2 + Modo Demo recuperados

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Deploy — Mapa V2 + Modo Demo — 01/06**

### ✅ O que foi entregue:
- **Mapa V2 aplicado na página principal:**
  - Clusters com ícones SVG (estilo hand-drawn/outline)
  - Clusters separados: Líderes (roxo), Eleitores (azul), Comunidades (verde)
  - Ícones SVG na legenda (substituíram círculos coloridos)
  - Botões de camada com ícones (Crown, User, BuildingCommunity)
  - "Sem bairro" removido do ranking de concentração
  - Responsividade mobile (flex-wrap, whitespace-nowrap)

- **Modo Demo para apresentações:**
  - Login: `demo@mandato.digital` / `demo2026`
  - Dados mockados em 8 abas: Dashboard, Eleitores, Comunidades, Solicitações, Mapa, Tarefas, Agenda, Líderes
  - Cenário: Vereador em João Pessoa/PB, campanha 2026
  - 10 eleitores, 3 comunidades, 5 solicitações, 5 tarefas, 5 eventos, 3 líderes

### ⚠️ Erros cometidos e corrigidos:
- **Deploy sem autorização** — enviei botão Demo na Landing Page sem confirmar
- **Páginas de teste em produção** — DashboardV2, SolicitacoesPageV3, MapaPageV1/V2 ficaram nas rotas
- **Revert forçado** — perdeu Mapa V2 e Modo Demo, depois recuperados

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Remover rotas de teste do App.tsx (teste-v2, teste-v3, teste-v1, teste-v2)
- [x] Documentar Regra de Ouro no AGENTS.md + catálogo de páginas de teste no SESSION-CONTEXT.md
- [ ] Testar Solicitações V3 em produção
- [ ] Aprovar/rejeitar Solicitações V3 → copiar para SolicitacoesPage.tsx
- [ ] Verificar se ícones SVG estão corretos em todas as abas

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes do commit.
> Na próxima sessão, pedir ao Kimi para reativar se quiser testar.

| Página | Arquivo | Última atualização | Status |
|---|---|---|---|
| Dashboard V2 | `DashboardV2.tsx` | 25/05 | Arquivado — funcionalidades migradas para v2.3 |
| Solicitações V3 | `SolicitacoesPageV3.tsx` | 27/05 | **Aguardando aprovação** — preview inline, modal refatorado |
| Mapa V1 | `MapaPageV1.tsx` | 28/05 | Arquivado — teste de clusters com ícones |
| Mapa V2 | `MapaPageV2.tsx` | 01/06 | **Editando** — cópia de trabalho para novas melhorias no mapa |

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |

---

## Decisões Pendentes (Ações Manuais)

| # | Ação | Onde fazer | Prioridade |
|---|---|---|---|
| 1 | Remover rotas de teste do App.tsx antes do próximo deploy | Código | Alta |
| 2 | Adicionar páginas de teste no .gitignore | .gitignore | Alta |
| 3 | Testar Solicitações V3 e aplicar na página principal | Código | Média |

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
□ Remover rotas de teste do App.tsx
□ Adicionar páginas de teste no .gitignore
□ Testar Solicitações V3 em produção
□ Aprovar/rejeitar Solicitações V3 → copiar para SolicitacoesPage.tsx
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
| 017 | Mobile e desktop com layouts completamente diferentes | 31/05/2026 | SEMPRE manter o mesmo padrão visual mobile/desktop. Apenas adaptar tamanhos/espacamentos, nunca trocar tabela por cards |
| 018 | `line-clamp-1` não funciona sem largura máxima no container | 31/05/2026 | SEMPRE definir `max-w-xxx` no container pai do `line-clamp-1`. O line-clamp precisa de largura limitada para calcular as linhas. Sem max-width, o texto extrapola a célula |
| 019 | Deploy sem autorização do usuário | 01/06/2026 | SEMPRE confirmar antes de deployar funcionalidades novas. Nunca assumir que o usuário quer algo que não pediu explicitamente |
| 020 | Páginas de teste em produção | 01/06/2026 | SEMPRE remover rotas de teste do App.tsx antes do deploy. Páginas de teste são apenas para desenvolvimento local |
| 021 | Revert forçado perde alterações | 01/06/2026 | SEMPRE fazer backup antes de reverts. Verificar quais alterações serão perdidas antes de resetar para commit anterior |
