import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface BairroCount {
  bairro: string;
  total: number;
}

export default function TerritorioPanel() {
  const navigate = useNavigate();
  const [bairros, setBairros] = useState<BairroCount[]>([]);
  const [totalGeo, setTotalGeo] = useState(0);
  const [totalEleitores, setTotalEleitores] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);

    // Top 5 bairros
    const { data: rows } = await supabase
      .from('eleitores')
      .select('bairro')
      .not('bairro', 'is', null)
      .not('bairro', 'eq', '');

    const contagem: Record<string, number> = {};
    rows?.forEach(r => {
      const b = r.bairro?.trim() || 'Sem bairro';
      contagem[b] = (contagem[b] || 0) + 1;
    });

    const ordenado = Object.entries(contagem)
      .map(([bairro, total]) => ({ bairro, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    setBairros(ordenado);

    // Total geolocalizado
    const { count: geo } = await supabase
      .from('eleitores')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    setTotalGeo(geo || 0);

    // Total geral
    const { count: total } = await supabase
      .from('eleitores')
      .select('*', { count: 'exact', head: true });

    setTotalEleitores(total || 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const cobertura = totalEleitores > 0 ? Math.round((totalGeo / totalEleitores) * 100) : 0;
  const maxTotal = bairros[0]?.total || 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Território
          </CardTitle>
          <button onClick={() => navigate('/dashboard/mapa')} className="text-xs text-blue-600 hover:underline">
            Ver mapa
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] bg-slate-50 rounded animate-pulse" />
        ) : (
          <div className="space-y-4">
            {/* Cobertura geográfica */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Cobertura geográfica</span>
                <span className="font-medium text-slate-700">{totalGeo} de {totalEleitores}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${cobertura}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {cobertura}% dos eleitores estão geolocalizados no mapa
              </p>
            </div>

            {/* Top bairros */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Top bairros</p>
              {bairros.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum bairro cadastrado</p>
              ) : (
                bairros.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-slate-700 truncate">{b.bairro}</span>
                        <span className="text-slate-500 font-medium">{b.total}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(b.total / maxTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/dashboard/mapa')}
              className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 rounded hover:bg-blue-50 transition-colors"
            >
              Abrir mapa territorial <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
