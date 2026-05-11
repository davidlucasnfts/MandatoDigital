import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTarefas } from '@/hooks/useSupabaseData';
import type { Tarefa } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tarefa?: import('@/lib/supabase').Tarefa | null;
}

export default function NovaTarefaDialog({ open, onClose, onSuccess, tarefa }: Props) {
  const { insert, update } = useTarefas();
  const [loading, setLoading] = useState(false);
  const isEdit = !!tarefa;
  const buildForm = (t?: import('@/lib/supabase').Tarefa | null) => ({
    titulo: t?.titulo || '',
    descricao: t?.descricao || '',
    status: t?.status || 'pendente',
    prioridade: t?.prioridade || 'media',
    responsavel: t?.responsavel || '',
    data_prazo: t?.data_prazo || null,
    tags: t?.tags || [],
  });
  const [form, setForm] = useState(buildForm(tarefa));

  useEffect(() => { setForm(buildForm(tarefa)); }, [tarefa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo?.trim()) return;

    setLoading(true);
    if (isEdit && tarefa) {
      await update(tarefa.id, form);
    } else {
      await insert(form as any);
    }
    setLoading(false);
    setForm(buildForm(null));
    onSuccess?.();
    onClose();
  };

  const setField = <K extends keyof Tarefa>(key: K, value: Tarefa[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar tarefa' : 'Nova tarefa'}
          </DialogTitle>
          <DialogDescription>Preencha os dados para criar uma nova tarefa.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={form.titulo || ''}
              onChange={e => setField('titulo', e.target.value)}
              placeholder="Digite o título da tarefa"
              required
            />
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
              <Label htmlFor="prioridade">Prioridade</Label>
              <select
                id="prioridade"
                value={form.prioridade || 'media'}
                onChange={e => setField('prioridade', e.target.value as Tarefa['prioridade'])}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={form.status || 'pendente'}
                onChange={e => setField('status', e.target.value as Tarefa['status'])}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="pendente">Pendente</option>
                <option value="andamento">Em Andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={form.responsavel || ''}
                onChange={e => setField('responsavel', e.target.value)}
                placeholder="Nome do responsável"
              />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
