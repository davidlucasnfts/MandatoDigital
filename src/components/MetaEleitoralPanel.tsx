import { useState, useEffect, useCallback } from 'react';
import { Target, TrendingUp, Pencil, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
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
    const diasPassados = Math.max(1, Math.floor((agora.getTime() - inicioMes.getTime()) / 86400000) + 1);
    const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();

    const mediaDiaria = totalAtual / diasPassados;
    const projecaoFimMes = Math.round(mediaDiaria * diasNoMes);

    if (projecaoFimMes >= meta) {
      const diasParaMeta = meta > 0 ? Math.ceil((meta - totalAtual) / mediaDiaria) : 0;
      return diasParaMeta > 0 ? `Meta em ${diasParaMeta} dias` : 'Meta atingida!';
    }
    return `Projeção: ${projecaoFimMes.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="h-full"
    >
      <div className="h-full rounded-xl border border-slate-200 bg-white border-t-[3px] border-t-blue-600
        shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-3 lg:p-4">
          {/* Header: ícone + valor + ação na mesma linha */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Target className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600" />
            </div>
            {loading ? (
              <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" />
            ) : editando ? (
              <input
                type="number"
                value={inputMeta}
                onChange={(e) => setInputMeta(e.target.value)}
                className="flex-1 text-sm lg:text-base border border-slate-200 rounded-lg px-2 py-1
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') salvarMeta(); }}
                aria-label="Nova meta de eleitores"
              />
            ) : (
              <p className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">{totalAtual.toLocaleString()}</p>
            )}
            <div className="ml-auto flex items-center gap-1">
              {editando ? (
                <>
                  <button onClick={salvarMeta} className="p-1 rounded-md hover:bg-green-50 text-green-600 transition-colors" aria-label="Salvar meta"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setEditando(false); setInputMeta(String(meta)); }} className="p-1 rounded-md hover:bg-red-50 text-red-600 transition-colors" aria-label="Cancelar"><X className="w-3.5 h-3.5" /></button>
                </>
              ) : (
                <button onClick={() => setEditando(true)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Editar meta"><Pencil className="w-3.5 h-3.5" /></button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="h-[60px] bg-slate-50 rounded animate-pulse" />
          ) : (
            <div className="space-y-2">
              {/* Label */}
              {!editando && (
                <p className="text-[10px] lg:text-xs text-slate-500">de {meta.toLocaleString()} eleitores</p>
              )}

              {/* Barra de progresso animada */}
              <div className="space-y-1">
                <div className="w-full h-1.5 lg:h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progresso}%` }}
                    transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] lg:text-[10px] text-slate-500 font-medium">{progresso.toFixed(0)}%</span>
                  <span className="text-[9px] lg:text-[10px] text-slate-500">{faltam > 0 ? `${faltam.toLocaleString()} faltam` : 'Atingida!'}</span>
                </div>
              </div>

              {/* Projeção */}
              <div className="flex items-center gap-1 text-[9px] lg:text-[10px] text-green-600 font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>{calcularProjecao()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
