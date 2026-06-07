import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Scan, RotateCcw, Link2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';

interface Props {
  open: boolean;
  onClose: () => void;
  initialStatus?: string;
}

export default function WhatsAppConnectModal({ open, onClose, initialStatus = '' }: Props) {
  const { getSession, startSession, stopSession, getQRCode } = useWhatsApp();
  const [wahaStatus, setWahaStatus] = useState<string>(initialStatus);
  const [wahaQR, setWahaQR] = useState<string | null>(null);
  const [wahaLoading, setWahaLoading] = useState(false);
  const [wahaError, setWahaError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState<number>(15);

  // Quando abre o modal: verifica status atual
  useEffect(() => {
    if (open) {
      checkStatus();
    }
  }, [open]);

  // Polling: detecta quando escaneia
  useEffect(() => {
    if (!open || wahaStatus !== 'SCAN_QR_CODE') return;
    const interval = setInterval(async () => {
      const session = await getSession();
      console.log('Polling status:', session?.status);
      if (session?.status === 'WORKING') {
        setWahaStatus('WORKING');
        setWahaQR(null);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [open, wahaStatus, getSession]);

  // Auto-renovação do QR Code quando status é SCAN_QR_CODE
  useEffect(() => {
    if (!open || wahaStatus !== 'SCAN_QR_CODE') return;

    const renewQR = async () => {
      const qr = await getQRCode();
      console.log('QR auto-renew:', qr ? 'recebido' : 'null');
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
  }, [open, wahaStatus, getQRCode]);

  const checkStatus = async () => {
    setWahaLoading(true);
    setWahaError(null);
    try {
      const session = await getSession();
      console.log('WAHA status:', session);
      setWahaStatus(session?.status || 'OFFLINE');
    } catch {
      setWahaError('Falha ao verificar status');
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
      setWahaStatus(result.status || 'SCAN_QR_CODE');
      // Já gera o QR Code automaticamente
      const qr = await getQRCode();
      console.log('QR Code result:', qr ? 'recebido' : 'null');
      if (qr) {
        setWahaQR(qr);
      } else {
        setQrError('Não foi possível gerar o QR Code. Clique em Mostrar QR Code.');
      }
    } catch {
      setWahaError('Erro ao conectar. Verifique o console.');
    }
    setWahaLoading(false);
  };

  const handleShowQR = async () => {
    setQrError(null);
    const qr = await getQRCode();
    console.log('QR Code gerado:', qr ? qr.substring(0, 50) + '...' : 'null');
    if (qr) {
      setWahaQR(qr);
      setQrCountdown(15);
    } else {
      setQrError('Não foi possível gerar o QR Code.');
    }
  };

  const handleDisconnect = async () => {
    setWahaLoading(true);
    const ok = await stopSession();
    if (ok) {
      setWahaStatus('OFFLINE');
      setWahaQR(null);
    }
    setWahaLoading(false);
  };

  const handleClose = () => {
    setWahaQR(null);
    setWahaError(null);
    setQrError(null);
    onClose();
  };

  const isConnected = wahaStatus === 'WORKING';
  const isScanning = wahaStatus === 'SCAN_QR_CODE';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                WhatsApp Conectado
              </>
            ) : isScanning ? (
              <>
                <Scan className="w-5 h-5 text-amber-600" />
                Escaneie o QR Code
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5 text-green-600" />
                Conectar WhatsApp
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Status */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              isConnected ? 'bg-green-50' : isScanning ? 'bg-amber-50' : 'bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : isScanning ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="text-sm font-medium text-slate-700">
                Status:{' '}
                {isConnected ? 'Conectado' : isScanning ? 'Aguardando QR Code' : wahaStatus || 'Desconhecido'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={checkStatus}
              disabled={wahaLoading}
            >
              <RotateCcw className={`w-3 h-3 mr-1 ${wahaLoading ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
          </div>

          {/* Erro */}
          <AnimatePresence>
            {wahaError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 rounded-lg p-3 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{wahaError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conteúdo principal */}
          {isConnected ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-slate-600">
                Seu WhatsApp está conectado e pronto para enviar campanhas.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDisconnect}
                disabled={wahaLoading}
              >
                Desconectar WhatsApp
              </Button>
            </div>
          ) : isScanning ? (
            <div className="space-y-3">
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-medium">Escaneie o QR Code com seu celular</p>
                <ol className="text-xs text-amber-700 mt-2 space-y-1 pl-4">
                  <li>1. Abra o WhatsApp no celular</li>
                  <li>2. Toque em Configurações → Aparelhos conectados</li>
                  <li>3. Toque em "Conectar aparelho"</li>
                  <li>4. Aponte a câmera para o QR Code abaixo</li>
                </ol>
              </div>

              <div className="text-center space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowQR}
                >
                  <Scan className="w-4 h-4 mr-1" /> Mostrar QR Code
                </Button>

                {qrError && <p className="text-xs text-red-600">{qrError}</p>}

                {wahaQR ? (
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
                ) : (
                  <div className="h-[220px] bg-slate-50 rounded-lg flex items-center justify-center">
                    <p className="text-xs text-slate-400">Clique em Mostrar QR Code</p>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-500"
                  onClick={checkStatus}
                >
                  Já escaneei — verificar conexão
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 py-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Link2 className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">
                Conecte seu WhatsApp para enviar mensagens automaticamente pelas campanhas.
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                onClick={handleConnect}
                disabled={wahaLoading}
              >
                {wahaLoading ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Scan className="w-4 h-4 mr-1.5" />
                )}
                {wahaLoading ? 'Iniciando...' : 'Conectar WhatsApp'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
