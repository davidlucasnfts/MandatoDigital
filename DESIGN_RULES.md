# 🎨 Regras de Design UX/UI — Reutilizáveis

> Aplicáveis a **qualquer projeto** (SaaS, landing page, dashboard, app mobile)

---

## 1. Espaço e Layout

| Regra | O que fazer | O que evitar |
|---|---|---|
| **Zero espaços vazios** | Todo espaço tem propósito: conteúdo, respiro proporcional ou separação | Grandes áreas sem nada, apenas "para encher" |
| **Paddings proporcionais** | `py-10` a `py-14` é suficiente para maioria das seções | `py-20`, `py-28`, `min-h-screen` sem necessidade real |
| **Hero compacto** | Altura definida pelo conteúdo, não pela tela | `min-h-screen` que força rolagem desnecessária |
| **Conteúdo acima do fold** | Usuário deve ver valor em 3 segundos, sem rolar | Esconder CTA, headline ou prova social no final da tela |

## 2. Conversão e Copywriting

| Regra | Exemplo bom | Exemplo ruim |
|---|---|---|
| **Headline na dor** | "Nunca mais perca um voto por esquecimento" | "Gestão política inteligente" |
| **Antes vs Depois** | "Planilha → Digital", "Esquecia → Lembra automático" | Lista genérica de features |
| **Depoimentos com resultado** | "15% mais votos", "Economizei 10h por semana" | "Ótimo produto, recomendo" |
| **CTA claro e repetido** | Botão principal em hero, meio e final da página | Só um CTA escondido no footer |
| **Prova social no hero** | "350+ parlamentares", avatares com cargos | Números genéricos sem contexto |

## 3. Visual e Componentes

| Regra | O que fazer | O que evitar |
|---|---|---|
| **Cores distintas por card** | Cada feature com cor própria (azul, verde, roxo...) | Tudo cinza ou tudo azul |
| **Placeholder visual** | Ícone grande + cor de fundo quando não há imagem | Espaço vazio ou "imagem não encontrada" |
| **Botões sempre visíveis** | Fundo sólido ou transparente com borda, nunca branco sobre branco | Botão que some no fundo |
| **Transições suaves** | Header que muda de cor ao rolar, cards com hover | Mudanças bruscas ou sem feedback |

## 4. Mobile-First

| Regra | O que fazer |
|---|---|
| **Touch targets mínimos** | Botões e links com pelo menos 44px de altura |
| **Stack vertical** | Em mobile, tudo empilha: texto acima, imagem abaixo |
| **Menu hambúrguer** | Navegação escondida em telas pequenas, nunca quebrada |
| **Fontes legíveis** | Mínimo 16px para inputs, 14px para texto corrido |

---

**Como usar em outros projetos:**
1. Copie este arquivo para a pasta raiz do novo projeto
2. Ou cole o conteúdo no `AGENTS.md` ou `MEMORY.md` do novo projeto
3. Eu leio automaticamente e aplico em todas as decisões de design
