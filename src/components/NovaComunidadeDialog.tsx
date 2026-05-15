import { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useComunidades, useEleitores } from '@/hooks/useSupabaseData';
import AutocompleteCidade from '@/components/AutocompleteCidade';
import AutocompleteBairro from '@/components/AutocompleteBairro';
import IconPicker from '@/components/IconPicker';
import ColorPicker from '@/components/ColorPicker';
import { capitalizeWords, maskCEP } from '@/lib/masks';
import type { Comunidade } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  comunidade?: Comunidade | null;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export default function NovaComunidadeDialog({ open, onClose, onSuccess, comunidade }: Props) {
  const { insert, update } = useComunidades();
  const { data: eleitores } = useEleitores();
  const lideres = eleitores.filter(e => e.nivel === 'lider');
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const isEdit = !!comunidade;

  const buildForm = (c?: Comunidade | null) => ({
    nome: c?.nome || '',
    descricao: c?.descricao || '',
    lider_id: c?.lider_id || null,
    cor: c?.cor || '#2563EB',
    icone: c?.icone || 'Users',
    cep: c?.cep || '',
    logradouro: c?.logradouro || '',
    numero: c?.numero || '',
    bairro: c?.bairro || '',
    cidade: c?.cidade || '',
    estado: c?.estado || '',
  });
  const [form, setForm] = useState(buildForm(comunidade));

  useEffect(() => { setForm(buildForm(comunidade)); }, [comunidade?.id, open]);

  // Busca CEP no ViaCEP e preenche endereço
  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data: ViaCepResponse = await res.json();

      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch {
      // ignora erro
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return;

    setLoading(true);
    try {
      const payload: Partial<Comunidade> = {
        nome: form.nome.trim(),
        descricao: form.descricao || undefined,
        lider_id: form.lider_id || null,
        cor: form.cor || '#2563EB',
        icone: form.icone || 'Users',
        cep: form.cep?.replace(/\D/g, '') || null,
        logradouro: form.logradouro || null,
        numero: form.numero || null,
        bairro: form.bairro || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
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

  const setField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar comunidade' : 'Nova comunidade'}
          </DialogTitle>
          <DialogDescription>Preencha os dados da comunidade. O CEP preenche o endereço automaticamente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={form.nome} onChange={e => setField('nome', capitalizeWords(e.target.value))} placeholder="Nome da comunidade" required />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={form.descricao} onChange={e => setField('descricao', e.target.value)} placeholder="Descrição da comunidade" rows={2} />
          </div>

          {/* Líder */}
          <div className="space-y-1.5">
            <Label htmlFor="lider_id">Líder</Label>
            <select id="lider_id" value={form.lider_id || ''} onChange={e => setField('lider_id', e.target.value || null)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Selecione um líder</option>
              {lideres.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>

          {/* Endereço — CEP */}
          <div className="space-y-1.5">
            <Label htmlFor="cep" className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              CEP
            </Label>
            <div className="flex gap-2">
              <Input
                id="cep"
                value={maskCEP(form.cep)}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setField('cep', v);
                  if (v.length === 8) buscarCep(v);
                }}
                placeholder="00000-000"
                className="flex-1"
              />
              {buscandoCep && <span className="text-xs text-slate-400 self-center">Buscando...</span>}
            </div>
          </div>

          {/* Endereço — Logradouro + Número */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="logradouro">Rua / Avenida</Label>
              <Input id="logradouro" value={form.logradouro} onChange={e => setField('logradouro', capitalizeWords(e.target.value))} placeholder="Nome da rua" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero">Número</Label>
              <Input id="numero" value={form.numero} onChange={e => setField('numero', e.target.value.toUpperCase())} placeholder="S/N" />
            </div>
          </div>

          {/* Endereço — Bairro + Cidade + Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bairro">Bairro</Label>
              <AutocompleteBairro
                id="bairro"
                cidade={form.cidade}
                value={form.bairro}
                onChange={v => setField('bairro', v)}
                placeholder="Bairro"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <AutocompleteCidade id="cidade" value={form.cidade} onChange={v => {
                setField('cidade', v);
                setField('bairro', '');
              }} placeholder="Cidade" />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" value={form.estado} onChange={e => setField('estado', e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" maxLength={2} className="w-20" />
          </div>

          {/* Cor + Ícone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ColorPicker value={form.cor || '#2563EB'} onChange={v => setField('cor', v)} />
            <IconPicker value={form.icone || 'Users'} onChange={v => setField('icone', v)} />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar comunidade'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
