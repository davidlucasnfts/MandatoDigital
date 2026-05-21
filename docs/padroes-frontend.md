<!-- 20/05/2026 - Padroes de frontend do projeto -->

# Padroes de Frontend — Mandato Digital

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | React 18 |
| Build | Vite |
| Estilo | Tailwind CSS |
| Componentes UI | shadcn/ui |
| Icones | Lucide React |
| Estado | React hooks (local) + tRPC (servidor) |
| Formularios | React Hook Form + Zod (via shadcn Form) |
| Roteamento | React Router 6 |
| HTTP | tRPC (Axios para APIs externas) |

## Regras de Componentes

### 1. Estrutura de Pastas

```
src/
  components/
    ui/              # shadcn/ui — NAO EDITAR
    forms/           # Formularios compostos reutilizaveis
    layout/          # DashboardLayout, Header, Sidebar
    features/        # Componentes especificos de dominio
      enquetes/
      eleitores/
      proposicoes/
  pages/             # Uma pagina por rota
  hooks/             # Custom hooks (useAuth, useEleitores, etc.)
  lib/               # Configuracoes (trpc, utils)
  types/             # Tipos TypeScript
```

### 2. Componentes Funcionais

```tsx
// ✅ Correto — interface separada, export nomeado
interface BadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'error'
}

export function Badge({ label, variant = 'success' }: BadgeProps) {
  // ...
}

// ❌ Incorreto — type inline, export default
export default function({ label }: { label: string }) {
  // ...
}
```

### 3. Hooks Customizados

- Sempre prefixo `use`
- Retornar objeto, nunca array
- Isolar efeitos colaterais

```tsx
// hooks/useEnquetes.ts
export function useEnquetes(filtros?: { status?: string }) {
  return trpc.enquetes.list.useQuery(filtros)
}
```

### 4. Formularios

- Usar `shadcn/ui` Form (React Hook Form + Zod)
- Validacao Zod no frontend E backend (tRPC input)
- Mensagens de erro em portugues

```tsx
const formSchema = z.object({
  titulo: z.string().min(1, 'Titulo e obrigatorio').max(500),
  descricao: z.string().optional(),
})
```

### 5. Botões de Acao (regra do AGENTS.md)

- **NUNCA** usar dropdown de 3 pontinhos
- Sempre visiveis, com texto + icone
- Cores por acao:

| Acao | Cor |
|------|-----|
| Editar | bg-blue-50 text-blue-600 |
| Excluir | bg-red-50 text-red-600 |
| Aprovar | bg-green-50 text-green-600 |
| Ver | bg-slate-50 text-slate-600 |

### 6. Tabelas

- Coluna de acoes na **primeira posicao**
- Acoes empilhadas verticalmente (`flex-col gap-1`)
- Hover azul: `hover:bg-blue-50/50`
- Clique na linha abre preview

### 7. Dialogs/Modais

- Cancelar: `variant="outline"`
- Salvar: `bg-blue-600 hover:bg-blue-700`
- Excluir: `bg-red-600 hover:bg-red-700`

### 8. Seguranca

- Nunca `dangerouslySetInnerHTML` com dados do usuario
- Variaveis `VITE_*` sao publicas — nunca secrets
- Token JWT em memoria (via tRPC context)

## Checklist de Novo Componente

- [ ] Props com interface tipada
- [ ] Export nomeado (nao default)
- [ ] Usa shadcn/ui quando possivel
- [ ] Acessibilidade: labels, aria quando necessario
- [ ] Responsivo (mobile-first)
