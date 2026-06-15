import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Clock } from '@/lib/icons';
import { formatDateForInput } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEventos } from '@/hooks/useSupabaseData';
import { supabase } from '@/lib/supabase';
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
  const [authError, setAuthError] = useState<string | null>(null);
  const [showHoraFim, setShowHoraFim] = useState(false);
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

  // Resetar formulário quando o dialog é aberto (open muda de false para true)
  const [wasOpen, setWasOpen] = useState(false);
  useEffect(() => { 
    if (open && !wasOpen) {
      setForm(buildForm(evento)); 
      setShowHoraFim(!!evento?.hora_fim);
      setAuthError(null);
    }
    setWasOpen(open);
  }, [open, evento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo?.trim() || !form.data) return;

    setAuthError(null);
    
    // Verificar autenticação antes de enviar
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setAuthError('Você precisa estar logado para criar eventos. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (isEdit && evento) {
        await update(evento.id, form);
      } else {
        await insert(form as any);
      }
      setForm(buildForm(null));
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err.message?.includes('autenticado') || err.message?.includes('401') || err.message?.includes('403')) {
        setAuthError('Sessão expirada. Por favor, faça login novamente para continuar.');
      } else {
        setAuthError('Erro ao salvar evento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHoraInicioChange = (value: string) => {
    setField('hora_inicio', value);
    // Se preencher hora de início e ainda não mostrar hora de fim, mostrar automaticamente
    if (value && !showHoraFim && !form.hora_fim) {
      setShowHoraFim(true);
    }
    // Se limpar hora de início, limpar também hora de fim
    if (!value) {
      setField('hora_fim', '');
      setShowHoraFim(false);
    }
  };

  const setField = <K extends keyof Evento>(key: K, value: Evento[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar evento' : 'Novo evento'}
          </DialogTitle>
          <DialogDescription>Preencha os dados para criar um novo evento na agenda.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" value={form.titulo || ''} onChange={e => setField('titulo', e.target.value)} placeholder="Título do evento" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={form.descricao || ''} onChange={e => setField('descricao', e.target.value)} placeholder="Descrição opcional" rows={3} className="break-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data *</Label>
              <Input id="data" type="date" min="1900-01-01" value={form.data || ''} onChange={e => setField('data', e.target.value)} required />
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

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hora_inicio" className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Hora de início
                </Label>
                <Input 
                  id="hora_inicio" 
                  type="time" 
                  value={form.hora_inicio || ''} 
                  onChange={e => handleHoraInicioChange(e.target.value)} 
                />
              </div>
              
              {/* Hora de fim - aparece apenas se hora de início preenchida ou showHoraFim ativo */}
              {(showHoraFim || form.hora_fim) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hora_fim" className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Hora de fim
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHoraFim(false);
                        setField('hora_fim', '');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                    >
                      remover
                    </button>
                  </div>
                  <Input 
                    id="hora_fim" 
                    type="time" 
                    value={form.hora_fim || ''} 
                    onChange={e => setField('hora_fim', e.target.value)} 
                  />
                </div>
              )}
            </div>
            
            {/* Botão para adicionar hora de fim (só aparece se não estiver visível) */}
            {!showHoraFim && !form.hora_fim && form.hora_inicio && (
              <button
                type="button"
                onClick={() => setShowHoraFim(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar hora de término
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="local">Local</Label>
            <Input id="local" value={form.local || ''} onChange={e => setField('local', e.target.value)} placeholder="Endereço ou local do evento" />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar evento'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
