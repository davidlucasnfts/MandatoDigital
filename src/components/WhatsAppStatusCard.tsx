import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Scan, RotateCcw, Link2, AlertCircle } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export default function WhatsAppStatusCard() {
  const { getSession, startSession, stopSession, getQRCode } = useWhatsApp();
  const [wahaStatus, setWahaStatus] = useState<string>('');
  const [wahaQR, setWahaQR] = useState<string | null>(null);
  const [wahaLoading, setWahaLoading] = useState(false);
  const [wahaMe, setWahaMe] = useState<{ id: string; pushName: string } | null>(null);
  const [wahaError, setWahaError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(15);

  // Verificar status ao montar o componente
  useEffect(() => {
    checkStatus();
  }, []);

  // Polling: verifica se o usuário já escaneou (a cada 3s)
  useEffect(() => {
    if (wahaStatus !== 'SCAN_QR_CODE') return;

    const interval = setInterval(async () => {
      const session = await getSession();
      console.log('Polling status:', session?.status);
      if (session?.status === 'WORKING') {
        setWahaStatus('WORKING');
        setWahaMe(session?.me || null);
        setWahaQR(null);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [wahaStatus, getSession]);

  // Auto-renovação do QR Code
  useEffect(() => {
    if (wahaStatus !== 'SCAN_QR_CODE') return;

    const renewQR = async () => {
      const qr = await getQRCode();
      if (qr) {
        setWahaQR(qr);
        setQrCountdown(15);
      }
    };

    renewQR(); // Primeira carga imediata
    const renewInterval = setInterval(renewQR, 10000); // Renova a cada 10s
    const countdown = setInterval(() => {
      setQrCountdown((prev) => (prev > 0 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(renewInterval);
      clearInterval(countdown);
    };
  }, [wahaStatus, getQRCode]);

  const checkStatus = async () => {
    setWahaLoading(true);
    setWahaError(null);
    try {
      const session = await getSession();
      console.log('WAHA status:', session);
      setWahaStatus(session?.status || 'OFFLINE');
      setWahaMe(session?.me || null);
    } catch {
      setWahaError('Falha ao verificar status do WhatsApp');
    }
    setWahaLoading(false);
  };

  const handleConnect = async () => {
    setWahaLoading(true);
    setWahaError(null);
    setQrError(null);
    try {
      const result = await startSession();
      console.log('Start session result:', result);
      if (!result.ok) {
        setWahaError(result.error || 'Falha ao iniciar sessão. Tente novamente.');
        setWahaLoading(false);
        return;
      }
      // Atualiza status
      const nextStatus = result.status || 'SCAN_QR_CODE';
      setWahaStatus(nextStatus);

      // Se a sessão ainda está iniciando, aguarda um pouco antes de buscar QR
      if (nextStatus === 'STARTING') {
        await new Promise(r => setTimeout(r, 3000));
      }

      // Já gera o QR Code automaticamente
      const qr = await getQRCode();
      console.log('QR Code result:', qr ? 'recebido' : 'null');
      if (qr) {
        setWahaQR(qr);
      } else {
        setQrError('Não foi possível gerar o QR Code. Clique em Atualizar.');
      }
      setWahaLoading(false);
    } catch (e) {
      setWahaError('Erro ao conectar. Verifique o console.');
      setWahaLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setWahaLoading(true);
    const ok = await stopSession();
    if (ok) {
      setWahaStatus('OFFLINE');
      setWahaMe(null);
      setWahaQR(null);
    }
    setWahaLoading(false);
  };

  const statusLabels: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    WORKING: { label: 'Conectado', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
    SCAN_QR_CODE: { label: 'Aguardando QR Code', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    STARTING: { label: 'Iniciando...', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    OFFLINE: { label: 'Desconectado', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  };

  const showQRArea = wahaStatus === 'SCAN_QR_CODE' || wahaStatus === 'STARTING';

  const current = statusLabels[wahaStatus] || statusLabels.OFFLINE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-600" />
            WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Status */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${current.bg}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${current.dot} ${wahaStatus === 'SCAN_QR_CODE' ? 'animate-pulse' : ''}`} />
              <span className={`text-sm font-medium ${current.color}`}>
                {current.label}
              </span>
              {wahaMe && wahaStatus === 'WORKING' && (
                <span className="text-xs text-slate-500">({wahaMe.pushName})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {wahaStatus === 'WORKING' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDisconnect}
                  disabled={wahaLoading}
                >
                  Desconectar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={checkStatus}
                disabled={wahaLoading}
              >
                <RotateCcw className={`w-3 h-3 mr-1 ${wahaLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Erro */}
          {wahaError && (
            <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{wahaError}</p>
            </div>
          )}

          {/* Não conectado — mostra botão Conectar */}
          {wahaStatus !== 'WORKING' && !showQRArea && (
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-slate-600">
                Conecte o WhatsApp para enviar mensagens pelas campanhas
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                onClick={handleConnect}
                disabled={wahaLoading}
              >
                <Scan className="w-4 h-4 mr-1.5" />
                {wahaLoading ? 'Iniciando...' : 'Conectar WhatsApp'}
              </Button>
            </div>
          )}

          {/* Aguardando QR Code */}
          {showQRArea && (
            <div className="text-center space-y-3">
              <div className="bg-amber-50 rounded-lg p-3 text-left">
                <p className="text-sm text-amber-800 font-medium">
                  {wahaStatus === 'STARTING' ? 'Iniciando sessão... aguarde o QR Code' : 'Escaneie o QR Code com seu celular'}
                </p>
                <ol className="text-xs text-amber-700 mt-2 space-y-1 pl-4">
                  <li>1. Abra o WhatsApp no celular</li>
                  <li>2. Toque em Configurações → Aparelhos conectados</li>
                  <li>3. Toque em "Conectar aparelho"</li>
                  <li>4. Aponte a câmera para o QR Code</li>
                </ol>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setQrError(null);
                  const qr = await getQRCode();
                  console.log('QR Code gerado:', qr ? qr.substring(0, 50) + '...' : 'null');
                  if (qr) {
                    setWahaQR(qr);
                  } else {
                    setQrError('Não foi possível gerar o QR Code.');
                  }
                }}
              >
                <Scan className="w-4 h-4 mr-1" /> Mostrar QR Code
              </Button>

              {qrError && <p className="text-xs text-red-600">{qrError}</p>}

              {wahaQR && (
                <div className="max-w-[240px] mx-auto">
                  <img
                    src={wahaQR}
                    alt="Tela de login WhatsApp Web - escaneie o QR Code"
                    className="w-full h-auto border rounded-lg bg-white"
                    onError={() => {
                      console.error('Erro ao carregar imagem do QR Code');
                      setQrError('Erro ao exibir QR Code. Tente novamente.');
                    }}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    <span className="text-amber-600 font-medium">
                      ⏱️ Novo QR em {qrCountdown}s — aponte a câmera rapidamente
                    </span>
                  </p>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-500"
                onClick={checkStatus}
              >
                <Link2 className="w-3 h-3 mr-1" />
                Já escaneei — verificar
              </Button>
            </div>
          )}

          {/* Conectado */}
          {wahaStatus === 'WORKING' && (
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4" /> WhatsApp conectado!
              </p>
              <p className="text-xs text-green-600 mt-1">
                Pronto para enviar campanhas de mensagens.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
