import { useState } from "react";
import { Target, TrendingUp, Pencil, Check, X } from "lucide-react";
import { motion } from "framer-motion";

interface MetaPanelProps {
  totalAtual: number;
  metaInicial?: number;
  delay?: number;
}

export function MetaPanel({ totalAtual, metaInicial = 1000, delay = 0 }: MetaPanelProps) {
  const [meta, setMeta] = useState(metaInicial);
  const [editando, setEditando] = useState(false);
  const [inputMeta, setInputMeta] = useState(String(metaInicial));

  const progresso = meta > 0 ? Math.min((totalAtual / meta) * 100, 100) : 0;
  const faltam = Math.max(meta - totalAtual, 0);

  const salvarMeta = () => {
    const valor = parseInt(inputMeta, 10);
    if (!isNaN(valor) && valor >= 1) {
      setMeta(valor);
      setEditando(false);
    }
  };

  const calcularProjecao = () => {
    const agora = new Date();
    const diasPassados = Math.max(1, agora.getDate());
    const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
    const mediaDiaria = totalAtual / diasPassados;
    const projecaoFimMes = Math.round(mediaDiaria * diasNoMes);

    if (projecaoFimMes >= meta) {
      const diasParaMeta = Math.ceil((meta - totalAtual) / mediaDiaria);
      return diasParaMeta > 0 ? `Meta em ${diasParaMeta} dias` : "Meta atingida!";
    }
    return `Projeção: ${projecaoFimMes.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="h-full"
    >
      <div className="h-full rounded-xl border border-slate-200 bg-white border-t-[3px] border-t-blue-600 
        shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-4 lg:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            {editando ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={salvarMeta}
                  className="p-1 rounded-md hover:bg-green-50 text-green-600 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Salvar meta"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditando(false);
                    setInputMeta(String(meta));
                  }}
                  className="p-1 rounded-md hover:bg-red-50 text-red-600 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Cancelar edição"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditando(true)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Editar meta"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Valor */}
          {editando ? (
            <input
              type="number"
              value={inputMeta}
              onChange={(e) => setInputMeta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && salvarMeta()}
              className="w-full text-lg font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-2
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={1}
              autoFocus
              aria-label="Nova meta de eleitores"
            />
          ) : (
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                {totalAtual.toLocaleString()}
              </div>
              <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5">
                de {meta.toLocaleString()} eleitores
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-3 space-y-1.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progresso}%` }}
                transition={{ duration: 0.8, delay: delay * 0.1 + 0.3 }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] lg:text-[10px] text-slate-500 font-medium">
                {progresso.toFixed(0)}%
              </span>
              <span className="text-[9px] lg:text-[10px] text-slate-500">
                {faltam > 0 ? `${faltam.toLocaleString()} faltam` : "Atingida!"}
              </span>
            </div>
          </div>

          {/* Projeção */}
          <div className="flex items-center gap-1 mt-2 text-[9px] lg:text-[10px] text-green-600 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>{calcularProjecao()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
