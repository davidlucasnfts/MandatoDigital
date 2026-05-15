# Decisão Pendente: Estratégia de Geocodificação do Mapa

> **Data:** 15/05/2026
> **Contexto:** Plano Supabase gratuito (500 MB limite). CNEFE completo do Brasil = 1,2 GB.
> **Status:** Aguardando decisão do David.

---

## O Problema

O projeto precisa de dados geoespaciais precisos para posicionar eleitores no mapa. A melhor base disponível é o **CNEFE (IBGE)** — 106 milhões de endereços georreferenciados do Censo 2022 — mas ocupa **1,2 GB**, acima do limite de **500 MB** do plano Supabase gratuito.

---

## Opções Analisadas

### Opção 1: CNEFE de 1-2 estados apenas (RECOMENDADA)
Importar só a UF do mandato. Ex: Acre = ~15 MB, São Paulo = ~300 MB.

| Prós | Contras |
|------|---------|
| Dados oficiais do IBGE | Só funciona para o estado importado |
| Geocodificação instantânea | Fora do estado, fallback para Nominatim |
| Coordenadas salvas no banco | — |

**Como funciona:**
```
Cadastro eleitor no estado importado:
  → Busca no CNEFE (local, instantâneo, preciso)
  → Salva lat/lng no banco

Cadastro eleitor em outro estado:
  → Fallback Nominatim (online, 1 req/s)
  → Salva lat/lng no banco
```

---

### Opção 2: Manter Nominatim (atual) + melhorar tiles
Usar OpenStreetMap/Nominatim para geocodificação (já implementado).

| Prós | Contras |
|------|---------|
| Funciona para qualquer lugar | Rate limit 1 req/s |
| Não ocupa espaço no banco | Impreciso (centro do CEP) |
| Grátis | Depende de internet |

**Melhorias já entregues (v4):**
- Tiles CartoDB Voyager (visual profissional)
- Satélite + modo escuro
- Nominatim como fallback

---

### Opção 3: Cache inteligente de endereços geocodificados
Salvar no banco só os endereços que já foram geocodificados.

| Prós | Contras |
|------|---------|
| Ocupa pouco espaço | Primeira vez ainda usa Nominatim |
| Precisão aumenta com o tempo | Não tem dados pré-existentes |
| Funciona para qualquer lugar | — |

**Como funciona:**
```
1º cadastro: Nominatim → lat/lng → salva no cache
2º cadastro: Busca no cache (instantâneo)
```

---

### Opção 4: ViaCEP + coordenadas aproximadas por CEP
Usar ViaCEP + tabela pequena de CEPs com coordenadas.

| Prós | Contras |
|------|---------|
| Muito leve (~10 MB) | Precisão de centro do CEP (~500m) |
| Rápido | Não chega ao nível de número da casa |

---

### Opção 5: Upgrade Supabase Pro ($25/mês)

| Prós | Contras |
|------|---------|
| 8 GB de disco | Custo mensal |
| Cabe o Brasil inteiro | — |
| Backups diários | — |

---

## Comparação Resumida

| Opção | Precisão | Custo | Espaço | Velocidade | Cobertura |
|-------|----------|-------|--------|------------|-----------|
| **1. CNEFE 1-2 estados** | ⭐⭐⭐⭐⭐ | Grátis | ~50-300 MB | Instantâneo | Estado importado |
| **2. Nominatim (atual)** | ⭐⭐⭐ | Grátis | 0 | 1 req/s | Todo Brasil |
| **3. Cache inteligente** | ⭐⭐⭐⭐ | Grátis | ~10-100 MB | Rápido (após 1º uso) | Todo Brasil |
| **4. ViaCEP + CEP** | ⭐⭐⭐ | Grátis | ~10 MB | Instantâneo | Todo Brasil |
| **5. Upgrade Pro** | ⭐⭐⭐⭐⭐ | $25/mês | 1,2 GB | Instantâneo | Todo Brasil |

---

## Recomendação do Kimi (para quando voltar)

**Híbrido Opção 1 + 3:**
1. Importar CNEFE da UF principal do mandato (~15-300 MB)
2. Para outros estados: cache inteligente + Nominatim fallback
3. Resultado: 80% dos eleitores com geocodificação instantânea e precisa

---

## Próximos Passos (quando David decidir)

1. Escolher uma das 5 opções acima
2. Se Opção 1: informar qual UF importar
3. Se Opção 5: fazer upgrade no Supabase
4. Implementar a solução escolhida

---

## Arquivos Relacionados

- `supabase/migrations/017-cnefe-enderecos.sql` — schema da tabela
- `scripts/importar-cnefe.ts` — script de importação
- `scripts/atualizar-municipios-cnefe.ts` — atualização de nomes
- `api/cnefe-router.ts` — endpoints tRPC
- `src/lib/geocoding.ts` — lógica de geocodificação
