import { useState } from 'react';
import { Scan, Link2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';

interface WhatsAppQRCodeProps {
  wahaStatus: string;
  wahaQR: string | null;
  qrError: string | null;
  qrAgeSeconds: number;
  qrGeneratedAt: number | null;
  isRegeneratingQR: boolean;
  onRegenerate: () => void;
  onCheckStatus: () => void;
  showInstructions?: boolean;
  showQR?: boolean;
}

export default function WhatsAppQRCode({
  wahaStatus,
  wahaQR,
  qrError,
  qrAgeSeconds,
  qrGeneratedAt,
  isRegeneratingQR,
  onRegenerate,
  onCheckStatus,
  showInstructions = true,
  showQR = true,
}: WhatsAppQRCodeProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {showInstructions && (
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
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isRegeneratingQR}
          onClick={onRegenerate}
        >
          <Scan className="w-4 h-4 mr-1" />
          {isRegeneratingQR ? 'Gerando...' : (wahaQR ? 'Gerar novo QR Code' : 'Mostrar QR Code')}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-slate-500"
          onClick={onCheckStatus}
        >
          <Link2 className="w-3 h-3 mr-1" />
          Já escaneei — verificar
        </Button>
      </div>

      {(qrError || localError) && <p className="text-xs text-red-600">{qrError || localError}</p>}

      {showQR && wahaQR && (
        <div className="max-w-[240px]">
          <div className="relative">
            <img
              src={wahaQR}
              alt="Tela de login WhatsApp Web - escaneie o QR Code"
              className={`w-full h-auto border rounded-lg bg-white transition-opacity duration-300 ${qrAgeSeconds > 30 || isRegeneratingQR ? 'opacity-40' : ''}`}
              onError={() => setLocalError('Erro ao exibir QR Code. Tente novamente.')}
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
            <span className="text-amber-600 font-medium">Aponte a câmera do celular</span>
          </p>
          {qrGeneratedAt && (
            <p className={`text-[10px] ${qrAgeSeconds > 25 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {qrAgeSeconds > 30
                ? 'QR Code expirado — clique em "Gerar novo QR Code"'
                : `Válido por ${Math.max(0, 30 - qrAgeSeconds)}s`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
