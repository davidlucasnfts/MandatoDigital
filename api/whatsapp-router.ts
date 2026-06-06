import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { env } from "./lib/env.js";

interface WahaSession {
  name: string;
  status: string;
  me?: { id: string; pushName: string };
}

/** Normaliza telefone para formato WAHA: remove máscara, remove 55 duplicado, remove 9, adiciona 55 */
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  // Remove 55 do início se existir
  if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  // Remove o 9 (nono dígito) se o número tiver 11 dígitos
  if (digits.length === 11 && digits[2] === "9") {
    digits = digits.slice(0, 2) + digits.slice(3);
  }
  return "55" + digits;
}

/** Valida se o telefone tem formato brasileiro válido (10 ou 11 dígitos) */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const numDigits = digits.startsWith("55") ? digits.slice(2) : digits;
  if (numDigits.length !== 10 && numDigits.length !== 11) return false;
  const ddd = parseInt(numDigits.slice(0, 2), 10);
  return ddd >= 11 && ddd <= 99;
}

async function wahaFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${env.wahaApiUrl}${path}`;
  const headers: Record<string, string> = {
    "X-Api-Key": env.wahaApiKey || "",
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  // Timeout de 20 segundos para evitar falhas silenciosas
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(url, { ...options, headers, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export const whatsappRouter = createRouter({
  status: publicQuery.query(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      return { status: "FAILED", error: "WAHA não configurado" };
    }
    try {
      const res = await wahaFetch("/api/sessions/default");
      if (!res.ok) {
        return { status: "FAILED", error: `HTTP ${res.status}` };
      }
      const data = (await res.json()) as WahaSession;
      return {
        status: data.status,
        me: data.me,
      };
    } catch (e: any) {
      return { status: "FAILED", error: e.message || "Servidor WAHA indisponível" };
    }
  }),

  startSession: publicQuery.mutation(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      return { ok: false, error: "WAHA não configurado. Verifique as variáveis de ambiente." };
    }
    try {
      // Para sessão existente
      await wahaFetch("/api/sessions/default/stop", { method: "POST", body: "{}" }).catch(() => {});

      // Inicia nova sessão
      const res = await wahaFetch("/api/sessions/default/start", { method: "POST", body: "{}" });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.message || `Falha ao iniciar (HTTP ${res.status})` };
      }

      // Aguarda até 30s para status mudar
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusRes = await wahaFetch("/api/sessions/default");
        if (statusRes.ok) {
          const data = (await statusRes.json()) as WahaSession;
          if (data.status === "SCAN_QR_CODE" || data.status === "WORKING") {
            return { ok: true, status: data.status };
          }
        }
      }
      
      return { ok: true, status: "STARTING" };
    } catch (e: any) {
      return { ok: false, error: e.message || "Falha ao iniciar sessão" };
    }
  }),

  getQRCode: publicQuery.query(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      return { qrCode: null, error: "WAHA não configurado" };
    }
    try {
      // Usa endpoint específico de QR Code da WAHA
      const res = await wahaFetch("/api/default/auth/qr", {
        headers: { "Accept": "application/json" },
      });
      console.log("[WAHA] QR Code status:", res.status);
      if (!res.ok) {
        return { qrCode: null, error: `Não foi possível gerar QR Code (HTTP ${res.status})` };
      }
      const data = await res.json();
      console.log("[WAHA] QR Code data:", data ? "recebido" : "vazio");
      if (data && data.data) {
        return { qrCode: `data:${data.mimetype || "image/png"};base64,${data.data}` };
      }
      return { qrCode: null, error: "QR Code não disponível" };
    } catch (e: any) {
      console.error("[WAHA] QR Code error:", e.message);
      return { qrCode: null, error: e.message || "Falha ao gerar QR Code" };
    }
  }),

  stopSession: publicQuery.mutation(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      return { ok: false, error: "WAHA não configurado" };
    }
    try {
      const res = await wahaFetch("/api/sessions/default/stop", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.message || "Falha ao desconectar" };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || "Falha ao desconectar" };
    }
  }),

  sendMessage: publicQuery
    .input(z.object({ phone: z.string(), text: z.string() }))
    .mutation(async ({ input }) => {
      if (!env.wahaApiUrl || !env.wahaApiKey) {
        return { ok: false, error: "WAHA não configurado" };
      }
      // Validação do telefone
      if (!isValidPhone(input.phone)) {
        return { ok: false, error: "Telefone inválido. Use formato: (DD) 9XXXX-XXXX" };
      }
      try {
        const chatId = normalizePhone(input.phone) + "@c.us";
        // Verifica se o número existe no WhatsApp antes de enviar
        const checkRes = await wahaFetch(`/api/contacts/check-exists?phone=${normalizePhone(input.phone)}&session=default`);
        if (checkRes.ok) {
          const checkData = await checkRes.json().catch(() => ({}));
          if (checkData.numberExists === false) {
            return { ok: false, error: "Número não possui WhatsApp" };
          }
        }
        const res = await wahaFetch("/api/sendText", {
          method: "POST",
          body: JSON.stringify({ session: "default", chatId, text: input.text }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          return { ok: false, error: err.message || "Falha ao enviar" };
        }
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message || "Falha ao enviar mensagem" };
      }
    }),
});
