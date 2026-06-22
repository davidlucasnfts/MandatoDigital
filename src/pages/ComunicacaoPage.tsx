import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, Mail, Plus, Eye, Users, CheckCircle2,
  Clock, AlertCircle, Trash2, BarChart3, Copy, Pencil, Play, RotateCcw,
  ChevronDown, FileText, X
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilterBar } from '@/components/dashboard';
import { useCampanhas } from '@/hooks/useCampanhas';
import { useTemplates } from '@/hooks/useTemplates';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { aplicarTemplate } from '@/lib/templateUtils';
import NovoComunicadoDialog from '@/components/NovoComunicadoDialog';
import NovoTemplateDialog from '@/components/NovoTemplateDialog';
import CampanhaPreview from '@/components/CampanhaPreview';
import WhatsAppStatusCard from '@/components/WhatsAppStatusCard';
import type { Campanha, TemplateMensagem, Eleitor } from '@/lib/supabase';

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
  const { data: campanhas, loading: loadingCampanhas, remove: removeCampanha, update: updateCampanha, fetch: fetchCampanhas } = useCampanhas();
  const { data: templates, loading: loadingTemplates, remove: removeTemplate, fetch: fetchTemplates } = useTemplates();
  const { data: eleitores } = useEleitores();
  const { data: comunidades } = useComunidades();
  const { sendText } = useWhatsApp();
  const [showNovaCampanha, setShowNovaCampanha] = useState(false);
  const [showNovoTemplate, setShowNovoTemplate] = useState(false);
  const [templateEditando, setTemplateEditando] = useState<TemplateMensagem | null>(null);
  const [templatePreview, setTemplatePreview] = useState<TemplateMensagem | null>(null);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<Campanha | null>(null);
  const [campanhaEditando, setCampanhaEditando] = useState<Campanha | null>(null);
  const [templatePreSelecionado, setTemplatePreSelecionado] = useState<TemplateMensagem | null>(null);
  const [tab, setTab] = useState('campanhas');
  const [campanhaEnviando, setCampanhaEnviando] = useState<string | null>(null);
  const [enviandoProgresso, setEnviandoProgresso] = useState({ atual: 0, total: 0 });

  const tabCounts = {
    campanhas: campanhas?.length ?? 0,
    templates: templates?.length ?? 0,
  };

  const handleEnviarCampanha = async (campanha: Campanha) => {
    if (!eleitores || campanha.status !== 'rascunho') return;
    setCampanhaEnviando(campanha.id);

    // Buscar destinatários pelos filtros da campanha
    const filtros = campanha.filtros || {};
    const destinatarios = eleitores.filter(e => {
      if (filtros.comunidade && e.comunidade_id !== filtros.comunidade) return false;
      if (filtros.cidade && e.cidade?.toLowerCase() !== filtros.cidade.toLowerCase()) return false;
      if (filtros.bairro && e.bairro?.toLowerCase() !== filtros.bairro.toLowerCase()) return false;
      if (filtros.lider && e.id !== filtros.lider) return false;
      if (filtros.liderados && e.lider_id !== filtros.liderados) return false;
      if (campanha.tipo === 'whatsapp' && !e.telefone) return false;
      if (campanha.tipo === 'email' && !e.email) return false;
      return true;
    });

    if (destinatarios.length === 0) {
      setCampanhaEnviando(null);
      return;
    }

    // Atualiza status para enviando
    await updateCampanha(campanha.id, { status: 'enviando', total_destinatarios: destinatarios.length });
    setEnviandoProgresso({ atual: 0, total: destinatarios.length });

    // Envia mensagens reais
    let enviados = 0;
    let erros = 0;

    if (campanha.tipo === 'whatsapp') {
      for (let i = 0; i < destinatarios.length; i++) {
        const eleitor = destinatarios[i];
        const phone = eleitor.telefone?.replace(/\D/g, '');
        if (phone) {
          const mensagemPersonalizada = aplicarTemplate(campanha.conteudo, eleitor, comunidades || []);
          const result = await sendText(phone, mensagemPersonalizada);
          if (result.ok) enviados++;
          else erros++;
        } else {
          erros++;
        }
        setEnviandoProgresso({ atual: i + 1, total: destinatarios.length });
        await new Promise(r => setTimeout(r, 1000));
      }
    } else {
      // Email: simula por enquanto
      for (let i = 0; i < destinatarios.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        enviados++;
        setEnviandoProgresso({ atual: i + 1, total: destinatarios.length });
      }
    }

    // Finaliza
    await updateCampanha(campanha.id, {
      status: 'enviada',
      total_enviados: enviados,
      total_erros: erros,
    });

    setCampanhaEnviando(null);
    setEnviandoProgresso({ atual: 0, total: 0 });
  };

  const handleReenviarCampanha = async (campanha: Campanha) => {
    if (!eleitores || campanha.status !== 'enviada' || campanhaEnviando === campanha.id) return;
    setCampanhaEnviando(campanha.id);

    const filtros = campanha.filtros || {};
    const destinatarios = eleitores.filter(e => {
      if (filtros.comunidade && e.comunidade_id !== filtros.comunidade) return false;
      if (filtros.cidade && e.cidade?.toLowerCase() !== filtros.cidade.toLowerCase()) return false;
      if (filtros.bairro && e.bairro?.toLowerCase() !== filtros.bairro.toLowerCase()) return false;
      if (filtros.lider && e.id !== filtros.lider) return false;
      if (filtros.liderados && e.lider_id !== filtros.liderados) return false;
      if (campanha.tipo === 'whatsapp' && !e.telefone) return false;
      if (campanha.tipo === 'email' && !e.email) return false;
      return true;
    });

    if (destinatarios.length === 0) {
      setCampanhaEnviando(null);
      return;
    }

    setEnviandoProgresso({ atual: 0, total: destinatarios.length });

    let enviados = 0;
    let erros = 0;

    if (campanha.tipo === 'whatsapp') {
      for (let i = 0; i < destinatarios.length; i++) {
        const eleitor = destinatarios[i];
        const phone = eleitor.telefone?.replace(/\D/g, '');
        if (phone) {
          const mensagemPersonalizada = aplicarTemplate(campanha.conteudo, eleitor, comunidades || []);
          const result = await sendText(phone, mensagemPersonalizada);
          if (result.ok) enviados++;
          else erros++;
        } else {
          erros++;
        }
        setEnviandoProgresso({ atual: i + 1, total: destinatarios.length });
        await new Promise(r => setTimeout(r, 1000));
      }
    } else {
      // Email: simula por enquanto
      for (let i = 0; i < destinatarios.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        enviados++;
        setEnviandoProgresso({ atual: i + 1, total: destinatarios.length });
      }
    }

    await updateCampanha(campanha.id, {
      total_enviados: campanha.total_enviados + enviados,
      total_erros: (campanha.total_erros || 0) + erros,
    });

    setCampanhaEnviando(null);
    setEnviandoProgresso({ atual: 0, total: 0 });
  };

  const handleCloseNovaCampanha = () => {
    setShowNovaCampanha(false);
    setCampanhaEditando(null);
    setTemplatePreSelecionado(null);
  };

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
            onClick={() => { setCampanhaEditando(null); setTemplatePreSelecionado(null); setShowNovaCampanha(true); }}
          >
            <Send className="w-4 h-4 mr-1.5" /> Novo Comunicado
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {[
          { label: 'Comunicados', value: stats.total, icon: BarChart3, color: 'blue' },
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

      {/* WhatsApp */}
      <WhatsAppStatusCard layout="horizontal" />

      {/* SearchFilterBar */}
      <SearchFilterBar
        showSearch={false}
        delay={2}
        tabs={[
          { value: 'campanhas', label: 'Comunicados', count: tabCounts.campanhas },
          { value: 'templates', label: 'Templates', count: tabCounts.templates },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />

      {/* Campanhas */}
      {tab === 'campanhas' && (
        <div className="space-y-4">
          {loadingCampanhas ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : campanhas.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Nenhum comunicado ainda</p>
              <p className="text-xs text-slate-400 mt-1">Crie seu primeiro comunicado</p>
              <Button
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => { setCampanhaEditando(null); setTemplatePreSelecionado(null); setShowNovaCampanha(true); }}
              >
                <Plus className="w-4 h-4 mr-1.5" /> Novo Comunicado
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
                    <Card className="hover:shadow-md transition-shadow h-full cursor-pointer"
                      onClick={() => setCampanhaSelecionada(c)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                              <Icon className={`w-5 h-5 ${cfg.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 line-clamp-2 break-all">{c.nome}</p>
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
                          {/* Ações por status */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-xs font-bold text-slate-700">
                              {c.total_enviados}/{c.total_destinatarios}
                            </span>
                            <div className="flex flex-col gap-1">
                              {/* Rascunho: Editar + Enviar + Excluir */}
                              {c.status === 'rascunho' && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setCampanhaEditando(c); setShowNovaCampanha(true); }}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                                    title="Editar"
                                  >
                                    <Pencil className="w-3 h-3" /> Editar
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEnviarCampanha(c); }}
                                    disabled={campanhaEnviando === c.id}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm disabled:opacity-50"
                                    title="Enviar agora"
                                  >
                                    <Play className="w-3 h-3" />
                                    {campanhaEnviando === c.id ? 'Enviando...' : 'Enviar'}
                                  </button>
                                </>
                              )}
                              {/* Enviada: Reenviar */}
                              {c.status === 'enviada' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleReenviarCampanha(c); }}
                                  disabled={campanhaEnviando === c.id}
                                  className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-amber-600 text-white hover:bg-amber-700 rounded-lg shadow-sm disabled:opacity-50"
                                  title="Reenviar"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  {campanhaEnviando === c.id ? 'Enviando...' : 'Reenviar'}
                                </button>
                              )}
                              {/* Excluir (todos os status) */}
                              <button
                                onClick={(e) => { e.stopPropagation(); removeCampanha(c.id); }}
                                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
                                title="Excluir"
                              >
                                <Trash2 className="w-3 h-3" /> Excluir
                              </button>
                            </div>
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
        </div>
      )}

      {/* Templates */}
      {tab === 'templates' && (
        <div className="space-y-4">
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
                  <Card className="hover:shadow-md transition-shadow h-full cursor-pointer"
                    onClick={() => setTemplatePreview(t)}>
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
                      <h3 className="font-semibold text-slate-800 text-sm break-all">{t.nome}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 break-all">{t.conteudo}</p>
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {t.variaveis?.map(v => (
                          <span key={v} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {v}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-end gap-1 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setTemplateEditando(t); setShowNovoTemplate(true); }}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                          title="Editar"
                        >
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCampanhaEditando(null); setTemplatePreSelecionado(t); setShowNovaCampanha(true); }}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm"
                          title="Usar template"
                        >
                          <FileText className="w-3 h-3" /> Usar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeTemplate(t.id); }}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      <CampanhaPreview
        campanha={campanhaSelecionada}
        onClose={() => setCampanhaSelecionada(null)}
        onExcluir={(id) => {
          removeCampanha(id);
          setCampanhaSelecionada(null);
        }}
      />

      {/* Preview do Template */}
      {templatePreview && (
        <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setTemplatePreview(null)}>
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="p-4 lg:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      templatePreview.tipo === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {templatePreview.tipo === 'whatsapp' ? (
                        <MessageSquare className="w-6 h-6 text-green-600" />
                      ) : (
                        <Mail className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-2 break-all">{templatePreview.nome}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        templatePreview.tipo === 'whatsapp' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {templatePreview.tipo.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setTemplatePreview(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 lg:p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Conteúdo</p>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-all">{templatePreview.conteudo}</p>
                  </div>
                </div>
                {templatePreview.variaveis && templatePreview.variaveis.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Variáveis</p>
                    <div className="flex flex-wrap gap-1">
                      {templatePreview.variaveis.map(v => (
                        <span key={v} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { setTemplateEditando(templatePreview); setShowNovoTemplate(true); setTemplatePreview(null); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => { setCampanhaEditando(null); setTemplatePreSelecionado(templatePreview); setShowNovaCampanha(true); setTemplatePreview(null); }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg"
                  >
                    <FileText className="w-3 h-3" /> Usar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <NovoComunicadoDialog
        open={showNovaCampanha}
        onClose={handleCloseNovaCampanha}
        campanhaEditando={campanhaEditando}
        templatePreSelecionado={templatePreSelecionado}
        templates={templates}
        onInsert={() => {
          // Recarrega lista de comunicados após inserir
          fetchCampanhas();
        }}
        onSuccess={() => {
          // Recarrega lista de comunicados após enviar
          fetchCampanhas();
        }}
      />
      <NovoTemplateDialog
        open={showNovoTemplate}
        onClose={() => {
          setShowNovoTemplate(false);
          setTemplateEditando(null);
        }}
        onSuccess={() => {
          fetchTemplates();
        }}
        templateEditando={templateEditando}
      />
    </div>
  );
}
