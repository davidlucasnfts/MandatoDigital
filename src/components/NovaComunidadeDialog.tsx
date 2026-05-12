import { useState, useEffect } from 'react';
import { Plus, icons } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useComunidades, useEleitores } from '@/hooks/useSupabaseData';
import AutocompleteCidade from '@/components/AutocompleteCidade';
import AutocompleteBairro from '@/components/AutocompleteBairro';
import { capitalizeWords } from '@/lib/masks';
import type { Comunidade } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  comunidade?: Comunidade | null;
}

export default function NovaComunidadeDialog({ open, onClose, onSuccess, comunidade }: Props) {
  const { insert, update } = useComunidades();
  const { data: eleitores } = useEleitores();
  const lideres = eleitores.filter(e => e.nivel === 'lider');
  const [loading, setLoading] = useState(false);
  const isEdit = !!comunidade;
  const iconesDisponiveis = Object.keys(icons).filter(k => k[0] >= 'A' && k[0] <= 'Z').sort();

  const buildForm = (c?: Comunidade | null) => ({
    nome: c?.nome || '',
    descricao: c?.descricao || '',
    lider_id: c?.lider_id || null,
    cor: c?.cor || '#2563EB',
    icone: c?.icone || 'Users',
    cidade: c?.cidade || '',
    bairro: c?.bairro || '',
  });
  const [form, setForm] = useState(buildForm(comunidade));

  useEffect(() => { setForm(buildForm(comunidade)); }, [comunidade?.id, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return;

    setLoading(true);
    try {
      // Monta payload apenas com campos válidos do banco (sem campos virtuais)
      const payload: Partial<Comunidade> = {
        nome: form.nome.trim(),
        descricao: form.descricao || undefined,
        lider_id: form.lider_id || null,
        cor: form.cor || '#2563EB',
        icone: form.icone || 'Users',
        cidade: form.cidade || null,
        bairro: form.bairro || null,
      };

      let result;
      if (isEdit && comunidade) {
        result = await update(comunidade.id, payload);
      } else {
        result = await insert(payload as any);
      }
      if (!result) {
        throw new Error('Erro ao salvar comunidade. Verifique se todos os campos estão preenchidos corretamente.');
      }
      setForm(buildForm(null));
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar comunidade');
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof Comunidade>(key: K, value: Comunidade[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar comunidade' : 'Nova comunidade'}
          </DialogTitle>
          <DialogDescription>Preencha os dados para criar uma nova comunidade.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={form.nome || ''} onChange={e => setField('nome', capitalizeWords(e.target.value))} placeholder="Nome da comunidade" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={form.descricao || ''} onChange={e => setField('descricao', e.target.value)} placeholder="Descrição da comunidade" rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lider_id">Líder</Label>
              <select id="lider_id" value={form.lider_id || ''} onChange={e => setField('lider_id', e.target.value || null)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="">Selecione um líder</option>
                {lideres.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <AutocompleteCidade id="cidade" value={form.cidade || ''} onChange={v => {
                setField('cidade', v);
                setField('bairro', ''); // Limpa bairro ao trocar cidade
              }} placeholder="São Paulo" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <AutocompleteBairro
              id="bairro"
              cidade={form.cidade || ''}
              value={form.bairro || ''}
              onChange={v => setField('bairro', v)}
              placeholder="Selecione o bairro"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cor">Cor</Label>
              <div className="flex items-center gap-3">
                <input id="cor" type="color" value={form.cor || '#2563EB'} onChange={e => setField('cor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <span className="text-sm text-slate-600">{form.cor || '#2563EB'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="icone">Ícone</Label>
              <select id="icone" value={form.icone || 'Users'} onChange={e => setField('icone', e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                {iconesDisponiveis.slice(0, 60).map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar comunidade'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
