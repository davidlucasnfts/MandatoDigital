// Configuracao de geocodificacao - monitoramento de volume

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, TrendingUp, MapPin } from "lucide-react";
import { getCurrentMetrics, getRecommendedProvider } from "@/lib/geocoding-monitor";
import { getHereStatus } from "@/lib/here-geocoding";

interface MetricData {
  provider: string;
  requests: number;
  limit: number;
  percentage: number;
  recommendedProvider: string;
  shouldMigrate: boolean;
  reason: string;
  hereEnabled: boolean;
}

export default function GeocodingConfig() {
  const [data, setData] = useState<MetricData | null>(null);

  useEffect(() => {
    const load = () => {
      const metric = getCurrentMetrics();
      const hereStatus = getHereStatus();

      if (!metric) {
        setData({
          provider: "here",
          requests: 0,
          limit: 30000,
          percentage: 0,
          recommendedProvider: "here",
          shouldMigrate: false,
          reason: "Nenhuma requisicao este mes.",
          hereEnabled: hereStatus.enabled,
        });
        return;
      }

      const rec = getRecommendedProvider(metric.provider);

      setData({
        provider: metric.provider,
        requests: metric.requests,
        limit: metric.limit,
        percentage: metric.requests / metric.limit,
        recommendedProvider: rec.provider,
        shouldMigrate: rec.shouldMigrate,
        reason: rec.reason,
        hereEnabled: hereStatus.enabled,
      });
    };

    load();
    const interval = setInterval(load, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const percentage = data.percentage * 100;

  // Status visual
  let statusColor = "bg-green-50 border-green-200 text-green-700";
  let statusIcon = <CheckCircle className="w-5 h-5 text-green-500" />;
  let statusText = "Volume dentro do limite";

  if (percentage >= 100) {
    statusColor = "bg-red-50 border-red-200 text-red-700";
    statusIcon = <AlertTriangle className="w-5 h-5 text-red-500" />;
    statusText = "LIMITE EXCEDIDO!";
  } else if (percentage >= 90) {
    statusColor = "bg-amber-50 border-amber-200 text-amber-700";
    statusIcon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
    statusText = "Proximo do limite";
  } else if (percentage >= 75) {
    statusColor = "bg-yellow-50 border-yellow-200 text-yellow-700";
    statusIcon = <TrendingUp className="w-5 h-5 text-yellow-500" />;
    statusText = "Volume alto";
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Status do Provedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provedor atual */}
          <div className={`p-4 rounded-lg border ${statusColor}`}>
            <div className="flex items-center gap-3">
              {statusIcon}
              <div>
                <p className="font-medium">{statusText}</p>
                <p className="text-sm opacity-80">
                  {data.provider.toUpperCase()} — {data.requests.toLocaleString()} / {data.limit.toLocaleString()} requisicoes
                </p>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Uso do mes</span>
              <span>{percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentage >= 100
                    ? "bg-red-500"
                    : percentage >= 90
                    ? "bg-amber-500"
                    : percentage >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Here API Status */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Here API</p>
              <p className="text-xs text-slate-400">
                {data.hereEnabled ? "Configurado e ativo" : "Nao configurado"}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                data.hereEnabled
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {data.hereEnabled ? "Ativo" : "Inativo"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recomendacao */}
      {data.shouldMigrate && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Migracao Necessaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">{data.reason}</p>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-700">
                Provedor recomendado: {data.recommendedProvider.toUpperCase()}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Configure a nova API key em Integracoes para continuar com geocodificacao precisa.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de provedores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plano de Migracao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "Here", limit: "30.000/mes", cost: "Gratis", status: data.provider === "here" ? "Atual" : "" },
              { name: "TomTom", limit: "100.000/mes", cost: "~$54/mes", status: data.provider === "tomtom" ? "Atual" : "" },
              { name: "OpenCage", limit: "Ilimitado", cost: "$50-125/mes", status: data.provider === "opencage" ? "Atual" : "" },
              { name: "CSV2GEO", limit: "Ilimitado", cost: "$50-100/mes", status: data.provider === "csv2geo" ? "Atual" : "" },
            ].map((p) => (
              <div
                key={p.name}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  p.status === "Atual" ? "bg-blue-50 border border-blue-200" : "bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">
                    {p.name}
                    {p.status && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {p.status}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{p.limit}</p>
                </div>
                <span className="text-sm font-medium text-slate-600">{p.cost}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
