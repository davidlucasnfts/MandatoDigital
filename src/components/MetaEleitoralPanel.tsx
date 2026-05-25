import { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, Users, Pencil, Check, X } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface MetaEleitoralProps {
  totalAtual: number;
}

export default function MetaEleitoralPanel({ totalAtual }: MetaEleitoralProps) {
  const [meta, setMeta] = useState<number>(0);
  const [editando, setEditando] = useState(false);
  const [inputMeta, setInputMeta] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMeta = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) { setLoading(false); return; }

    const { data } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'meta_eleitores')
      .eq('owner_id', ownerId)
      .single();

    const valor = data?.valor ? parseInt(data.valor, 10) : 0;
    setMeta(valor || 1000);
    setInputMeta(String(valor || 1000));
    setLoading(false);
  }, []);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  const salvarMeta = async () => {
    const valor = parseInt(inputMeta, 10);
    if (isNaN(valor) || valor < 1) return;

    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) return;

    await supabase.from('configuracoes').upsert({
      chave: 'meta_eleitores',
      valor: String(valor),
      user_id: ownerId,
    });

    setMeta(valor);
    setEditando(false);
  };

  const progresso = meta > 0 ? Math.min((totalAtual / meta) * 100, 100) : 0;
  const faltam = Math.max(meta - totalAtual, 0);

  // Projeção: eleitores no mês atual
  const calcularProjecao = () => {
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const diasPassados = Math.max(1, agora.getDate());
    const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();

    // Média diária do mês
    const mediaDiaria = totalAtual / Math.max(1, Math.floor((agora.getTime() - inicioMes.getTime()) / 86400000) + 1);
    const projecaoFimMes = Math.round(mediaDiaria * diasNoMes);

    if (projecaoFimMes >= meta) {
      const diasParaMeta = meta > 0 ? Math.ceil((meta - totalAtual) / mediaDiaria) : 0;
      return diasParaMeta > 0 ? `Meta em ${diasParaMeta} dias` : 'Meta atingida!';
    }
    return `Projeção: ${projecaoFimMes.toLocaleString()} até o fim do mês`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Meta Eleitoral
          </CardTitle>
          {editando ? (
            <div className="flex items-center gap-1">
              <button onClick={salvarMeta} className="p-1 rounded hover:bg-green-50 text-green-600"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => { setEditando(false); setInputMeta(String(meta)); }} className="p-1 rounded hover:bg-red-50 text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => setEditando(true)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[160px] bg-slate-50 rounded animate-pulse" />
        ) : (
          <div className="space-y-4">
            {/* Meta editável */}
            {editando ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inputMeta}
                  onChange={(e) => setInputMeta(e.target.value)}
                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={1}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') salvarMeta(); }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{totalAtual.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">de {meta.toLocaleString()} eleitores</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            )}

            {/* Barra de progresso */}
            <div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progresso}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-500">{progresso.toFixed(0)}% concluído</span>
                <span className="text-[10px] text-slate-500">{faltam > 0 ? `${faltam.toLocaleString()} faltam` : 'Meta atingida!'}</span>
              </div>
            </div>

            {/* Projeção */}
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-600">{calcularProjecao()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
