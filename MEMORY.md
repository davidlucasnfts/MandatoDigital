# MandatoDigital — Histórico de Entregas

CRM político. React + TS + Vite + Tailwind + shadcn/ui + Supabase + Drizzle (PostgreSQL). Vercel.

> **Para contexto da sessão atual, ver `SESSION-CONTEXT.md`**
> **Para regras de desenvolvimento, ver `AGENTS.md`**
> **Para referência técnica completa, ver `docs/mandato-digital-guia.md`**
> **Para estrutura de documentação, ver `docs/documentacao-estrutura.md`**

---

## ✅ Entregues
| Funcionalidade | Data |
|---|---|
| Eleitores (CRUD, tags, níveis, comunidades, CPF) | — |
| Import/Export CSV | — |
| Kanban drag-and-drop | — |
| Registro de Interações | — |
| Dashboard com dados reais | — |
| Comunicação E-mail/SMS | — |
| Agenda e Documentos | — |
| Automação de Aniversário (WhatsApp) | 04/05 |
| Mapa Territorial (Leaflet + OpenStreetMap) | 04/05 |
| Landing Page (foco conversão) | 04/05 |
| Multi-usuário RBAC (admin/editor/visualizador) | 05/05 |
| Relatórios PDF/CSV (6 gráficos, KPIs, filtros) | 06/05 |
| Documentação toolkit + guia do projeto | 07/05 |
| TypeScript strict, testes Vitest + cobertura 80% | 07/05 |
| Rate limiting + headers de segurança (CSP, HSTS) | 07/05 |
| CI/CD GitHub Actions + Vercel deploy | 07/05 |
| Logs de auditoria LGPD + tabela audit_logs | 07/05 |
| ADRs documentados (4 decisões arquiteturais) | 07/05 |
| Schema Produção Legislativa (proposições + tramitações) | 07/05 |
| Router tRPC proposições (CRUD + produtividade + tramitações) | 07/05 |
| Frontend: lista, form, detalhe com timeline, dashboard produtividade | 07/05 |
| Melhorias cadastro eleitores: nome_mãe, CEP ViaCEP, hierarquia, convites, preview | 07/05 |
| Schema versionado em migrations (001-007) + schema_safe.sql consolidado | 07/05 |
| Abas no modal de eleitor (Eleitor/Apoiador/Influenciador/Líder) com títulos e cores | 07/05 |
| Comunidades: ícone dinâmico por comunidade (lucide-react) | 07/05 |
| Mapa: bounds limitado ao Brasil, tiles CARTO light | 07/05 |
| Aniversariantes: filtros dia/semana/mês + data visível | 07/05 |
| Solicitações: data_solicitacao/data_evento, toggle rápido status na tabela | 07/05 |
| Pesquisa de Opinião / Enquetes (CRUD, opções, respostas, estatísticas) | 07/05 |
| Hierarquia de Líderes: campo lider_id, modal simplificado (Eleitor/Líder), link de afiliação, página pública de cadastro | 07/05 |
| **Padronização UI/UX completa — botões de ação** | **07/05** |
| **Hardening de Segurança — correções críticas + padrão global** | **10/05** |
| **Vínculo Comunidade → Cidade + Marcadores coloridos no mapa** | **10/05** |
| **Autocomplete de cidades e bairros do Brasil** | **10/05** |
| **Geocodificacao real no mapa (Nominatim/OpenStreetMap)** | **10/05** |
| **Batch geocodificacao de eleitores existentes** | **10/05** |

---

## 📝 Resumo da Sessão 07/05

### Padronização de Botões de Ação (aplicado em TODO o projeto)
- ❌ **Removido:** Dropdowns de 3 pontinhos (MoreHorizontal) em todas as páginas
- ✅ **Novo padrão:** Botões com **texto + ícone** empilhados verticalmente
- ✅ **Cores fixas por ação:** Editar(azul), Excluir(vermelho), Aprovar(verde), Link(roxo), Ver(cinza)
- ✅ **Coluna Ações na primeira posição** da tabela (antes do nome)
- ✅ **Hover azul** (`hover:bg-blue-50/50`) em todas as linhas de tabela
- ✅ **Clique na linha** abre preview/detalhes
- ✅ **`stopPropagation`** nos botões para não disparar clique da linha
- ✅ **Botão Fechar** do preview centralizado abaixo do card

### Hierarquia de Líderes (melhorias)
- Preview do líder mostra **eleitores vinculados** com contador
- **Filtro por líder** na tabela de eleitores
- Coluna Líder com avatar + nome

### Páginas padronizadas
Eleitores, Solicitações, Proposições, Equipe, Enquetes, Comunidades, Agenda, Tarefas

### AGENTS.md atualizado
Regras de design de botões salvas para não repetir erros

---

## 📝 Resumo da Sessão 10/05 — Hardening de Segurança

### Documentação criada
- **`SECURITY.md`** — checklist reutilizável de segurança para este e todos os projetos futuros
- **`docs/adr-005-seguranca-padrao.md`** — decisão arquitetural do padrão de segurança
- **`AGENTS.md` atualizado** — regras de segurança obrigatórias para o Kimi em todo projeto
- **`MestreProjects.md` atualizado** — regras de segurança global consolidadas no arquivo mestre

### Vulnerabilidades corrigidas
| Severidade | Problema | Correção |
|---|---|---|
| 🔴 CRÍTICO | Senha do banco hardcoded em `api/lib/env.ts` | Removida. `DATABASE_URL` obrigatória via env |
| 🔴 CRÍTICO | Fallback de chave Supabase no frontend | Removido. App não inicializa sem a var |
| 🟠 ALTO | Todo usuário logado = admin no backend | `api/context.ts` busca role real da tabela `equipe` |
| 🟠 ALTO | Sem proteção CSRF | Middleware `validateOrigin` em rotas sensíveis |
| 🟡 MÉDIO | Rate limit só por IP | Adicionado rate limit por token em rotas de equipe |
| 🟡 MÉDIO | `ctx.user` tipado como opcional | `AuthenticatedContext` — user garantido em authedQuery |
| 🟡 MÉDIO | Conexão DB cacheada com senha antiga | `getDb()` recria quando `DATABASE_URL` muda |

### Melhorias técnicas
- Type check passando
- Testes passando (12/12)
- Enum `"vetoado"` → `"veteado"` corrigido (consistência schema/código)
- Níveis inexistentes (`influenciador`, `apoiador`) removidos do frontend

---

## 📝 Resumo da Sessão 10/05 — Vínculo Comunidade-Cidade + Mapa

### Migration 013
- `comunidades.cidade TEXT` — cidade vinculada para posicionamento no mapa
- `comunidades.icone TEXT DEFAULT 'Users'` — ícone Lucide para exibição

### NovaComunidadeDialog.tsx
- Campo **Cidade** adicionado (com capitalização automática)
- Layout em grid: cidade/cor em uma linha, ícone/bairros em outra
- Bug de bairros duplicado corrigido

### MapaPage.tsx
- Comunidades com cidade vinculada aparecem como **marcadores coloridos** no mapa
- Ícone SVG dinâmico com cor da comunidade (pin personalizado)
- Tooltip mostra nome da comunidade + cidade
- Clique no marcador aplica filtro de comunidade
- Contador de comunidades no mapa na sidebar

### Arquivos criados
- `src/lib/mapIcons.ts` — `createColorIcon()` gera marcador SVG com cor personalizada

---

## 📝 Resumo da Sessão 10/05 — Geocodificacao Real no Mapa

### Problema
O mapa posicionava eleitores no **centro da cidade** (coordenadas aproximadas de 78 cidades), nao no endereco real. Um eleitor na Av. Paulista aparecia no mesmo ponto que outro no Morumbi.

### Solucao
- **Nominatim (OpenStreetMap)** — API gratuita de geocodificacao
- Ao buscar CEP no cadastro, o sistema agora **geocodifica o endereco** e salva lat/lng no banco
- Eleitores aparecem no **ponto exato** do endereco no mapa

### Arquivos criados/modificados
- `supabase/migrations/014-eleitor-coordenadas.sql` — colunas `latitude` e `longitude`
- `src/lib/geocoding.ts` — `geocodeEndereco()` e `geocodeCep()` via Nominatim
- `src/lib/supabase.ts` — tipo `Eleitor` com `latitude` e `longitude`
- `src/components/NovoEleitorDialog.tsx` — busca CEP agora geocodifica automaticamente
- `src/pages/MapaPage.tsx` — reescrito:
  - Eleitores **com coordenadas**: circulos coloridos no ponto exato (clique abre detalhes)
  - Eleitores **sem coordenadas**: marcador da cidade (fallback)
  - Contador na sidebar: "Com coordenadas" / "Sem coordenadas"

### Batch geocodificacao (eleitores existentes)
- **Endpoint tRPC:** `geocoding.geocodeAll` — apenas admin
- **Processamento:** 1 eleitor a cada 1.2 segundos (respeita rate limit Nominatim)
- **UI:** Botao na sidebar do mapa "Geocodificar X eleitores"
- **Resultado:** Pagina recarrega automaticamente apos conclusao

### Politica de uso Nominatim
- User-Agent obrigatorio com contato
- 1 requisicao por segundo (throttle automatico via cache)
- Dados OpenStreetMap — cobertura boa em areas urbanas do Brasil

---

## 📝 Resumo da Sessão 10/05 — Autocomplete Cidades/Bairros

### Dataset de cidades
- **Fonte:** API IBGE (oficial)
- **5.571 cidades** do Brasil com nome + UF
- **Arquivo:** `src/data/cidadesBrasil.json` (284 KB)
- Filtro instantâneo no frontend (sem chamadas de API)

### Dataset de bairros
- **Fonte:** ViaCEP (logradouros por cidade)
- **51 cidades principais** cobertas, **3.831 bairros**
- **Arquivo:** `src/data/bairrosBrasil.json` (87 KB)
- Cidades cobertas: todas as capitais + maiores cidades do Brasil
- Fallback: se cidade não está no dataset, permite digitação livre

### Componentes criados
- **`AutocompleteCidade.tsx`** — dropdown com ícone, busca por nome, mostra UF, navegação por teclado
- **`AutocompleteBairro.tsx`** — busca no dataset local da cidade selecionada, fallback para digitação livre

### Formulários atualizados
- `NovoEleitorDialog.tsx` — cidade + bairro com autocomplete
- `NovaComunidadeDialog.tsx` — cidade com autocomplete
- `AfiliarPage.tsx` — cidade + bairro com autocomplete
- `ConvitePage.tsx` — cidade + bairro com autocomplete

### Comportamento
- Digita 2+ caracteres → aparece dropdown com sugestões
- Setas ↑↓ navegam, Enter seleciona, Escape fecha
- Cidade selecionada **preenche o estado automaticamente**
- Bairro usa a cidade selecionada para filtrar o dataset local

---

## 📋 Backlog
- Prestação de Contas Pública (MÉDIA)
- App mobile / PWA para campo (MÉDIA)
- Integração WhatsApp API oficial (MÉDIA)
- Website integrado (BAIXA)
