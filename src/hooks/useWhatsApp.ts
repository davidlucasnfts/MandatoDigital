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
  const logoutMutation = trpc.whatsapp.logout.useMutation();
  const stopMutation = trpc.whatsapp.stopSession.useMutation();
  const sendMutation = trpc.whatsapp.sendMessage.useMutation();

  const getSession = useCallback(async () => {
    try {
      const result = await statusQuery.refetch();
      console.log('[WhatsApp] status result:', result.data);
      return result.data;
    } catch (e: any) {
      console.error('[WhatsApp] status error:', e);
      return { status: 'FAILED', error: e?.message || 'Servidor indisponível' };
    }
  }, [statusQuery]);

  const startSession = useCallback(async (): Promise<{ ok: boolean; status?: string; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await startMutation.mutateAsync();
      console.log('[WhatsApp] startSession result:', result);
      setLoading(false);
      return result;
    } catch (e: any) {
      console.error('[WhatsApp] startSession error:', e);
      setError('Falha ao iniciar sessão');
      setLoading(false);
      return { ok: false, error: 'Falha ao iniciar sessão' };
    }
  }, [startMutation]);

  const logoutSession = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await logoutMutation.mutateAsync();
      setLoading(false);
      return result.ok;
    } catch (e: any) {
      setError('Falha ao desconectar do WhatsApp');
      setLoading(false);
      return false;
    }
  }, [logoutMutation]);

  const stopSession = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await stopMutation.mutateAsync();
      setLoading(false);
      return result.ok;
    } catch (e: any) {
      setError('Falha ao parar sessão');
      setLoading(false);
      return false;
    }
  }, [stopMutation]);

  const getQRCode = useCallback(async (): Promise<{ qrCode: string | null; error: string | null }> => {
    try {
      const result = await qrQuery.refetch();
      return {
        qrCode: result.data?.qrCode || null,
        error: result.data?.error || null,
      };
    } catch (e: any) {
      return { qrCode: null, error: e?.message || 'Falha ao buscar QR Code' };
    }
  }, [qrQuery]);

  const sendText = useCallback(async (phone: string, text: string): Promise<{ ok: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendMutation.mutateAsync({ phone, text });
      setLoading(false);
      if (!result.ok) {
        setError(result.error || 'Falha ao enviar');
        return { ok: false, error: result.error };
      }
      return { ok: true };
    } catch (e: any) {
      const msg = e?.message || 'Falha ao enviar mensagem';
      setError(msg);
      setLoading(false);
      return { ok: false, error: msg };
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
      const result = await sendText(phones[i], text);
      if (result.ok) success++;
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
    logoutSession,
    stopSession,
    getQRCode,
    sendText,
    sendBulk,
  };
}
