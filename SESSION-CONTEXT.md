# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 22/05/2026
> **Sessão atual:** Teste de bibliotecas de ícones — Carbon, Material, Tabler

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Teste de bibliotecas de ícones: Carbon, Material, Tabler** — 22/05

### O que foi feito:
1. **Rejeitado Phosphor Icons** — usuário não gostou dos pesos (fill/duotone/bold)
2. **Rejeitado Fluent UI + Govicons** — usuário não gostou do visual
3. **Instalado `@carbon/icons-react`** (IBM) — página demo `/icones-carbon` criada
4. **Instalado `@mui/icons-material`** (Google) — página demo `/icones-material` criada
5. **Instalado `@tabler/icons-react`** — página demo `/icones-tabler` criada
6. **Corrigido build** — instalado `@emotion/react` e `@emotion/styled` (peer deps do MUI)
7. **Corrigido erro `IconFire` → `IconFlame`** — ícone não existia no Tabler, build falhava
8. **Wrapper `@/lib/icons.ts`** mantido como ponto único de troca futura

### Páginas de teste disponíveis:
- http://localhost:3000/icones-carbon — Carbon Icons (IBM) — estilo técnico, cantos quadrados
- http://localhost:3000/icones-material — Material Design (Google) — estilo preenchido, cantos arredondados
- http://localhost:3000/icones-tabler — Tabler Icons — estilo minimalista, stroke fino

### Decisão pendente:
- **Usuário vai decidir** qual biblioteca adotar (ou rejeitar todas)
- Se escolher uma: migrar `src/lib/icons.ts` e todos os imports
- Se rejeitar todas: pesquisar outras opções (Heroicons, etc.)

### Pendências para próxima sessão:
- [ ] HTTPS/SSL (precisa de domínio)
- [ ] Cloudflare Tunnel (esconder IP da VPS)
- [ ] Importar mais estados (opcional)
- [x] Testar geocodificação completa no cadastro de eleitor

---

## URLs Importantes

| Serviço | URL |
|---|---|
| **Produção (Vercel)** | https://mandato-digital-xi.vercel.app |
| **API Proxy CNEFE** | http://82.197.73.101 |
| **VPS (SSH)** | ssh -p 2222 root@82.197.73.101 |

---

## Decisões Pendentes (Ações Manuais)

| # | Ação | Onde fazer | Prioridade |
|---|---|---|---|
| 1 | Comprar domínio (Registro.br, Porkbun ou KingHost) | Site do registrador | Média |
| 2 | Configurar DNS para apontar VPS | Painel do registrador | Média |
| 3 | Configurar Certbot (HTTPS) | VPS (quando tiver domínio) | Média |
| 4 | Configurar Cloudflare Tunnel | Cloudflare (opcional) | Baixa |

---

## Variáveis de Ambiente (Vercel)

```
DATABASE_URL=postgresql://... (Supabase)
SUPABASE_SERVICE_ROLE_KEY=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_HERE_API_KEY=bPFahqLf6LlNCV9bq4k7pDB9iTiRj_twmAeRf06-lUM
CNEFE_API_URL=http://82.197.73.101
```

---

## Checklist Próxima Sessão — PRIORIDADE 1

```
□ DECIDIR BIBLIOTECA DE ÍCONES
  → Acessar http://localhost:3000/icones-carbon (Carbon Icons IBM)
  → Acessar http://localhost:3000/icones-material (Material Design Google)
  → Acessar http://localhost:3000/icones-tabler (Tabler Icons)
  → Comparar visualmente e escolher uma (ou pedir outras opções)
  → Migrar src/lib/icons.ts e todos os imports para a escolhida

□ Testar página /icones-tabler no navegador
  → Verificar se renderiza corretamente (corrigido erro IconFire → IconFlame)
  → Verificar controles de stroke width e tamanho

□ Testar cadastro de eleitor com geocodificação CNEFE
  → Acessar https://mandato-digital-xi.vercel.app
  → Cadastrar eleitor com CEP e número
  → Verificar se aparece no mapa na posição correta
  
□ Verificar se Here API está sendo usada como fallback
  → Cadastrar endereço fora do CE/MA (ex: São Paulo)
  → Confirmar se Here API geocodifica

□ Comprar/configurar domínio (se decidir)
□ Importar mais estados se necessário (PB, RN, PI)
```

> **LEMBRETE:** Prioridade é decidir a biblioteca de ícones.
> URLs de teste: http://localhost:3000/icones-carbon | http://localhost:3000/icones-material | http://localhost:3000/icones-tabler

---

## Erros Registrados (Self-Healing)

| # | Erro | Data | Prevenção |
|---|---|---|---|
| 008 | API Proxy sem rate limiting / rodando como root | 19/05/2026 | Sempre usar usuário dedicado, rate limiting, systemd |
