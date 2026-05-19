# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 19/05/2026
> **Sessão atual:** VPS CNEFE reativada com API Proxy e dados importados

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**API Proxy CNEFE + Importação de dados** — 19/05

### O que foi feito:
1. **API Proxy na VPS** — Node.js/Hono rodando na porta 3001 (localhost), Nginx reverse proxy na porta 80
2. **Segurança reforçada:**
   - PostgreSQL só em localhost (127.0.0.1), senha hex 64 chars
   - UFW: portas 2222 (SSH) e 80 (API) apenas
   - Rate limiting: 100 req/15min por IP
   - API roda como usuário `cnefe-api` (não root)
   - Systemd service com auto-restart
3. **Dados CNEFE importados:**
   - CE (23): 4.750.642 registros
   - MA (21): 3.257.843 registros
   - **Total: 8.008.485 endereços georreferenciados**
4. **Projeto atualizado** para usar HTTP client em vez de PostgreSQL direto
5. **MestreProjects.md** atualizado com regras de VPS para todos os projetos
6. **Deploy Vercel** funcionando com CNEFE_API_URL configurada

### Pendências para próxima sessão:
- [ ] HTTPS/SSL (precisa de domínio)
- [ ] Cloudflare Tunnel (esconder IP da VPS)
- [ ] Importar mais estados (opcional)
- [ ] Testar geocodificação completa no cadastro de eleitor

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

> **LEMBRETE:** Amanhã a prioridade é testar o cadastro de eleitor no mapa com o CNEFE ativo.
> URL: https://mandato-digital-xi.vercel.app

---

## Erros Registrados (Self-Healing)

| # | Erro | Data | Prevenção |
|---|---|---|---|
| 008 | API Proxy sem rate limiting / rodando como root | 19/05/2026 | Sempre usar usuário dedicado, rate limiting, systemd |
