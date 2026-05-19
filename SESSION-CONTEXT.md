# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 18/05/2026
> **Sessão atual:** Here API implementada com monitoramento de volume

## Here API — ATIVA
- **Chave:** Configurada no `.env`
- **Status:** Testada e funcionando (precisão de número de casa)
- **Free tier:** 30.000 requisições/mês
- **Monitoramento:** Tela `/admin` com alertas de volume

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE) + Vercel

---

## Última funcionalidade trabalhada
**Correção geocodificação 100% CNEFE** — 18/05

### Problemas identificados e corrigidos:
1. **`geocoding-router.ts` usava `getDb()` (Supabase) em vez de `getCnefeDb()` (VPS)**
   - Como a tabela `cnefe_enderecos` só existe na VPS, a busca retornava vazio
   - Sistema caía no fallback Nominatim, posicionando no centro da cidade
   
2. **`buscarPorCep` retornava apenas 1 registro arbitrário**
   - Agora busca TODOS os registros do CEP e calcula coordenadas médias
   - Mais preciso quando há múltiplos números na mesma rua
   
3. **Frontend `geocoding.ts` usava fetch manual com formato errado**
   - Reescrito com função `trpcCall` que envia `{ json: payload }` no POST
   - Remove import não utilizado do `trpc` React

4. **Nominatim removido completamente**
   - `geocoding-router.ts` agora é 100% CNEFE
   - `geocodeBairro` também usa CNEFE (não Nominatim)

### Arquivos modificados:
- `api/geocoding-router.ts` — `getDb()` → `getCnefeDb()`, remove Nominatim, coordenadas médias
- `api/cnefe-router.ts` — `buscarPorCep` retorna coordenadas médias do CEP
- `src/lib/geocoding.ts` — corrige chamada tRPC com POST + `{ json: payload }`

---

## Funcionalidade entregue nesta sessão
**Correção geocodificação 100% CNEFE** — 18/05

---

## Decisões pendentes (ação manual necessária)

### ⚠️ CNEFE com múltiplos registros para mesmo CEP
**Problema:** O CNEFE tem registros duplicados para o mesmo CEP em bairros diferentes (ex: CEP 65057-060 tem registros no Centro e no João de Deus).

**Status:** Implementamos coordenadas médias do CEP, o que melhora a precisão para ruas com muitos números, mas ainda pode retornar ponto central entre bairros diferentes.

**Onde fazer:** VPS HostUp — verificar qualidade dos dados importados
**Como fazer:** Rodar query SQL para identificar CEPs com coordenadas muito dispersas

### ⚠️ Geocodificação por número da casa
**Decisão:** Implementar Here API para geocodificação precisa (nível de número).

**Plano de migração por volume:**
- 0-30k/mês: Here (grátis) ← ATUAL
- 30k-100k/mês: TomTom (~$54/mês)
- 100k-500k/mês: OpenCage ($50-125/mês fixo)
- 500k+/mês: CSV2GEO ($50-100/mês fixo)

**Monitoramento:** Verificar dashboard Here mensalmente (dia 1)
**Referência:** Ver comparativo completo na seção "Comparativo de Provedores de Geocodificação" abaixo

---

## Próximo passo definido
**Aguardando teste local do David** — rodar `npm run dev` e testar cadastro de eleitor com CEP

---

## Bloqueios
Nenhum.

---

## Comparativo de Provedores de Geocodificação

> **Decisão atual:** Here API (free tier 30k/mês)
> **Próxima revisão:** Quando volume atingir 25.000 requisições/mês

| Volume mensal | Provedor | Custo | Por quê |
|---------------|----------|-------|---------|
| 0 - 30.000 | **Here** | R$ 0 | Free tier generoso, precisão de número |
| 30.001 - 100.000 | **TomTom** | ~$54/mês | Mais barato que Here após free tier |
| 100.001 - 500.000 | **OpenCage** | $50-125/mês | Preço fixo, previsível |
| 500.001+ | **CSV2GEO** | $50-100/mês | Plano fixo ilimitado |

**⚠️ ALERTA:** NÃO usar Mapbox — free tier de 100k é ótimo, mas se ultrapassar 1 requisição, paga $5/1k em tudo (sem gradualidade).

**Monitoramento:** Verificar dashboard Here mensalmente (dia 1) em https://developer.here.com/dashboard

---

## Contexto técnico atual

### Banco CNEFE (VPS HostUp)
- **Status:** VPS reinstalada após ransomware, segurança reforçada
- **PostgreSQL:** Só localhost, senha forte, firewall UFW, fail2ban
- **Tabela:** `cnefe_enderecos` criada, aguardando importação dos dados

### Arquivos principais (geocodificação)
- `api/cnefe-router.ts` — router tRPC para buscas CNEFE
- `api/geocoding-router.ts` — batch geocoding + geocodeBairro (100% CNEFE)
- `src/lib/geocoding.ts` — funções frontend de geocodificação
- `api/queries/connection.ts` — `getCnefeDb()` para conexão VPS
- `src/components/NovoEleitorDialog.tsx` — form com CEP + onBlur
