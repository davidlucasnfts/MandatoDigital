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
| Solicitações V3 — Preview inline, modal refatorado, filtros avançados | 27/05 |
| **Mapa V2 — Ícones SVG nos clusters e legenda, clusters separados, sem "Sem bairro"** | **01/06** |
| **Mapa V2 Refatorado — Ícones E14/L11/C13 padronizados, legenda com SVGs reais, popups e dialogs com ícones, camadas com toggles, filtros estilizados, legenda minimizável, cobertura sempre visível, responsivo mobile** | **01/06** |
| **Modo Demo — Dados mockados para demo@mandato.digital em 8 abas** | **01/06** |
| **Solicitações V3 — Página principal: lista com seções colapsáveis + Kanban com modal central, Design System, responsivo** | **01/06** |
| **Dashboard Restaurado — Dados reais do Supabase, mock removido, painéis buscam do banco** | **04/06** |
| **Comunicação — Campanhas WhatsApp/E-mail com templates, filtros, seleção múltipla, registro de envios** | **04/06** |
| **WhatsApp — WAHA API integrada na VPS para envio automático de mensagens** | **04/06** |
| **Documentação ADR-006 — Estratégia WhatsApp API para múltiplos clientes (WAHA/Evolution/Cloud)** | **04/06** |
| **Comunicação V2 — Botões de ação com texto+ícone, editar/enviar/reenviar campanha, status individual dos envios no preview** | **06/06** |
| **Comunicação V2 — Bugfixes: lista atualiza após criar, status envios atualiza, edição carrega dados** | **06/06** |
| **Comunicação V2 — Filtros de destinatários: Cidade, Líder, Liderados (dados reais do banco) + Salvar como rascunho** | **06/06** |
| **Comunicação V2 — Promovida à produção (copiada para ComunicacaoPage.tsx)** | **06/06** |
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
| **Dashboard v2.1: Correção ícones + Responsividade mobile** | **25/05** |
| **Dashboard v2.2: Redesign Meta Eleitoral + Layout simétrico** | **25/05** |
| **Skill Design System criada** | **25/05** |
| **Dashboard V2 Premium (página de teste): Command Menu, Skeletons, Empty States, Acessibilidade, Animações** | **25/05** |
| **Dashboard v2.3: Fusão v2 Premium + atual — componentes base, animações, CommandMenu, acessibilidade** | **25/05** |
| **Eleitores V3: Design System aplicado (StatCards, PanelCard, preview inline, tabela otimizada)** | **25/05** |
| **Eleitores V3.1: Preview inline na tabela (igual Líderes), sem scroll para cima** | **25/05** |
| **Líderes V3: Design System aplicado (StatCards, PanelCard, preview inline, tabela, podium)** | **25/05** |
| **Cache de CEP (Supabase) — reduz chamadas Here API em 90%** | **27/05** |
| **Comunidades: cadastro com geocodificação CNEFE + Here API + cache** | **27/05** |
| **Mapa: clusters com ícones coloridos (Eleitor azul, Comunidade verde, Líder roxo)** | **28/05** |
| **Análise de bibliotecas de ícones (Tabler, Phosphor, Lucide, Open Peeps)** | **28/05** |

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

## 📝 Resumo da Sessão 25/05 — Correções Dashboard v2

### Problemas corrigidos
| # | Problema | Causa | Solução |
|---|---|---|---|
| 1 | Ícones causando crash | Nomes de ícones não existiam em `src/lib/icons.ts` | Verificar todos os ícones antes de usar; adicionar aliases faltantes |
| 2 | Meta Eleitoral com estilo diferente | Card com Header+Content, outros só Content | Refatorar Meta para mesmo padrão dos stats (só Content) |
| 3 | Espaço vazio nos cards | Padding inconsistente entre Header e Content | Remover padding bottom do Header; usar pt-0 no Content |
| 4 | Layout assimétrico no desktop | 3 cards stats + 1 card meta (diferente) | Grid 4 colunas uniforme; Meta com mesmo estilo |
| 5 | Atividade com espaço vazio | Card ocupando 2/3 mas conteúdo pequeno | Redistribuir: Atividade + Eventos + Aniversariantes em 3 colunas |
| 6 | Responsividade quebrada no mobile | Ícones e textos muito grandes | Criar escala mobile/desktop para todos os elementos |

### Melhorias de Design Aplicadas
- **Consistência visual**: Todos os cards de stats com mesmo padrão (ícone topo, número, label, badge)
- **Espaçamento zero**: Removido todo espaço vazio sem função
- **Grid simétrico**: Layout 4 colunas no desktop, 2 colunas no mobile
- **Indicadores visuais**: Bolinhas coloridas antes dos títulos de seção
- **Textos compactos**: Títulos encurtados no mobile ("Meta Eleitoral" → "Meta")
- **Badges integrados**: Contadores no mesmo estilo dos títulos

### Lições Aprendidas (Self-Healing)
- SEMPRE verificar ícones em `src/lib/icons.ts` antes de usar
- SEMPRE manter consistência visual em cards do mesmo grid
- SEMPRE questionar espaços vazios — zero espaço sem função
- SEMPRE preferir grids simétricos (2, 3, 4 colunas)
- SEMPRE testar em 3 breakpoints: mobile, tablet, desktop
- SEMPRE limpar cache Vite quando código não refletir mudanças

---

## 📝 Resumo da Sessão 27/05 — Cache de CEP + Comunidades

### Cache de CEP (nova funcionalidade)
| Aspecto | Descrição |
|---|---|
| **Problema** | Here API sendo chamada toda vez que CEP não existia no CNEFE — custo desnecessário |
| **Solução** | Tabela `cep_cache` no Supabase com RLS — salva coordenadas da Here API para reutilização |
| **Fluxo** | Cache → CNEFE → Here API → salva no cache → próxima vez vem do cache (zero custo) |
| **Economia** | ~90% de redução em chamadas Here API para CEPs repetidos |

### Arquivos criados
- `supabase/migrations/027-cep-cache.sql` — schema da tabela
- `supabase/migrations/028-cep-cache-rls.sql` — políticas RLS (SELECT + ALL para autenticados)
- `api/cep-cache-router.ts` — endpoints tRPC (fallback, não usado no final)

### Arquivos modificados
- `src/lib/here-geocoding.ts` — `geocodeCepSmart` agora consulta cache antes de chamar APIs
- `db/schema.ts` — adicionado `cepCache` table
- `src/components/NovaComunidadeDialog.tsx` — cadastro com geocodificação completa

### Comunidades (melhorias)
| # | Melhoria | Status |
|---|---|---|
| 1 | CEP busca ViaCEP + geocodifica CNEFE/Here | ✅ |
| 2 | Número com checkbox S/N + refine Here API | ✅ |
| 3 | Campos bloqueados quando CEP preenchido (rua, bairro, cidade, estado) | ✅ |
| 4 | Cor e ícone removidos (padrão fixo: azul, Users) | ✅ |
| 5 | Cache de CEP reduzindo custo Here API | ✅ |

---

## 📝 Resumo da Sessão 28/05 — Mapa: Clusters com Ícones Coloridos

### O que foi feito
| # | Item | Status |
|---|---|---|
| 1 | Clusters separados (Eleitor/Comunidade/Líder) | ✅ |
| 2 | Ícone Eleitor: círculo azul `#2563eb` com SVG pessoa | ✅ |
| 3 | Ícone Comunidade: círculo verde `#16a34a` com SVG grupo | ✅ |
| 4 | Ícone Líder: círculo roxo `#7c3aed` com SVG apontando | ✅ |
| 5 | Contador branco dentro do círculo | ✅ |
| 6 | Sombra 3D (gradiente + sombra interna) | ✅ |
| 7 | Legenda atualizada com SVGs | ✅ |
| 8 | Páginas de teste criadas | ✅ |

### Análise de Bibliotecas
| Biblioteca | Avaliação | Decisão |
|---|---|---|
| Tabler Icons | Bom, tem fill | Opção B |
| Phosphor Icons | Ótimo fill, grande | Opção B |
| Lucide | Simples, sem fill crown | Descartado |
| Open Peeps | Melhor para humanizar | **Favorito** |
| SVG customizado | Mais flexível | **Usado agora** |

### Erros / Aprendizados
- CSS 3D limitado para ícones realistas
- Emoji não muda de cor (depende do SO)
- Open Peeps tem 500M+ combinações, ideal para ilustrações

### Páginas de Teste
| Arquivo | URL | Conteúdo |
|---|---|---|
| `teste-clusters.html` | `/teste-clusters.html` | Comparação bibliotecas |
| `teste-openpeeps.html` | `/teste-openpeeps.html` | Catálogo Open Peeps |

### Próxima Sessão — Decisões Pendentes
1. **Testar MapaPageV2** em produção
2. **Decidir**: manter SVGs atuais ou migrar para Open Peeps
3. **Se Open Peeps**: baixar SVGs específicos (eleitor azul, comunidade verde, líder roxo)
4. **Aplicar** clusters aprovados na página principal
5. **Remover** MapaPageV1 e V2 após aprovação

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

## 📝 Resumo da Sessão 04/06 — Dashboard Restaurado com Dados Reais

### Contexto
O Dashboard estava usando dados mockados (`useMockData`, `useMockDashboardData`) em vez de buscar do Supabase. O usuário solicitou restaurar a versão com dados reais, já que existe conta demo (`demo@mandato.digital`) para apresentações.

### Funcionalidades Restauradas
| # | Painel/Funcionalidade | Fonte de dados |
|---|---|---|
| 1 | **Stats cards** (eleitores, pendentes, tarefas) | `useStats()` — contagens reais do Supabase |
| 2 | **Tendências** (↑↓ % vs mês anterior) | `useStats()` — comparação mês atual vs anterior |
| 3 | **Gráfico Crescimento da Base** | `useDashboardData()` — eleitores por mês (últimos 12) |
| 4 | **Gráfico Solicitações por Categoria** | `useDashboardData()` — agrupamento real por categoria |
| 5 | **Alertas** (tarefas urgentes, solicitações pendentes, eventos hoje) | `useDashboardData()` — dados reais do banco |
| 6 | **Território** (top bairros, cobertura geográfica) | Supabase direto — eleitores com lat/lng |
| 7 | **Produtividade dos Líderes** | Supabase direto — eleitores vinculados por líder |
| 8 | **Proposições** (resumo + recentes) | Supabase direto — tabela proposições |
| 9 | **Enquetes** (ativas + respostas) | Supabase direto — tabela enquetes |
| 10 | **Comunicação** (e-mail, WhatsApp, envios) | Supabase direto — eleitores com contato |
| 11 | **Convites Pendentes** | Supabase direto — tabela convites_eleitores |
| 12 | **Atividade Recente** | Supabase direto — eleitores, solicitações, interações |
| 13 | **Meta Eleitoral** | Supabase direto — configurações |
| 14 | **Aniversariantes** | `useEleitores()` — dados reais (já estava) |

### Arquivos Restaurados (do commit a82b127)
- `src/hooks/useDashboardData.ts` — hook com queries reais do Supabase
- `src/components/TerritorioPanel.tsx` — busca bairros e geolocalização real
- `src/components/LideresPanel.tsx` — busca líderes com eleitores vinculados
- `src/components/AtividadeRecentePanel.tsx` — busca atividades recentes
- `src/components/ProposicoesPanel.tsx` — busca proposições do banco
- `src/components/EnquetesPanel.tsx` — busca enquetes do banco
- `src/components/ComunicacaoPanel.tsx` — busca contatos reais
- `src/components/ConvitesPendentesPanel.tsx` — busca convites pendentes

### Arquivos Modificados
- `src/pages/DashboardHome.tsx` — usa `useStats` + `useDashboardData` (dados reais)
- `src/hooks/useSupabaseData.ts` — exporta `useDashboardData`

### Arquivos de Teste
- `src/pages/DashboardHomeV2.tsx` — mantido para histórico

### Dados mockados ainda existem (para conta demo)
- `src/lib/demoData.ts` — usado por `useSupabaseData.ts` quando `isDemoUser()`
- `src/lib/mockData.ts` — não mais usado pelo DashboardHome
- `src/hooks/useMockData.ts` — não mais usado pelo DashboardHome

---

## 📝 Resumo da Sessão 06/06 — Comunicação V2 (Melhorias)

### Contexto
A página de Comunicação V2 (`ComunicacaoPageV2.tsx`) estava funcional mas com ações pendentes (TODOs) e botões de ícone sem texto, violando o Design System. Esta sessão implementou todas as ações e aplicou o padrão visual correto.

### Melhorias Entregues

#### 1. Botões de Ação — Design System Aplicado
| Antes | Depois |
|-------|--------|
| Ícone solitário (Pencil, Play, Trash2) | Texto + ícone empilhados verticalmente |
| Cores pastel (bg-blue-50) | Cores sólidas (bg-blue-600 text-white) |
| Sem padrão definido | Todos botões do mesmo grupo com mesmo estilo |

| Ação | Cor | Estilo |
|------|-----|--------|
| Editar | `bg-blue-600` | Sólido, texto+ícone |
| Enviar | `bg-green-600` | Sólido, texto+ícone |
| Reenviar | `bg-amber-600` | Sólido, texto+ícone |
| Excluir | `bg-red-600` | Sólido, texto+ícone |

#### 2. Ações Pendentes Implementadas
| Ação | Status Antes | Status Depois |
|------|-------------|---------------|
| Editar campanha (rascunho) | `/* TODO */` | ✅ Abre dialog com dados preenchidos |
| Enviar campanha (rascunho) | `/* TODO */` | ✅ Processa envio, atualiza status |
| Reenviar campanha (enviada) | `/* TODO */` | ✅ Reprocessa para mesmos destinatários |
| Excluir campanha | ✅ Funcionava | ✅ Mantido, com texto+ícone |

#### 3. Status Individual dos Envios no Preview
- Nova seção "Status dos envios" no `CampanhaPreview.tsx`
- Lista cada destinatário com ícone de status:
  - ⏱️ Pendente (âmbar)
  - ✅ Enviado (verde)
  - ❌ Erro (vermelho)
  - 👁️ Lido (azul)
- Seção colapsável (ChevronDown/Up)
- Busca dados reais da tabela `envios_campanha`

#### 4. NovaCampanhaDialog Suporta Edição
- Nova prop `campanhaEditando?: Campanha | null`
- `useEffect` preenche formulário com dados da campanha
- Atualiza campanha existente em vez de criar nova
- Título muda para "Editar Campanha"

#### 5. Removida Opção de E-mail
- NovaCampanhaDialog só oferece WhatsApp
- E-mail não estava implementado (causaria confusão)
- Botão de tipo removido do dialog

### Arquivos Modificados
- `src/pages/ComunicacaoPageV2.tsx` — Ações implementadas, botões com texto+ícone
- `src/components/NovaCampanhaDialog.tsx` — Suporte a edição, removido e-mail
- `src/components/CampanhaPreview.tsx` — Status individual dos envios

### Correções de Bugs (06/06)
| # | Problema | Causa | Solução |
|---|----------|-------|---------|
| 1 | Lista não atualiza após criar campanha | Hooks separados não compartilham estado | `onSuccess` callback + `window.location.reload()` |
| 2 | Envios ficam "pendente" no preview | Nunca chamava `marcarEnviado()` | Mapeia envio_id → eleitor_id e atualiza status individual |
| 3 | Edição não carrega dados | `useEffect` com dependências incorretas | Reescreveu lógica: limpa ao abrir (criação) ou preenche (edição) |

### Melhorias nos Filtros de Destinatários (06/06)
| # | Melhoria | Descrição |
|---|----------|-----------|
| 1 | **Salvar como rascunho** | Botão nas Etapas 1 e 2 para salvar campanha sem enviar |
| 2 | **Remover filtro TAG** | Tags são digitadas manualmente — baixa assertividade |
| 3 | **Filtro por Cidade** | Select com cidades dos eleitores cadastrados (ViaCEP) |
| 4 | **Filtro por Líder** | Select com eleitores que têm `nivel='lider'` |
| 5 | **Filtro por Liderados** | Select que mostra eleitores vinculados a um líder |
| 6 | **Dados reais do banco** | Todos os filtros vêm dos eleitores cadastrados — zero dados "do além" |

### Layout dos Filtros
```
Comunidade [Todas ▼]          Líder [Todos ▼]
Cidade [Todas ▼]              Bairro [Todos ▼]
Liderados por [Todos ▼]
```

### Próximos Passos
- [x] Promover V2 para produção (copiar para ComunicacaoPage.tsx)
- [ ] Implementar envio de e-mail (SendGrid/Resend)
- [ ] Webhook WAHA para status real de entrega

---

## 📋 Backlog
- Decidir biblioteca de ícones (Carbon vs Material vs Tabler)
- Migrar `src/lib/icons.ts` e todos os imports para biblioteca escolhida
- Importar CNEFE da UF do mandato (ação manual pendente)
- Prestação de Contas Pública (MÉDIA)
- App mobile / PWA para campo (MÉDIA)
- Integração WhatsApp API oficial (MÉDIA)
- Website integrado (BAIXA)

## 📝 Resumo da Sessão 01/06 — Solicitações V3 Torna Página Principal

### Contexto
A página de Solicitações tinha uma versão de teste (V3) criada em 27/05 com melhorias visuais, mas nunca havia sido promovida à produção. Esta sessão finalizou a V3 e a tornou a página principal.

### Funcionalidades Entregues

#### 1. Lista de Solicitações (Modo Tabela)
| # | Melhoria | Descrição |
|---|---|---|
| 1 | **Seções colapsáveis** | "Concluídas" e "Canceladas" com badge count, minimizáveis via clique |
| 2 | **Preview inline expandido** | Clique na linha abre preview com ícone circular, grid de detalhes, alterar status |
| 3 | **Botões com texto+ícone** | Editar (azul) e Excluir (vermelho) empilhados verticalmente |
| 4 | **Responsividade** | Tabela mobile (2 colunas) e desktop (7 colunas) separadas |
| 5 | **Limites de caracteres** | Título 60, Descrição 250 com contadores no modal |
| 6 | **Refresh sem reload** | Após criar/editar, lista atualiza via callback onSuccess |

#### 2. Kanban (Modo Board)
| # | Melhoria | Descrição |
|---|---|---|
| 1 | **Drag-and-drop entre colunas** | Arrastar card muda status automaticamente |
| 2 | **Modal central de preview** | Clique no card abre modal overlay (não expande inline na coluna estreita) |
| 3 | **Colunas minimizáveis** | Header clicável expande/minimiza, mostra preview compacto (5 títulos) |
| 4 | **Design System no preview** | Mesmo padrão da lista: círculo ícone, grid 2/3 colunas, alterar status |
| 5 | **Responsividade** | 1 coluna mobile, 2 tablet, 4 desktop |
| 6 | **Título truncado no card** | `truncate` + tooltip title para não estourar layout |

#### 3. Design System Aplicado
- Stats cards clicáveis (filtram por status ao clicar)
- Filtros expansíveis (status, prioridade)
- Badges coloridos por status/prioridade
- Cores fixas: Pendente(âmbar), Andamento(azul), Concluído(verde), Cancelado(vermelho)
- Botões de ação sempre visíveis (sem hover)

#### 4. Correções de Bugs
| # | Problema | Causa | Solução |
|---|---|---|---|
| 1 | Tabela mobile antiga sem seções colapsáveis | Tabela embutida na V3 não usava componente SolicitacoesLista | Removida tabela mobile antiga, usa componente unificado |
| 2 | Status "excluido" não existe no banco | Constraint CHECK só permite 4 status | Excluir → muda status para "cancelado" |
| 3 | Título quebrando 1 palavra/linha no preview | `break-words` + container estreito do Kanban | Preview do Kanban em modal central (largura adequada) |
| 4 | Overlay do modal não cobria tela toda | Padding no container flex do overlay | Separar overlay (inset-0) do container do modal |

### Arquivos Criados
- `src/components/SolicitacoesKanban.tsx` — Componente Kanban com DnD, modal, colunas minimizáveis

### Arquivos Modificados
- `src/pages/SolicitacoesPage.tsx` — Copiado da V3, renomeado para produção
- `src/pages/SolicitacoesPageV3.tsx` — Mantido para histórico
- `src/components/SolicitacoesLista.tsx` — Preview inline com seções colapsáveis
- `src/components/NovaSolicitacaoDialog.tsx` — Limites de caracteres + onSuccess callback
- `src/App.tsx` — Removida rota /solicitacoes/teste-v3
- `src/components/DashboardLayout.tsx` — Removido link "Solicitações V3"

### Lições Aprendidas (Self-Healing)
- **Preview inline em Kanban não funciona** — colunas são muito estreitas (~200px). Sempre usar modal/drawer para preview em Kanban.
- **Overlay de modal deve ser elemento separado** — nunca misturar overlay e conteúdo no mesmo container flex com padding.
- **`break-words` vs `break-all`** — `break-words` só quebra em hífen/espaço; para textos longos sem espaço (testes), usar `break-all`.
- **Componente unificado para mobile/desktop** — evitar duplicar tabela mobile/desktop. Um componente com classes responsivas (`hidden sm:block` / `sm:hidden`) é mais manutenível.

### Decisões Pendentes
- Nenhuma. Página em produção.

---

## 📋 Backlog
- Decidir biblioteca de ícones (Carbon vs Material vs Tabler)
- Migrar `src/lib/icons.ts` e todos os imports para biblioteca escolhida
- Importar CNEFE da UF do mandato (ação manual pendente)
- Prestação de Contas Pública (MÉDIA)
- App mobile / PWA para campo (MÉDIA)
- Integração WhatsApp API oficial (MÉDIA)
- Website integrado (BAIXA)
