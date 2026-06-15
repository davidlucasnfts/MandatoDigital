import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Mail, MessageSquare, CheckCircle2, Clock,
  AlertCircle, Copy, Trash2, BarChart3, Users, Calendar,
  ChevronDown, ChevronUp, Check, XCircle
} from '@/lib/icons';
import { supabase } from '@/lib/supabase';
import type { Campanha, EnvioCampanha } from '@/lib/supabase';

interface Props {
  campanha: Campanha | null;
  onClose: () => void;
  onExcluir?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  rascunho: { label: 'Rascunho', color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock },
  enviando: { label: 'Enviando', color: 'text-blue-600', bg: 'bg-blue-50', icon: Send },
  enviada: { label: 'Enviada', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  cancelada: { label: 'Cancelada', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
};

export default function CampanhaPreview({ campanha, onClose, onExcluir }: Props) {
  const [destinatarios, setDestinatarios] = useState<string[]>([]);
  const [mostrarDestinatarios, setMostrarDestinatarios] = useState(false);
  const [envios, setEnvios] = useState<EnvioCampanha[]>([]);
  const [mostrarEnvios, setMostrarEnvios] = useState(false);

  useEffect(() => {
    if (!campanha) return;
    async function buscarDestinatarios() {
      const { data: enviosData } = await supabase
        .from('envios_campanha')
        .select('*, eleitor:eleitor_id(nome)')
        .eq('campanha_id', campanha.id)
        .limit(50);
      if (enviosData) {
        const nomes = enviosData.map((e: any) => e.eleitor?.nome).filter(Boolean);
        setDestinatarios(nomes);
        setEnvios(enviosData as EnvioCampanha[]);
      }
    }
    buscarDestinatarios();
  }, [campanha?.id]);

  if (!campanha) return null;

  const cfg = statusConfig[campanha.status] || statusConfig.rascunho;
  const Icon = cfg.icon;
  const progresso = campanha.total_destinatarios > 0
    ? Math.round((campanha.total_enviados / campanha.total_destinatarios) * 100)
    : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(campanha.conteudo);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4"
      >
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cfg.bg}`}>
                  <Icon className={`w-6 h-6 ${cfg.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-2 break-all">{campanha.nome}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>
                      {cfg.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {campanha.tipo === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                  title="Copiar mensagem"
                >
                  <Copy className="w-3 h-3" /> Copiar
                </button>
                {onExcluir && (
                  <button
                    onClick={() => onExcluir(campanha.id)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Excluir campanha"
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-4 lg:p-6 space-y-4">
            {/* Mensagem */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Mensagem</p>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-700 whitespace-pre-wrap break-all">{campanha.conteudo}</p>
              </div>
            </div>

            {/* Grid de estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Destinatários</p>
                </div>
                <p className="text-lg font-bold text-slate-800">{campanha.total_destinatarios}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Enviados</p>
                </div>
                <p className="text-lg font-bold text-slate-800">{campanha.total_enviados}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Erros</p>
                </div>
                <p className="text-lg font-bold text-slate-800">{campanha.total_erros}</p>
              </div>
            </div>

            {/* Progresso */}
            {campanha.status !== 'rascunho' && campanha.total_destinatarios > 0 && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Progresso</span>
                  <span className="text-[10px] font-bold text-slate-700">{progresso}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            )}

            {/* Data */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-[10px] text-slate-400">
                Criada em {new Date(campanha.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>

            {/* Status dos Envios */}
            {envios.length > 0 && (
              <div>
                <button
                  onClick={() => setMostrarEnvios(!mostrarEnvios)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase mb-1 hover:text-slate-600 transition-colors"
                >
                  Status dos envios
                  {mostrarEnvios ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                {mostrarEnvios && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto"
                  >
                    <div className="space-y-1">
                      {envios.map((envio, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 truncate flex-1">
                            {destinatarios[i] || 'Desconhecido'}
                          </span>
                          <span className={`flex items-center gap-1 flex-shrink-0 ml-2 ${
                            envio.status === 'enviado' ? 'text-green-600' :
                            envio.status === 'erro' ? 'text-red-600' :
                            envio.status === 'lido' ? 'text-blue-600' :
                            'text-amber-600'
                          }`}>
                            {envio.status === 'enviado' && <Check className="w-3 h-3" />}
                            {envio.status === 'erro' && <XCircle className="w-3 h-3" />}
                            {envio.status === 'lido' && <CheckCircle2 className="w-3 h-3" />}
                            {envio.status === 'pendente' && <Clock className="w-3 h-3" />}
                            {envio.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Destinatários */}
            {destinatarios.length > 0 && (
              <div>
                <button
                  onClick={() => setMostrarDestinatarios(!mostrarDestinatarios)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase mb-1 hover:text-slate-600 transition-colors"
                >
                  Destinatários ({destinatarios.length})
                  {mostrarDestinatarios ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                {mostrarDestinatarios && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-slate-50 rounded-lg p-3 max-h-40 overflow-y-auto"
                  >
                    <div className="flex flex-wrap gap-1">
                      {destinatarios.map((nome, i) => (
                        <span key={i} className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[120px] inline-block">
                          {nome}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Filtros aplicados */}
            {campanha.filtros && Object.keys(campanha.filtros).some(k => campanha.filtros[k]) && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Filtros aplicados</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(campanha.filtros).map(([key, value]) => {
                    if (!value) return null;
                    return (
                      <span key={key} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded truncate max-w-[150px] inline-block">
                        {key}: {String(value)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" /> Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
