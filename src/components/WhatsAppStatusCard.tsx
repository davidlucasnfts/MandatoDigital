import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Scan, Link2, AlertCircle } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export default function WhatsAppStatusCard() {
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

  // Atualiza idade do QR Code a cada segundo
  useEffect(() => {
    if (!qrGeneratedAt) {
      setQrAgeSeconds(0);
      return;
    }
    const updateAge = () => {
      setQrAgeSeconds(Math.floor((Date.now() - qrGeneratedAt) / 1000));
    };
    updateAge();
    const interval = setInterval(updateAge, 1000);
    return () => clearInterval(interval);
  }, [qrGeneratedAt]);

  // Polling automático: verifica status quando está conectando
  // Desabilitado durante regeneração manual para evitar race condition
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
            if (session.status === 'FAILED') {
              setIsRegeneratingQR(false);
            }
          }
        } catch {
          // Ignora erros de polling
        }
      };
      
      check();
      const interval = setInterval(check, 8000);
      
      return () => {
        isActive = false;
        clearInterval(interval);
      };
    }
  }, [wahaStatus, getSession]);

  // Busca QR Code automaticamente quando entra em SCAN_QR_CODE
  // Não dispara durante regeneração manual (o botão cuida disso)
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
      
      return () => {
        isActive = false;
      };
    }
  }, [wahaStatus, getQRCode, wahaQR, qrError]);

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
      console.log('[WhatsAppStatusCard] Iniciando sessão...');
      const result = await startSession();
      console.log('[WhatsAppStatusCard] Resultado:', result);
      if (!result.ok) {
        setWahaError(result.error || 'Falha ao iniciar sessão. Tente novamente.');
        setWahaLoading(false);
        return;
      }

      const nextStatus = result.status || 'STARTING';
      setWahaStatus(nextStatus);
      
      // Se já está em SCAN_QR_CODE, busca QR Code imediatamente
      if (nextStatus === 'SCAN_QR_CODE') {
        console.log('[WhatsAppStatusCard] Buscando QR Code...');
        const { qrCode } = await getQRCode();
        console.log('[WhatsAppStatusCard] QR Code:', qrCode ? 'encontrado' : 'não encontrado');
        if (qrCode) {
          setWahaQR(qrCode);
        }
      }
      // Se está STARTING, o polling automático cuidará do resto
      
      setWahaLoading(false);
    } catch (e) {
      console.error('[WhatsAppStatusCard] Erro:', e);
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

  const statusLabels: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    WORKING: { label: 'Conectado', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
    SCAN_QR_CODE: { label: 'Aguardando QR Code', color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    STARTING: { label: 'Iniciando...', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    STOPPED: { label: 'Desconectado', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
    FAILED: { label: 'Falhou', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  };

  const showQRArea = wahaStatus === 'SCAN_QR_CODE' || wahaStatus === 'STARTING' || isRegeneratingQR || !!wahaQR;
  const current = statusLabels[wahaStatus] || statusLabels.STOPPED;

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
          {(wahaStatus === 'STOPPED' || wahaStatus === 'FAILED' || !wahaStatus) && !showQRArea && (
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

              {/* Botão Mostrar/Atualizar QR Code */}
              <Button
                variant="outline"
                size="sm"
                disabled={isRegeneratingQR}
                onClick={async () => {
                  // Para gerar QR Code NOVO, precisamos recriar a sessão
                  // (o QR da sessão atual expira em ~30s na engine NOWEB)
                  setIsRegeneratingQR(true);
                  setQrError(null);
                  // NÃO limpa wahaQR: mantém o QR antigo visível (escurecido) enquanto gera novo
                  try {
                    const result = await startSession();
                    if (!result.ok) {
                      setQrError(result.error || 'Falha ao reiniciar sessão');
                      setIsRegeneratingQR(false);
                      return;
                    }

                    const nextStatus = result.status || 'STARTING';
                    setWahaStatus(nextStatus);

                    // Se já está em SCAN_QR_CODE, busca QR imediatamente
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

                    // Se está STARTING, aguarda virar SCAN_QR_CODE (máx 15s)
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
                }}
              >
                <Scan className="w-4 h-4 mr-1" /> {isRegeneratingQR ? 'Gerando...' : (wahaQR ? 'Gerar novo QR Code' : 'Mostrar QR Code')}
              </Button>

              {qrError && <p className="text-xs text-red-600">{qrError}</p>}

              {wahaQR && (
                <div className="max-w-[240px] mx-auto">
                  <div className="relative">
                    <img
                      src={wahaQR}
                      alt="Tela de login WhatsApp Web - escaneie o QR Code"
                      className={`w-full h-auto border rounded-lg bg-white transition-opacity duration-300 ${qrAgeSeconds > 30 || isRegeneratingQR ? 'opacity-40' : ''}`}
                      onError={() => {
                        setQrError('Erro ao exibir QR Code. Tente novamente.');
                      }}
                    />
                    {qrAgeSeconds > 30 && !isRegeneratingQR && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
                          Expirado
                        </span>
                      </div>
                    )}
                    {isRegeneratingQR && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-lg">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                        <span className="text-slate-700 text-xs font-medium">Gerando novo QR...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    <span className="text-amber-600 font-medium">
                      Aponte a câmera do celular
                    </span>
                  </p>
                  {qrGeneratedAt && (
                    <p className={`text-[10px] ${qrAgeSeconds > 25 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                      {qrAgeSeconds > 30 ? 'QR Code expirado — clique em "Gerar novo QR Code"' : `Válido por ${Math.max(0, 30 - qrAgeSeconds)}s`}
                    </p>
                  )}
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
