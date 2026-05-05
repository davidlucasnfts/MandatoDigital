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

---

## 🎨 Regras de Design UX/UI (aplicáveis a todos os projetos)

### Espaço e Layout
- **Zero espaços vazios sem função** — todo espaço deve ter propósito: conteúdo, respiro proporcional ou separação visual
- **Paddings proporcionais** — `py-10` a `py-14` é suficiente; nunca `py-20/py-28` sem necessidade
- **Hero compacto** — altura definida pelo conteúdo, não pela tela; remover `min-h-screen`
- **Conteúdo acima do fold** — usuário deve ver valor em 3 segundos, sem rolar

### Conversão e Copywriting
- **Headline na dor** — falar o problema que resolve, não o recurso (ex: "Nunca mais perca um voto" vs "Gestão inteligente")
- **Antes vs Depois** — mostrar transformação real, não só listar features
- **Depoimentos com resultados** — números concretos ("15% mais votos", "10h economizadas")
- **CTA claro e repetido** — botão principal em hero, meio e final da página
- **Prova social no hero** — números, avatares, cargos reais para credibilidade imediata

### Visual e Componentes
- **Cores distintas por card** — facilita scan visual e memorização
- **Placeholder visual** — quando não há imagem, usar ícone grande com cor de fundo
- **Botões sempre visíveis** — fundo sólido ou transparente com borda, nunca branco sobre branco
- **Transições suaves** — header que muda de cor ao rolar, cards com hover

### Mobile-First
- **Touch targets mínimos** — botões e links com pelo menos 44px de altura
- **Stack vertical** — em mobile, tudo empilha: texto acima, imagem abaixo
- **Menu hambúrguer** — navegação escondida em telas pequenas, nunca quebrada
- **Fontes legíveis** — mínimo 16px para inputs, 14px para texto corrido
