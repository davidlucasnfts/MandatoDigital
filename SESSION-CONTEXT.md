# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 01/06/2026
> **Sessão atual:** Mapa V2 Refatorado — Ícones padronizados E14/L11/C13, produção

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Deploy — Mapa V2 + Modo Demo — 01/06**

### ✅ O que foi entregue:
- **Mapa V2 Refatorado — Ícones padronizados E14/L11/C13:**
  - Ícone Eleitor: E14 (silhueta 3D com sombra projetada) — azul #2563eb
  - Ícone Líder: L11 (coroa dourada minimalista) — roxo #7c3aed
  - Ícone Comunidade: C13 (prédio 3D colorido) — verde #16a34a
  - Todos os ícones padronizados em: stat cards, toggles de camada, legenda, popups, dialogs
  - Marcadores individuais: sticker 32px inclinado, anchor na base (não cobre a rua)
  - Clusters: 33px com ícone central 20px + badge lateral 16px fora do círculo

- **UX/UI melhorada no mapa:**
  - Filtros com dropdowns estilizados (shadcn-like) ao invés de selects nativos
  - Legenda flutuante minimizável (botão "?" expande/minimiza)
  - Botão Centralizar só ícone (sem texto)
  - Cobertura Geográfica sempre visível (check verde em 100%)
  - StatCards com ícone + número na mesma linha, label embaixo
  - z-index corrigido: mapa não cobre menu mobile

- **Modo Demo:** Funciona automaticamente com todas as melhorias visuais

### ⚠️ Erros cometidos e corrigidos:
- **Ícone SVG branco sumindo no fundo branco** — SVG de "Com Coordenadas" usava fill="white", ficou invisível no círculo verde. Corrigido para fill="#16a34a"
- **Mapa cobrindo menu mobile** — Leaflet z-index alto. Corrigido com zIndex: 1 no MapContainer + isolate no container pai
- **Marcador cobrindo a rua** — anchor no centro do sticker. Corrigido para anchor na base ([16, 30] para sticker 32px)

### ✅ Checklist desta sessão (CONCLUÍDO):
- [x] Definir ícones E14/L11/C13 após ~30 iterações de teste
- [x] Aplicar ícones em toda a aba do mapa (stat cards, toggles, legenda, popups, dialogs)
- [x] Ajustar tamanhos: marcadores 32px, clusters 33px, ícones internos 20px
- [x] Corrigir anchor dos marcadores (base, não centro)
- [x] Filtros estilizados (dropdowns customizados)
- [x] Legenda minimizável
- [x] Botão Centralizar só ícone
- [x] Cobertura sempre visível
- [x] z-index corrigido para mobile
- [x] Remover rota de teste /mapa/teste-v2
- [x] Copiar MapaPageV2 → MapaPage.tsx (produção)
- [x] Atualizar MEMORY.md
- [x] Commit + push para produção
- [ ] Testar Solicitações V3 em produção
- [ ] Aprovar/rejeitar Solicitações V3 → copiar para SolicitacoesPage.tsx

---

## 🧪 Páginas de Teste Disponíveis

> **Regra:** Arquivos ficam salvos no projeto. Rotas são removidas antes do commit.
> Na próxima sessão, pedir ao Kimi para reativar se quiser testar.

| Página | Arquivo | Última atualização | Status |
|---|---|---|---|
| Dashboard V2 | `DashboardV2.tsx` | 25/05 | Arquivado — funcionalidades migradas para v2.3 |
| Solicitações V3 | `SolicitacoesPageV3.tsx` | 27/05 | **Reativada para teste** — rota `/solicitacoes/teste-v3` ativa |
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
