# Guia: Setup Seguro da WAHA na VPS

> **Data:** 08/06/2026  
> **Objetivo:** Configurar a WAHA API para ser acessível apenas via localhost, eliminando exposição direta na internet.

---

## O que você precisa saber ANTES de começar

### Onde fica cada credencial

| Credencial | Onde está | Quem usa | Nunca commitar? |
|---|---|---|---|
| `WAHA_API_KEY` | `.env` da VPS + Vercel | Backend do MandatoDigital | ✅ Sim |
| `WAHA_DASHBOARD_PASSWORD` | `.env` da VPS | Você (acesso ao dashboard WAHA) | ✅ Sim |
| Senha SSH da VPS | Painel HostUp | Você (acesso ao servidor) | ✅ Sim |
| API Key do Supabase | Vercel | Frontend + Backend | ✅ Sim |

### O que o script faz (e o que NÃO faz)

✅ **O script faz:**
- Lê `WAHA_API_KEY` do `.env` que já existe na VPS
- Para e remove container WAHA antigo (se existir)
- Sobe novo container bindado em `127.0.0.1:8080` (só localhost)
- Testa se responde em localhost
- Testa se NÃO responde pela internet
- Remove regra do UFW para porta 8080, se existir

❌ **O script NÃO faz:**
- Não cria o `.env` (você precisa ter feito isso antes)
- Não sabe sua senha SSH (você acessa pelo Console da HostUp)
- Não modifica nada fora do Docker e UFW

---

## Passo a passo

### 1. Acesse o Console da HostUp

1. Vá em [hostup.com](https://hostup.com) → Login
2. Clique na VPS `shiny-dolphin`
3. Clique no botão **"Console"** (terminal web, não precisa de SSH)

### 2. Verifique se o `.env` existe

No Console, rode:

```bash
cd /root
ls -la .env
cat .env | grep WAHA
```

Você deve ver algo como:
```
WAHA_API_KEY=abc123... (mínimo 32 caracteres)
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=senha-forte-aqui
```

**Se o `.env` NÃO existir**, crie ele:

```bash
cd /root
nano .env
```

Cole isso (substitua pelos seus valores):
```env
WAHA_API_KEY=          # gere com: openssl rand -hex 32
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=  # senha forte, mínimo 16 caracteres
```

Salve: `Ctrl+O` → Enter → `Ctrl+X`

### 3. Baixe e execute o script

Ainda no Console:

```bash
cd /root

# Opção A: Se você tem o arquivo no projeto (recomendado)
# Copie o conteúdo de scripts/setup-waha-secure.sh e cole com nano:
nano setup-waha-secure.sh
# (cole o conteúdo, salve: Ctrl+O → Enter → Ctrl+X)

# Opção B: Ou use curl se o arquivo estiver em algum lugar público
# curl -O URL_DO_SCRIPT

# Torna executável e roda
chmod +x setup-waha-secure.sh
./setup-waha-secure.sh
```

### 4. O que esperar do output

```
==========================================
  Setup Seguro da WAHA API
==========================================

🐳 Atualizando imagem da WAHA...
🚀 Iniciando WAHA em 127.0.0.1:8080 (apenas localhost)...
⏳ Aguardando WAHA iniciar (15s)...

🧪 Testando conexão localhost...
✅ WAHA respondendo em http://localhost:8080

🔒 Verificando se a porta está fechada na internet...
✅ Porta 8080 NÃO está acessível pela internet (82.197.73.101).

🛡️  Verificando firewall UFW...
✅ UFW não tem regra para porta 8080.

==========================================
  Setup concluído!
==========================================
```

### 5. Atualize a Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seu projeto → Settings → Environment Variables
3. Encontre `WAHA_API_URL`
4. Altere para: `http://localhost:8080`
5. Clique em **Save**
6. Vá em Deployments → clique nos 3 pontos do último deploy → **Redeploy**

### 6. Teste no frontend

1. Abra https://mandato-digital-xi.vercel.app
2. Vá em Comunicação
3. Clique em Conectar WhatsApp
4. Aguarde até 45 segundos
5. QR Code deve aparecer automaticamente

---

## Se algo der errado

### "WAHA_API_KEY não encontrada no .env"
- O `.env` não existe ou não tem a variável
- Crie o `.env` como mostrado no Passo 2

### "Falha ao criar sessão (HTTP 500)"
- A imagem Docker pode estar corrompida
- Tente: `docker pull devlikeapro/waha:latest` manualmente

### "Porta 8080 ainda está acessível pela internet"
- Outro processo pode estar usando a porta
- Verifique: `sudo netstat -tlnp | grep 8080`
- Pode ser necessário reiniciar a VPS pelo painel HostUp

### QR Code não aparece
1. Verifique logs: `docker logs waha --tail 100`
2. Teste localhost na VPS: `curl http://localhost:8080/api/sessions?all=true -H "X-Api-Key: SUA_KEY"`
3. Verifique se `WAHA_API_URL` na Vercel é `http://localhost:8080`

---

## Checklist de segurança pós-setup

```
□ Container WAHA mostra 127.0.0.1:8080->3000 (não 0.0.0.0)
□ curl http://localhost:8080 funciona DENTRO da VPS
□ curl http://82.197.73.101:8080 FALHA de fora da VPS
□ UFW não tem regra para porta 8080
□ WAHA_API_URL na Vercel = http://localhost:8080
□ WAHA_API_KEY tem 32+ caracteres aleatórios
□ .env da VPS NUNCA foi commitado
```

---

## Arquitetura final

```
Usuário (navegador)
    ↓ HTTPS
Vercel (MandatoDigital)
    ↓ tRPC/Hono
Backend Node.js
    ↓ HTTP (localhost)
WAHA Docker (127.0.0.1:8080)
    ↓ WhatsApp Web
WhatsApp do Vereador
```

**Nenhuma porta da WAHA é acessível pela internet.**
