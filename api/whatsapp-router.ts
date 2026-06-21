import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { env } from "./lib/env.js";

interface WahaSessionResponse {
  name: string;
  status: string;
  me?: {
    id: string;
    pushName: string;
  };
  engine?: {
    engine: string;
  };
}

/** Log seguro: nunca expõe API Key nem URL completa */
function wahaLog(message: string) {
  const url = env.wahaApiUrl || "não-configurado";
  const safeUrl = url.replace(/:\/\/[^/]+/, "://[waha-host]");
  console.log(`[WAHA] ${message} (host: ${safeUrl})`);
}

/** Valida se o telefone tem formato brasileiro válido */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const numDigits = digits.startsWith("55") ? digits.slice(2) : digits;
  if (numDigits.length !== 10 && numDigits.length !== 11) return false;
  const ddd = parseInt(numDigits.slice(0, 2), 10);
  return ddd >= 11 && ddd <= 99;
}

/** Normaliza telefone para formato WAHA (com @c.us) */
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }
  // Remove o 9º dígito se for celular (padrão WhatsApp)
  if (digits.length === 13 && digits[4] === "9") {
    digits = digits.slice(0, 4) + digits.slice(5);
  }
  return digits;
}

async function wahaFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${env.wahaApiUrl}${path}`;
  const headers: Record<string, string> = {
    "X-Api-Key": env.wahaApiKey || "",
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  wahaLog(`${options?.method || "GET"} ${path}`);

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

const SESSION_NAME = env.wahaSessionName || "default";

export const whatsappRouter = createRouter({
  status: publicQuery.query(async () => {
    // DEBUG: log das variáveis de ambiente
    console.log("[WAHA DEBUG] wahaApiUrl=", env.wahaApiUrl ? "presente" : "AUSENTE", "wahaApiKey=", env.wahaApiKey ? "presente" : "AUSENTE");
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      wahaLog("status -> WAHA não configurado");
      return { status: "FAILED", error: "WAHA não configurado" };
    }
    try {
      const res = await wahaFetch(`/api/sessions/${SESSION_NAME}`);
      if (!res.ok) {
        if (res.status === 404) {
          wahaLog("status -> sessão não existe (404)");
          return { status: "STOPPED" };
        }
        const body = await res.text().catch(() => "");
        wahaLog(`status -> ERRO: HTTP ${res.status} - ${body.slice(0, 200)}`);
        return { status: "FAILED", error: `HTTP ${res.status} - ${body}` };
      }
      const data = (await res.json()) as WahaSessionResponse;
      const rawStatus = data.status || "STOPPED";
      wahaLog(`status -> ${rawStatus}`);
      
      // Mapeia estados do WAHA para nossos estados
      const statusMap: Record<string, string> = {
        "WORKING": "WORKING",
        "CONNECTED": "WORKING",
        "STARTING": "STARTING",
        "SCAN_QR_CODE": "SCAN_QR_CODE",
        "STOPPED": "STOPPED",
        "FAILED": "FAILED",
      };
      
      return { status: statusMap[rawStatus] || rawStatus };
    } catch (e: any) {
      return { status: "FAILED", error: e.message || "Servidor WAHA indisponível" };
    }
  }),

  startSession: publicQuery.mutation(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      return { ok: false, error: "WAHA não configurado. Verifique as variáveis de ambiente." };
    }
    try {
      // 1. Verifica se sessão existe
      const existsRes = await wahaFetch(`/api/sessions/${SESSION_NAME}`);
      let sessionExists = existsRes.ok && existsRes.status !== 404;
      wahaLog(`startSession -> sessão ${sessionExists ? "existe" : "não existe"}`);

      // 2. Se não existe, cria
      if (!sessionExists) {
        wahaLog("startSession -> POST /api/sessions/start");
        const createRes = await wahaFetch("/api/sessions/start", {
          method: "POST",
          body: JSON.stringify({ name: SESSION_NAME }),
        });
        if (!createRes.ok) {
          const errText = await createRes.text().catch(() => "");
          wahaLog(`startSession -> ERRO criar sessão: HTTP ${createRes.status} - ${errText}`);
          return { ok: false, error: `Falha ao criar sessão (HTTP ${createRes.status}: ${errText.slice(0, 200)})` };
        }
        wahaLog("startSession -> sessão criada");
      }

      // 3. Aguarda inicialização
      await new Promise(r => setTimeout(r, 2000));
      
      // 4. Verifica status final
      const finalRes = await wahaFetch(`/api/sessions/${SESSION_NAME}`);
      if (finalRes.ok) {
        const data = (await finalRes.json()) as WahaSessionResponse;
        const rawStatus = data.status || "STARTING";
        const statusMap: Record<string, string> = {
          "WORKING": "WORKING",
          "CONNECTED": "WORKING",
          "STARTING": "STARTING",
          "SCAN_QR_CODE": "SCAN_QR_CODE",
          "STOPPED": "STOPPED",
        };
        const mappedStatus = statusMap[rawStatus] || "STARTING";
        wahaLog(`startSession -> status final: ${mappedStatus}`);
        return { ok: true, status: mappedStatus };
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
      // WAHA retorna QR Code como PNG binário no endpoint /auth/qr
      wahaLog("getQRCode -> GET /api/" + SESSION_NAME + "/auth/qr");
      const res = await wahaFetch(`/api/${SESSION_NAME}/auth/qr`, {
        method: "GET",
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("image/png")) {
          const buffer = await res.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          wahaLog("getQRCode -> PNG recebido, convertido para base64");
          return { qrCode: `data:image/png;base64,${base64}` };
        }
        // Pode retornar JSON com erro
        const data = await res.json().catch(() => ({})) as { error?: string; session?: string; status?: string };
        if (data.error) {
          wahaLog(`getQRCode -> erro: ${data.error}`);
          return { qrCode: null, error: data.error };
        }
      }

      const errText = await res.text().catch(() => "");
      wahaLog(`getQRCode -> ERRO: HTTP ${res.status} - ${errText.slice(0, 200)}`);
      return { qrCode: null, error: `Não foi possível gerar QR Code (HTTP ${res.status}: ${errText.slice(0, 200)})` };
    } catch (e: any) {
      wahaLog(`getQRCode -> ERRO: ${e.message || "desconhecido"}`);
      return { qrCode: null, error: e.message || "Falha ao gerar QR Code" };
    }
  }),

  logout: publicQuery.mutation(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      return { ok: false, error: "WAHA não configurado" };
    }
    try {
      wahaLog("logout -> POST /api/sessions/" + SESSION_NAME + "/stop");
      const res = await wahaFetch(`/api/sessions/${SESSION_NAME}/stop`, {
        method: "POST",
      });
      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        return { ok: false, error: err.message || "Falha ao desconectar" };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || "Falha ao desconectar" };
    }
  }),

  stopSession: publicQuery.mutation(async () => {
    if (!env.wahaApiUrl || !env.wahaApiKey) {
      return { ok: false, error: "WAHA não configurado" };
    }
    try {
      wahaLog("stopSession -> POST /api/sessions/" + SESSION_NAME + "/stop");
      const res = await wahaFetch(`/api/sessions/${SESSION_NAME}/stop`, {
        method: "POST",
      });
      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        return { ok: false, error: err.message || "Falha ao parar sessão" };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || "Falha ao parar sessão" };
    }
  }),

  sendMessage: publicQuery
    .input(z.object({ phone: z.string(), text: z.string() }))
    .mutation(async ({ input }) => {
      if (!env.wahaApiUrl || !env.wahaApiKey) {
        return { ok: false, error: "WAHA não configurado" };
      }
      if (!isValidPhone(input.phone)) {
        return { ok: false, error: "Telefone inválido. Use formato: (DD) 9XXXX-XXXX" };
      }
      try {
        const number = normalizePhone(input.phone);
        const chatId = `${number}@c.us`;
        wahaLog(`sendMessage -> POST /api/${SESSION_NAME}/messages/send`);
        const res = await wahaFetch(`/api/sendText`, {
          method: "POST",
          body: JSON.stringify({
            session: SESSION_NAME,
            chatId,
            text: input.text,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { message?: string };
          return { ok: false, error: err.message || "Falha ao enviar" };
        }
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message || "Falha ao enviar mensagem" };
      }
    }),
});
