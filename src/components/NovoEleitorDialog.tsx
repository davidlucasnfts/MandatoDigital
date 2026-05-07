import { useState, useEffect } from 'react';
import { Plus, User, Crown, Megaphone, HeartHandshake } from 'lucide-react';
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

type AbaNivel = 'eleitor' | 'apoiador' | 'influenciador' | 'lider';

const abaConfig: Record<AbaNivel, { label: string; icon: React.ElementType; color: string }> = {
  eleitor: { label: 'Eleitor', icon: User, color: 'text-slate-600' },
  apoiador: { label: 'Apoiador', icon: HeartHandshake, color: 'text-green-600' },
  influenciador: { label: 'Influenciador', icon: Megaphone, color: 'text-blue-600' },
  lider: { label: 'Líder', icon: Crown, color: 'text-purple-600' },
};

export default function NovoEleitorDialog({ open, onClose, onSuccess, eleitor }: Props) {
  const { insert, update } = useEleitores();
  const { data: comunidades } = useComunidades();
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AbaNivel>('eleitor');
  const isEdit = !!eleitor;

  const buildForm = (e?: Eleitor | null): Partial<Eleitor> => {
    if (!e) return { nivel: 'eleitor', status: 'ativo', tags: [] };
    return {
      nome: e.nome,
      nome_mae: e.nome_mae,
      email: e.email,
      telefone: e.telefone,
      cpf: e.cpf,
      endereco: e.endereco,
      bairro: e.bairro,
      cidade: e.cidade,
      estado: e.estado,
      cep: e.cep,
      comunidade_id: e.comunidade_id,
      indicador_id: e.indicador_id,
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
    if (eleitor?.nivel) setAbaAtiva(eleitor.nivel as AbaNivel);
  }, [eleitor]);

  // Sincroniza nível com aba ativa
  useEffect(() => {
    setForm(prev => ({ ...prev, nivel: abaAtiva }));
  }, [abaAtiva]);

  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch {
      // ignora erro de CEP
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return;

    setLoading(true);
    if (isEdit && eleitor) {
      await update(eleitor.id, {
        nome: form.nome,
        nome_mae: form.nome_mae || null,
        email: form.email || '',
        telefone: form.telefone || '',
        cpf: form.cpf || '',
        endereco: form.endereco || '',
        bairro: form.bairro || '',
        cidade: form.cidade || 'São Paulo',
        estado: form.estado || 'SP',
        cep: form.cep || '',
        comunidade_id: form.comunidade_id || null,
        indicador_id: form.indicador_id || null,
        nivel: form.nivel || 'eleitor',
        tags: form.tags || [],
        status: form.status || 'ativo',
        observacoes: form.observacoes || '',
        data_nascimento: form.data_nascimento || null,
      });
    } else {
      await insert({
        nome: form.nome,
        nome_mae: form.nome_mae || null,
        email: form.email || '',
        telefone: form.telefone || '',
        cpf: form.cpf || '',
        endereco: form.endereco || '',
        bairro: form.bairro || '',
        cidade: form.cidade || 'São Paulo',
        estado: form.estado || 'SP',
        cep: form.cep || '',
        comunidade_id: form.comunidade_id || null,
        indicador_id: form.indicador_id || null,
        nivel: form.nivel || 'eleitor',
        tags: form.tags || [],
        status: form.status || 'ativo',
        observacoes: form.observacoes || '',
        data_nascimento: form.data_nascimento || null,
      });
    }
    setLoading(false);
    setForm({ nivel: 'eleitor', status: 'ativo', tags: [] });
    setAbaAtiva('eleitor');
    onSuccess?.();
    onClose();
  };

  const setField = <K extends keyof Eleitor>(key: K, value: Eleitor[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const renderAbaEleitor = () => (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-700">Cadastro de Eleitor</p>
        <p className="text-xs text-blue-500">Preencha os dados do eleitor da base.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" value={form.nome || ''} onChange={e => setField('nome', e.target.value)} placeholder="Nome completo" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome_mae">Nome da Mãe</Label>
        <Input id="nome_mae" value={form.nome_mae || ''} onChange={e => setField('nome_mae', e.target.value)} placeholder="Nome completo da mãe" />
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
    </div>
  );

  const renderAbaLider = () => (
    <div className="space-y-4">
      <div className="p-3 bg-purple-50 rounded-lg">
        <p className="text-sm font-medium text-purple-700">Cadastro de Líder</p>
        <p className="text-xs text-purple-500">Líderes podem indicar eleitores e receber links de afiliação.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" value={form.nome || ''} onChange={e => setField('nome', e.target.value)} placeholder="Nome completo" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome_mae">Nome da Mãe</Label>
        <Input id="nome_mae" value={form.nome_mae || ''} onChange={e => setField('nome_mae', e.target.value)} placeholder="Nome completo da mãe" />
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
    </div>
  );

  const renderAbaInfluenciador = () => (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium text-blue-700">Cadastro de Influenciador</p>
        <p className="text-xs text-blue-500">Influenciadores têm alcance na comunidade e mobilizam eleitores.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" value={form.nome || ''} onChange={e => setField('nome', e.target.value)} placeholder="Nome completo" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome_mae">Nome da Mãe</Label>
        <Input id="nome_mae" value={form.nome_mae || ''} onChange={e => setField('nome_mae', e.target.value)} placeholder="Nome completo da mãe" />
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
    </div>
  );

  const renderAbaApoiador = () => (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 rounded-lg">
        <p className="text-sm font-medium text-green-700">Cadastro de Apoiador</p>
        <p className="text-xs text-green-500">Apoiadores colaboram ativamente com a campanha.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome *</Label>
        <Input id="nome" value={form.nome || ''} onChange={e => setField('nome', e.target.value)} placeholder="Nome completo" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nome_mae">Nome da Mãe</Label>
        <Input id="nome_mae" value={form.nome_mae || ''} onChange={e => setField('nome_mae', e.target.value)} placeholder="Nome completo da mãe" />
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
    </div>
  );

  const renderCamposComuns = () => (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cep">CEP</Label>
          <div className="flex gap-2">
            <Input id="cep" value={form.cep || ''} onChange={e => setField('cep', e.target.value)} placeholder="01001-000" className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={() => buscarCep(form.cep || '')} className="h-10 px-3">Buscar</Button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comunidade_id">Comunidade</Label>
          <select id="comunidade_id" value={form.comunidade_id || ''} onChange={e => setField('comunidade_id', e.target.value || null)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            <option value="">Selecione</option>
            {comunidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
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
          <Label htmlFor="status">Status</Label>
          <select id="status" value={form.status || 'ativo'} onChange={e => setField('status', e.target.value as Eleitor['status'])} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input id="tags" value={(form.tags || []).join(', ')} onChange={e => setField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} placeholder="saude, educacao, infraestrutura" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea id="observacoes" value={form.observacoes || ''} onChange={e => setField('observacoes', e.target.value)} placeholder="Observações adicionais" rows={3} />
      </div>
    </div>
  );

  const renderConteudoAba = () => {
    switch (abaAtiva) {
      case 'lider': return renderAbaLider();
      case 'influenciador': return renderAbaInfluenciador();
      case 'apoiador': return renderAbaApoiador();
      default: return renderAbaEleitor();
    }
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

        {/* Abas de nível */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(Object.keys(abaConfig) as AbaNivel[]).map((aba) => {
            const config = abaConfig[aba];
            const Icon = config.icon;
            return (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                  abaAtiva === aba
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${abaAtiva === aba ? config.color : 'text-slate-400'}`} />
                {config.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderConteudoAba()}
          {renderCamposComuns()}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : `Cadastrar ${abaConfig[abaAtiva].label}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
