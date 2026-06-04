import { useState, useCallback } from 'react';
import { trpc } from '@/providers/trpc';

export function useWhatsApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusQuery = trpc.whatsapp.status.useQuery(undefined, {
    enabled: false,
  });
  
  const qrQuery = trpc.whatsapp.getQRCode.useQuery(undefined, {
    enabled: false,
  });

  const startMutation = trpc.whatsapp.startSession.useMutation();
  const stopMutation = trpc.whatsapp.stopSession.useMutation();
  const sendMutation = trpc.whatsapp.sendMessage.useMutation();

  const getSession = useCallback(async () => {
    try {
      const result = await statusQuery.refetch();
      return result.data;
    } catch {
      return { status: 'FAILED', error: 'Servidor indisponível' };
    }
  }, [statusQuery]);

  const startSession = useCallback(async (): Promise<{ ok: boolean; status?: string; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await startMutation.mutateAsync();
      setLoading(false);
      return result;
    } catch (e: any) {
      setError('Falha ao iniciar sessão');
      setLoading(false);
      return { ok: false, error: 'Falha ao iniciar sessão' };
    }
  }, [startMutation]);

  const stopSession = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await stopMutation.mutateAsync();
      setLoading(false);
      return result.ok;
    } catch (e: any) {
      setError('Falha ao desconectar');
      setLoading(false);
      return false;
    }
  }, [stopMutation]);

  const getQRCode = useCallback(async (): Promise<string | null> => {
    try {
      console.log('getQRCode: calling tRPC query...');
      const result = await qrQuery.refetch();
      console.log('getQRCode: refetch result:', result.data ? 'has data' : 'no data');
      console.log('getQRCode: qrCode exists?', result.data?.qrCode ? 'yes' : 'no');
      return result.data?.qrCode || null;
    } catch (e: any) {
      console.error('getQRCode error:', e.message, e);
      return null;
    }
  }, [qrQuery]);

  const sendText = useCallback(async (phone: string, text: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendMutation.mutateAsync({ phone, text });
      setLoading(false);
      if (!result.ok) {
        setError(result.error || 'Falha ao enviar');
        return false;
      }
      return true;
    } catch (e) {
      setError('Falha ao enviar mensagem');
      setLoading(false);
      return false;
    }
  }, [sendMutation]);

  const sendBulk = useCallback(async (
    phones: string[],
    text: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: number; failed: number }> => {
    setLoading(true);
    setError(null);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < phones.length; i++) {
      const ok = await sendText(phones[i], text);
      if (ok) success++;
      else failed++;
      onProgress?.(i + 1, phones.length);
      await new Promise(r => setTimeout(r, 1000));
    }

    setLoading(false);
    return { success, failed };
  }, [sendText]);

  return {
    loading,
    error,
    getSession,
    startSession,
    stopSession,
    getQRCode,
    sendText,
    sendBulk,
  };
}
