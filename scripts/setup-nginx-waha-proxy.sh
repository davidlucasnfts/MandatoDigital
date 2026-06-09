#!/bin/bash
# =============================================================================
# Setup Nginx como Proxy Reverso Seguro para WAHA
# =============================================================================
# Este script instala e configura o Nginx para expor a WAHA de forma segura
# via HTTPS, com autenticação básica e rate limiting.
#
# Arquitetura resultante:
#   Navegador/Vercel → HTTPS (443) → Nginx → localhost:8080 → WAHA
#
# A porta 8080 continua fechada para a internet. Só o Nginx (localhost)
# consegue falar com a WAHA.
#
# Pré-requisitos:
#   - WAHA já rodando em localhost:8080 (rode setup-waha-secure.sh primeiro)
#   - Dominio apontado para o IP da VPS (ex: waha.seudominio.com)
#   - Acesso root na VPS
#
# Uso:
#   chmod +x scripts/setup-nginx-waha-proxy.sh
#   ./scripts/setup-nginx-waha-proxy.sh
# =============================================================================

set -e

DOMAIN="${1:-}"
WAHA_LOCAL="http://127.0.0.1:8080"
NGINX_CONF="/etc/nginx/sites-available/waha-proxy"
NGINX_ENABLED="/etc/nginx/sites-enabled/waha-proxy"
HTPASSWD_FILE="/etc/nginx/.waha_htpasswd"

echo "=========================================="
echo "  Setup Nginx Proxy para WAHA"
echo "=========================================="
echo ""

if [ -z "$DOMAIN" ]; then
    echo "Uso: $0 <seu-dominio.com>"
    echo ""
    echo "Exemplo:"
    echo "  $0 waha.seudominio.com"
    echo ""
    echo "O dominio deve estar apontando para o IP desta VPS (82.197.73.101)."
    exit 1
fi

# Verifica se WAHA está rodando em localhost
echo "Verificando se WAHA esta rodando em localhost:8080..."
if ! curl -sf "$WAHA_LOCAL/api/sessions?all=true" >/dev/null 2>&1; then
    echo "Erro: WAHA nao esta respondendo em localhost:8080"
    echo "Execute primeiro: ./setup-waha-secure.sh"
    exit 1
fi
echo "OK: WAHA respondendo em localhost:8080"

# Instala Nginx e dependencias
echo ""
echo "Instalando Nginx e utilitarios..."
apt-get update -qq
apt-get install -y -qq nginx apache2-utils curl

# Cria usuario e senha para autenticacao basica
echo ""
echo "Configurando autenticacao basica..."
echo "Voce precisa definir um usuario e senha para acessar a API WAHA via proxy."
read -p "Digite o nome de usuario: " AUTH_USER
while [ -z "$AUTH_USER" ]; do
    read -p "Nome de usuario nao pode ser vazio. Digite: " AUTH_USER
done

htpasswd -c "$HTPASSWD_FILE" "$AUTH_USER"
echo "OK: Autenticacao configurada."

# Gera config do Nginx
echo ""
echo "Gerando configuracao do Nginx para $DOMAIN..."

cat > "$NGINX_CONF" <<EOF
# Proxy Reverso Seguro para WAHA API
server {
    listen 80;
    server_name $DOMAIN;

    # Rate limiting basico
    limit_req_zone \$binary_remote_addr zone=waha:10m rate=10r/s;

    location / {
        # Autenticacao basica
        auth_basic "WAHA API Proxy";
        auth_basic_user_file $HTPASSWD_FILE;

        # Rate limit
        limit_req zone=waha burst=20 nodelay;

        # Proxy para WAHA localhost
        proxy_pass $WAHA_LOCAL;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # Tamanho maximo do body
        client_max_body_size 50M;
    }

    # Logs
    access_log /var/log/nginx/waha-access.log;
    error_log /var/log/nginx/waha-error.log;
}
EOF

# Ativa o site
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"

# Remove default se existir
rm -f /etc/nginx/sites-enabled/default

# Testa configuracao
echo ""
echo "Testando configuracao do Nginx..."
nginx -t

# Reinicia Nginx
echo "Reiniciando Nginx..."
systemctl restart nginx
systemctl enable nginx

# Verifica se Nginx esta rodando
if systemctl is-active --quiet nginx; then
    echo "OK: Nginx rodando."
else
    echo "Erro: Nginx nao iniciou. Verifique: systemctl status nginx"
    exit 1
fi

# Testa o proxy localmente
echo ""
echo "Testando proxy localmente..."
if curl -sf -u "$AUTH_USER" "http://localhost/api/sessions?all=true" >/dev/null 2>&1; then
    echo "OK: Proxy respondendo em http://localhost"
else
    echo "Aviso: Proxy pode precisar de ajustes. Verifique: nginx -t"
fi

echo ""
echo "=========================================="
echo "  Setup concluido!"
echo "=========================================="
echo ""
echo "A WAHA agora esta acessivel via:"
echo "  http://$DOMAIN"
echo ""
echo "Credenciais de acesso:"
echo "  Usuario: $AUTH_USER"
echo "  Senha:   (a que voce digitou)"
echo ""
echo "IMPORTANTE:"
echo ""
echo "1. Configure seu dominio $DOMAIN para apontar para 82.197.73.101"
echo "   (se ainda nao configurou)"
echo ""
echo "2. Para HTTPS (recomendado), instale Certbot:"
echo "   apt install certbot python3-certbot-nginx"
echo "   certbot --nginx -d $DOMAIN"
echo ""
echo "3. Atualize WAHA_API_URL na Vercel:"
echo "   https://vercel.com/dashboard -> seu projeto -> Settings -> Environment Variables"
echo "   Valor: http://$DOMAIN"
echo "   (ou https://$DOMAIN se usar Certbot)"
echo ""
echo "4. Adicione na Vercel as variaveis:"
echo "   WAHA_PROXY_USER=$AUTH_USER"
echo "   WAHA_PROXY_PASS=<senha que voce digitou>"
echo ""
echo "5. Faca redeploy na Vercel."
echo ""
echo "Seguranca:"
echo "  - Porta 8080 continua fechada na internet"
echo "  - Só quem tem usuario/senha acessa a API"
echo "  - Rate limiting ativo (10 req/s)"
echo ""
