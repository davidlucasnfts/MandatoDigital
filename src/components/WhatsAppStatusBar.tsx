import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Scan, RotateCcw, Link2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import WhatsAppConnectModal from './WhatsAppConnectModal';

export default function WhatsAppStatusBar() {
  const { getSession } = useWhatsApp();
  const [wahaStatus, setWahaStatus] = useState<string>('');
  const [wahaLoading, setWahaLoading] = useState(false);
  const [wahaError, setWahaError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setWahaLoading(true);
    setWahaError(null);
    try {
      const session = await getSession();
      setWahaStatus(session?.status || 'OFFLINE');
    } catch {
      setWahaError('Falha ao verificar status');
    }
    setWahaLoading(false);
  };

  const isConnected = wahaStatus === 'WORKING';
  const isScanning = wahaStatus === 'SCAN_QR_CODE';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-xl border shadow-sm ${
            isConnected
              ? 'bg-green-50 border-green-200'
              : isScanning
              ? 'bg-amber-50 border-amber-200'
              : 'bg-white border-slate-200'
          }`}
        >
          {/* Esquerda: ícone + status */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isConnected ? 'bg-green-100' : isScanning ? 'bg-amber-100' : 'bg-slate-100'
              }`}
            >
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : isScanning ? (
                <Scan className="w-5 h-5 text-amber-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                WhatsApp
                {isConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Conectado
                  </span>
                )}
                {isScanning && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Aguardando QR
                  </span>
                )}
                {!isConnected && !isScanning && wahaStatus && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Desconectado
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                {isConnected
                  ? 'Pronto para enviar campanhas de mensagens'
                  : isScanning
                  ? 'Escaneie o QR Code para conectar'
                  : 'Conecte o WhatsApp para habilitar o envio de campanhas'}
              </p>
            </div>
          </div>

          {/* Direita: ações */}
          <div className="flex items-center gap-2">
            {wahaError && (
              <div className="hidden sm:flex items-center gap-1 text-red-600 text-xs mr-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Erro ao verificar</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={checkStatus}
              disabled={wahaLoading}
            >
              <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${wahaLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              size="sm"
              className={`h-9 text-xs font-semibold ${
                isConnected
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              onClick={() => setShowModal(true)}
            >
              {isConnected ? (
                <>
                  <Link2 className="w-3.5 h-3.5 mr-1.5" /> Gerenciar
                </>
              ) : (
                <>
                  <Scan className="w-3.5 h-3.5 mr-1.5" /> Conectar
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <WhatsAppConnectModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          checkStatus();
        }}
        initialStatus={wahaStatus}
      />
    </>
  );
}
