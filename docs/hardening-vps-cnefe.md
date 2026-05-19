# Hardening VPS — Proteção do Banco CNEFE

> **Data:** 18/05/2026 (atualizado 19/05/2026)
> **Incidente:** Ransomware no PostgreSQL da VPS HostUp
> **Causa provável:** Senha fraca (`senha123`) + porta 5432 aberta para internet
> **Status:** Resolvido — API Proxy implementada, PostgreSQL isolado

---

## Checklist de Ações (faça nesta ordem)

### 1. ACESSAR A VPS

```bash
# Conecte via SSH (você deve ter as credenciais da HostUp)
ssh root@82.197.73.101
```

---

### 2. TROCAR SENHA DO POSTGRESQL

```bash
# Acesse o PostgreSQL como postgres
sudo -u postgres psql

# Dentro do psql, troque a senha:
ALTER USER postgres WITH PASSWORD 'SuaNovaSenhaForte123!@#';

# Saia
\q
```

> **Regra de senha:** mínimo 20 caracteres, misturando maiúsculas, minúsculas, números e símbolos. Use um gerador de senhas.

---

### 3. RESTRINGIR ACESSO AO POSTGRESQL

Edite o arquivo `pg_hba.conf`:

```bash
# Encontre o arquivo
sudo find / -name "pg_hba.conf" 2>/dev/null

# Exemplo: /var/lib/postgresql/data/pg_hba.conf
sudo nano /var/lib/postgresql/data/pg_hba.conf
```

**Substitua TODAS as linhas que permitem acesso externo:**

```
# ANTES (perigoso — aceita de qualquer lugar):
host  all  all  0.0.0.0/0  scram-sha-256

# DEPOIS (só aceita localhost):
host  all  all  127.0.0.1/32  scram-sha-256
host  all  all  ::1/128       scram-sha-256
```

> **NÃO** deixe `0.0.0.0/0` — isso aceita conexão de qualquer IP do mundo.

Reinicie o PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

### 4. CONFIGURAR TUNNEL SSH (acesso remoto seguro)

Como o backend está na Vercel, ele não pode fazer tunnel SSH. Você tem 2 opções:

#### Opção A: API Proxy na VPS (recomendada)

Crie uma API simples na VPS que o frontend chama via HTTPS. A API se conecta ao PostgreSQL localmente.

**Vantagens:**
- PostgreSQL fica 100% fechado para internet
- Acesso via HTTPS (porta 443, criptografado)
- Pode adicionar rate limiting, autenticação

**Desvantagem:** precisa rodar um servidor Node na VPS.

#### Opção B: WireGuard VPN (mais segura, mais complexa)

Conecta a Vercel à VPS via VPN. O PostgreSQL só responde dentro da VPN.

**Vantagens:**
- PostgreSQL invisível na internet
- Comunicação criptografada

**Desvantagem:** complexa de configurar na Vercel.

#### Opção C: Cloudflare Tunnel (mais fácil)

Usa o Cloudflare para criar um tunnel seguro entre a VPS e a internet.

**Vantagens:**
- Fácil de configurar
- HTTPS gratuito
- PostgreSQL fica escondido

---

### 5. ATUALIZAR O `.env` LOCAL

Depois de trocar a senha:

```bash
# .env
CNEFE_DATABASE_URL=postgresql://postgres:NOVASENHAFORTE@82.197.73.101:5432/postgres
```

> **Nunca commitar o `.env`!** Já está no `.gitignore`, mantenha assim.

---

### 6. FIREWALL (UFW)

```bash
# Instale o UFW se não tiver
sudo apt update && sudo apt install ufw

# Padrão: negar tudo
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (porta 22)
sudo ufw allow 22/tcp

# Permitir HTTPS (porta 443) — se for usar API proxy
sudo ufw allow 443/tcp

# NÃO abra a porta 5432!
# sudo ufw allow 5432/tcp  ❌ NUNCA FAÇA ISSO

# Ativar
sudo ufw enable

# Verificar status
sudo ufw status verbose
```

---

### 7. FAIL2BAN (bloqueia IPs suspeitos)

```bash
sudo apt install fail2ban

# Configurar para PostgreSQL
cat << 'EOF' | sudo tee /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
EOF

sudo systemctl restart fail2ban
```

---

### 8. MONITORAMENTO

```bash
# Instale o logwatch para receber resumos de logs
sudo apt install logwatch

# Ver logs de acesso ao PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## Resumo das Portas

| Porta | Serviço | Deve estar aberta? |
|-------|---------|-------------------|
| 22 | SSH | ✅ Sim (só para você) |
| 443 | HTTPS | ✅ Sim (se usar API proxy) |
| 5432 | PostgreSQL | ❌ NUNCA para internet |
| 80 | HTTP | ❌ Não (use HTTPS) |

---

## Alterações Realizadas (19/05/2026)

### API Proxy Implementada
- Node.js + Hono rodando na porta 3001 (localhost)
- Nginx reverse proxy na porta 80
- Rate limiting: 100 req/15min por IP
- CORS configurado para Vercel
- Rodando como usuário `cnefe-api` (não root)
- Systemd service para auto-restart

### Segurança Reforçada
- PostgreSQL: senha hex 64 chars (forte)
- PostgreSQL: só escuta em 127.0.0.1
- UFW: portas 2222 (SSH) e 80 (API) apenas
- API Proxy: rate limiting em memória
- API Proxy: sem acesso root

### Pendências
- [ ] HTTPS/SSL (Certbot + domínio)
- [ ] Cloudflare Tunnel (esconder IP)
- [ ] Importar dados CNEFE (CE, MA, etc.)

---

## Próximo Passo: Reimportar CNEFE

Depois de proteger a VPS, reimporte os dados:

```bash
# 1. Dropar banco corrompido e recriar
sudo -u postgres psql -c "DROP DATABASE IF EXISTS postgres;"
sudo -u postgres psql -c "CREATE DATABASE postgres;"

# 2. Criar tabela
sudo -u postgres psql postgres << 'EOF'
CREATE TABLE cnefe_enderecos (
  id SERIAL PRIMARY KEY,
  uf VARCHAR(2) NOT NULL,
  codigo_municipio VARCHAR(20),
  municipio VARCHAR(100),
  bairro VARCHAR(100),
  tipo_logradouro VARCHAR(50),
  nome_logradouro VARCHAR(200) NOT NULL,
  numero VARCHAR(20),
  cep VARCHAR(8),
  latitude TEXT NOT NULL,
  longitude TEXT NOT NULL,
  nivel_geocodificacao INTEGER DEFAULT 3,
  codigo_unico VARCHAR(50) UNIQUE
);

CREATE INDEX idx_cnefe_cep ON cnefe_enderecos(cep);
CREATE INDEX idx_cnefe_municipio ON cnefe_enderecos(municipio);
CREATE INDEX idx_cnefe_logradouro ON cnefe_enderecos(nome_logradouro);
EOF

# 3. Baixar CSVs do IBGE e importar
# (usar o script scripts/importar-cnefe.ts)
```

---

## Arquitetura Recomendada (Pós-Incidente)

```
┌─────────────┐     HTTPS      ┌─────────────┐     Localhost    ┌─────────────┐
│   Vercel    │ ─────────────→ │  API Proxy  │ ───────────────→ │ PostgreSQL  │
│  (Frontend) │                │  (VPS:443)  │   (127.0.0.1)    │  (VPS:5432)  │
└─────────────┘                └─────────────┘                  └─────────────┘
                                     ↑
                                     │
                              Firewall UFW
                              Fail2Ban
                              Cloudflare Tunnel (opcional)
```

---

## Verificação Final

Após todas as mudanças, teste:

```bash
# 1. PostgreSQL não responde de fora
curl -v telnet://82.197.73.101:5432
# Deve falhar (connection refused ou timeout)

# 2. SSH funciona
ssh root@82.197.73.101
# Deve conectar

# 3. API proxy responde (se configurada)
curl https://sua-api-proxy.com/cnefe/status
# Deve retornar JSON
```
