# Roteiro de Retomada — Instalação Evolution API na VPS

> **Data:** 19/06/2026
> **Status:** ✅ CONCLUÍDO — Evolution API v2.2.3 rodando, instância `mandato` criada e funcional
> **Próximo passo:** Configurar env vars na Vercel e testar frontend

---

## ✅ O que foi feito

1. **Acesso SSH estabelecido** — porta 2222
2. **WAHA removida** — container parado e deletado
3. **Docker e Docker Compose instalados** — Docker 26.1.1, Compose v2.35.1
4. **PostgreSQL configurado e seguro**:
   - Banco `evolution` criado
   - `listen_addresses = '127.0.0.1'` (só localhost)
   - `pg_hba.conf`: só `127.0.0.1/32 md5` (senha obrigatória)
   - Senha: `Mandato2026SeguroXYZ` (20+ chars, sem caracteres especiais)
5. **Evolution API container rodando** — `network_mode: host`, conecta em `127.0.0.1:5432`
6. **Instância `mandato` criada** — `integration: "EVOLUTION"`, status `open`
7. **Envio de mensagem testado e funcionando** — retorna messageId, remoteJid, timestamp

---

## 🔧 Comandos úteis

```bash
# Ver logs
ssh -p 2222 root@82.197.73.101 "docker logs evolution-api --tail 20"

# Parar/Subir
cd ~/evolution-api && docker compose down
cd ~/evolution-api && docker compose up -d

# Verificar PostgreSQL
PGPASSWORD=Mandato2026SeguroXYZ psql -h 127.0.0.1 -U postgres -d evolution -c 'SELECT 1;'
```

---

## 📁 Arquivos importantes

| Arquivo | Caminho |
|---------|---------|
| docker-compose.yml | `~/evolution-api/docker-compose.yml` |
| Config PostgreSQL | `/etc/postgresql/12/main/postgresql.conf` |
| Autenticação PostgreSQL | `/etc/postgresql/12/main/pg_hba.conf` |

---

## 📝 Notas

- PostgreSQL 12 rodando no Ubuntu 20.04
- Porta SSH da VPS: 2222 (não 22)
- Evolution API usa `network_mode: host` para acessar PostgreSQL em `127.0.0.1`
- A instância `mandato` já estava conectada ao WhatsApp (sessão persistida no banco)

---

## ✅ O que já foi feito

1. **Acesso SSH estabelecido** — porta 2222
   ```bash
   ssh -p 2222 root@82.197.73.101
   ```

2. **WAHA removida**
   ```bash
   docker stop waha && docker rm waha
   ```

3. **Docker e Docker Compose instalados**
   - Docker: 26.1.1
   - Docker Compose: v2.35.1

4. **PostgreSQL instalado e configurado**
   - Banco `evolution` criado
   - `listen_addresses = '*'` em `/etc/postgresql/12/main/postgresql.conf`
   - `host all all 172.17.0.0/16 trust` em `/etc/postgresql/12/main/pg_hba.conf`
   - Serviço reiniciado: `systemctl restart postgresql`

5. **Evolution API container criado**
   - Diretório: `~/evolution-api`
   - `docker-compose.yml` criado
   - Container: `atendai/evolution-api:v2.2.3`
   - Porta: 8080:8080

---

## 🔴 Problema atual

Container Evolution reinicia em loop. Erro:
```
Error: P1001: Can't reach database server at `172.17.0.1:5432`
```

Mesmo com PostgreSQL configurado para aceitar conexões de qualquer IP.

---

## 🔄 Próximos passos para retomar

### Passo 1 — Verificar se PostgreSQL está acessível
```bash
# Testar conexão do host para o IP Docker
psql -h 172.17.0.1 -U postgres -d evolution -c "SELECT 1;"

# Se falhar, testar localhost
psql -h localhost -U postgres -d evolution -c "SELECT 1;"

# Verificar status do PostgreSQL
systemctl status postgresql
```

### Passo 2 — Se PostgreSQL não estiver acessível em 172.17.0.1
```bash
# Verificar IP do PostgreSQL
sudo -u postgres psql -c "SHOW listen_addresses;"

# Verificar porta
ss -tlnp | grep 5432

# Se necessário, reiniciar PostgreSQL
systemctl restart postgresql
```

### Passo 3 — Testar conexão do container Docker
```bash
# Instalar cliente PostgreSQL no container temporariamente
docker exec evolution-api sh -c "apt-get update && apt-get install -y postgresql-client"

# Testar conexão do container
docker exec evolution-api psql -h 172.17.0.1 -U postgres -d evolution -c "SELECT 1;"
```

### Passo 4 — Se tudo falhar, usar network host
Editar `docker-compose.yml` para usar network do host:
```yaml
services:
  evolution-api:
    # ... resto igual
    network_mode: host
    # Remover networks e ports (não necessário com host)
```

### Passo 5 — Subir container
```bash
cd ~/evolution-api && docker compose down && docker compose up -d
```

### Passo 6 — Testar endpoint
```bash
curl http://localhost:8080
```

---

## 📁 Arquivos importantes

| Arquivo | Caminho |
|---------|---------|
| docker-compose.yml | `~/evolution-api/docker-compose.yml` |
| Config PostgreSQL | `/etc/postgresql/12/main/postgresql.conf` |
| Autenticação PostgreSQL | `/etc/postgresql/12/main/pg_hba.conf` |

---

## 🔧 Comandos úteis

```bash
# Ver logs Evolution
docker logs evolution-api --tail 50

# Ver status container
docker ps

# Parar/Subir
cd ~/evolution-api && docker compose down
cd ~/evolution-api && docker compose up -d

# Acessar container
docker exec -it evolution-api sh

# Verificar PostgreSQL
sudo -u postgres psql -l
```

---

## 📝 Notas

- PostgreSQL 12 rodando no Ubuntu 20.04
- Docker network bridge: `172.17.0.0/16`
- IP do host na Docker network: `172.17.0.1`
- Porta SSH da VPS: 2222 (não 22)
