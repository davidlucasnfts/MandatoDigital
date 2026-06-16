import { useState, useMemo } from 'react';
import { Send, Search, Check, X, Users, MessageSquare, Loader2, Filter } from '@/lib/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { maskPhone, normalizePhoneForWhatsApp } from '@/lib/masks';

interface Props {
  open: boolean;
  onClose: () => void;
  enquete: {
    id: string;
    titulo: string;
    descricao?: string | null;
  };
}

function getPublicUrl(enqueteId: string) {
  const base = window.location.origin;
  return `${base}/enquete/${enqueteId}`;
}

function buildMessage(enquete: { titulo: string; descricao?: string | null }, nome: string, link: string) {
  const titulo = enquete.titulo.trim();
  const descricao = enquete.descricao?.trim();
  let msg = `Olá ${nome}, tudo bem?\n\n`;
  msg += `Queremos ouvir a sua opinião! 📊\n\n`;
  msg += `*${titulo}*\n`;
  if (descricao) msg += `${descricao}\n`;
  msg += `\nClique no link abaixo para votar:\n${link}\n\n`;
  msg += `Agradecemos sua participação!`;
  return msg;
}

export default function EnviarEnqueteDialog({ open, onClose, enquete }: Props) {
  const { data: eleitores, loading: loadingEleitores } = useEleitores();
  const { data: comunidades, loading: loadingComunidades } = useComunidades();
  const { sendText, loading: sending } = useWhatsApp();
  const [search, setSearch] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroBairro, setFiltroBairro] = useState('');
  const [filtroComunidade, setFiltroComunidade] = useState('');
  const [filtroLider, setFiltroLider] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const cidades = useMemo(
    () => Array.from(new Set(eleitores.map((e) => e.cidade).filter(Boolean))).sort(),
    [eleitores]
  );
  const bairros = useMemo(
    () => Array.from(new Set(eleitores.map((e) => e.bairro).filter(Boolean))).sort(),
    [eleitores]
  );
  const lideres = useMemo(
    () => eleitores.filter((e) => eleitores.some((x) => x.lider_id === e.id)).sort((a, b) => a.nome.localeCompare(b.nome)),
    [eleitores]
  );

  const filtered = useMemo(() => {
    let list = [...eleitores];
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (e) =>
          e.nome.toLowerCase().includes(term) ||
          (e.telefone && e.telefone.toLowerCase().includes(term))
      );
    }
    if (filtroCidade) list = list.filter((e) => e.cidade === filtroCidade);
    if (filtroBairro) list = list.filter((e) => e.bairro === filtroBairro);
    if (filtroComunidade) list = list.filter((e) => e.comunidade_id === filtroComunidade);
    if (filtroLider) list = list.filter((e) => e.lider_id === filtroLider);
    return list;
  }, [eleitores, search, filtroCidade, filtroBairro, filtroComunidade, filtroLider]);

  const validEleitores = useMemo(
    () => filtered.filter((e) => e.telefone && e.telefone.replace(/\D/g, '').length >= 10),
    [filtered]
  );

  const allSelected = validEleitores.length > 0 && validEleitores.every((e) => selected.has(e.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      validEleitores.forEach((e) => next.delete(e.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      validEleitores.forEach((e) => next.add(e.id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSend = async () => {
    const destinatarios = validEleitores.filter((e) => selected.has(e.id));
    if (destinatarios.length === 0) return;

    setResult(null);
    setProgress({ current: 0, total: destinatarios.length });

    let success = 0;
    let failed = 0;
    const link = getPublicUrl(enquete.id);

    for (let i = 0; i < destinatarios.length; i++) {
      const e = destinatarios[i];
      const nome = e.nome.split(' ')[0] || e.nome;
      const message = buildMessage(enquete, nome, link);
      const phone = normalizePhoneForWhatsApp(e.telefone);
      const res = await sendText(phone, message);
      if (res.ok) success++;
      else failed++;
      setProgress({ current: i + 1, total: destinatarios.length });
      if (i < destinatarios.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setResult({ success, failed });
  };

  const handleClose = () => {
    if (sending) return;
    setSearch('');
    setFiltroCidade('');
    setFiltroBairro('');
    setFiltroComunidade('');
    setFiltroLider('');
    setSelected(new Set());
    setProgress({ current: 0, total: 0 });
    setResult(null);
    onClose();
  };

  const isLoading = loadingEleitores || loadingComunidades;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Enviar enquete por WhatsApp
          </DialogTitle>
          <DialogDescription className="break-all">
            Enquete: <span className="font-medium text-slate-700">{enquete.titulo}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Mensagem preview */}
          <div className="bg-slate-50 rounded-lg p-3 text-sm whitespace-pre-wrap border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
              <MessageSquare className="w-3.5 h-3.5" /> Pré-visualização da mensagem
            </div>
            {buildMessage(enquete, 'João', getPublicUrl(enquete.id))}
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <select
              value={filtroCidade}
              onChange={(e) => setFiltroCidade(e.target.value)}
              className="h-9 px-2 text-sm rounded-md border border-slate-200 bg-white text-slate-700"
            >
              <option value="">Todas as cidades</option>
              {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filtroBairro}
              onChange={(e) => setFiltroBairro(e.target.value)}
              className="h-9 px-2 text-sm rounded-md border border-slate-200 bg-white text-slate-700"
            >
              <option value="">Todos os bairros</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select
              value={filtroComunidade}
              onChange={(e) => setFiltroComunidade(e.target.value)}
              className="h-9 px-2 text-sm rounded-md border border-slate-200 bg-white text-slate-700"
            >
              <option value="">Todas as comunidades</option>
              {comunidades.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select
              value={filtroLider}
              onChange={(e) => setFiltroLider(e.target.value)}
              className="h-9 px-2 text-sm rounded-md border border-slate-200 bg-white text-slate-700"
            >
              <option value="">Todos os líderes</option>
              {lideres.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>

          {/* Busca e selecionar todos */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar eleitor por nome ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={toggleAll} disabled={validEleitores.length === 0}>
              {allSelected ? <X className="w-3.5 h-3.5 mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              {allSelected ? 'Desmarcar' : 'Selecionar todos'}
            </Button>
          </div>

          {/* Contador */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {selected.size} de {validEleitores.length} selecionados
            </span>
            <span>{filtered.length - validEleitores.length} sem telefone válido</span>
          </div>

          {/* Lista */}
          <div className="border border-slate-200 rounded-lg overflow-auto flex-1 max-h-[280px]">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">Carregando...</div>
            ) : validEleitores.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">Nenhum eleitor com telefone válido encontrado.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {validEleitores.map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(e.id)}
                      onChange={() => toggleOne(e.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">{e.nome}</div>
                      <div className="text-xs text-slate-500">
                        {maskPhone(e.telefone)}
                        {e.cidade && ` • ${e.cidade}`}
                        {e.bairro && ` • ${e.bairro}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Progresso / Resultado */}
          {progress.total > 0 && !result && (
            <div className="text-sm text-slate-600">
              Enviando {progress.current} de {progress.total}...
            </div>
          )}
          {result && (
            <div className="text-sm">
              <span className="text-green-600 font-medium">{result.success} enviados</span>
              {result.failed > 0 && (
                <span className="text-red-600 font-medium ml-3">{result.failed} falhas</span>
              )}
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} disabled={sending}>
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={selected.size === 0 || sending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Enviar {selected.size > 0 && `(${selected.size})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
