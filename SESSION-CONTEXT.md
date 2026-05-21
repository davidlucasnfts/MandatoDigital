# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 20/05/2026
> **Sessão atual:** Repaginação de ícones — Phosphor Icons substituindo Lucide

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Supabase (PostgreSQL) + VPS HostUp (CNEFE API Proxy) + Vercel

---

## Última funcionalidade trabalhada
**Repaginação de Ícones — Phosphor Icons** — 20/05

### O que foi feito:
1. **Instalado `@phosphor-icons/react`** — biblioteca com 7000+ ícones, 6 pesos visuais
2. **Criado wrapper `@/lib/icons.ts`** — mapeia nomes Lucide → Phosphor para compatibilidade
3. **Substituídos todos os imports** `lucide-react` → `@/lib/icons` em 43 arquivos
4. **IconContext global** no `main.tsx` com `weight: "fill"` (efeito 3D/preenchido)
5. **Página demo** `/icones` com visualização de todos os pesos (thin a duotone)
6. **IconPicker mantido** com lucide-react (uso interno, não afeta UI principal)

### Próximos passos:
- Verificar visualmente se o peso "fill" ficou bom em todos os componentes
- Ajustar peso individual em ícones que precisem de destaque (duotone)
- Remover lucide-react do package.json quando IconPicker for migrado

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
