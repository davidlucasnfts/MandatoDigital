import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSolicitacoes, useEleitores } from '@/hooks/useSupabaseData';
import type { Solicitacao } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  solicitacao?: import('@/lib/supabase').Solicitacao | null;
}

export default function NovaSolicitacaoDialog({ open, onClose, onSuccess, solicitacao }: Props) {
  const { insert, update } = useSolicitacoes();
  const { data: eleitores } = useEleitores();
  const [loading, setLoading] = useState(false);
  const isEdit = !!solicitacao;
  const buildForm = (s?: import('@/lib/supabase').Solicitacao | null) => ({
    titulo: s?.titulo || '',
    descricao: s?.descricao || '',
    eleitor_id: s?.eleitor_id || '',
    eleitor_nome: s?.eleitor_nome || '',
    categoria: s?.categoria || '',
    prioridade: s?.prioridade || 'media',
    status: s?.status || 'pendente',
    data_prazo: s?.data_prazo || null,
    responsavel: s?.responsavel || '',
  });
  const [form, setForm] = useState(buildForm(solicitacao));

  useEffect(() => { setForm(buildForm(solicitacao)); }, [solicitacao]);

  const eleitorSelecionado = useMemo(() => {
    return eleitores.find(e => e.id === form.eleitor_id);
  }, [eleitores, form.eleitor_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo?.trim()) return;

    setLoading(true);
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || '',
      eleitor_id: form.eleitor_id || '',
      eleitor_nome: eleitorSelecionado?.nome || form.eleitor_nome || '',
      categoria: form.categoria || '',
      prioridade: form.prioridade || 'media',
      status: form.status || 'pendente',
      data_prazo: form.data_prazo || null,
      responsavel: form.responsavel || '',
    };
    if (isEdit && solicitacao) {
      await update(solicitacao.id, payload);
    } else {
      await insert(payload as any);
    }
    setLoading(false);
    setForm(buildForm(null));
    onSuccess?.();
    onClose();
  };

  const setField = <K extends keyof Solicitacao>(key: K, value: Solicitacao[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
          <DialogDescription>Preencha os dados para criar uma nova solicitação.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={form.titulo || ''}
              onChange={e => setField('titulo', e.target.value)}
              placeholder="Digite o título da solicitação"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eleitor_id">Eleitor</Label>
            <select
              id="eleitor_id"
              value={form.eleitor_id || ''}
              onChange={e => setField('eleitor_id', e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Selecione um eleitor</option>
              {eleitores.map(e => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={form.descricao || ''}
              onChange={e => setField('descricao', e.target.value)}
              placeholder="Descrição opcional"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={form.categoria || ''}
                onChange={e => setField('categoria', e.target.value)}
                placeholder="Ex: Saúde, Educação"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prioridade">Prioridade</Label>
              <select
                id="prioridade"
                value={form.prioridade || 'media'}
                onChange={e => setField('prioridade', e.target.value as Solicitacao['prioridade'])}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status || 'pendente'}
                onChange={e => setField('status', e.target.value as Solicitacao['status'])}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="pendente">Pendente</option>
                <option value="andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_prazo">Prazo</Label>
              <Input
                id="data_prazo"
                type="date"
                value={form.data_prazo || ''}
                onChange={e => setField('data_prazo', e.target.value || null)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={form.responsavel || ''}
              onChange={e => setField('responsavel', e.target.value)}
              placeholder="Nome do responsável"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Solicitação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
