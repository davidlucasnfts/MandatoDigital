import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import type { Eleitor } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  eleitor?: Eleitor | null;
}

export default function NovoEleitorDialog({ open, onClose, onSuccess, eleitor }: Props) {
  const { insert, update } = useEleitores();
  const { data: comunidades } = useComunidades();
  const [loading, setLoading] = useState(false);
  const isEdit = !!eleitor;

  const buildForm = (e?: Eleitor | null): Partial<Eleitor> => {
    if (!e) return { nivel: 'eleitor', status: 'ativo', tags: [] };
    return {
      nome: e.nome,
      email: e.email,
      telefone: e.telefone,
      cpf: e.cpf,
      endereco: e.endereco,
      bairro: e.bairro,
      cidade: e.cidade,
      estado: e.estado,
      cep: e.cep,
      comunidade_id: e.comunidade_id,
      nivel: e.nivel,
      tags: e.tags,
      status: e.status,
      observacoes: e.observacoes,
      data_nascimento: e.data_nascimento,
    };
  };

  const [form, setForm] = useState<Partial<Eleitor>>(buildForm(eleitor));

  useEffect(() => {
    setForm(buildForm(eleitor));
  }, [eleitor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return;

    setLoading(true);
    if (isEdit && eleitor) {
      await update(eleitor.id, {
        nome: form.nome,
        email: form.email || '',
        telefone: form.telefone || '',
        cpf: form.cpf || '',
        endereco: form.endereco || '',
        bairro: form.bairro || '',
        cidade: form.cidade || 'São Paulo',
        estado: form.estado || 'SP',
        cep: form.cep || '',
        comunidade_id: form.comunidade_id || null,
        nivel: form.nivel || 'eleitor',
        tags: form.tags || [],
        status: form.status || 'ativo',
        observacoes: form.observacoes || '',
        data_nascimento: form.data_nascimento || null,
      });
    } else {
      await insert({
        nome: form.nome,
        email: form.email || '',
        telefone: form.telefone || '',
        cpf: form.cpf || '',
        endereco: form.endereco || '',
        bairro: form.bairro || '',
        cidade: form.cidade || 'São Paulo',
        estado: form.estado || 'SP',
        cep: form.cep || '',
        comunidade_id: form.comunidade_id || null,
        nivel: form.nivel || 'eleitor',
        tags: form.tags || [],
        status: form.status || 'ativo',
        observacoes: form.observacoes || '',
        data_nascimento: form.data_nascimento || null,
      });
    }
    setLoading(false);
    setForm({ nivel: 'eleitor', status: 'ativo', tags: [] });
    onSuccess?.();
    onClose();
  };

  const setField = <K extends keyof Eleitor>(key: K, value: Eleitor[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar Eleitor' : 'Novo Eleitor'}
          </DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar um novo eleitor.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={form.nome || ''} onChange={e => setField('nome', e.target.value)} placeholder="Nome completo" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email || ''} onChange={e => setField('email', e.target.value)} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={form.telefone || ''} onChange={e => setField('telefone', e.target.value)} placeholder="(11) 98765-4321" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={form.cpf || ''} onChange={e => setField('cpf', e.target.value)} placeholder="123.456.789-00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_nascimento">Data Nascimento</Label>
              <Input id="data_nascimento" type="date" value={form.data_nascimento || ''} onChange={e => setField('data_nascimento', e.target.value || null)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" value={form.endereco || ''} onChange={e => setField('endereco', e.target.value)} placeholder="Rua, número, complemento" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" value={form.bairro || ''} onChange={e => setField('bairro', e.target.value)} placeholder="Bairro" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={form.cidade || ''} onChange={e => setField('cidade', e.target.value)} placeholder="Cidade" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" value={form.estado || ''} onChange={e => setField('estado', e.target.value)} placeholder="SP" maxLength={2} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={form.cep || ''} onChange={e => setField('cep', e.target.value)} placeholder="01001-000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comunidade_id">Comunidade</Label>
              <select id="comunidade_id" value={form.comunidade_id || ''} onChange={e => setField('comunidade_id', e.target.value || null)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="">Selecione</option>
                {comunidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="nivel">Nível</Label>
              <select id="nivel" value={form.nivel || 'eleitor'} onChange={e => setField('nivel', e.target.value as Eleitor['nivel'])} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="eleitor">Eleitor</option>
                <option value="apoiador">Apoiador</option>
                <option value="influenciador">Influenciador</option>
                <option value="lider">Líder</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select id="status" value={form.status || 'ativo'} onChange={e => setField('status', e.target.value as Eleitor['status'])} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input id="tags" value={(form.tags || []).join(', ')} onChange={e => setField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="saude, educacao, infraestrutura" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" value={form.observacoes || ''} onChange={e => setField('observacoes', e.target.value)} placeholder="Observações adicionais" rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>{loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Cadastrar Eleitor'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
