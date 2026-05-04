import { useMemo, useState } from 'react';
import { Gift, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEleitores } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Eleitor } from '@/lib/supabase';

interface Props {}

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
    .replace(/{{comunidade}}/g, '')
    .replace(/{{cidade}}/g, eleitor.cidade || '');
}

export default function AniversariantesPanel({}: Props) {
  const { data: eleitores, loading } = useEleitores();
  const [selected, setSelected] = useState<Eleitor | null>(null);
  const [template, setTemplate] = useState('Olá {{nome}}! 🎉\n\nDesejo um feliz aniversário! Muita saúde, paz e conquistas.\n\nConte comigo sempre!\n\nAbraço,');
  const [copied, setCopied] = useState(false);
  const [enviados, setEnviados] = useState<Set<string>>(new Set());

  const hojeData = hoje();

  const aniversariantes = useMemo(() => {
    return eleitores.filter(e => {
      const dn = formatarDataNascimento(e.data_nascimento);
      return dn && dn.dia === hojeData.dia && dn.mes === hojeData.mes;
    });
  }, [eleitores, hojeData.dia, hojeData.mes]);

  const mensagemFinal = selected ? montarMensagem(template, selected) : '';

  const abrirWhatsApp = () => {
    if (!selected?.telefone) return;
    const tel = selected.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${tel}?text=${encodeURIComponent(mensagemFinal)}`;
    window.open(url, '_blank');
    setEnviados(prev => new Set(prev).add(selected.id));
  };

  const copiarMensagem = async () => {
    await navigator.clipboard.writeText(mensagemFinal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          {aniversariantes.map(e => (
            <Card key={e.id} className={`hover:shadow-sm transition-shadow ${enviados.has(e.id) ? 'opacity-60' : ''}`}>
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
                    {enviados.has(e.id) && (
                      <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                        Enviado
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => setSelected(e)}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setCopied(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Enviar WhatsApp para {selected?.nome?.split(' ')[0]}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Template da mensagem</label>
              <p className="text-[10px] text-slate-500">Variáveis: {'{{nome}}'}, {'{{nome_completo}}'}, {'{{cidade}}'}</p>
              <textarea
                value={template}
                onChange={e => setTemplate(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[100px]"
              />
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-medium text-slate-500 mb-1">Preview</p>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{mensagemFinal}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-xs" onClick={copiarMensagem}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
              <Button className="flex-1 h-9 text-xs bg-green-600 hover:bg-green-700" onClick={abrirWhatsApp} disabled={!selected?.telefone}>
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Abrir WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
