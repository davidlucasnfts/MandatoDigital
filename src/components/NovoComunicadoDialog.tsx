import { useState, useMemo, useEffect } from 'react';
import { Send, MessageSquare, X, Users, Check, Filter, AlertTriangle } from 'lucide-react';
import { isValidPhone, normalizePhoneForWhatsApp } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { useComunidades as useComunidadesList } from '@/hooks/useSupabaseData';
import { useCampanhas, useEnviosCampanha } from '@/hooks/useCampanhas';
import { useTemplates } from '@/hooks/useTemplates';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import type { Eleitor, TemplateMensagem, Campanha } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  campanhaEditando?: Campanha | null;
  templatePreSelecionado?: TemplateMensagem | null;
  templates?: TemplateMensagem[];
  onSuccess?: () => void;
  onInsert?: (campanha: Campanha) => void;
}

function aplicarTemplate(conteudo: string, eleitor: Eleitor, comunidades: { id: string; nome: string }[]): string {
  const comunidade = comunidades.find(c => c.id === eleitor.comunidade_id);
  return conteudo
    .replace(/{{nome}}/g, eleitor.nome?.split(' ')[0] || '')
    .replace(/{{nome_completo}}/g, eleitor.nome || '')
    .replace(/{{cidade}}/g, eleitor.cidade || '')
    .replace(/{{bairro}}/g, eleitor.bairro || '')
    .replace(/{{comunidade}}/g, comunidade?.nome || '')
    .replace(/{{telefone}}/g, eleitor.telefone || '')
    .replace(/{{endereco}}/g, eleitor.endereco || '');
}

export default function NovoComunicadoDialog({ open, onClose, campanhaEditando, templatePreSelecionado, templates: templatesProp, onSuccess, onInsert }: Props) {
  const { data: eleitores } = useEleitores();
  const { data: comunidades } = useComunidades();
  const { data: templatesHook } = useTemplates();
  const templates = templatesProp || templatesHook;
  const { insert: insertCampanha, update: updateCampanha } = useCampanhas();
  const { criarEnvios, marcarEnviado, marcarErro } = useEnviosCampanha();
  const { sendText } = useWhatsApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'whatsapp' | 'email'>('whatsapp');
  const [templateId, setTemplateId] = useState<string>('');
  const [conteudo, setConteudo] = useState('');
  const [filtroComunidade, setFiltroComunidade] = useState<string>('');
  const [filtroCidade, setFiltroCidade] = useState<string>('');
  const [filtroBairro, setFiltroBairro] = useState<string>('');
  const [filtroLider, setFiltroLider] = useState<string>('');
  const [filtroLiderados, setFiltroLiderados] = useState<string>('');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [buscaNome, setBuscaNome] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [salvandoRascunho, setSalvandoRascunho] = useState(false);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });

  // Carregar dados da campanha em edição ou template pré-selecionado quando o dialog abre
  useEffect(() => {
    if (open) {
      if (campanhaEditando) {
        // Modo edição: preenche com dados da campanha
        setNome(campanhaEditando.nome);
        setTipo(campanhaEditando.tipo);
        setTemplateId(campanhaEditando.template_id || '');
        setConteudo(campanhaEditando.conteudo);
        const filtros = campanhaEditando.filtros || {};
        setFiltroComunidade(filtros.comunidade || '');
        setFiltroCidade(filtros.cidade || '');
        setFiltroBairro(filtros.bairro || '');
        setFiltroLider(filtros.lider || '');
        setFiltroLiderados(filtros.liderados || '');
        setStep(1);
      } else if (templatePreSelecionado) {
        // Modo template pré-selecionado: preenche com dados do template
        setNome(templatePreSelecionado.nome);
        setTipo(templatePreSelecionado.tipo);
        setTemplateId(templatePreSelecionado.id);
        setConteudo(templatePreSelecionado.conteudo);
        setStep(1);
      } else {
        // Modo criação: limpa tudo
        setNome('');
        setTipo('whatsapp');
        setTemplateId('');
        setConteudo('');
        setFiltroComunidade('');
        setFiltroCidade('');
        setFiltroBairro('');
        setFiltroLider('');
        setFiltroLiderados('');
        setSelecionados(new Set());
        setBuscaNome('');
        setStep(1);
      }
    }
  }, [open, campanhaEditando, templatePreSelecionado]);

  const templateSelecionado = useMemo(() =>
    templates.find(t => t.id === templateId),
    [templates, templateId]
  );

  const eleitoresFiltrados = useMemo(() => {
    return eleitores.filter(e => {
      if (filtroComunidade && e.comunidade_id !== filtroComunidade) return false;
      if (filtroCidade && e.cidade?.toLowerCase().trim() !== filtroCidade.toLowerCase().trim()) return false;
      if (filtroBairro && e.bairro?.toLowerCase().trim() !== filtroBairro.toLowerCase().trim()) return false;
      if (filtroLider && e.id !== filtroLider) return false;
      if (filtroLiderados && e.lider_id !== filtroLiderados) return false;
      if (buscaNome && !e.nome?.toLowerCase().includes(buscaNome.toLowerCase())) return false;

      if (tipo === 'whatsapp' && !e.telefone) return false;
      if (tipo === 'email' && !e.email) return false;
      return true;
    });
  }, [eleitores, filtroComunidade, filtroCidade, filtroBairro, filtroLider, filtroLiderados, tipo, buscaNome]);

  // Líderes únicos dos eleitores cadastrados (apenas dados reais do banco)
  // Um líder é qualquer eleitor com nivel='lider'
  const lideresUnicos = useMemo(() => {
    const lideresMap = new Map<string, string>();
    eleitores.forEach(e => {
      if (e.nivel === 'lider') {
        lideresMap.set(e.id, e.nome);
      }
    });
    return Array.from(lideresMap.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [eleitores]);

  // Cidades únicas dos eleitores cadastrados (apenas dados reais do banco)
  const cidadesUnicas = useMemo(() =>
    [...new Set(eleitores.map(e => e.cidade).filter(Boolean))].sort(),
    [eleitores]
  );

  // Bairros únicos dos eleitores cadastrados (apenas dados reais do banco)
  const bairrosUnicos = useMemo(() =>
    [...new Set(eleitores.map(e => e.bairro).filter(Boolean))].sort(),
    [eleitores]
  );



  const handleClose = () => {
    setProgresso({ atual: 0, total: 0 });
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

  const salvarRascunho = async () => {
    if (!nome.trim() || !conteudo.trim()) return;
    setSalvandoRascunho(true);

    if (campanhaEditando) {
      await updateCampanha(campanhaEditando.id, {
        nome: nome.trim(),
        tipo,
        template_id: templateId || null,
        assunto: null,
        conteudo: conteudo.trim(),
        status: 'rascunho',
        total_destinatarios: 0,
        total_enviados: 0,
        total_erros: 0,
        filtros: { comunidade: filtroComunidade, cidade: filtroCidade, bairro: filtroBairro, lider: filtroLider, liderados: filtroLiderados },
      });
    } else {
      const campanha = await insertCampanha({
        nome: nome.trim(),
        tipo,
        template_id: templateId || null,
        assunto: null,
        conteudo: conteudo.trim(),
        status: 'rascunho',
        total_destinatarios: 0,
        total_enviados: 0,
        total_erros: 0,
        filtros: { comunidade: filtroComunidade, cidade: filtroCidade, bairro: filtroBairro, lider: filtroLider, liderados: filtroLiderados },
      });
      if (campanha) onInsert?.(campanha);
    }

    setSalvandoRascunho(false);
    onSuccess?.();
    handleClose();
  };

  const enviar = async () => {
    if (!nome.trim() || !conteudo.trim() || selecionados.size === 0) return;
    setEnviando(true);

    let campanhaId: string;

    if (campanhaEditando) {
      // Atualizar campanha existente
      await updateCampanha(campanhaEditando.id, {
        nome: nome.trim(),
        tipo,
        template_id: templateId || null,
        assunto: tipo === 'email' ? nome.trim() : null,
        conteudo: conteudo.trim(),
        status: 'enviando',
        total_destinatarios: selecionados.size,
        total_enviados: 0,
        total_erros: 0,
        filtros: { comunidade: filtroComunidade, cidade: filtroCidade, bairro: filtroBairro, lider: filtroLider, liderados: filtroLiderados },
      });
      campanhaId = campanhaEditando.id;
    } else {
      // Criar nova campanha
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
        filtros: { comunidade: filtroComunidade, cidade: filtroCidade, bairro: filtroBairro, lider: filtroLider, liderados: filtroLiderados },
      });

      if (!campanha) {
        setEnviando(false);
        return;
      }
      campanhaId = campanha.id;
      onInsert?.(campanha);
    }

    // 2. Criar registros de envio
    const destinatarios = eleitores.filter(e => selecionados.has(e.id));
    const enviosCriados = await criarEnvios(campanhaId, destinatarios, conteudo);
    const envioMap = new Map<string, string>(); // eleitor_id -> envio_id
    if (enviosCriados) {
      enviosCriados.forEach((envio, idx) => {
        if (destinatarios[idx]) {
          envioMap.set(destinatarios[idx].id, envio.id);
        }
      });
    }

    // 3. Enviar via WhatsApp (WAHA API)
    setProgresso({ atual: 0, total: destinatarios.length });
    let enviados = 0;
    let erros = 0;
    const errosLista: { nome: string; telefone: string; motivo: string; eleitorId: string }[] = [];

    if (tipo === 'whatsapp') {
      // Filtra apenas telefones válidos
      const destinatariosValidos = destinatarios.filter(e => {
        if (!e.telefone) {
          errosLista.push({ nome: e.nome, telefone: '(vazio)', motivo: 'Sem telefone', eleitorId: e.id });
          return false;
        }
        if (!isValidPhone(e.telefone)) {
          errosLista.push({ nome: e.nome, telefone: e.telefone, motivo: 'Formato inválido', eleitorId: e.id });
          return false;
        }
        return true;
      });

      // Envia mensagem personalizada para cada destinatário
      let successCount = 0;
      let failedCount = 0;
      for (let i = 0; i < destinatariosValidos.length; i++) {
        const eleitor = destinatariosValidos[i];
        const mensagemPersonalizada = aplicarTemplate(conteudo, eleitor, comunidades);
        const phone = normalizePhoneForWhatsApp(eleitor.telefone!);
        const result = await sendText(phone, mensagemPersonalizada);
        if (result.ok) successCount++;
        else failedCount++;
        setProgresso({ atual: i + 1, total: destinatariosValidos.length });
        await new Promise(r => setTimeout(r, 1000));
      }
      enviados = successCount;
      erros = failedCount + errosLista.length;

      // Atualizar status individual dos envios
      for (const eleitor of destinatariosValidos) {
        const envioId = envioMap.get(eleitor.id);
        if (envioId) {
          await marcarEnviado(envioId);
        }
      }
      for (const erro of errosLista) {
        const envioId = envioMap.get(erro.eleitorId);
        if (envioId) {
          await marcarErro(envioId, erro.motivo);
        }
      }
    }

    // 4. Atualizar campanha como enviada
    await updateCampanha(campanhaId, {
      status: 'enviada',
      total_enviados: enviados,
      total_erros: erros,
    });

    setEnviando(false);
    onSuccess?.();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="w-5 h-5 text-green-600" />
            {campanhaEditando ? 'Editar Comunicado' : 'Novo Comunicado'} — Etapa {step}/3
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
            </div>

            {/* Templates */}
            {templates.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Usar template</label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.filter(t => t.tipo === tipo).map(t => (
                    <button
                      key={t.id}
                      onClick={() => usarTemplate(t)}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        templateId === t.id
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <MessageSquare className={`w-3 h-3 ${templateId === t.id ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className={`text-xs font-medium break-all ${templateId === t.id ? 'text-blue-700' : 'text-slate-700'}`}>
                          {t.nome}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 break-all">
                        {t.conteudo.slice(0, 60)}{t.conteudo.length > 60 ? '...' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nome/Assunto */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                {tipo === 'email' ? 'Assunto' : 'Nome do comunicado'}
              </label>
              <Input
                placeholder={tipo === 'email' ? 'Digite o assunto...' : 'Ex: Agradecimento de fim de ano'}
                value={nome}
                onChange={e => setNome(e.target.value)}
                maxLength={100}
                className="h-10"
              />
              <p className="text-[10px] text-slate-400 mt-1">{nome.length}/100 caracteres</p>
            </div>

            {/* Conteúdo */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Conteúdo</label>
              <div className="bg-blue-50 rounded-lg p-2 mb-2">
                <p className="text-[10px] text-blue-700">
                  <strong>Variáveis disponíveis:</strong> Clique para inserir no texto. Elas serão substituídas automaticamente no envio.
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {['{{nome}}', '{{nome_completo}}', '{{cidade}}', '{{bairro}}', '{{comunidade}}', '{{telefone}}', '{{endereco}}'].map(v => (
                    <button
                      key={v}
                      onClick={() => setConteudo(prev => prev + ' ' + v)}
                      className="text-[9px] bg-white text-blue-600 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-100"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder={`Digite a mensagem...`}
                rows={5}
                value={conteudo}
                onChange={e => setConteudo(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none break-all"
              />
              <div className="flex items-center justify-between mt-1">
                <p className={`text-[10px] ${conteudo.length > 4000 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                  {conteudo.length} / 4096 caracteres
                  {conteudo.length > 4000 && ' (limite próximo)'}
                </p>
                {conteudo.length > 4096 && (
                  <p className="text-[10px] text-red-500 font-medium">Excedeu o limite do WhatsApp!</p>
                )}
              </div>
            </div>

            {/* Preview */}
            {conteudo && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Preview</p>
                <p className="text-xs text-slate-700 whitespace-pre-wrap break-all">
                  {aplicarTemplate(conteudo, {
                    nome: 'João Silva', cidade: 'João Pessoa', bairro: 'Centro',
                    telefone: '(83) 99999-9999', endereco: 'Rua das Flores, 123',
                    comunidade_id: null,
                  } as Eleitor, comunidades)}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={salvarRascunho}
                disabled={!nome.trim() || !conteudo.trim() || salvandoRascunho}
              >
                {salvandoRascunho ? 'Salvando...' : 'Salvar como Rascunho'}
              </Button>
              <Button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
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
            {/* Busca por nome */}
            <div>
              <label className="text-[10px] font-medium text-slate-500 mb-1 block">Buscar por nome</label>
              <Input
                placeholder="Digite o nome do eleitor..."
                value={buscaNome}
                onChange={e => setBuscaNome(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            {/* Filtros */}
            <div className="bg-blue-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-blue-700 font-medium">
                Selecione os destinatários por comunidade, cidade ou bairro. 
                Mostramos apenas as opções que possuem eleitores cadastrados na base.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Comunidade</label>
                <select
                  value={filtroComunidade}
                  onChange={e => setFiltroComunidade(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Todas as comunidades</option>
                  {comunidades.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Líder</label>
                <select
                  value={filtroLider}
                  onChange={e => setFiltroLider(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Todos os líderes</option>
                  {lideresUnicos.map(([id, nome]) => (
                    <option key={id} value={id}>{nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Cidade</label>
                <select
                  value={filtroCidade}
                  onChange={e => setFiltroCidade(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Todas as cidades</option>
                  {cidadesUnicas.map(c => (
                    <option key={c} value={c}>{c}</option>
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
                  <option value="">Todos os bairros</option>
                  {bairrosUnicos.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1 block">Liderados por</label>
                <select
                  value={filtroLiderados}
                  onChange={e => setFiltroLiderados(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">Todos os eleitores</option>
                  {lideresUnicos.map(([id, nome]) => (
                    <option key={id} value={id}>{nome}</option>
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
                    <p className="text-xs font-medium text-slate-800 truncate break-all">{e.nome}</p>
                    <p className="text-[10px] text-slate-500 break-all">
                      {e.telefone} · {e.bairro} · {e.cidade}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(1)}>Voltar</Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={salvarRascunho}
                  disabled={!nome.trim() || !conteudo.trim() || salvandoRascunho}
                >
                  {salvandoRascunho ? 'Salvando...' : 'Salvar Rascunho'}
                </Button>
              </div>
              <Button
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
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
                <p className="text-sm font-medium text-slate-800 break-all">{nome}</p>
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
                {/* Preview com dados reais do primeiro destinatário */}
                {(() => {
                  const primeiroDestinatario = eleitores.find(e => selecionados.has(e.id));
                  if (primeiroDestinatario) {
                    const preview = aplicarTemplate(conteudo, primeiroDestinatario, comunidades);
                    return (
                      <div className="mt-1">
                        <p className="text-[10px] text-slate-500 mb-1 break-all">
                          Preview com dados de <strong>{primeiroDestinatario.nome}</strong>:
                        </p>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap break-all bg-white rounded p-2 border border-slate-200">
                          {preview}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <p className="text-xs text-slate-700 whitespace-pre-wrap break-all bg-white rounded p-2 mt-1 border border-slate-200">
                      {conteudo}
                    </p>
                  );
                })()}
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

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setStep(2)} disabled={enviando}>
                Voltar
              </Button>
              <Button
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                onClick={enviar}
                disabled={enviando}
              >
                <Send className="w-4 h-4 mr-1.5" />
                {enviando ? 'Enviando...' : 'Enviar Comunicado'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
