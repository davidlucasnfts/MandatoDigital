# UX/UI Designer — Regras para Projetos

## Design System Base
- **shadcn/ui** como biblioteca principal de componentes
- **Tailwind CSS** para estilização
- **Radix UI** como base de acessibilidade
- **Lucide React** para ícones

---

## Regras de Botões de Ação

### Visibilidade
- **Sempre visíveis** — nunca usar `opacity-0` + `group-hover:opacity-100`
- Botões de ação devem estar disponíveis imediatamente, sem precisar de hover

### Cores por Ação
| Ação | Cor de Fundo | Cor do Ícone | Hover |
|---|---|---|---|
| Editar | `bg-blue-50` | `text-blue-600` | `hover:bg-blue-100` |
| Excluir/Recusar | `bg-red-50` | `text-red-600` | `hover:bg-red-100` |
| Aprovar/Confirmar | `bg-green-50` | `text-green-600` | `hover:bg-green-100` |
| Visualizar | `bg-slate-50` | `text-slate-600` | `hover:bg-slate-100` |
| Link/Afiliar | `bg-purple-50` | `text-purple-600` | `hover:bg-purple-100` |

### Layout
- Ícones do Lucide React, tamanho `w-3.5 h-3.5` para ações em tabela/card
- Botões em linha com `gap-1` ou `gap-1.5`
- Padding `p-1.5` para botões de ícone
- Bordas arredondadas `rounded`

---

## Regras de Tabelas

### Coluna de Ações
- **Primeira coluna** da tabela (antes do nome)
- Para itens pendentes: botões empilhados verticalmente (Aprovar em cima, Recusar embaixo)
- Para itens normais: botões lado a lado (Editar, Excluir)

### Estados Visuais
- Status com badges coloridos:
  - `ativo` → verde
  - `pendente` → âmbar
  - `inativo` → cinza
  - `concluido` → verde
  - `cancelado` → vermelho

---

## Regras de Cards (Kanban/Grid)

### Ações no Card
- Botões no canto superior direito do card
- Sempre visíveis (sem hover)
- Mesmas cores da tabela

---

## Regras de Abas/Filtros

### Abas Principais
- **"Todos"** → mostra todos os itens (incluindo pendentes)
- **"Pendentes"** → mostra só itens com status pendente
- Badge com contador quando houver pendentes

---

## Regras de Modal/Dialog

### Botões de Ação
- Cancelar: `variant="outline"`
- Confirmar/Salvar: `bg-blue-600 hover:bg-blue-700`
- Excluir: `bg-red-600 hover:bg-red-700`
- Aprovar: `bg-green-600 hover:bg-green-700`

---

## Componentes shadcn/ui Preferidos

| Componente | Uso |
|---|---|
| `Button` | Todas as ações |
| `Card` | Contêineres de conteúdo |
| `Dialog` | Modais |
| `DropdownMenu` | Menu de opções (quando necessário) |
| `Input` | Campos de texto |
| `Label` | Rótulos de formulário |
| `Badge` | Status e tags |
| `Table` | Listagens |

---

## Cores do Projeto (Tailwind)

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
