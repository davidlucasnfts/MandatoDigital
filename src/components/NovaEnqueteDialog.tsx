import { useState, useEffect } from 'react';
import { Plus, X, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/providers/trpc';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  enquete?: any;
}

interface OpcaoForm {
  id?: string;
  texto: string;
  ordem: number;
}

function buildForm(enquete?: any) {
  if (!enquete) {
    return {
      titulo: '',
      descricao: '',
      status: 'rascunho' as const,
      dataPublicacao: '',
      dataEncerramento: '',
      permiteMultiplaEscolha: 0,
      opcoes: [
        { texto: '', ordem: 0 },
        { texto: '', ordem: 1 },
      ] as OpcaoForm[],
    };
  }
  return {
    titulo: enquete.titulo || '',
    descricao: enquete.descricao || '',
    status: enquete.status || 'rascunho',
    dataPublicacao: enquete.dataPublicacao ? new Date(enquete.dataPublicacao).toISOString().split('T')[0] : '',
    dataEncerramento: enquete.dataEncerramento ? new Date(enquete.dataEncerramento).toISOString().split('T')[0] : '',
    permiteMultiplaEscolha: enquete.permiteMultiplaEscolha ?? 0,
    opcoes: enquete.opcoes?.length > 0
      ? enquete.opcoes.map((o: any, i: number) => ({ id: o.id, texto: o.texto, ordem: o.ordem ?? i }))
      : [{ texto: '', ordem: 0 }, { texto: '', ordem: 1 }],
  };
}

export default function NovaEnqueteDialog({ open, onClose, onSuccess, enquete }: Props) {
  const [form, setForm] = useState(buildForm(enquete));
  const [loading, setLoading] = useState(false);
  const isEdit = !!enquete;

  const createMutation = trpc.enquetes.create.useMutation({ onSuccess: () => onSuccess?.() });
  const updateMutation = trpc.enquetes.update.useMutation({ onSuccess: () => onSuccess?.() });

  useEffect(() => { setForm(buildForm(enquete)); }, [enquete]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateOpcao = (index: number, texto: string) => {
    setForm(prev => {
      const opcoes = [...prev.opcoes];
      opcoes[index] = { ...opcoes[index], texto };
      return { ...prev, opcoes };
    });
  };

  const addOpcao = () => {
    setForm(prev => ({
      ...prev,
      opcoes: [...prev.opcoes, { texto: '', ordem: prev.opcoes.length }],
    }));
  };

  const removeOpcao = (index: number) => {
    setForm(prev => ({
      ...prev,
      opcoes: prev.opcoes.filter((_, i) => i !== index).map((o, i) => ({ ...o, ordem: i })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOpcoes = form.opcoes.filter(o => o.texto.trim() !== '');
    if (validOpcoes.length < 2) return;

    setLoading(true);
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || undefined,
      status: form.status as any,
      dataPublicacao: form.dataPublicacao ? new Date(form.dataPublicacao) : undefined,
      dataEncerramento: form.dataEncerramento ? new Date(form.dataEncerramento) : undefined,
      permiteMultiplaEscolha: form.permiteMultiplaEscolha,
      opcoes: validOpcoes.map((o, i) => ({ id: o.id, texto: o.texto, ordem: i })),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: enquete.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar enquete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar' : 'Nova'} Enquete
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Altere os dados da enquete abaixo.' : 'Crie uma nova pesquisa de opinião.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" value={form.titulo} onChange={e => updateField('titulo', e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={form.descricao} onChange={e => updateField('descricao', e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <select id="status" value={form.status} onChange={e => updateField('status', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="rascunho">Rascunho</option>
                <option value="publicada">Publicada</option>
                <option value="encerrada">Encerrada</option>
                <option value="arquivada">Arquivada</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de resposta</Label>
              <select id="tipo" value={form.permiteMultiplaEscolha} onChange={e => updateField('permiteMultiplaEscolha', parseInt(e.target.value))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value={0}>Única escolha</option>
                <option value={1}>Múltipla escolha</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dataPublicacao">Data publicação</Label>
              <Input id="dataPublicacao" type="date" value={form.dataPublicacao} onChange={e => updateField('dataPublicacao', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dataEncerramento">Data encerramento</Label>
              <Input id="dataEncerramento" type="date" value={form.dataEncerramento} onChange={e => updateField('dataEncerramento', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Opções * (mínimo 2)</Label>
            {form.opcoes.map((opcao, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={opcao.texto}
                  onChange={e => updateOpcao(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                  required
                />
                {form.opcoes.length > 2 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeOpcao(index)} className="shrink-0">
                    <X className="w-4 h-4 text-slate-400" />
                  </Button>
                )}
              </div>
            ))}
            {form.opcoes.length < 10 && (
              <Button type="button" variant="outline" size="sm" onClick={addOpcao} className="w-full">
                <Plus className="w-4 h-4 mr-1" /> Adicionar opção
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
