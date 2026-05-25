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
| Repaginação ícones: Phosphor Icons (fill/duotone) substituindo Lucide | 20/05 |
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
| **Bugfix: CEP atualiza no cadastro + Comunidade cria corretamente** | **11/05** |
| **Comunidade.lider vinculado a eleitores (FK lider_id)** | **11/05** |
| **Bairro relacional em comunidades + posicionamento no mapa** | **12/05** |
| **Mapa Territorial v2: cluster, filtros avançados, popups, camadas, zoom automático, estatísticas** | **12/05** |
| **Mapa Territorial v3: heatmap de densidade + rota de visita otimizada** | **12/05** |
| **Mapa Territorial v4: CNEFE (IBGE) + tiles profissionais (CartoDB/Esri)** | **14/05** |
| **Correção campos de data (type=date) em todos os dialogs — formato YYYY-MM-DD** | **14/05** |
| **Validação data de nascimento: mínimo 18 anos, bloqueio ano inválido** | **14/05** |
| **IconPicker visual + ColorPicker para comunidades** | **15/05** |
| **Endereço completo vinculado em comunidades (CEP, rua, número, bairro, cidade, estado)** | **15/05** |
| **Tradução PT-BR: IconPicker com nomes em português** | **15/05** |
| **Número da casa no cadastro de eleitor + Exportação CSV/DOC/PDF** | **15/05** |
| **Geocodificação 100% CNEFE — remove dependência do Nominatim** | **16/05** |
| **CNEFE: busca por CEP + logradouro para maior precisão** | **16/05** |
| **Fix IconPicker: compatibilidade com lucide-react atual** | **16/05** |
| **Hardening VPS — reinstalação após ransomware, firewall, fail2ban, chaves SSH** | **18/05** |
| **API Proxy CNEFE na VPS — PostgreSQL isolado, rate limiting, usuário dedicado** | **19/05** |
| **Decisão: Here API para geocodificação precisa (nível de número)** | **18/05** |
| **Documentação técnica: Diagrama ER, Regras de Negócio, Diagramas de Estado, Padrões Frontend, Plano de Testes, Runbook** | **20/05** |
| **Teste bibliotecas ícones: Carbon (IBM), Material (Google), Tabler** | **22/05** |
| **Correção crítica: DATABASE_URL + schema_safe.sql + erro 500 Líderes** | **24/05** |
| **Novos campos eleitorais: seção, zona, título + vinculo líder→líder** | **24/05** |
| **Script automático: `npm run db:schema-safe` para consolidar migrations** | **24/05** |
| **Migração completa para Tabler Icons** | **23/05** |
| **Página Produtividade dos Líderes: edição de estimativa + cores do ranking** | **24/05** |
| **Responsividade mobile na página de Líderes** | **24/05** |
| **Dashboard v2: 10 melhorias completas** | **24/05** |

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

## 📝 Resumo da Sessão 24/05 — Correções Críticas + Novos Campos Eleitorais

### Correções Críticas
| # | Problema | Causa | Solução |
|---|---|---|---|
| 1 | Erro 500 em `lideres.produtividade` | Coluna `estimativa_votos` não existia no banco | Migration 020 aplicada no Supabase |
| 2 | `DATABASE_URL` era placeholder | Valor `postgres://user:pass@db.example.com` na Vercel | Atualizado para Session Pooler do Supabase |
| 3 | Senha com `!` quebrava URL | Caractere especial não codificado | `encodeURIComponent()` no `api/lib/env.ts` |
| 4 | `schema_safe.sql` desatualizado | Faltavam migrations 011-025 | Script `npm run db:schema-safe` criado |
| 5 | `editorQuery` sem autenticação | `ta.procedure` não verificava `ctx.user` | Adicionado `requireAuth` antes de `requireRole` |

### Novas Funcionalidades
| Funcionalidade | Descrição |
|---|---|
| **Campos eleitorais** | Seção (4 dígitos), Zona (3 dígitos), Título de Eleitor (12 dígitos) |
| **Vincular líder com líder** | Campo `lider_vinculado_id` — hierarquia multi-nível |
| **Edição de estimativa** | Lápis sempre visível na lista e no modal de líderes |
| **Script automático** | `npm run db:schema-safe` consolida migrations no schema_safe.sql |

### Melhorias Técnicas
| Melhoria | Descrição |
|---|---|
| **Codificação de senha** | `api/lib/env.ts` codifica automaticamente caracteres especiais na `DATABASE_URL` |
| **Session Pooler** | Mudança de Direct Connection (IPv6) para Session Pooler (IPv4) do Supabase |
| **Cliente postgres direto** | `lideres-router.ts` usa `postgres()` em vez de `db.execute(sql")` |

### Melhorias UI/UX
- Cores do ranking: 1º=âmbar, 2º=prata, 3º=bronze
- Podium horizontal no mobile
- Textos KPI encurtados no mobile
- Lápis de edição sempre visível (sem hover)

---

## 📝 Resumo da Sessão 24/05 — Dashboard v2 (10 Melhorias)

### Melhorias no Dashboard
| # | Melhoria | Descrição |
|---|---|---|
| 1 | **Tendência nos cards** | Indicador ↑↓ % vs mês anterior em cada card (verde=positivo, vermelho=negativo) |
| 2 | **Painel Território** | Top 5 bairros com mais eleitores + barra de cobertura geográfica (% geolocalizados) |
| 3 | **Produtividade Líderes** | Top 3 líderes do mês com eleitores vinculados e taxa de conversão |
| 4 | **Proposições** | Contagem por status + 3 proposições mais recentes com badge de status |
| 5 | **Enquetes Ativas** | Total de enquetes ativas + respostas + lista das 3 mais recentes |
| 6 | **Atividade Recente** | Feed com últimas ações: eleitores cadastrados, solicitações resolvidas, interações |
| 7 | **Meta Eleitoral** | Barra de progresso editável + projeção de quando atinge a meta |
| 8 | **Aniversariantes** | Estatística de envios (% enviado, barra de progresso) no topo do painel |
| 9 | **Comunicação** | Resumo de canais (e-mail/WhatsApp) + envios de aniversário + base segmentável |
| 10 | **Convites Pendentes** | Lista de eleitores aguardando aprovação com tempo de espera |

### Arquivos criados
- `src/components/TerritorioPanel.tsx`
- `src/components/LideresPanel.tsx`
- `src/components/ProposicoesPanel.tsx`
- `src/components/EnquetesPanel.tsx`
- `src/components/AtividadeRecentePanel.tsx`
- `src/components/MetaEleitoralPanel.tsx`
- `src/components/ComunicacaoPanel.tsx`
- `src/components/ConvitesPendentesPanel.tsx`

### Arquivos modificados
- `src/hooks/useSupabaseData.ts` — `useStats` retorna `tendencias` (comparação mês atual vs anterior)
- `src/pages/DashboardHome.tsx` — Layout reorganizado com todos os novos painéis
- `src/components/AniversariantesPanel.tsx` — Barra de progresso de envios adicionada

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

## 📝 Resumo da Sessão 14/05 — Mapa Territorial v4 (CNEFE + Tiles Profissionais)

### Problema
Mapa usava OpenStreetMap padrão (visual fraco) e Nominatim para geocodificação (impreciso, rate limit 1 req/sg). Precisava de dados REAIS do Brasil e visual profissional.

### Solução
1. **CNEFE (IBGE) como base primária** — 106M endereços georreferenciados do Censo 2022, gratuito, armazenável
2. **Geocodificação híbrida** — CNEFE primeiro (local, instantâneo), Nominatim fallback
3. **Tiles profissionais** — CartoDB Voyager (ruas), Esri World Imagery (satélite), CartoDB Dark Matter (escuro)

### Arquivos criados
- `supabase/migrations/017-cnefe-enderecos.sql` — schema tabela CNEFE
- `scripts/importar-cnefe.ts` — importação de CSVs do IBGE
- `api/cnefe-router.ts` — endpoints tRPC (busca, geocodificação, status)

### Arquivos modificados
- `db/schema.ts` — tabela `cnefeEnderecos`
- `api/router.ts` — rota `cnefe`
- `api/geocoding-router.ts` — CNEFE primeiro, Nominatim fallback
- `src/lib/geocoding.ts` — usa tRPC CNEFE
- `src/pages/MapaPage.tsx` — seletor de camada (Ruas/Satélite/Escuro)

### Custo
**R$ 0** — CNEFE é dado público federal, tiles CartoDB/Esri são gratuitos

---

## 📝 Resumo da Sessão 22/05 — Teste de Bibliotecas de Ícones

### Contexto
Usuário rejeitou Phosphor Icons (pesos fill/duotone/bold) e Govicons. Precisava testar alternativas visuais antes de decidir.

### Bibliotecas testadas
| Biblioteca | Estilo | Página | Status |
|---|---|---|---|
| Carbon Icons (IBM) | Técnico, cantos quadrados | `/icones-carbon` | ✅ Testável |
| Material Design (Google) | Preenchido, cantos arredondados | `/icones-material` | ✅ Testável |
| Tabler Icons | Minimalista, stroke fino | `/icones-tabler` | ✅ Testável (corrigido build) |

### Erro corrigido
- `IconFire` não existe no `@tabler/icons-react` → substituído por `IconFlame`
- Build falhava com "not exported" → corrigido, build passando

### Decisão pendente
Usuário vai acessar as 3 páginas localmente e decidir qual biblioteca adotar.

---

## 📋 Backlog
- Decidir biblioteca de ícones (Carbon vs Material vs Tabler)
- Migrar `src/lib/icons.ts` e todos os imports para biblioteca escolhida
- Importar CNEFE da UF do mandato (ação manual pendente)
- Prestação de Contas Pública (MÉDIA)
- App mobile / PWA para campo (MÉDIA)
- Integração WhatsApp API oficial (MÉDIA)
- Website integrado (BAIXA)
