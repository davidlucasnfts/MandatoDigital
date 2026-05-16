# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 16/05/2026
> **Sessão atual:** Geocodificação 100% CNEFE — remove Nominatim

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE) + Vercel

---

## Última funcionalidade trabalhada
**Geocodificação 100% CNEFE — remove dependência do Nominatim** — 16/05

### O que mudou:
1. **Remove Nominatim completamente** — agora usa apenas dados próprios na VPS
2. **CNEFE como única fonte** — sem fallback externo
3. **Busca por CEP + logradouro** — filtra por nome do logradouro (sem tipo) para maior precisão
4. **Remove `geocodeNominatimFallback`** — função não mais necessária
5. **Simplifica `geocodeCep`** — chama API CNEFE, retorna null se não encontrar

### Arquivos modificados:
- `api/cnefe-router.ts` — remove Nominatim, busca apenas CNEFE
- `src/lib/geocoding.ts` — remove Nominatim, simplifica geocodeCep
- `api/lib/env.ts` — mantém `cnefeDatabaseUrl`
- `api/queries/connection.ts` — mantém `getCnefeDb()`
- `src/components/NovoEleitorDialog.tsx` — CEP com onBlur + geocodeCep
- `src/components/IconPicker.tsx` — fix tipagem lucide-react

---

## Funcionalidade entregue nesta sessão
**Geocodificação 100% CNEFE — remove Nominatim** — 16/05

---

## Decisões pendentes (ação manual necessária)

### ⚠️ CNEFE com múltiplos registros para mesmo CEP
**Problema:** O CNEFE tem registros duplicados para o mesmo CEP em bairros diferentes (ex: CEP 65057-060 tem registros no Centro e no João de Deus).

**Status:** Implementamos filtro por logradouro para tentar pegar o correto, mas ainda pode retornar o registro errado se houver múltiplas ruas com nomes similares.

**Onde fazer:** VPS HostUp — verificar qualidade dos dados importados
**Como fazer:** Rodar query SQL para identificar CEPs com coordenadas muito dispersas

### ⚠️ Geocodificação por número da casa
**Decisão:** Não implementamos geocodificação precisa por número de casa. O CNEFE só tem coordenadas de nível de rua.

**Opções para o futuro:**
1. Usar Google Maps Geocoding API (pago)
2. Usar Here Maps API (tem tier gratuito)
3. Aceitar precisão de rua do CNEFE

---

## Próximo passo definido
**Aguardando definição do David** — opções:
1. Melhorar precisão do CNEFE (identificar/registrar CEPs problemáticos)
2. Implementar geocodificação por número (API paga)
3. Outra funcionalidade

---

## Bloqueios
Nenhum.

---

## Contexto técnico atual

### Banco CNEFE (VPS HostUp)
- **Total de registros:** ~7.6 milhões (CE + MA)
- **CE:** 4.537.155 registros
- **MA:** 3.086.449 registros
- **Problema conhecido:** CEPs duplicados em bairros diferentes

### Arquivos principais (geocodificação)
- `api/cnefe-router.ts` — router tRPC para buscas CNEFE
- `src/lib/geocoding.ts` — funções frontend de geocodificação
- `api/queries/connection.ts` — `getCnefeDb()` para conexão VPS
- `src/components/NovoEleitorDialog.tsx` — form com CEP + onBlur
