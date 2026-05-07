# ADR-004: Tailwind CSS + shadcn/ui

**Data:** 2026-05-06
**Status:** Aceita
**Decisores:** David Lucas, Kimi Code

## Contexto

O projeto precisa de uma UI consistente, moderna e acessível, sem investir em um design system próprio. O time é pequeno e precisa de velocidade.

## Decisão

Usar Tailwind CSS para estilização utilitária + shadcn/ui para componentes base (acessibilidade + consistência).

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| Material UI | Maturidade, componentes ricos | Bundle grande, difícil customizar |
| Chakra UI | DX excelente | v3 em beta, mudanças de API |
| Styled Components | Flexibilidade | Runtime overhead, hidratação lenta |
| **Tailwind + shadcn/ui** (escolhido) | Zero runtime, componentes copiáveis, customização total | HTML mais verboso (mitigado com componentes) |

## Consequências

- ✅ Sem runtime de CSS-in-JS (menor bundle, melhor performance)
- ✅ Componentes são código copiado, não dependência — controle total
- ✅ Baseado em Radix UI (acessibilidade garantida)
- ✅ Design system consistente com tokens CSS
- ⚠️ Curva de aprendizado inicial do Tailwind
- ⚠️ Necessidade de disciplina para não criar classes gigantes

## Notas

- Componentes shadcn em `src/components/ui/` nunca devem ser editados
- Customizações devem ser feitas via wrappers ou `cn()`
