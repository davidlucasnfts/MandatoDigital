# COMO TRABALHAR COM O KIMI NESTE PROJETO

> **Antes de criar/modificar qualquer arquivo de documentação, consultar `docs/documentacao-estrutura.md`**

## Perfil do desenvolvedor
David Lucas é analista de sistemas (não desenvolvedor) que usa o Kimi Code como ferramenta principal de desenvolvimento. Tem visão de produto e negócio, mas não escreve código manualmente. Quer projetos escaláveis e profissionais. Prefere entender o "porquê" além do "como".

## Idioma e estilo de resposta
- **Sempre em português** — perguntas, respostas, confirmações, tudo
- **Modo direto:** resultado primeiro, sem rodeios, sem narração do processo
- Expandir explicações só se pedido explicitamente

## Regras de código
- **Limite de 400 linhas por arquivo.** Se ultrapassar, redistribuir em componentes/utilitários menores.
- **Exceção:** componentes do shadcn/ui em `src/components/ui/` — são de biblioteca externa, não mexer.

---

## 🚀 Regras Globais (aplicáveis a todos os projetos)

### Deploy
- **Deploy padrão: Vercel** — todos os projetos devem ser adaptados para Vercel (serverless)
- Criar `api/index.ts` como entrypoint, `vercel.json` com rewrites SPA

### Independência de IA
- **Nunca deixar dependência** de plataforma/oauth do gerador de código (Kimi OAuth, etc.)
- Remover código morto do template antes de deployar

### Banco de dados
- **Sempre usar `schema_safe.sql`** (nunca `schema.sql`) — idempotent, pode rodar quantas vezes quiser
- Comentar **data + descrição** no topo de cada alteração no schema

### Economia de Tokens
- **Leitura única** — ler arquivo 1x, fazer todas as mudanças na memória, escrever 1x
- **StrReplaceFile preferido** — só substituir o trecho que muda, não reescrever arquivo inteiro
- **Commits agrupados** — uma única chamada de commit com todas as mudanças
- **Push somente no final da sessão** — quando o usuário pedir para encerrar. Durante a sessão, commit local apenas
- **Sem prints desnecessários** — resultado direto, sem mostrar código que já foi visto

### Sincronização de Arquivos de Projeto
- **Sempre atualizar MEMORY.md e roadmap.html** quando uma funcionalidade for adicionada, removida ou concluída
- **Sempre atualizar arquivos mencionados** quando o usuário pedir remoção, alteração ou renomeação de qualquer item
- Nunca deixar arquivo de documentação desatualizado após mudanças no projeto
- **Nunca duplicar informação** entre arquivos de documentação — cada arquivo tem função única (ver `docs/documentacao-estrutura.md`)

### 📝 Onde salvar cada tipo de mudança (REGRA OBRIGATÓRIA)

| Tipo de mudança | Onde salvar | Nunca salvar em |
|-----------------|-------------|-----------------|
| Funcionalidade entregue | `MEMORY.md` (tabela + resumo) | `SESSION-CONTEXT.md` |
| Estado atual da sessão | `SESSION-CONTEXT.md` | `MEMORY.md` |
| Regra de codificação nova | `AGENTS.md` | Arquivo qualquer |
| Decisão arquitetural | `docs/adr-NNN-nome.md` | `AGENTS.md` sozinho |
| Padrão para todos os projetos | `MestreProjects.md` | Dentro de projeto |
| Mudança em segurança | `AGENTS.md` + `MestreProjects.md` | Arquivo isolado |
| Estrutura de documentação | `docs/documentacao-estrutura.md` | Outro lugar |

**Checklist antes de finalizar qualquer tarefa:**
```
□ A informação está no arquivo correto (ver tabela acima)?
□ Não existe outro arquivo com a mesma função?
□ Se modifiquei um arquivo, atualizei todos que referenciam ele?
□ Se criei arquivo novo, adicionei no docs/documentacao-estrutura.md?
□ Se deletei arquivo, removi referências em todos os docs?
```

### Datas em Funcionalidades
- **Sempre incluir a data de entrega** ao lado do nome da funcionalidade em MEMORY.md e roadmap.html
- Formato: `Funcionalidade — DD/MM` (ex: `Relatórios PDF/CSV — 06/05`)
- Funcionalidades antigas sem data definida podem ficar sem data
- Atualizar datas ao concluir novas melhorias

### Ações Manuais — REGRA CRÍTICA
- **Sempre que uma funcionalidade exigir ação manual** (rodar SQL no Supabase, configurar secret no GitHub/Vercel, criar bucket, env var, etc.), **adicionar em "Decisões pendentes" do `SESSION-CONTEXT.md`**
- **Sempre avisar David no final da resposta** com destaque em negrito e emoji ⚠️
- Nunca assumir que ele "já sabe" — ele não escreve código e não acompanha infraestrutura
- Itens pendentes devem ser claros: **o quê**, **onde fazer**, **como fazer**
- **Schema:** usar migrations em `supabase/migrations/NNN-descricao.sql`. Nunca editar `schema_safe.sql` manualmente — ele é gerado juntando as migrations.

---

## 🧠 Self-Healing — Aprender com Erros

> **Regra obrigatória:** SEMPRE consultar esta seção antes de criar/modificar/deletar qualquer arquivo.

### Erros Registrados (nunca repetir)

| # | Erro | Data | Prevenção |
|---|------|------|-----------|
| 001 | Criar arquivo sem verificar se função já existe | 11/05/2026 | Consultar `docs/documentacao-estrutura.md` antes |
| 002 | Sobrescrever arquivo fora do repo Git | 11/05/2026 | Nunca usar `overwrite` fora do working dir |
| 003 | Duplicar informação de segurança | 10/05/2026 | Expandir arquivo existente, nunca criar duplicata |
| 004 | Salvar no `MestreProjects.md` em vez de `AGENTS.md` | 11/05/2026 | Só salvar no global quando David disser "para todos os projetos" |
| 005 | VPS com PostgreSQL exposto + senha fraca | 18/05/2026 | NUNCA expor porta 5432, usar senhas fortes (20+ chars), firewall UFW, fail2ban |
| 006 | Esquecer de monitorar volume de API externa | 18/05/2026 | Sempre criar alerta de uso (80% do free tier), documentar plano de migração em SESSION-CONTEXT.md |
| 007 | Não atualizar grafo do projeto após mudanças grandes | 18/05/2026 | Rodar `npm run graphify` após refactorings ou novas funcionalidades. Usar `npm run graphify:watch` para atualização automática |
| 007 | Não documentar decisão de provedor de geocodificação | 18/05/2026 | Salvar comparativo de preços e plano de migração em `docs/geocoding-providers-comparison.md`

### Checklist Obrigatório (executar antes de QUALQUER ação)

```
□ 1. Já existe arquivo com essa função? (ver docs/documentacao-estrutura.md)
□ 2. Estou no diretório correto? (nunca modificar fora do working dir sem confirmar)
□ 3. Vou usar StrReplaceFile ou WriteFile? (preferir StrReplaceFile sempre)
□ 4. Se criar arquivo novo, adicionei no docs/documentacao-estrutura.md?
□ 5. Se modificar arquivo, atualizei todos que referenciam ele?
□ 6. Onde devo salvar? AGENTS.md (projeto) ou MestreProjects.md (global)?
□ 7. Execute npm run check após mudanças?
```

### Regras de Ouro (nunca quebrar)

1. **NUNCA** criar arquivo de documentação sem verificar se função já existe
2. **NUNCA** usar `WriteFile overwrite` em arquivos fora do working directory
3. **NUNCA** duplicar informação entre arquivos
4. **NUNCA** salvar no `MestreProjects.md` sem explicitamente ser "para todos os projetos"
5. **SEMPRE** executar checklist antes de criar/modificar/deletar
6. **SEMPRE** preferir `StrReplaceFile` sobre `WriteFile`
7. **SEMPRE** consultar `docs/documentacao-estrutura.md` antes de nova documentação

---

## 🛠️ Skills Disponíveis (quando usar)

> **Skills do Kimi:** `C:\Users\David Lucas\.claude\skills\`
> **Skills do claude-spec-toolkit:** `C:\Users\David Lucas\Documents\claude-spec-toolkit\skills\`

### Skills do Kimi (usar quando necessário)
| Skill | Quando usar |
|-------|-------------|
| **security** | Revisão de segurança, auditoria, vulnerabilidades |
| **frontend-design** | Design de UI, componentes, landing pages |
| **ux-ui-designer** | Experiência do usuário, fluxos, wireframes |
| **scalability** | Problemas de performance, otimização |
| **cost-reducer** | Reduzir custos de infraestrutura |
| **researcher** | Pesquisa de mercado, concorrência, tecnologias |
| **self-healing** | Debugging, resolver bugs complexos |
| **customer-support** | Atendimento, FAQ, documentação de suporte |

### Skills do claude-spec-toolkit (aplicáveis a este projeto)
| Skill | Quando usar | Onde está |
|-------|-------------|-----------|
| **react-frontend** | Desenvolvimento React, hooks, estado | `claude-spec-toolkit/skills/react-frontend/` |
| **c4-model** | Documentar arquitetura | `claude-spec-toolkit/skills/c4-model/` |
| **diagrama-er** | Documentar schema do banco | `claude-spec-toolkit/skills/diagrama-er/` |
| **diagramas-estado** | Ciclos de vida (status, workflows) | `claude-spec-toolkit/skills/diagramas-estado/` |
| **diagramas-sequencia** | Fluxos complexos | `claude-spec-toolkit/skills/diagramas-sequencia/` |
| **testes** | Estratégia de testes, TDD | `claude-spec-toolkit/skills/testes/` |
| **user-stories** | Decompor funcionalidades | `claude-spec-toolkit/skills/user-stories/` |
| **regras-de-negocio** | Documentar regras do domínio | `claude-spec-toolkit/skills/regras-de-negocio/` |

### Skills NÃO aplicáveis (nunca usar neste projeto)
| Skill | Por quê não |
|-------|-------------|
| api-design | Usamos tRPC, não REST |
| clean-architecture | Over-engineering para monolito |
| ddd | Domínio ainda simples |
| event-driven | Sem Kafka/eventos |
| kubernetes | Usamos Vercel (serverless) |
| microservices-patterns | Projeto é monolito |
| nuxt / vue-frontend | Usamos React |
| react-native | Projeto é web |
| spring-boot-3 | Usamos TypeScript/Node |
| cloud-azure | Usamos Vercel + Supabase |
| devops / runbook | Sem infra própria |

---

## 🔒 Segurança — Regras Obrigatórias (aplicáveis a todos os projetos)

> **Referência técnica:** `docs/adr-005-seguranca-padrao.md`
> **Referência global:** `C:\Users\David Lucas\Documents\PROJETOS IA\MestreProjects.md` (seção 2)

### 🚫 PROIBIDO — Regras de Ouro
1. **NUNCA** hardcodear credenciais, senhas, chaves API, connection strings
2. **NUNCA** usar fallback `|| 'valor-padrao'` em variáveis de ambiente sensíveis
3. **NUNCA** expor `service_role_key` ou qualquer secret no frontend
4. **NUNCA** assumir role do usuário — sempre buscar do banco
5. **NUNCA** commitar `.env` com valores reais
6. **NUNCA** desabilitar RLS em tabelas de produção

### ✅ Obrigatório em todo projeto
- Headers de segurança: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Rate limiting por IP + por usuário autenticado
- Validação de TODOS os inputs com Zod (ou similar)
- RBAC funcional: buscar role real do banco no contexto da API
- RLS habilitado em todas as tabelas com dados pessoais
- Audit logs para operações sensíveis (create, update, delete, login, export)
- `npm audit` no CI/CD — falhar em vulnerabilidades HIGH/CRITICAL
- TypeScript strict (`noImplicitAny`, `strictNullChecks`)
- Conexão com banco recria quando DATABASE_URL muda (evita cache de senha antiga)

### Checklist pré-deploy
```
□ Nenhuma credencial hardcoded
□ Nenhum fallback de secret
□ RLS em todas as tabelas com PII
□ RBAC busca role do banco
□ Rate limiting ativo
□ Headers de segurança configurados
□ npm audit limpo
□ Audit logs funcionando
□ .env não está no git
□ VPS: PostgreSQL NÃO exposto na internet (porta 5432 fechada)
□ VPS: Firewall UFW ativo (só 22 e 443 abertos)
□ VPS: Fail2Ban configurado
□ VPS: Senha do PostgreSQL forte (20+ caracteres)
```

### Headers HTTP padrão
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

### Rate limiting padrão
- Geral: 100 req/15min por IP
- Auth: 10 req/15min por IP
- Rotas sensíveis: 30 req/1min por usuário (token)

### 🔒 Segurança de VPS / Banco Próprio
> **Referência:** `docs/hardening-vps-cnefe.md`

#### 🚫 PROIBIDO em VPS
1. **NUNCA** deixar PostgreSQL (porta 5432) acessível da internet
2. **NUNCA** usar senhas fracas no PostgreSQL (ex: `senha123`)
3. **NUNCA** usar `0.0.0.0/0` no `pg_hba.conf`
4. **NUNCA** commitar `CNEFE_DATABASE_URL` com credenciais reais

#### ✅ Obrigatório em VPS
- PostgreSQL só escuta em `127.0.0.1` (localhost)
- Firewall UFW: apenas portas 22 (SSH) e 443 (HTTPS) abertas
- Fail2Ban para bloquear IPs suspeitos
- Senha do PostgreSQL: mínimo 20 caracteres, aleatória
- Acesso remoto via API proxy (HTTPS) ou VPN, nunca direto no banco
- Cloudflare Tunnel (recomendado) para esconder IP da VPS

#### Arquitetura segura recomendada
```
Vercel → HTTPS → API Proxy (VPS:443) → localhost → PostgreSQL (VPS:5432)
```

---

## 🎨 Regras de Design UX/UI (aplicáveis a todos os projetos)

### Design System Base
- **shadcn/ui** como biblioteca principal de componentes
- **Tailwind CSS** para estilização
- **Radix UI** como base de acessibilidade
- **Lucide React** para ícones

### Botões de Ação — REGRAS OBRIGATÓRIAS

#### PROIBIDO: Dropdown de 3 pontinhos (MoreHorizontal)
- **NUNCA** usar `<DropdownMenu>` com `<MoreHorizontal>` para esconder ações
- Todas as ações devem ser botões de ícone visíveis diretamente
- Sem exceções — mesmo que "fique muitos botões", eles devem estar visíveis

#### Visibilidade
- **Sempre visíveis** — nunca usar `opacity-0` + `group-hover:opacity-100`
- Botões de ação devem estar disponíveis imediatamente, sem precisar de hover

#### Cores por Ação (sempre com fundo)
| Ação | Cor de Fundo | Cor do Ícone | Hover |
|---|---|---|---|
| Editar | `bg-blue-50` | `text-blue-600` | `hover:bg-blue-100` |
| Excluir/Recusar | `bg-red-50` | `text-red-600` | `hover:bg-red-100` |
| Aprovar/Confirmar | `bg-green-50` | `text-green-600` | `hover:bg-green-100` |
| Ver/Preview | `bg-slate-50` | `text-slate-600` | `hover:bg-slate-100` | Ícone `Eye` |
| Link/Afiliar | `bg-purple-50` | `text-purple-600` | `hover:bg-purple-100` |

#### Layout — Botões com Texto (padrão preferido)
- **Sempre com texto + ícone**, nunca ícone sozinho
- Empilhados verticalmente (`flex-col gap-1`) na coluna de ações
- Tamanho compacto: `text-[10px] font-medium`, padding `px-1.5 py-0.5`
- Ícone `w-3 h-3` à esquerda do texto
- Exemplo:
  ```tsx
  <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded">
    <Pencil className="w-3 h-3"/>Editar
  </button>
  ```

#### Exceção: Cards Kanban
- No kanban o espaço é limitado — manter ícones com fundo colorido fixo
- Mas sempre com `title="Descrição da ação"` para acessibilidade

### Tabelas — Posicionamento Unificado
- **Coluna de Ações na primeira posição** (antes do nome)
- **TODAS as ações na mesma coluna** — não separar em colunas diferentes
- Pendentes: botões empilhados verticalmente (Aprovar em cima, Recusar embaixo)
- Normais: botões empilhados verticalmente (Ver, Editar, Link, Excluir)
- Status com badges coloridos: `ativo`=verde, `pendente`=âmbar, `inativo`=cinza
- **NUNCA** deixar coluna vazia no final da tabela
- **Hover azul**: `hover:bg-blue-50/50` em todas as linhas de tabela
- **Clique na linha** → abre preview/detalhes (quando aplicável)
- Botões de ação usam `stopPropagation` para não disparar o clique da linha

### Cards/Preview/Detalhes
- Botões no canto superior direito
- Sempre visíveis (sem hover)
- Mesmas cores da tabela
- **Sempre com texto + ícone** (exceto kanban por limitação de espaço)
- Ações principais: Editar, Excluir, Link (quando aplicável), Fechar

### Abas/Filtros
- **"Todos"** → mostra todos os itens (incluindo pendentes)
- **"Pendentes"** → mostra só itens com status pendente
- Badge com contador quando houver pendentes

### Modal/Dialog
- Cancelar: `variant="outline"`
- Confirmar/Salvar: `bg-blue-600 hover:bg-blue-700`
- Excluir: `bg-red-600 hover:bg-red-700`
- Aprovar: `bg-green-600 hover:bg-green-700`

### Cores do Projeto (Tailwind)
| Uso | Cor |
|---|---|
| Primária (ações principais) | `blue-600` |
| Sucesso | `green-600` |
| Perigo/Excluir | `red-600` |
| Aviso/Pendente | `amber-600` |
| Líder | `purple-600` |
| Texto principal | `slate-800` |
| Texto secundário | `slate-500` |
| Fundo página | `slate-50` |
| Fundo card | `white` |

### Espaço e Layout
- **Zero espaços vazios sem função** — todo espaço deve ter propósito
- **Paddings proporcionais** — `py-10` a `py-14` é suficiente
- **Hero compacto** — altura definida pelo conteúdo, não pela tela
- **Conteúdo acima do fold** — usuário deve ver valor em 3 segundos

### Conversão e Copywriting
- **Headline na dor** — falar o problema que resolve
- **Antes vs Depois** — mostrar transformação real
- **CTA claro e repetido** — botão principal em hero, meio e final
- **Prova social no hero** — números, avatares, cargos reais

### Mobile-First
- **Touch targets mínimos** — 44px de altura
- **Stack vertical** — em mobile, tudo empilha
- **Menu hambúrguer** — navegação escondida em telas pequenas
- **Fontes legíveis** — mínimo 16px para inputs, 14px para texto corrido
