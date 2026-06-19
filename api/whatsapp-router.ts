import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { env } from "./lib/env.js";

interface EvolutionInstanceResponse {
  instance: {
    instanceName: string;
    state?: string;
    status?: string;
    connectionStatus?: string;
  };
}

interface EvolutionQRResponse {
  base64?: string;
  code?: string;
  pairingCode?: string;
}

/** Log seguro: nunca expõe API Key nem URL completa */
function evoLog(message: string) {
  const url = env.evolutionApiUrl || "não-configurado";
  const safeUrl = url.replace(/:\/\/[^/]+/, "://[evo-host]");
  console.log(`[EVOLUTION] ${message} (host: ${safeUrl})`);
}

/** Converte ArrayBuffer para base64 (Node.js compatível) */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Buffer.from(bytes).toString("base64");
}

/** Normaliza telefone para formato Evolution */
function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits[2] === "9") {
    digits = digits.slice(0, 2) + digits.slice(3);
  }
  return "55" + digits;
}

/** Valida se o telefone tem formato brasileiro válido */
function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const numDigits = digits.startsWith("55") ? digits.slice(2) : digits;
  if (numDigits.length !== 10 && numDigits.length !== 11) return false;
  const ddd = parseInt(numDigits.slice(0, 2), 10);
  return ddd >= 11 && ddd <= 99;
}

async function evoFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${env.evolutionApiUrl}${path}`;
  const headers: Record<string, string> = {
    "apikey": env.evolutionApiKey || "",
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> || {}),
  };
  evoLog(`${options?.method || "GET"} ${path}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    evoLog(`${options?.method || "GET"} ${path} -> HTTP ${res.status}`);
    return res;
  } catch (e: any) {
    evoLog(`${options?.method || "GET"} ${path} -> ERRO: ${e.message || "network"}`);
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

const INSTANCE_NAME = env.evolutionInstanceName || "mandato";

export const whatsappRouter = createRouter({
  status: publicQuery.query(async () => {
    if (!env.evolutionApiUrl || !env.evolutionApiKey) {
      evoLog("status -> Evolution não configurado");
      return { status: "FAILED", error: "Evolution não configurado" };
    }
    try {
      const res = await evoFetch(`/instance/connectionState/${INSTANCE_NAME}`);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        evoLog(`status -> ERRO: HTTP ${res.status} - ${body.slice(0, 200)}`);
        return { status: "STOPPED", error: `HTTP ${res.status} - ${body}` };
      }
      const data = (await res.json()) as EvolutionInstanceResponse;
      const rawState = data.instance?.state || data.instance?.status || data.instance?.connectionStatus || "";
      evoLog(`status -> ${rawState}`);
      
      // Mapeia estados da Evolution para nossos estados
      const statusMap: Record<string, string> = {
        "open": "WORKING",
        "connecting": "STARTING",
        "close": "STOPPED",
        "qrcode": "SCAN_QR_CODE",
      };
      
      return { status: statusMap[rawState] || rawState || "STOPPED" };
    } catch (e: any) {
      return { status: "FAILED", error: e.message || "Servidor Evolution indisponível" };
    }
  }),

  startSession: publicQuery.mutation(async () => {
    if (!env.evolutionApiUrl || !env.evolutionApiKey) {
      return { ok: false, error: "Evolution não configurado. Verifique as variáveis de ambiente." };
    }
    try {
      // 1. Verifica se instância existe
      const existsRes = await evoFetch(`/instance/fetchInstances`);
      let instanceExists = false;
      
      if (existsRes.ok) {
        const instances = (await existsRes.json()) as any[];
        instanceExists = instances.some(i => i.instanceName === INSTANCE_NAME || i.name === INSTANCE_NAME);
        evoLog(`startSession -> instância ${instanceExists ? "existe" : "não existe"}`);
      }

      // 2. Se não existe, cria
      if (!instanceExists) {
        evoLog("startSession -> POST /instance/create");
        const createRes = await evoFetch("/instance/create", {
          method: "POST",
          body: JSON.stringify({
            instanceName: INSTANCE_NAME,
            token: "",
            qrcode: true,
            integration: "EVOLUTION",
            webhook: "",
            webhook_by_events: false,
            events: [],
          }),
        });
        if (!createRes.ok) {
          const errText = await createRes.text().catch(() => "");
          let err: { message?: string } = {};
          try { err = JSON.parse(errText); } catch {}
          evoLog(`startSession -> ERRO criar instância: HTTP ${createRes.status} - ${errText}`);
          return { ok: false, error: err.message || `Falha ao criar instância (HTTP ${createRes.status}: ${errText.slice(0, 200)})` };
        }
        evoLog("startSession -> instância criada");
      }

      // 3. Busca QR Code (a instância já inicia automaticamente ao criar)
      await new Promise(r => setTimeout(r, 2000));
      
      // 4. Verifica status final
      const finalRes = await evoFetch(`/instance/connectionState/${INSTANCE_NAME}`);
      if (finalRes.ok) {
        const data = (await finalRes.json()) as EvolutionInstanceResponse;
        const rawState = data.instance?.state || data.instance?.status || data.instance?.connectionStatus || "";
        const statusMap: Record<string, string> = {
          "open": "WORKING",
          "connecting": "STARTING",
          "close": "STOPPED",
          "qrcode": "SCAN_QR_CODE",
        };
        const mappedStatus = statusMap[rawState] || "STARTING";
        evoLog(`startSession -> status final: ${mappedStatus}`);
        return { ok: true, status: mappedStatus };
      }

      return { ok: true, status: "STARTING" };
    } catch (e: any) {
      return { ok: false, error: e.message || "Falha ao iniciar instância" };
    }
  }),

  getQRCode: publicQuery.query(async () => {
    if (!env.evolutionApiUrl || !env.evolutionApiKey) {
      evoLog("getQRCode -> Evolution não configurado");
      return { qrCode: null, error: "Evolution não configurado" };
    }
    try {
      // Evolution retorna QR Code no endpoint de conexão
      evoLog("getQRCode -> GET /instance/connect/" + INSTANCE_NAME);
      const res = await evoFetch(`/instance/connect/${INSTANCE_NAME}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      if (res.ok) {
        const data = (await res.json()) as EvolutionQRResponse;
        evoLog(`getQRCode -> base64=${data.base64 ? "sim" : "não"}, code=${data.code ? "sim" : "não"}`);
        if (data.base64) {
          return { qrCode: `data:image/png;base64,${data.base64}` };
        }
        if (data.code) {
          return { qrCode: null, pairingCode: data.code };
        }
      }

      const errText = await res.text().catch(() => "");
      evoLog(`getQRCode -> ERRO: HTTP ${res.status} - ${errText.slice(0, 200)}`);
      return { qrCode: null, error: `Não foi possível gerar QR Code (HTTP ${res.status}: ${errText.slice(0, 200)})` };
    } catch (e: any) {
      evoLog(`getQRCode -> ERRO: ${e.message || "desconhecido"}`);
      return { qrCode: null, error: e.message || "Falha ao gerar QR Code" };
    }
  }),

  logout: publicQuery.mutation(async () => {
    if (!env.evolutionApiUrl || !env.evolutionApiKey) {
      return { ok: false, error: "Evolution não configurado" };
    }
    evoLog(`logout -> Evolution configurada: ${env.evolutionApiKey ? "sim (key presente)" : "não"}`);
    try {
      evoLog("logout -> DELETE /instance/logout/" + INSTANCE_NAME);
      const res = await evoFetch(`/instance/logout/${INSTANCE_NAME}`, {
        method: "DELETE",
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
    if (!env.evolutionApiUrl || !env.evolutionApiKey) {
      return { ok: false, error: "Evolution não configurado" };
    }
    try {
      // Evolution não tem "stop" separado — logout é o equivalente
      evoLog("stopSession -> DELETE /instance/logout/" + INSTANCE_NAME);
      const res = await evoFetch(`/instance/logout/${INSTANCE_NAME}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        return { ok: false, error: err.message || "Falha ao parar instância" };
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message || "Falha ao parar instância" };
    }
  }),

  sendMessage: publicQuery
    .input(z.object({ phone: z.string(), text: z.string() }))
    .mutation(async ({ input }) => {
      if (!env.evolutionApiUrl || !env.evolutionApiKey) {
        return { ok: false, error: "Evolution não configurado" };
      }
      if (!isValidPhone(input.phone)) {
        return { ok: false, error: "Telefone inválido. Use formato: (DD) 9XXXX-XXXX" };
      }
      try {
        const number = normalizePhone(input.phone);
        evoLog(`sendMessage -> POST /message/sendText/${INSTANCE_NAME}`);
        const res = await evoFetch(`/message/sendText/${INSTANCE_NAME}`, {
          method: "POST",
          body: JSON.stringify({
            number,
            text: input.text,
            options: {
              delay: 1200,
              presence: "composing",
            },
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
