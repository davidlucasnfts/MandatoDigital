import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEventos } from '@/hooks/useSupabaseData';
import type { Evento } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  evento?: import('@/lib/supabase').Evento | null;
}

export default function NovoEventoDialog({ open, onClose, onSuccess, evento }: Props) {
  const { insert, update } = useEventos();
  const [loading, setLoading] = useState(false);
  const isEdit = !!evento;
  const buildForm = (ev?: import('@/lib/supabase').Evento | null) => ({
    titulo: ev?.titulo || '',
    descricao: ev?.descricao || '',
    data: ev?.data || '',
    hora_inicio: ev?.hora_inicio || '',
    hora_fim: ev?.hora_fim || '',
    local: ev?.local || '',
    tipo: ev?.tipo || 'compromisso',
  });
  const [form, setForm] = useState(buildForm(evento));

  useEffect(() => { setForm(buildForm(evento)); }, [evento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo?.trim() || !form.data) return;

    setLoading(true);
    if (isEdit && evento) {
      await update(evento.id, form);
    } else {
      await insert(form as any);
    }
    setLoading(false);
    setForm(buildForm(null));
    onSuccess?.();
    onClose();
  };

  const setField = <K extends keyof Evento>(key: K, value: Evento[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
          <DialogDescription>Preencha os dados para criar um novo evento na agenda.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" value={form.titulo || ''} onChange={e => setField('titulo', e.target.value)} placeholder="Título do evento" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={form.descricao || ''} onChange={e => setField('descricao', e.target.value)} placeholder="Descrição opcional" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data *</Label>
              <Input id="data" type="date" value={form.data || ''} onChange={e => setField('data', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo</Label>
              <select id="tipo" value={form.tipo || 'compromisso'} onChange={e => setField('tipo', e.target.value as Evento['tipo'])} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="compromisso">Compromisso</option>
                <option value="reuniao">Reunião</option>
                <option value="evento">Evento</option>
                <option value="visita">Visita</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hora_inicio">Hora Início</Label>
              <Input id="hora_inicio" type="time" value={form.hora_inicio || ''} onChange={e => setField('hora_inicio', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hora_fim">Hora Fim</Label>
              <Input id="hora_fim" type="time" value={form.hora_fim || ''} onChange={e => setField('hora_fim', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="local">Local</Label>
            <Input id="local" value={form.local || ''} onChange={e => setField('local', e.target.value)} placeholder="Endereço ou local do evento" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Evento'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
