import { useState, useMemo } from 'react';
import { Send, MessageSquare, Mail, X, Users, Check, Filter, AlertTriangle } from 'lucide-react';
import { isValidPhone, normalizePhoneForWhatsApp } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { useCampanhas, useEnviosCampanha } from '@/hooks/useCampanhas';
import { useTemplates } from '@/hooks/useTemplates';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import type { Eleitor, TemplateMensagem } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
}

function aplicarTemplate(conteudo: string, eleitor: Eleitor): string {
  return conteudo
    .replace(/{{nome}}/g, eleitor.nome?.split(' ')[0] || '')
    .replace(/{{nome_completo}}/g, eleitor.nome || '')
    .replace(/{{cidade}}/g, eleitor.cidade || '')
    .replace(/{{bairro}}/g, eleitor.bairro || '')
    .replace(/{{telefone}}/g, eleitor.telefone || '')
    .replace(/{{endereco}}/g, eleitor.endereco || '');
}

export default function NovaCampanhaDialog({ open, onClose }: Props) {
  const { data: eleitores } = useEleitores();
  const { data: comunidades } = useComunidades();
  const { data: templates } = useTemplates();
  const { insert: insertCampanha, update: updateCampanha } = useCampanhas();
  const { criarEnvios } = useEnviosCampanha();
  const { sendBulk } = useWhatsApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'whatsapp' | 'email'>('whatsapp');
  const [templateId, setTemplateId] = useState<string>('');
  const [conteudo, setConteudo] = useState('');
  const [filtroComunidade, setFiltroComunidade] = useState<string>('');
  const [filtroBairro, setFiltroBairro] = useState<string>('');
  const [filtroTag, setFiltroTag] = useState<string>('');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });

  const templateSelecionado = useMemo(() =>
    templates.find(t => t.id === templateId),
    [templates, templateId]
  );

  const eleitoresFiltrados = useMemo(() => {
    return eleitores.filter(e => {
      if (filtroComunidade && e.comunidade_id !== filtroComunidade) return false;
      if (filtroBairro && e.bairro?.toLowerCase() !== filtroBairro.toLowerCase()) return false;
      if (filtroTag && !e.tags?.includes(filtroTag)) return false;
      if (tipo === 'whatsapp' && !e.telefone) return false;
      if (tipo === 'email' && !e.email) return false;
      return true;
    });
  }, [eleitores, filtroComunidade, filtroBairro, filtroTag, tipo]);

  const bairrosUnicos = useMemo(() =>
    [...new Set(eleitores.map(e => e.bairro).filter(Boolean))].sort(),
    [eleitores]
  );

  const tagsUnicas = useMemo(() =>
    [...new Set(eleitores.flatMap(e => e.tags || []))].sort(),
    [eleitores]
  );

  const reset = () => {
    setStep(1);
    setNome('');
    setTipo('whatsapp');
    setTemplateId('');
    setConteudo('');
    setFiltroComunidade('');
    setFiltroBairro('');
    setFiltroTag('');
    setSelecionados(new Set());
    setProgresso({ atual: 0, total: 0 });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selecionarTodos = () => {
    setSelecionados(new Set(eleitoresFiltrados.map(e => e.id)));
  };

  const limparSelecao = () => {
    setSelecionados(new Set());
  };

  const usarTemplate = (t: TemplateMensagem) => {
    setTemplateId(t.id);
    setTipo(t.tipo);
    if (t.assunto) setNome(t.assunto);
    setConteudo(t.conteudo);
  };

  const enviar = async () => {
    if (!nome.trim() || !conteudo.trim() || selecionados.size === 0) return;
    setEnviando(true);

    // 1. Criar campanha
    const campanha = await insertCampanha({
      nome: nome.trim(),
      tipo,
      template_id: templateId || null,
      assunto: tipo === 'email' ? nome.trim() : null,
      conteudo: conteudo.trim(),
      status: 'enviando',
      total_destinatarios: selecionados.size,
      total_enviados: 0,
      total_erros: 0,
      filtros: { comunidade: filtroComunidade, bairro: filtroBairro, tag: filtroTag },
    });

    if (!campanha) {
      setEnviando(false);
      return;
    }

    // 2. Criar registros de envio
    const destinatarios = eleitores.filter(e => selecionados.has(e.id));
    await criarEnvios(campanha.id, destinatarios, conteudo);

    // 3. Enviar via WhatsApp (WAHA API)
    setProgresso({ atual: 0, total: destinatarios.length });
    let enviados = 0;
    let erros = 0;
    const errosLista: { nome: string; telefone: string; motivo: string }[] = [];

    if (tipo === 'whatsapp') {
      // Filtra apenas telefones válidos
      const destinatariosValidos = destinatarios.filter(e => {
        if (!e.telefone) {
          errosLista.push({ nome: e.nome, telefone: '(vazio)', motivo: 'Sem telefone' });
          return false;
        }
        if (!isValidPhone(e.telefone)) {
          errosLista.push({ nome: e.nome, telefone: e.telefone, motivo: 'Formato inválido' });
          return false;
        }
        return true;
      });

      const phones = destinatariosValidos.map(e => normalizePhoneForWhatsApp(e.telefone!));
      const result = await sendBulk(
        phones,
        conteudo,
        (current, total) => setProgresso({ atual: current, total })
      );
      enviados = result.success;
      erros = result.failed + errosLista.length;
    }

    // 4. Atualizar campanha como enviada
    await updateCampanha(campanha.id, {
      status: 'enviada',
      total_enviados: enviados,
      total_erros: erros,
    });

    setEnviando(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="w-5 h-5 text-green-600" />
            Nova Campanha — Etapa {step}/3
          </DialogTitle>
        </DialogHeader>

        {/* Etapa 1: Mensagem */}
        {step === 1 && (
          <div className="space-y-4 mt-2">
            {/* Tipo */}
            <div className="flex gap-2">
              <Button
                variant={tipo === 'whatsapp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipo('whatsapp')}
                className={tipo === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <MessageSquare className="w-4 h-4 mr-1.5" /> WhatsApp
              </Button>
              <Button
                variant={tipo === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipo('email')}
                className={tipo === 'email' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Mail className="w-4 h-4 mr-1.5" /> E-mail
              </Button>
            </div>

            {/* Templates */}
            {templates.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Usar template</label>
                <div className="flex flex-wrap gap-1.5">
                  {templates.filter(t => t.tipo === tipo).map(t => (
                    <button
                      key={t.id}
                      onClick={() => usarTemplate(t)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        templateId === t.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nome/Assunto */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                {tipo === 'email' ? 'Assunto' : 'Nome da campanha'}
              </label>
              <Input
                placeholder={tipo === 'email' ? 'Digite o assunto...' : 'Ex: Agradecimento de fim de ano'}
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Conteúdo */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Conteúdo</label>
              <textarea
                placeholder={`Digite a mensagem...\n\nUse {{nome}}, {{cidade}}, {{bairro}} para personalizar.`}
                rows={5}
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">{conteudo.length} caracteres</p>
            </div>

            {/* Preview */}
            {conteudo && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Preview</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">
                  {aplicarTemplate(conteudo, {
                    nome: 'João Silva', cidade: 'João Pessoa', bairro: 'Centro',
                    telefone: '(83) 99999-9999', endereco: 'Rua das Flores, 123',
                  } as Eleitor)}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setStep(2)}
                disabled={!nome.trim() || !conteudo.trim()}
              >
                Próximo: Destinatários
              </Button>
            </div>
          </div>
        )}

        {/* Etapa 2: Destinatários */}
        {step === 2 && (
          <div className="space-y-4 mt-2">
            {/* Filtros */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Comunidade</label>
                <select
                  value={filtroComunidade}
                  onChange={e => setFiltroComunidade(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Todas</option>
                  {comunidades.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Bairro</label>
                <select
                  value={filtroBairro}
                  onChange={e => setFiltroBairro(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Todos</option>
                  {bairrosUnicos.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Tag</label>
                <select
                  value={filtroTag}
                  onChange={e => setFiltroTag(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Todas</option>
                  {tagsUnicas.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumo filtros */}
            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-600">
                  {eleitoresFiltrados.length} eleitor{eleitoresFiltrados.length !== 1 ? 'es' : ''} encontrado{eleitoresFiltrados.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {selecionados.size} selecionado{selecionados.size !== 1 ? 's' : ''}
                </span>
                <button onClick={selecionarTodos} className="text-[10px] text-blue-600 hover:underline">
                  Todos
                </button>
                <button onClick={limparSelecao} className="text-[10px] text-red-600 hover:underline">
                  Limpar
                </button>
              </div>
            </div>

            {/* Lista de eleitores */}
            <div className="max-h-[300px] overflow-y-auto border rounded-lg">
              {eleitoresFiltrados.map(e => (
                <div
                  key={e.id}
                  onClick={() => toggleSelecionado(e.id)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors ${
                    selecionados.has(e.id) ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                    selecionados.has(e.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                  }`}>
                    {selecionados.has(e.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{e.nome}</p>
                    <p className="text-[10px] text-slate-500">
                      {e.telefone} · {e.bairro} · {e.cidade}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setStep(3)}
                disabled={selecionados.size === 0}
              >
                Próximo: Revisar
              </Button>
            </div>
          </div>
        )}

        {/* Etapa 3: Revisar e Enviar */}
        {step === 3 && (
          <div className="space-y-4 mt-2">
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Campanha</p>
                <p className="text-sm font-medium text-slate-800">{nome}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Tipo</p>
                <p className="text-sm text-slate-700">
                  {tipo === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Destinatários</p>
                <p className="text-sm text-slate-700">{selecionados.size} eleitores</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">Mensagem</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap bg-white rounded p-2 mt-1">
                  {conteudo}
                </p>
              </div>
            </div>

            {enviando && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium">
                  Enviando... {progresso.atual} de {progresso.total}
                </p>
                <div className="w-full h-2 bg-blue-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progresso.total > 0 ? (progresso.atual / progresso.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Alerta de telefones inválidos */}
            {tipo === 'whatsapp' && eleitoresFiltrados.some(e => selecionados.has(e.id) && e.telefone && !isValidPhone(e.telefone)) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    {eleitoresFiltrados.filter(e => selecionados.has(e.id) && e.telefone && !isValidPhone(e.telefone)).length} eleitor(es) com telefone inválido serão ignorados
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} disabled={enviando}>
                Voltar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={enviar}
                disabled={enviando}
              >
                <Send className="w-4 h-4 mr-1.5" />
                {enviando ? 'Enviando...' : 'Enviar Campanha'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
