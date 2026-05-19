// Componente de monitoramento de volume de geocodificacao
// Mostra alertas quando proximo do limite do provedor

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { getCurrentMetrics, getRecommendedProvider } from "@/lib/geocoding-monitor";

interface MonitorData {
  requests: number;
  limit: number;
  percentage: number;
  provider: string;
  recommendedProvider: string;
  shouldMigrate: boolean;
  reason: string;
}

export function useGeocodingMonitor() {
  const [data, setData] = useState<MonitorData | null>(null);

  useEffect(() => {
    const check = () => {
      const metric = getCurrentMetrics();
      if (!metric) return;

      const recommendation = getRecommendedProvider(metric.provider);

      setData({
        requests: metric.requests,
        limit: metric.limit,
        percentage: metric.requests / metric.limit,
        provider: metric.provider,
        recommendedProvider: recommendation.provider,
        shouldMigrate: recommendation.shouldMigrate,
        reason: recommendation.reason,
      });
    };

    check();
    const interval = setInterval(check, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  return data;
}

export function GeocodingMonitorBadge() {
  const data = useGeocodingMonitor();

  if (!data) return null;

  const percentage = data.percentage * 100;

  // Cores baseadas no percentual
  let color = "bg-green-100 text-green-700";
  let icon = <CheckCircle className="w-3 h-3" />;

  if (percentage >= 100) {
    color = "bg-red-100 text-red-700";
    icon = <AlertTriangle className="w-3 h-3" />;
  } else if (percentage >= 90) {
    color = "bg-amber-100 text-amber-700";
    icon = <AlertTriangle className="w-3 h-3" />;
  } else if (percentage >= 75) {
    color = "bg-yellow-100 text-yellow-700";
    icon = <TrendingUp className="w-3 h-3" />;
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${color}`}>
      {icon}
      <span>
        {data.provider.toUpperCase()}: {percentage.toFixed(0)}% ({data.requests.toLocaleString()}/{data.limit.toLocaleString()})
      </span>
    </div>
  );
}

export function GeocodingMonitorAlert() {
  const data = useGeocodingMonitor();

  if (!data) return null;

  // So mostra alerta se >= 90% ou precisa migrar
  if (data.percentage < 0.9 && !data.shouldMigrate) return null;

  const bgColor = data.shouldMigrate ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200";
  const textColor = data.shouldMigrate ? "text-red-700" : "text-amber-700";
  const iconColor = data.shouldMigrate ? "text-red-500" : "text-amber-500";

  return (
    <div className={`p-3 rounded-lg border ${bgColor} mb-4`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className={`w-4 h-4 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {data.shouldMigrate
              ? "LIMITE DE GEOCODIFICACAO EXCEDIDO!"
              : "ALERTA: Volume de geocodificacao alto"}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {data.reason}
          </p>
          {data.shouldMigrate && (
            <p className="text-xs font-medium text-red-600 mt-1">
              Migrar para: {data.recommendedProvider.toUpperCase()}
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-1">
            {data.requests.toLocaleString()} / {data.limit.toLocaleString()} requisicoes este mes
          </p>
        </div>
      </div>
    </div>
  );
}
