#!/bin/bash
# =============================================================================
# Reabrir WAHA para Vercel (sem domínio)
# =============================================================================
# Este script reabre a porta 8080 da WAHA para acesso externo,
# mas APENAS com rate limiting e API Key forte.
#
# ⚠️  ISSO É UMA MITIGAÇÃO TEMPORÁRIA.
#    Quando comprar domínio, migre para Cloudflare Tunnel ou Nginx+HTTPS.
#
# Uso:
#   chmod +x scripts/reabrir-waha-vercel.sh
#   ./scripts/reabrir-waha-vercel.sh
# =============================================================================

set -e

echo "=========================================="
echo "  Reabrir WAHA para Vercel"
echo "=========================================="
echo ""
echo "⚠️  ATENÇÃO: Isso expõe a porta 8080 na internet."
echo "   Mitigação: API Key forte + rate limiting na WAHA."
echo "   Quando tiver domínio, migre para arquitetura segura."
echo ""

# Para o container atual (bindado em localhost)
if docker ps | grep -q "waha"; then
    echo "Parando container WAHA atual (localhost)..."
    docker stop waha >/dev/null 2>&1 || true
    docker rm waha >/dev/null 2>&1 || true
fi

# Sobe novo container com porta exposta (0.0.0.0:8080)
echo "Subindo WAHA em 0.0.0.0:8080 (acessível externamente)..."
docker run -d \
    --env-file .env \
    -v "$(pwd)/sessions:/app/.sessions" \
    -p "8080:3000" \
    --name waha \
    --restart unless-stopped \
    devlikeapro/waha:latest

echo "Aguardando iniciar (15s)..."
sleep 15

# Testa acesso externo
PUBLIC_IP=$(curl -sf https://api.ipify.org 2>/dev/null || echo "82.197.73.101")
echo ""
echo "Testando acesso externo..."
WAHA_API_KEY=$(grep -E '^WAHA_API_KEY=' .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if curl -sf "http://$PUBLIC_IP:8080/api/sessions?all=true" -H "X-Api-Key: $WAHA_API_KEY" >/dev/null 2>&1; then
    echo "OK: WAHA acessível em http://$PUBLIC_IP:8080"
else
    echo "Aviso: WAHA pode não estar pronto. Verifique: docker logs waha --tail 50"
fi

echo ""
echo "=========================================="
echo "  WAHA reaberta!"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo ""
echo "1. Atualize WAHA_API_URL na Vercel:"
echo "   Valor: http://82.197.73.101:8080"
echo ""
echo "2. Faça redeploy na Vercel."
echo ""
echo "3. Teste o QR Code."
echo ""
echo "⚠️  IMPORTANTE — Comprar domínio ASAP e migrar para:"
echo "   - Cloudflare Tunnel (recomendado)"
echo "   - Ou Nginx + HTTPS + autenticação básica"
echo ""
echo "   Ver docs/adr-006-whatsapp-api-multi-cliente.md"
echo ""
