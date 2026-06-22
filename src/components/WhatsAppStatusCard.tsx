import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Scan, AlertCircle, Link2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import WhatsAppQRCode from '@/components/WhatsAppQRCode';

interface WhatsAppStatusCardProps {
  layout?: 'vertical' | 'horizontal';
}

export default function WhatsAppStatusCard({ layout = 'vertical' }: WhatsAppStatusCardProps) {
  const { getSession, startSession, logoutSession, getQRCode } = useWhatsApp();
  const [wahaStatus, setWahaStatus] = useState<string>('');
  const [wahaQR, setWahaQR] = useState<string | null>(null);
  const [wahaLoading, setWahaLoading] = useState(false);
  const [wahaMe, setWahaMe] = useState<{ id: string; pushName: string } | null>(null);
  const [wahaError, setWahaError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrGeneratedAt, setQrGeneratedAt] = useState<number | null>(null);
  const [qrAgeSeconds, setQrAgeSeconds] = useState(0);
  const [isRegeneratingQR, setIsRegeneratingQR] = useState(false);

  useEffect(() => {
    if (!qrGeneratedAt) {
      setQrAgeSeconds(0);
      return;
    }
    const updateAge = () => setQrAgeSeconds(Math.floor((Date.now() - qrGeneratedAt) / 1000));
    updateAge();
    const interval = setInterval(updateAge, 1000);
    return () => clearInterval(interval);
  }, [qrGeneratedAt]);

  useEffect(() => {
    if (isRegeneratingQR) return;
    if (wahaStatus === 'SCAN_QR_CODE' || wahaStatus === 'STARTING') {
      let isActive = true;
      const check = async () => {
        if (!isActive) return;
        try {
          const session = await getSession();
          if (session?.status && isActive) {
            setWahaStatus(session.status);
            if (session.status === 'WORKING') {
              setWahaMe(session.me || null);
              setWahaQR(null);
              setQrError(null);
              setIsRegeneratingQR(false);
            }
            if (session.status === 'FAILED') setIsRegeneratingQR(false);
          }
        } catch {
          // Ignora erros de polling
        }
      };
      check();
      const interval = setInterval(check, 8000);
      return () => { isActive = false; clearInterval(interval); };
    }
  }, [wahaStatus, getSession, isRegeneratingQR]);

  useEffect(() => {
    if (isRegeneratingQR) return;
    if (wahaStatus === 'SCAN_QR_CODE' && !wahaQR && !qrError) {
      let isActive = true;
      const fetchQR = async () => {
        if (!isActive) return;
        try {
          const { qrCode, error } = await getQRCode();
          if (qrCode && isActive) {
            setWahaQR(qrCode);
            setQrGeneratedAt(Date.now());
            setQrError(null);
            setIsRegeneratingQR(false);
          } else if (error && isActive) {
            setQrError(error);
            setIsRegeneratingQR(false);
          }
        } catch {
          setQrError('Não foi possível gerar o QR Code. Tente novamente.');
          setIsRegeneratingQR(false);
        }
      };
      fetchQR();
      return () => { isActive = false; };
    }
  }, [wahaStatus, getQRCode, wahaQR, qrError, isRegeneratingQR]);

  const checkStatus = async () => {
    setWahaLoading(true);
    setWahaError(null);
    try {
      const session = await getSession();
      setWahaStatus(session?.status || 'STOPPED');
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
    setWahaQR(null);
    try {
      const result = await startSession();
      if (!result.ok) {
        setWahaError(result.error || 'Falha ao iniciar sessão. Tente novamente.');
        setWahaLoading(false);
        return;
      }
      const nextStatus = result.status || 'STARTING';
      setWahaStatus(nextStatus);
      if (nextStatus === 'SCAN_QR_CODE') {
        const { qrCode } = await getQRCode();
        if (qrCode) {
          setWahaQR(qrCode);
          setQrGeneratedAt(Date.now());
        }
      }
      setWahaLoading(false);
    } catch {
      setWahaError('Erro ao conectar. Verifique o console.');
      setWahaLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setWahaLoading(true);
    const ok = await logoutSession();
    if (ok) {
      setWahaStatus('STOPPED');
      setWahaMe(null);
      setWahaQR(null);
    }
    setWahaLoading(false);
  };

  const handleRegenerateQR = async () => {
    setIsRegeneratingQR(true);
    setQrError(null);
    try {
      const result = await startSession();
      if (!result.ok) {
        setQrError(result.error || 'Falha ao reiniciar sessão');
        setIsRegeneratingQR(false);
        return;
      }
      const nextStatus = result.status || 'STARTING';
      setWahaStatus(nextStatus);
      if (nextStatus === 'SCAN_QR_CODE') {
        const { qrCode, error } = await getQRCode();
        if (qrCode) {
          setWahaQR(qrCode);
          setQrGeneratedAt(Date.now());
        } else {
          setQrError(error || 'Não foi possível gerar QR Code');
        }
        setIsRegeneratingQR(false);
        return;
      }
      if (nextStatus === 'STARTING') {
        let attempts = 0;
        const maxAttempts = 15;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const session = await getSession();
            if (session?.status) {
              setWahaStatus(session.status);
              if (session.status === 'SCAN_QR_CODE') {
                clearInterval(interval);
                const { qrCode, error } = await getQRCode();
                if (qrCode) {
                  setWahaQR(qrCode);
                  setQrGeneratedAt(Date.now());
                } else {
                  setQrError(error || 'Não foi possível gerar QR Code');
                }
                setIsRegeneratingQR(false);
              } else if (session.status === 'WORKING') {
                clearInterval(interval);
                setWahaMe(session.me || null);
                setWahaQR(null);
                setIsRegeneratingQR(false);
              } else if (session.status === 'FAILED' || attempts >= maxAttempts) {
                clearInterval(interval);
                setQrError('Sessão falhou ao gerar QR Code. Tente novamente.');
                setIsRegeneratingQR(false);
              }
            }
          } catch {
            clearInterval(interval);
            setQrError('Erro ao aguardar QR Code');
            setIsRegeneratingQR(false);
          }
        }, 1000);
      }
    } catch {
      setQrError('Erro ao reiniciar sessão');
      setIsRegeneratingQR(false);
    }
  };

  const statusLabels: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    WORKING: { label: 'Conectado', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
    SCAN_QR_CODE: { label: 'Aguardando QR Code', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    STARTING: { label: 'Iniciando...', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    STOPPED: { label: 'Desconectado', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
    FAILED: { label: 'Falhou', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  };

  const showQRArea = wahaStatus === 'SCAN_QR_CODE' || wahaStatus === 'STARTING' || isRegeneratingQR || !!wahaQR;
  const current = statusLabels[wahaStatus] || statusLabels.STOPPED;
  const isHorizontal = layout === 'horizontal';

  const renderStatus = () => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${current.bg}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`w-2 h-2 rounded-full ${current.dot} ${wahaStatus === 'SCAN_QR_CODE' ? 'animate-pulse' : ''}`} />
        <span className={`text-sm font-medium ${current.color}`}>{current.label}</span>
        {wahaMe && wahaStatus === 'WORKING' && (
          <span className="text-xs text-slate-500">({wahaMe.pushName})</span>
        )}
      </div>
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
    </div>
  );

  const renderError = () => wahaError ? (
    <div className="bg-red-50 rounded-lg p-3 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{wahaError}</p>
    </div>
  ) : null;

  const renderConnectPrompt = () => (
    <div className={`space-y-3 ${isHorizontal ? '' : 'text-center py-2'}`}>
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
  );

  const renderConnected = () => (
    <div className="bg-green-50 rounded-lg p-3">
      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
        <Link2 className="w-4 h-4" /> WhatsApp conectado!
      </p>
      <p className="text-xs text-green-600 mt-1">Pronto para enviar campanhas de mensagens.</p>
    </div>
  );

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
          {renderStatus()}
          {renderError()}

          {wahaStatus === 'WORKING' ? renderConnected() : (
            isHorizontal ? (
              <div className="grid md:grid-cols-2 gap-4 items-start">
                <div>
                  {!showQRArea ? renderConnectPrompt() : (
                    <WhatsAppQRCode
                      wahaStatus={wahaStatus}
                      wahaQR={wahaQR}
                      qrError={qrError}
                      qrAgeSeconds={qrAgeSeconds}
                      qrGeneratedAt={qrGeneratedAt}
                      isRegeneratingQR={isRegeneratingQR}
                      onRegenerate={handleRegenerateQR}
                      onCheckStatus={checkStatus}
                      showInstructions
                      showQR={false}
                    />
                  )}
                </div>
                {showQRArea && (
                  <div className="flex md:justify-end">
                    <WhatsAppQRCode
                      wahaStatus={wahaStatus}
                      wahaQR={wahaQR}
                      qrError={qrError}
                      qrAgeSeconds={qrAgeSeconds}
                      qrGeneratedAt={qrGeneratedAt}
                      isRegeneratingQR={isRegeneratingQR}
                      onRegenerate={handleRegenerateQR}
                      onCheckStatus={checkStatus}
                      showInstructions={false}
                      showQR
                    />
                  </div>
                )}
                {!showQRArea && <div />}
              </div>
            ) : (
              <>
                {!showQRArea && renderConnectPrompt()}
                {showQRArea && (
                  <WhatsAppQRCode
                    wahaStatus={wahaStatus}
                    wahaQR={wahaQR}
                    qrError={qrError}
                    qrAgeSeconds={qrAgeSeconds}
                    qrGeneratedAt={qrGeneratedAt}
                    isRegeneratingQR={isRegeneratingQR}
                    onRegenerate={handleRegenerateQR}
                    onCheckStatus={checkStatus}
                  />
                )}
              </>
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
