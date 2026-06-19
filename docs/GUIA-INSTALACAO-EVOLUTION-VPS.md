# Guia de Instalação — Evolution API na VPS

> **Data:** 18/06/2026
> **Para:** David Lucas (executar na VPS)
> **Tempo estimado:** 15-20 minutos

---

## 📋 O que você precisa

1. **Acesso ao painel da HostUp** (navegador)
2. **Este guia aberto** para copiar comandos
3. **Projeto no Vercel** aberto em outra aba (para configurar env vars)

---

## PASSO 1 — Acessar a VPS (sem SSH)

### Opção A: Console Web da HostUp (recomendado)

1. Abra https://hostup.com.br (ou o painel da sua hospedagem)
2. Faça login com sua conta
3. Vá em **Serviços → Meus Serviços**
4. Clique no seu VPS
5. Procure um botão **"Console"**, **"VNC"** ou **"Acesso Remoto"**
6. Clique — isso abre um terminal direto no servidor (sem precisar de SSH)

### Opção B: Se tiver acesso SSH (porta 22 aberta)

```bash
ssh root@82.197.73.101
# ou usuário que você usa
```

> ⚠️ Se nenhuma opção funcionar, me avise. Precisamos contatar a HostUp para liberar acesso.

---

## PASSO 2 — Verificar Docker

No terminal da VPS, execute:

```bash
docker --version
docker-compose --version
```

**Se aparecer versão (ex: Docker 24.x, Docker Compose 2.x)** → vá para Passo 4

**Se der "command not found"** → execute o Passo 3

---

## PASSO 3 — Instalar Docker (só se não tiver)

Execute um comando por vez:

```bash
# Atualizar pacotes
apt-get update

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Instalar Docker Compose
apt-get install -y docker-compose-plugin

# Verificar
docker --version
docker-compose --version
```

---

## PASSO 4 — Baixar e executar o script de instalação

Execute na VPS:

```bash
# Criar diretório
cd ~ && mkdir -p evolution-api && cd evolution-api

# Baixar script (opção 1 — se curl funcionar)
curl -fsSL https://raw.githubusercontent.com/seu-repo/scripts/install-evolution.sh -o install.sh

# Se o curl falhar, use wget (opção 2)
wget -O install.sh https://raw.githubusercontent.com/seu-repo/scripts/install-evolution.sh
```

> **Se não conseguir baixar**, copie o conteúdo do arquivo `scripts/install-evolution.sh` do projeto e cole na VPS:
> ```bash
> nano install.sh
> # Cole o conteúdo, Ctrl+O, Enter, Ctrl+X
> ```

Execute:

```bash
chmod +x install.sh
bash install.sh
```

O script vai:
- ✅ Parar a WAHA antiga (se existir)
- ✅ Baixar a imagem da Evolution API
- ✅ Subir o container
- ✅ Verificar se está rodando

**Aguarde 2-3 minutos** para o download da imagem.

---

## PASSO 5 — Verificar se funcionou

Execute na VPS:

```bash
# Ver se container está rodando
docker ps

# Deve aparecer: evolution-api (status Up)

# Testar endpoint
curl http://localhost:8080

# Deve retornar algo como: {"status":200,"message":"Evolution API","version":"2.x"}
```

Se retornar JSON com status 200 → **funcionou!**

---

## PASSO 6 — Configurar Environment Variables na Vercel

1. Abra https://vercel.com/dashboard
2. Clique no projeto **mandato-digital**
3. Vá em **Settings → Environment Variables**
4. Adicione 3 variáveis:

| Nome | Valor |
|---|---|
| `EVOLUTION_API_URL` | `http://82.197.73.101:8080` |
| `EVOLUTION_API_KEY` | `mandato2026evolution` |
| `EVOLUTION_INSTANCE_NAME` | `mandato` |

5. Clique **Save**
6. Vá em **Deployments** → clique nos 3 pontinhos da última deploy → **Redeploy**

> ⚠️ **Importante:** Não apague as variáveis `WAHA_API_URL` e `WAHA_API_KEY` ainda. Deixe as duas enquanto testamos.

---

## PASSO 7 — Testar no frontend

1. Abra https://mandato-digital-xi.vercel.app
2. Faça login
3. Vá em **Comunicação**
4. Clique em **Conectar WhatsApp**
5. Clique em **Mostrar QR Code**
6. Escaneie com o celular

Se conectar → **migração concluída!**

---

## 🔧 Comandos úteis na VPS

```bash
# Ver logs em tempo real
docker logs -f evolution-api

# Parar Evolution
cd ~/evolution-api && docker-compose down

# Iniciar Evolution
cd ~/evolution-api && docker-compose up -d

# Reiniciar
cd ~/evolution-api && docker-compose restart

# Ver status do container
docker ps

# Entrar no container (para debug)
docker exec -it evolution-api sh
```

---

## ⚠️ Problemas comuns

### "Porta 8080 já em uso"
A WAHA ainda está rodando. Execute:
```bash
docker stop waha && docker rm waha
cd ~/evolution-api && docker-compose up -d
```

### "PostgreSQL não encontrado"
A Evolution precisa de PostgreSQL. Se não tiver na VPS, instale:
```bash
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE evolution;"
```

> Se não quiser instalar PostgreSQL agora, a Evolution funciona sem banco (salva em arquivo). Mas perde persistência. Me avise se precisar dessa configuração.

### "Erro 401 — Unauthorized"
API Key incorreta. Verifique se `EVOLUTION_API_KEY` na Vercel é igual à do docker-compose.

---

## 📞 Se travar em algum passo

Me avise com:
1. **Qual passo** você está
2. **Qual erro** apareceu (copie e cole)
3. **Screenshot** se possível

Não fique preso — qualquer problema tem solução.
