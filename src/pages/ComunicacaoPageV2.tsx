import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, Mail, Plus, Eye, Users, CheckCircle2,
  Clock, AlertCircle, Trash2, BarChart3, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCampanhas } from '@/hooks/useCampanhas';
import { useTemplates } from '@/hooks/useTemplates';
import NovaCampanhaDialog from '@/components/NovaCampanhaDialog';
import NovoTemplateDialog from '@/components/NovoTemplateDialog';
import type { Campanha, TemplateMensagem } from '@/lib/supabase';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  rascunho: { label: 'Rascunho', color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock },
  enviando: { label: 'Enviando', color: 'text-blue-600', bg: 'bg-blue-50', icon: Send },
  enviada: { label: 'Enviada', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
  cancelada: { label: 'Cancelada', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
};

export default function ComunicacaoPage() {
  const { data: campanhas, loading: loadingCampanhas, remove: removeCampanha } = useCampanhas();
  const { data: templates, loading: loadingTemplates, remove: removeTemplate } = useTemplates();
  const [showNovaCampanha, setShowNovaCampanha] = useState(false);
  const [showNovoTemplate, setShowNovoTemplate] = useState(false);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<Campanha | null>(null);

  const stats = {
    total: campanhas.length,
    enviadas: campanhas.filter(c => c.status === 'enviada').length,
    enviando: campanhas.filter(c => c.status === 'enviando').length,
    rascunhos: campanhas.filter(c => c.status === 'rascunho').length,
    totalEnvios: campanhas.reduce((sum, c) => sum + c.total_enviados, 0),
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              Comunicação
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Envie mensagens para sua base de eleitores.
            </p>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white w-fit"
            onClick={() => setShowNovaCampanha(true)}
          >
            <Send className="w-4 h-4 mr-1.5" /> Nova Campanha
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {[
          { label: 'Campanhas', value: stats.total, icon: BarChart3, color: 'blue' },
          { label: 'Enviadas', value: stats.enviadas, icon: CheckCircle2, color: 'green' },
          { label: 'Em andamento', value: stats.enviando, icon: Send, color: 'amber' },
          { label: 'Total de envios', value: stats.totalEnvios, icon: Users, color: 'purple' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            custom={i + 1}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <Card className="border-t-[3px]" style={{ borderTopColor: s.color === 'blue' ? '#2563EB' : s.color === 'green' ? '#16a34a' : s.color === 'amber' ? '#d97706' : '#7c3aed' }}>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`w-4 h-4 ${s.color === 'blue' ? 'text-blue-600' : s.color === 'green' ? 'text-green-600' : s.color === 'amber' ? 'text-amber-600' : 'text-purple-600'}`} />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campanhas" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Campanhas */}
        <TabsContent value="campanhas" className="space-y-4">
          {loadingCampanhas ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : campanhas.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Nenhuma campanha ainda</p>
              <p className="text-xs text-slate-400 mt-1">Crie sua primeira campanha de comunicação</p>
              <Button
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setShowNovaCampanha(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Nova Campanha
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campanhas.map((c, i) => {
                const cfg = statusConfig[c.status] || statusConfig.rascunho;
                const Icon = cfg.icon;
                const progresso = c.total_destinatarios > 0
                  ? Math.round((c.total_enviados / c.total_destinatarios) * 100)
                  : 0;

                return (
                  <motion.div
                    key={c.id}
                    custom={i}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setCampanhaSelecionada(c)}>
                      <CardContent className="p-3 lg:p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                              <Icon className={`w-5 h-5 ${cfg.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{c.nome}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>
                                  {cfg.label}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {c.tipo === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(c.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs font-bold text-slate-700">
                              {c.total_enviados}/{c.total_destinatarios}
                            </span>
                            <span className="text-[10px] text-slate-400">enviados</span>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        {c.status !== 'rascunho' && c.total_destinatarios > 0 && (
                          <div className="mt-3">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${progresso}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[9px] text-slate-400">{progresso}% concluído</span>
                              {c.total_erros > 0 && (
                                <span className="text-[9px] text-red-500">{c.total_erros} erros</span>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNovoTemplate(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Novo Template
            </Button>
          </div>

          {loadingTemplates ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Nenhum template ainda</p>
              <p className="text-xs text-slate-400 mt-1">Crie templates para reutilizar mensagens</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((t, i) => (
                <motion.div
                  key={t.id}
                  custom={i}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {t.tipo === 'whatsapp' ? (
                          <MessageSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <Mail className="w-4 h-4 text-blue-600" />
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          t.tipo === 'whatsapp' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {t.tipo.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm">{t.nome}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.conteudo}</p>
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {t.variaveis?.map(v => (
                          <span key={v} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {v}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-end gap-1 mt-3">
                        <button
                          onClick={() => removeTemplate(t.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <NovaCampanhaDialog open={showNovaCampanha} onClose={() => setShowNovaCampanha(false)} />
      <NovoTemplateDialog open={showNovoTemplate} onClose={() => setShowNovoTemplate(false)} />
    </div>
  );
}
