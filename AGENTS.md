# COMO TRABALHAR COM O KIMI NESTE PROJETO

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
- **Sem prints desnecessários** — resultado direto, sem mostrar código que já foi visto

### Sincronização de Arquivos de Projeto
- **Sempre atualizar MEMORY.md e roadmap.html** quando uma funcionalidade for adicionada, removida ou concluída
- **Sempre atualizar arquivos mencionados** quando o usuário pedir remoção, alteração ou renomeação de qualquer item
- Nunca deixar arquivo de documentação desatualizado após mudanças no projeto

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
- Normais: botões lado a lado (Editar, Link, Excluir)
- Status com badges coloridos: `ativo`=verde, `pendente`=âmbar, `inativo`=cinza
- **NUNCA** deixar coluna vazia no final da tabela

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
