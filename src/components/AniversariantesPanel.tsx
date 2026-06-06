import { useMemo, useState } from 'react';
import { Gift, MessageCircle, Check, ExternalLink, Send, PartyPopper, CalendarDays, Calendar, CalendarRange } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEleitores, useConfiguracoes, useEnviosAniversario } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Eleitor } from '@/lib/supabase';

type FiltroPeriodo = 'dia' | 'semana' | 'mes';

function formatarDataNascimento(data: string | null): { dia: number; mes: number } | null {
  if (!data) return null;
  // Extrai dia/mês direto da string YYYY-MM-DD sem criar Date (evita timezone offset)
  const [anoStr, mesStr, diaStr] = data.split('-');
  if (!anoStr || !mesStr || !diaStr) return null;
  const dia = parseInt(diaStr, 10);
  const mes = parseInt(mesStr, 10);
  if (isNaN(dia) || isNaN(mes)) return null;
  return { dia, mes };
}

function hoje(): { dia: number; mes: number } {
  const d = new Date();
  return { dia: d.getDate(), mes: d.getMonth() + 1 };
}

function diasNoMes(mes: number, ano: number) {
  return new Date(ano, mes, 0).getDate();
}

function montarMensagem(template: string, eleitor: Eleitor): string {
  return template
    .replace(/{{nome}}/g, eleitor.nome?.split(' ')[0] || '')
    .replace(/{{nome_completo}}/g, eleitor.nome || '')
    .replace(/{{cidade}}/g, eleitor.cidade || '');
}

const DEFAULT_TEMPLATE = 'Olá {{nome}}! 🎉\n\nDesejo um feliz aniversário! Muita saúde, paz e conquistas.\n\nConte comigo sempre!\n\nAbraço,';

export default function AniversariantesPanel() {
  const { data: eleitores, loading: loadingEleitores } = useEleitores();
  const { data: configs, loading: loadingConfigs } = useConfiguracoes();
  const { data: envios, loading: loadingEnvios, insert, jaEnviouEsteAno } = useEnviosAniversario();
  const [selected, setSelected] = useState<Eleitor | null>(null);
  const [showMassModal, setShowMassModal] = useState(false);
  const [periodo, setPeriodo] = useState<FiltroPeriodo>('dia');
  const anoAtual = new Date().getFullYear();

  const template = configs['template_aniversario'] || DEFAULT_TEMPLATE;
  const hojeData = hoje();

  const aniversariantes = useMemo(() => {
    return eleitores.filter(e => {
      const dn = formatarDataNascimento(e.data_nascimento);
      if (!dn) return false;
      if (periodo === 'dia') {
        return dn.dia === hojeData.dia && dn.mes === hojeData.mes;
      }
      if (periodo === 'semana') {
        const hojeObj = new Date();
        const inicioSemana = new Date(hojeObj);
        inicioSemana.setDate(hojeObj.getDate() - hojeObj.getDay());
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        // Comparar dia/mes aproximado (simplificado: próximos 7 dias)
        for (let i = 0; i <= 6; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          if (dn.dia === d.getDate() && dn.mes === d.getMonth() + 1) return true;
        }
        return false;
      }
      // mes
      return dn.mes === hojeData.mes;
    });
  }, [eleitores, hojeData.dia, hojeData.mes, periodo]);

  const pendentes = useMemo(() => {
    return aniversariantes.filter(a => !jaEnviouEsteAno(a.id, anoAtual));
  }, [aniversariantes, envios, anoAtual]);

  const abrirWhatsApp = (eleitor: Eleitor) => {
    if (!eleitor.telefone) return;
    const mensagem = montarMensagem(template, eleitor);
    const tel = eleitor.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${tel}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const enviarIndividual = async (eleitor: Eleitor) => {
    abrirWhatsApp(eleitor);
    if (!jaEnviouEsteAno(eleitor.id, anoAtual)) {
      await insert(eleitor.id, anoAtual);
    }
  };

  const enviarTodos = async () => {
    for (const eleitor of pendentes) {
      if (eleitor.telefone) {
        abrirWhatsApp(eleitor);
        await insert(eleitor.id, anoAtual);
        await new Promise(r => setTimeout(r, 800));
      }
    }
    setShowMassModal(false);
  };

  const loading = loadingEleitores || loadingConfigs || loadingEnvios;

  const periodoLabels: Record<FiltroPeriodo, { label: string; icon: React.ElementType }> = {
    dia: { label: 'Hoje', icon: CalendarDays },
    semana: { label: 'Semana', icon: CalendarRange },
    mes: { label: 'Mês', icon: Calendar },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold text-slate-800">Aniversariantes</h3>
          <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            {aniversariantes.length}
          </span>
        </div>
        {pendentes.length > 0 && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-8" onClick={() => setShowMassModal(true)}>
            <Send className="w-3.5 h-3.5 mr-1" />
            Enviar {pendentes.length}
          </Button>
        )}
      </div>

      {/* Estatística de envios */}
      {aniversariantes.length > 0 && (
        <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Mensagens enviadas</span>
              <span className="font-medium text-slate-700">
                {aniversariantes.length - pendentes.length} de {aniversariantes.length}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${aniversariantes.length > 0 ? ((aniversariantes.length - pendentes.length) / aniversariantes.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {aniversariantes.length > 0 ? Math.round(((aniversariantes.length - pendentes.length) / aniversariantes.length) * 100) : 0}%
            </p>
            <p className="text-[10px] text-slate-400">enviado</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex bg-slate-100 rounded-lg p-0.5">
        {(Object.keys(periodoLabels) as FiltroPeriodo[]).map(p => {
          const { label, icon: Icon } = periodoLabels[p];
          return (
            <button key={p} onClick={() => setPeriodo(p)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${periodo === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : aniversariantes.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Gift className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum aniversariante {periodo === 'dia' ? 'hoje' : periodo === 'semana' ? 'esta semana' : 'este mês'}</p>
          <p className="text-xs mt-1">Cadastre a data de nascimento dos eleitores</p>
        </div>
      ) : (
        <div className="space-y-2">
          {aniversariantes.map(e => {
            const enviado = jaEnviouEsteAno(e.id, anoAtual);
            const dn = formatarDataNascimento(e.data_nascimento);
            return (
              <Card key={e.id} className={`hover:shadow-sm transition-shadow ${enviado ? 'opacity-60' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-pink-600 font-semibold text-xs">🎂</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 truncate">{e.nome}</p>
                        <p className="text-xs text-slate-500">{e.telefone} · {e.cidade} {dn && <span className="text-pink-500 font-medium">· {String(dn.dia).padStart(2,'0')}/{String(dn.mes).padStart(2,'0')}</span>}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {enviado && (
                        <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Enviado
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => enviado ? setSelected(e) : enviarIndividual(e)}
                        disabled={!e.telefone}
                      >
                        {enviado ? (
                          <>
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Reabrir
                          </>
                        ) : (
                          <>
                            <MessageCircle className="w-3.5 h-3.5 mr-1" />
                            WhatsApp
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog individual */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Mensagem para {selected?.nome?.split(' ')[0]}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-700 whitespace-pre-wrap">
              {selected ? montarMensagem(template, selected) : ''}
            </p>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => selected && abrirWhatsApp(selected)} disabled={!selected?.telefone}>
            <ExternalLink className="w-4 h-4 mr-1" />
            Abrir WhatsApp
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog envio em massa */}
      <Dialog open={showMassModal} onOpenChange={setShowMassModal}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-pink-500" />
              Enviar para {pendentes.length} aniversariante{pendentes.length > 1 ? 's' : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {pendentes.map(e => (
                <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700 truncate">{e.nome}</span>
                  <span className="text-xs text-slate-400">{e.telefone}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Isso vai abrir uma aba do WhatsApp para cada eleitor e registrar o envio.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowMassModal(false)}>Cancelar</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={enviarTodos}>
                <Send className="w-4 h-4 mr-1" />
                Enviar todos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
