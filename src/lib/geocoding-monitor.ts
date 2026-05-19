// Monitoramento de volume de geocodificacao
// Alerta quando proximo do limite do provedor atual

interface GeocodingMetrics {
  month: string;        // "2026-05"
  provider: string;     // "here" | "tomtom" | "opencage" | "csv2geo"
  requests: number;     // Total de requisicoes no mes
  limit: number;        // Limite do plano atual
  lastAlertAt?: string; // Data do ultimo alerta (evita spam)
}

const STORAGE_KEY = "geocoding_metrics_v1";

// Limites por provedor (requisicoes/mes)
const PROVIDER_LIMITS: Record<string, number> = {
  here: 30000,      // Free tier
  tomtom: 100000,   // Free tier
  opencage: 2500,   // Free tier (diario * 30)
  csv2geo: 1000,    // Free tier (diario * 30)
};

// Thresholds de alerta (% do limite)
const ALERT_THRESHOLDS = [0.5, 0.75, 0.9, 0.95, 1.0];

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function loadMetrics(): GeocodingMetrics[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveMetrics(metrics: GeocodingMetrics[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
}

function getOrCreateMetric(month: string, provider: string): GeocodingMetrics {
  const metrics = loadMetrics();
  let metric = metrics.find(m => m.month === month && m.provider === provider);
  
  if (!metric) {
    metric = {
      month,
      provider,
      requests: 0,
      limit: PROVIDER_LIMITS[provider] || 30000,
    };
    metrics.push(metric);
    saveMetrics(metrics);
  }
  
  return metric;
}

/**
 * Incrementa contador de requisicoes e verifica se precisa alertar
 * Chamar esta funcao a cada geocodificacao
 */
export function trackGeocodingRequest(provider: string): {
  requests: number;
  limit: number;
  percentage: number;
  shouldAlert: boolean;
  alertMessage?: string;
} {
  const month = getCurrentMonth();
  const metric = getOrCreateMetric(month, provider);
  
  metric.requests++;
  
  const percentage = metric.requests / metric.limit;
  const threshold = ALERT_THRESHOLDS.find(t => percentage <= t);
  
  let shouldAlert = false;
  let alertMessage: string | undefined;
  
  // Alerta apenas uma vez por threshold
  if (threshold) {
    const thresholdKey = `${month}-${provider}-${threshold}`;
    const alerted = metric.lastAlertAt === thresholdKey;
    
    if (!alerted && percentage >= threshold) {
      shouldAlert = true;
      metric.lastAlertAt = thresholdKey;
      
      if (threshold === 1.0) {
        alertMessage = `LIMITE EXCEDIDO! ${metric.requests}/${metric.limit} requisicoes (${(percentage * 100).toFixed(1)}%). MIGRAR DE PROVEDOR URGENTE!`;
      } else if (threshold >= 0.9) {
        alertMessage = `ALERTA: ${(percentage * 100).toFixed(0)}% do limite atingido (${metric.requests}/${metric.limit}). Preparar migracao!`;
      } else {
        alertMessage = `Aviso: ${(percentage * 100).toFixed(0)}% do limite usado (${metric.requests}/${metric.limit}).`;
      }
    }
  }
  
  // Atualiza no storage
  const metrics = loadMetrics();
  const idx = metrics.findIndex(m => m.month === month && m.provider === provider);
  if (idx >= 0) metrics[idx] = metric;
  else metrics.push(metric);
  saveMetrics(metrics);
  
  return {
    requests: metric.requests,
    limit: metric.limit,
    percentage,
    shouldAlert,
    alertMessage,
  };
}

/**
 * Retorna metricas do mes atual para exibir no dashboard
 */
export function getCurrentMetrics(): GeocodingMetrics | null {
  const month = getCurrentMonth();
  const metrics = loadMetrics();
  return metrics.find(m => m.month === month) || null;
}

/**
 * Retorna qual provedor usar baseado no volume atual
 * Regra: Here -> TomTom -> OpenCage -> CSV2GEO
 */
export function getRecommendedProvider(currentProvider: string): {
  provider: string;
  reason: string;
  shouldMigrate: boolean;
} {
  const month = getCurrentMonth();
  const metric = getOrCreateMetric(month, currentProvider);
  const percentage = metric.requests / metric.limit;
  
  if (percentage >= 1.0) {
    // Precisa migrar
    if (currentProvider === "here") {
      return { provider: "tomtom", reason: "Here free tier excedido. TomTom mais barato.", shouldMigrate: true };
    }
    if (currentProvider === "tomtom") {
      return { provider: "opencage", reason: "TomTom free tier excedido. OpenCage preco fixo.", shouldMigrate: true };
    }
    if (currentProvider === "opencage") {
      return { provider: "csv2geo", reason: "OpenCage excedido. CSV2GEO plano fixo ilimitado.", shouldMigrate: true };
    }
  }
  
  if (percentage >= 0.9) {
    return { provider: currentProvider, reason: `Proximo do limite (${(percentage * 100).toFixed(0)}%). Preparar migracao.`, shouldMigrate: false };
  }
  
  return { provider: currentProvider, reason: `Volume OK (${(percentage * 100).toFixed(0)}%).`, shouldMigrate: false };
}

/**
 * Reseta metricas (usar ao mudar de mes ou de provedor)
 */
export function resetMetrics(): void {
  localStorage.removeItem(STORAGE_KEY);
}
