import { useState, useCallback } from 'react';

const WAHA_URL = 'http://82.197.73.101:8080';
const WAHA_API_KEY = 'af5dc838ef174b5ca9c540110d6ab6d5';

interface WahaSession {
  name: string;
  status: string;
  me?: { id: string; pushName: string };
}

interface WahaMessage {
  id: string;
  timestamp: number;
  from: string;
  fromMe: boolean;
  body: string;
  chatId: string;
}

export function useWhatsApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    'X-Api-Key': WAHA_API_KEY,
    'Content-Type': 'application/json',
  };

  const getSession = useCallback(async (): Promise<WahaSession | null> => {
    try {
      const res = await fetch(`${WAHA_URL}/api/sessions/default`, { headers });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const startSession = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${WAHA_URL}/api/sessions/default/start`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      setLoading(false);
      return res.ok;
    } catch (e) {
      setError('Falha ao iniciar sessão');
      setLoading(false);
      return false;
    }
  }, []);

  const getQRCode = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${WAHA_URL}/api/screenshot?session=default`, { headers });
      if (!res.ok) return null;
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  const sendText = useCallback(async (phone: string, text: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const chatId = `55${phone.replace(/\D/g, '')}@c.us`;
      const res = await fetch(`${WAHA_URL}/api/sendText`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ session: 'default', chatId, text }),
      });
      setLoading(false);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Falha ao enviar mensagem');
        return false;
      }
      return true;
    } catch (e) {
      setError('Falha ao enviar mensagem');
      setLoading(false);
      return false;
    }
  }, []);

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
      await new Promise(r => setTimeout(r, 1000)); // Delay 1s entre envios
    }

    setLoading(false);
    return { success, failed };
  }, [sendText]);

  const getChats = useCallback(async (): Promise<WahaMessage[]> => {
    try {
      const res = await fetch(`${WAHA_URL}/api/messages?session=default&limit=50`, { headers });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }, []);

  return {
    loading,
    error,
    getSession,
    startSession,
    getQRCode,
    sendText,
    sendBulk,
    getChats,
  };
}
