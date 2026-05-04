import { useMemo, useState } from 'react';
import { Gift, MessageCircle, Check, ExternalLink, Send, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEleitores, useConfiguracoes, useEnviosAniversario } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Eleitor } from '@/lib/supabase';

function formatarDataNascimento(data: string | null): { dia: number; mes: number } | null {
  if (!data) return null;
  const d = new Date(data + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return { dia: d.getDate(), mes: d.getMonth() + 1 };
}

function hoje(): { dia: number; mes: number } {
  const d = new Date();
  return { dia: d.getDate(), mes: d.getMonth() + 1 };
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
  const anoAtual = new Date().getFullYear();

  const template = configs['template_aniversario'] || DEFAULT_TEMPLATE;

  const hojeData = hoje();

  const aniversariantes = useMemo(() => {
    return eleitores.filter(e => {
      const dn = formatarDataNascimento(e.data_nascimento);
      return dn && dn.dia === hojeData.dia && dn.mes === hojeData.mes;
    });
  }, [eleitores, hojeData.dia, hojeData.mes]);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold text-slate-800">Aniversariantes do Dia</h3>
          <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            {aniversariantes.length}
          </span>
        </div>
        {pendentes.length > 0 && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-8" onClick={() => setShowMassModal(true)}>
            <Send className="w-3.5 h-3.5 mr-1" />
            Enviar para {pendentes.length}
          </Button>
        )}
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
          <p className="text-sm">Nenhum aniversariante hoje</p>
          <p className="text-xs mt-1">Cadastre a data de nascimento dos eleitores</p>
        </div>
      ) : (
        <div className="space-y-2">
          {aniversariantes.map(e => {
            const enviado = jaEnviouEsteAno(e.id, anoAtual);
            return (
              <Card key={e.id} className={`hover:shadow-sm transition-shadow ${enviado ? 'opacity-60' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-pink-600 font-semibold text-xs">🎂</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{e.nome}</p>
                        <p className="text-xs text-slate-500">{e.telefone} · {e.cidade}</p>
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
        <DialogContent className="max-w-md">
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
        <DialogContent className="max-w-md">
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
                  <span className="text-sm text-slate-700">{e.nome}</span>
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
                Enviar Todos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
