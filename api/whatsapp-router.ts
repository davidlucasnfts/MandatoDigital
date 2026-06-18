import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { env } from "./lib/env.js";

interface WahaSession {
  name: string;
  status: string;
  me?: { id: string; pushName: string };
}

interface WahaQRResponse {
  mimetype?: string;
  data?: string;
}

/** Log seguro: nunca expõe API Key nem URL completa */
function wahaLog(message: string) {
  const url = env.wahaApiUrl || "não-configurado";
  // Mostra apenas o protocolo + domínio/IP truncado
  const safeUrl = url.replace(/:\/\/[^/]+/, "://[waha-host]");
  console.log(`[WAHA] ${message} (host: ${safeUrl})`);
}

/** Converte ArrayBuffer para base64 (Node.js compatível) */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Buffer.from(bytes).toString("base64");
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
  // Não loga headers para não vazar X-Api-Key
  wahaLog(`${options?.method || "GET"} ${path}`);

  // Timeout de 20 segundos para evitar falhas silenciosas
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    wahaLog(`${options?.method || "GET"} ${path} -> HTTP ${res.status}`);
    return res;
  } catch (e: any) {
    wahaLog(`${options?.method || "GET"} ${path} -> ERRO: ${e.message || "network"}`);
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export const whatsappRouter = createRouter({
  status: publicQuery.query(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      wahaLog("status -> WAHA não configurado");
      return { status: "FAILED", error: "WAHA não configurado" };
    }
    try {
      const res = await wahaFetch("/api/sessions/default");
      if (!res.ok) {
        return { status: "FAILED", error: `HTTP ${res.status}` };
      }
      const data = (await res.json()) as WahaSession;
      wahaLog(`status -> ${data.status}`);
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
      // 1. Tenta iniciar a sessão default pelo endpoint idempotente da WAHA Core
      wahaLog("startSession -> POST /api/sessions/default/start");
      const startRes = await wahaFetch("/api/sessions/default/start", {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!startRes.ok && startRes.status !== 409) {
        // Fallback: tenta criar sessão default (algumas versões da Core exigem)
        wahaLog(`startSession -> POST /api/sessions/default/start falhou (HTTP ${startRes.status}), tentando POST /api/sessions`);
        const createRes = await wahaFetch("/api/sessions", {
          method: "POST",
          body: JSON.stringify({ name: "default" }),
        });
        if (!createRes.ok) {
          const err = await createRes.json().catch(() => ({}));
          return { ok: false, error: err.message || `Falha ao criar sessão (HTTP ${createRes.status})` };
        }
      }

      // 2. Aguarda até 45s para status mudar para SCAN_QR_CODE ou WORKING
      for (let i = 0; i < 45; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusRes = await wahaFetch("/api/sessions/default");
        if (statusRes.ok) {
          const data = (await statusRes.json()) as WahaSession;
          wahaLog(`startSession -> polling ${i + 1}/45 status=${data.status}`);
          if (data.status === "SCAN_QR_CODE" || data.status === "WORKING") {
            return { ok: true, status: data.status };
          }
          if (data.status === "FAILED") {
            return { ok: false, error: "Sessão falhou ao iniciar. Tente reconectar." };
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
      wahaLog("getQRCode -> WAHA não configurado");
      return { qrCode: null, error: "WAHA não configurado" };
    }
    try {
      // WAHA Core: endpoint de QR Code é GET /api/default/auth/qr
      // Retorna: {"mimetype":"image/png","data":"base64..."}
      wahaLog("getQRCode -> GET /api/default/auth/qr");
      const res = await wahaFetch("/api/default/auth/qr", {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("image/")) {
          // Algumas versões retornam a imagem diretamente
          const buffer = await res.arrayBuffer();
          const mime = contentType.split(";")[0].trim() || "image/png";
          const base64 = arrayBufferToBase64(buffer);
          wahaLog("getQRCode -> imagem direta recebida");
          return { qrCode: `data:${mime};base64,${base64}` };
        }
        const data = (await res.json()) as WahaQRResponse;
        wahaLog(`getQRCode -> JSON recebido (mimetype=${data.mimetype || "?"}, data=${data.data ? "sim" : "não"})`);
        if (data && data.data) {
          return { qrCode: `data:${data.mimetype || "image/png"};base64,${data.data}` };
        }
      }

      // Fallback: tenta obter screenshot da tela de QR Code
      wahaLog(`getQRCode -> /api/default/auth/qr falhou (HTTP ${res.status}), tentando /api/screenshot`);
      const screenshotRes = await wahaFetch("/api/screenshot", {
        method: "GET",
        headers: { "Accept": "image/png" },
      });
      if (screenshotRes.ok) {
        const buffer = await screenshotRes.arrayBuffer();
        const base64 = arrayBufferToBase64(buffer);
        wahaLog("getQRCode -> screenshot recebido");
        return { qrCode: `data:image/png;base64,${base64}` };
      }

      return { qrCode: null, error: `Não foi possível gerar QR Code (HTTP ${res.status})` };
    } catch (e: any) {
      wahaLog(`getQRCode -> ERRO: ${e.message || "desconhecido"}`);
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
