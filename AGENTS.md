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
- **SENHA do PostgreSQL: nunca usar caracteres especiais que quebram URL** (`!`, `@`, `#`, `$`, `%`, `&`, `*`, `(`, `)`, `+`, `=`, `[`, `]`, `{`, `}`, `|`, `\`, `:`, `;`, `"`, `'`, `<`, `>`, `,`, `?`, `/`, ` `)
  - Se a senha já existir com caracteres especiais, codificar com `encodeURIComponent()` antes de montar a `DATABASE_URL`
  - Exemplo de senha segura: `Mandato2026SeguroXYZ` (apenas letras e números)
  - O `api/lib/env.ts` deve sempre codificar a senha antes de passar para o cliente postgres

### Economia de Tokens
- **Leitura única** — ler arquivo 1x, fazer todas as mudanças na memória, escrever 1x
- **StrReplaceFile preferido** — só substituir o trecho que muda, não reescrever arquivo inteiro
- **Commits agrupados** — uma única chamada de commit com todas as mudanças
- **Push somente no final da sessão** — quando o usuário pedir para encerrar. Durante a sessão, commit local apenas
- **Sem prints desnecessários** — resultado direto, sem mostrar código que já foi visto

### Checklist Pré-Commit Obrigatório (executar ANTES de todo commit/push)

> **Regra de Ouro:** Nunca commitar sem passar por este checklist. Um item não verificado = commit bloqueado.

```
□ 1. ROTAS DE TESTE — Verificar App.tsx
   grep -n "teste-\|PageV[0-9]\|V[0-9]" src/App.tsx
   → Se encontrar rotas de teste (ex: /teste-v3, /PageV2), REMOVER antes do commit
   → Exceção: /teste-here (API Here legítima)

□ 2. LINKS DE TESTE — Verificar DashboardLayout.tsx  
   grep -in "teste\|V[0-9]" src/components/DashboardLayout.tsx
   → Se encontrar links de teste no sidebar (ex: "Solicitações V3"), REMOVER antes do commit

□ 3. ARQUIVOS ORFÃOS — Verificar se há arquivos .tsx não importados
   → Arquivos de teste (PageV1, V2, V3) que não têm rota = código morto
   → Perguntar ao usuário se quer manter ou deletar

□ 4. TYPE CHECK — Executar npx tsc --noEmit
   → Deve passar sem erros. Zero tolerância para erros de TypeScript.

□ 5. DOCUMENTAÇÃO — Atualizar MEMORY.md e SESSION-CONTEXT.md
   → Funcionalidade entregue está na tabela de entregues?
   → Resumo da sessão está detalhado?
   → SESSION-CONTEXT.md reflete o estado atual?

□ 6. SELF-HEALING — Novo erro aprendido?
   → Se descobriu uma nova armadilha, adicionar à tabela de erros no AGENTS.md
   → Número sequencial (036, 037, etc.)
```

### Erros que este checklist previne (casos reais)
| # | Erro que passou | Causa | Como o checklist evita |
|---|---|---|---|
| 036 | Rota /solicitacoes/teste-v3 subiu em produção | Esqueci de remover do App.tsx | Checklist item 1: grep em App.tsx |
| 037 | Link "Solicitações V3" no sidebar em produção | Esqueci de remover do DashboardLayout.tsx | Checklist item 2: grep em DashboardLayout.tsx |
| 038 | Arquivo SolicitacoesPageV3.tsx modificado mas sem rota | Editei arquivo órfão em vez da página principal | Checklist item 3: verificar arquivos importados |
| 039 | Commit sem type check | Pressa para entregar | Checklist item 4: tsc --noEmit obrigatório |

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
| Padrão para todos os projetos | `MestreProjects/` (pasta) | Dentro de projeto |
| Mudança em segurança | `AGENTS.md` + `MestreProjects/02-seguranca.md` | Arquivo isolado |
| Estrutura de documentação | `docs/documentacao-estrutura.md` | Outro lugar |

**Checklist antes de finalizar qualquer tarefa:**
```
□ A informação está no arquivo correto (ver tabela acima)?
□ Não existe outro arquivo com a mesma função?
□ Se modifiquei um arquivo, atualizei todos que referenciam ele?
□ Se criei arquivo novo, adicionei no docs/documentacao-estrutura.md?
□ Se deletei arquivo, removi referências em todos os docs?
□ Atualizei MEMORY.md com a nova funcionalidade/melhoria?
□ Verifiquei se todas as melhorias do commit estão no MEMORY.md?
```

### Regra de Ouro — Documentação de Funcionalidades
- **APÓS CADA funcionalidade validada e funcionando**, anotar imediatamente no `MEMORY.md`
- **NUNCA** deixar para o final da sessão — anotar no momento da entrega
- **VERIFICAR** commit por commit se todas as melhorias estão documentadas
- **RESUMO DETALHADO** no final da sessão com todas as correções e melhorias técnicas

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

> **Fonte única:** `MestreProjects/12-self-healing.md`
>
> Todos os erros e prevenções estão centralizados no arquivo global.
> Nunca duplicar — sempre atualizar a fonte única.
>
> [Ver erros registrados e prevenções →](../../../MestreProjects/12-self-healing.md)

### Checklist Obrigatório (executar antes de QUALQUER ação)

```
□ 1. Já existe arquivo com essa função? (ver docs/documentacao-estrutura.md)
□ 2. Estou no diretório correto? (nunca modificar fora do working dir sem confirmar)
□ 3. Vou usar StrReplaceFile ou WriteFile? (preferir StrReplaceFile sempre)
□ 4. Se criar arquivo novo, adicionei no docs/documentacao-estrutura.md?
□ 5. Se modificar arquivo, atualizei todos que referenciam ele?
□ 6. Onde devo salvar? AGENTS.md (projeto) ou MestreProjects/ (global)?
□ 7. Execute npm run check após mudanças?
```

### Regras de Ouro (nunca quebrar)

1. **NUNCA** criar arquivo de documentação sem verificar se função já existe
2. **NUNCA** usar `WriteFile overwrite` em arquivos fora do working directory
3. **NUNCA** duplicar informação entre arquivos
4. **NUNCA** salvar no `MestreProjects/` sem explicitamente ser "para todos os projetos"
5. **SEMPRE** executar checklist antes de criar/modificar/deletar
6. **SEMPRE** preferir `StrReplaceFile` sobre `WriteFile`
7. **SEMPRE** consultar `docs/documentacao-estrutura.md` antes de nova documentação

---

## 📋 Padrão de Preview/Detalhes (Cards Expandidos)

> **Regra obrigatória:** Todos os previews de itens selecionados devem seguir o mesmo padrão visual

### Estrutura do Preview

```tsx
{selecionado && (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* HEADER: Avatar/Ícone + Título + Badges + Ações */}
      <div className="p-4 lg:p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Círculo colorido com ícone ou ranking */}
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-xxx-100">
              <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-xxx-600" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-800">{nome}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {/* Badges de status */}
              </div>
            </div>
          </div>
          {/* Ações: botões sólidos, empilhados verticalmente */}
          <div className="flex flex-col gap-2">
            <button className="bg-blue-600 text-white...">Editar</button>
            <button className="bg-red-600 text-white...">Excluir</button>
          </div>
        </div>
        {/* Descrição abaixo do header, se houver */}
        {descricao && <p className="text-sm text-slate-500 mt-3">{descricao}</p>}
      </div>

      {/* GRID DE DETALHES: 2 colunas mobile, 3 desktop */}
      <div className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Cada campo com label em text-slate-400 + valor */}
      </div>

      {/* AÇÕES SECUNDÁRIAS (opcional): toggle de status, etc */}
    </div>

    {/* Botão Fechar centralizado */}
    <div className="flex justify-center">
      <button className="bg-slate-100 text-slate-600...">
        <ChevronDown />Fechar
      </button>
    </div>
  </motion.div>
)}
```

### Regras Visuais

| Elemento | Padrão |
|----------|--------|
| Ícone/Avatar | Círculo `w-14 h-14` com fundo colorido (cor da entidade) |
| Título | `text-lg lg:text-xl font-bold text-slate-800` |
| Badges | Abaixo do título, flex-wrap gap-2 |
| Ações | Coluna direita, botões empilhados, **todos sólidos** |
| Descrição | Abaixo do header, `text-sm text-slate-500 mt-3` |
| Grid detalhes | `grid-cols-2 lg:grid-cols-3 gap-4` |
| Labels | `text-[10px] font-semibold text-slate-400 uppercase` |
| Valores | `text-sm font-medium text-slate-800` |
| Botão Fechar | Centralizado, `ChevronDown`, `bg-slate-100` |

### Exemplos no projeto
- **LíderesProdutividadePage.tsx** — preview de líder (referência correta)
- **SolicitacoesPageV3.tsx** — preview de solicitação

### Anti-padrões (nunca fazer)
- ❌ Ícone pequeno (w-8) no lugar do círculo grande
- ❌ Ações com estilos misturados (sólido + outline)
- ❌ Descrição no mesmo nível do título (sem mt-3)
- ❌ Grid assimétrico (1+2, 2+1)
- ❌ Labels em text-slate-500 (deve ser 400)

---

## 🔄 Padrão de Refatoração — Páginas de Teste

> **Regra obrigatória:** SEMPRE criar página de teste ao refatorar páginas existentes

### Quando usar
- Refatorar página existente (aplicar Design System, melhorar layout, etc.)
- Criar nova versão de página já funcional
- Testar melhorias antes de aplicar na página principal

### Passo a passo

1. **Criar página de teste**
   - Nomear como `{Nome}PageV3.tsx` (ou V2, V4, etc.)
   - Salvar em `src/pages/`
   - Copiar lógica da página original, aplicar melhorias

2. **Adicionar rota em `App.tsx`**
   ```tsx
   import MapaPageV3 from '@/pages/MapaPageV3';
   // ...
   <Route path="mapa/teste-v3" element={<MapaPageV3 />} />
   ```

3. **Adicionar link temporário no sidebar (`DashboardLayout.tsx`)**
   ```tsx
   { to: '/dashboard/mapa/teste-v3', icon: MapPin, label: 'Mapa V3', end: true },
   ```
   - Usar `end: true` para evitar conflito com rota pai (`/mapa`)
   - Colocar logo abaixo da página original

4. **Testar localmente**
   - `npm run dev`
   - Acessar via sidebar ou URL direta
   - Comparar com versão original

5. **Aprovação do usuário**
   - Só aplicar na página principal após aprovação explícita
   - Depois de aprovado: copiar conteúdo da V3 para página original
   - Remover rota de teste e link do sidebar

### Exemplos no projeto
| Página Original | Página Teste | Rota | Status |
|-----------------|--------------|------|--------|
| `MapaPage.tsx` | `MapaPageV1.tsx` | `/dashboard/mapa/teste-v1` | Em teste |
| `DashboardHome.tsx` | `DashboardV2.tsx` | `/dashboard/teste-v2` | Arquivado |
| `EleitoresPage.tsx` | `EleitoresPageV2.tsx` | `/dashboard/eleitores-v2` | Removido |

---

## 🛠️ Skills Disponíveis (quando usar)

> **Skills globais:** `C:\Users\David Lucas\.kimi\skills\` (50 skills)
> **Referência completa:** `C:\Users\David Lucas\Documents\PROJETOS IA\MestreProjects\10-skills.md`

### Skills aplicáveis a este projeto
| Skill | Quando usar |
|-------|-------------|
| **security** | Revisão de segurança, auditoria |
| **frontend-design** | Design de UI, componentes |
| **ux-ui-designer** | Experiência do usuário |
| **scalability** | Performance, otimização |
| **cost-reducer** | Reduzir custos de infra |
| **self-healing** | Debugging, prevenção de erros |
| **react-frontend** | Desenvolvimento React |
| **diagrama-er** | Documentar schema do banco |
| **diagramas-estado** | Ciclos de vida |
| **diagramas-sequencia** | Fluxos complexos |
| **testes** | Estratégia de testes |
| **user-stories** | Decompor funcionalidades |
| **regras-de-negocio** | Documentar regras do domínio |
| **c4-model** | Documentar arquitetura |
| **runbook** | Procedimentos operacionais |
| **arquiteto-solucoes** | Decisoes arquiteturais, trade-offs |
| **arquiteto-postgresql** | Modelagem, performance, HA |
| **engenheiro-dba** | DDL, migrations, padronizacao |
| **analista-de-negocio** | Levantamento de requisitos |
| **technical-writer** | Documentacao tecnica, runbooks |

### Skills NÃO aplicáveis
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
| devops | Sem infra própria |
| engenheiro-devops | Sem infra própria |
| engenheiro-kubernetes-docker | Vercel serverless, não K8s |
| design-patterns | Não aplicável no momento |

---

## 🔒 Segurança — Regras Obrigatórias (aplicáveis a todos os projetos)

> **Referência técnica:** `docs/adr-005-seguranca-padrao.md`
> **Referência global:** `C:\Users\David Lucas\Documents\PROJETOS IA\MestreProjects\02-seguranca.md`

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

| 012 | Testar na produção em vez de local primeiro | 22/05/2026 | SEMPRE testar localmente (`npm run dev`) antes de qualquer deploy. Produção é só para código validado |
| 013 | Ícones inexistentes causando crash no build | 25/05/2026 | SEMPRE verificar se o ícone existe em `src/lib/icons.ts` antes de usar. Nunca assumir que o nome do Tabler = nome do export |
| 014 | Cards com alturas diferentes no mesmo grid | 25/05/2026 | SEMPRE usar `h-full` em cards do mesmo grid. Manter consistência visual — se um card tem header+content, todos devem ter |
| 015 | Espaço vazio sem função em cards | 25/05/2026 | SEMPRE questionar: "esse espaço tem propósito?". Zero espaços vazios sem função. Conteúdo deve preencher o card naturalmente |
| 016 | Layout assimétrico sem necessidade | 25/05/2026 | SEMPRE preferir grids simétricos (2, 3, 4 colunas). Evitar 1+2, 2+1, etc. A menos que o conteúdo justifique |
| 017 | Nomes de ícones duplicados no export | 25/05/2026 | SEMPRE verificar se o alias já existe antes de adicionar novo ícone em `src/lib/icons.ts`. Nunca duplicar exports |
| 018 | Cache do Vite impedindo atualizações | 25/05/2026 | SEMPRE limpar `node_modules/.vite` quando o código não refletir as mudanças. Ou usar Ctrl+Shift+R no navegador |
| 019 | Componentes com estruturas diferentes no mesmo grid | 25/05/2026 | SEMPRE manter consistência: se os cards de stats têm só CardContent, o Meta também deve ter só CardContent. Nunca misturar CardHeader+CardContent com só CardContent no mesmo grid |
| 020 | Não verificar responsividade em múltiplos breakpoints | 25/05/2026 | SEMPRE testar em: mobile (375px), tablet (768px), desktop (1440px). Nunca assumir que funciona em todos |
| 021 | Não consultar Design System antes de criar componentes | 25/05/2026 | SEMPRE verificar `AGENTS.md` regras de design antes de criar novos componentes. Consistência > criatividade |
| 022 | Esquecer de criar página de teste ao refatorar | 26/05/2026 | SEMPRE que refatorar uma página existente, criar versão V3 (ou V2) como página de teste. Adicionar rota em `App.tsx` e link temporário no `DashboardLayout.tsx`. Nunca sobrescrever página principal sem teste prévio |
| 023 | Rotas de teste em produção | 01/06/2026 | SEMPRE remover rotas de teste do `App.tsx` e links do `DashboardLayout.tsx` antes de commitar. Páginas de teste são locais — nunca devem ter URL pública em produção |
| 024 | Esquecer de reativar páginas de teste na próxima sessão | 01/06/2026 | SEMPRE verificar `SESSION-CONTEXT.md` → "Páginas de Teste Disponíveis" ao iniciar sessão. Oferecer reativar rotas de teste se o usuário quiser continuar testando algo da sessão anterior |
| 025 | Editar página principal diretamente sem passar pela de teste | 01/06/2026 | SEMPRE editar a página de teste (V2/V3) primeiro, validar visualmente, e SÓ ENTÃO copiar o conteúdo para a página principal. Nunca editar a página de produção diretamente — sempre mantenha a versão de teste como "rascunho" até aprovação |
| 026 | Ícones SVG com fill branco em fundo colorido não aparecem | 01/06/2026 | SEMPRE usar a cor do tema (ex: `#2563eb`, `#16a34a`) no fill/stroke de SVGs que ficam em círculos coloridos. Nunca usar `fill="white"` quando o fundo é colorido — o ícone some no fundo branco do círculo |
| 027 | Leaflet z-index cobrindo menu mobile | 01/06/2026 | SEMPRE definir `zIndex` baixo (1) no MapContainer e `isolate` no container pai. Elementos internos do mapa (botões, legendas) usam z-30 máximo. Menu mobile usa z-50 — nunca deixar mapa cobrir menu |
| 028 | Anchor de marcador no centro cobre a rua/endereço | 01/06/2026 | SEMPRE definir `iconAnchor` na BASE do marcador (ex: `[16, 30]` para sticker 32px), não no centro (`[16, 16]`). A ponta do marcador deve tocar o endereço, o corpo deve ficar acima |
| 029 | Clusters múltiplos sobrepostos confundem o usuário | 01/06/2026 | SEMPRE considerar cluster único quando múltiplos tipos (eleitor/líder/comunidade) podem estar no mesmo ponto. Clusters separados ficam um em cima do outro e o usuário não entende o que significa |
| 030 | Página de teste sem rota não pode ser acessada | 01/06/2026 | SEMPRE manter rota de teste ativa durante desenvolvimento. Quando o usuário pedir para "subir versão teste", reativar rota em `App.tsx` + link no `DashboardLayout.tsx`. Remover antes do commit final |
| 031 | Preview inline em Kanban fica ilegível | 01/06/2026 | NUNCA expandir preview/detelhes inline dentro de uma coluna de Kanban. Colunas são muito estreitas (~200px). Sempre usar modal central ou drawer lateral para preview em Kanban |
| 032 | Overlay de modal misturado com conteúdo | 01/06/2026 | SEMPRE separar overlay do modal em elementos distintos. Overlay: `fixed inset-0 bg-black/40` (sem padding). Modal container: `fixed inset-0 flex items-start justify-center` (com padding). Nunca misturar no mesmo container flex |
| 033 | `break-words` quebra texto longo sem espaço em 1 palavra/linha | 01/06/2026 | Para textos longos SEM espaços (ex: testes, URLs, hashes), usar `break-all` em vez de `break-words`. O `break-words` só quebra em hífen/espaço; sem eles, cada caractere vira uma "palavra" e quebra linha a cada caractere |
| 034 | Tabela mobile duplicada embutida na página | 01/06/2026 | SEMPRE usar componente unificado para mobile/desktop com classes responsivas (`hidden sm:block` / `sm:hidden`). NUNCA duplicar tabelas mobile/desktop embutidas na mesma página — código duplicado diverge e causa bugs |
| 035 | Status "excluido" não existe no banco | 01/06/2026 | SEMPRE verificar constraint CHECK do banco antes de definir status. Se o banco só permite ('pendente','andamento','concluido','cancelado'), nunca tentar usar 'excluido'. Excluir = mudar status para 'cancelado' |
| 036 | Rota de teste subiu em produção | 01/06/2026 | SEMPRE executar checklist pré-commit item 1: `grep -n "teste-\|PageV[0-9]" src/App.tsx`. Se encontrar rotas de teste, REMOVER antes do commit. Nunca assumir que "já foi removido" |
| 037 | Link de teste no sidebar em produção | 01/06/2026 | SEMPRE executar checklist pré-commit item 2: `grep -in "teste\|V[0-9]" src/components/DashboardLayout.tsx`. Links de teste no sidebar devem ser removidos junto com as rotas |
| 038 | Arquivo órfão modificado sem efeito | 01/06/2026 | SEMPRE verificar se o arquivo editado é realmente importado pela aplicação. `SolicitacoesPageV3.tsx` não tinha rota mas foi editado — mudanças não apareciam na produção. Editar só a página principal após aprovação |
| 039 | Commit sem type check | 01/06/2026 | SEMPRE executar `npx tsc --noEmit` antes de TODO commit. TypeScript strict não perdoa. Um erro de tipo em produção = tela branca para o usuário |
