import { useState, useEffect } from 'react';
import { Plus, User, Crown } from 'lucide-react';
import { maskCPF, maskPhone, maskCEP, capitalizeWords, formatDateForInput } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useEleitores, useComunidades } from '@/hooks/useSupabaseData';
import AutocompleteCidade from '@/components/AutocompleteCidade';
import AutocompleteBairro from '@/components/AutocompleteBairro';
import { geocodeCep } from '@/lib/geocoding';
import type { Eleitor } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  eleitor?: Eleitor | null;
}

type AbaNivel = 'eleitor' | 'lider';

const abaConfig: Record<AbaNivel, { label: string; icon: React.ElementType; color: string; bg: string; desc: string }> = {
  eleitor: { label: 'Eleitor', icon: User, color: 'text-slate-600', bg: 'bg-slate-50', desc: 'Preencha os dados do eleitor da base.' },
  lider: { label: 'Líder', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Líderes podem indicar eleitores e receber links de afiliação.' },
};

export default function NovoEleitorDialog({ open, onClose, onSuccess, eleitor }: Props) {
  const { insert, update } = useEleitores();
  const { data: comunidades } = useComunidades();
  const { data: lideres } = useEleitores();
  const [loading, setLoading] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AbaNivel>('eleitor');
  const isEdit = !!eleitor;

  const buildForm = (e?: Eleitor | null): Partial<Eleitor> => {
    if (!e) return { nivel: 'eleitor', status: 'ativo', tags: [], lider_id: null, data_nascimento: null };
    return {
      nome: e.nome,
      nome_mae: e.nome_mae,
      email: e.email,
      telefone: e.telefone,
      cpf: e.cpf,
      endereco: e.endereco,
      numero: e.numero,
      bairro: e.bairro,
      cidade: e.cidade,
      estado: e.estado,
      cep: e.cep,
      comunidade_id: e.comunidade_id,
      indicador_id: e.indicador_id,
      nivel: e.nivel,
      lider_id: e.lider_id,
      tags: e.tags,
      status: e.status,
      observacoes: e.observacoes,
      data_nascimento: e.data_nascimento,
    };
  };

  const [form, setForm] = useState<Partial<Eleitor>>(buildForm(eleitor));

  useEffect(() => {
    // Só rebuilda o form se o dialog acabou de abrir (open mudou de false pra true)
    // ou se o eleitor mudou de ID. Evita sobrescrever digitação do usuário.
    setForm(buildForm(eleitor));
    if (eleitor?.nivel) setAbaAtiva(eleitor.nivel as AbaNivel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eleitor?.id, open]);

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
        const endereco = data.logradouro || '';
        const bairro = data.bairro || '';
        const cidade = data.localidade || '';
        const estado = data.uf || '';

        // Geocodifica o CEP + logradouro + cidade + estado para coordenadas precisas
        const coords = await geocodeCep(clean, cidade, estado, endereco);

        setForm(prev => ({
          ...prev,
          cep: maskCEP(clean), // <-- GARANTE QUE O CEP FICA FORMATADO NO FORM
          endereco,
          bairro,
          cidade,
          estado,
          latitude: coords?.lat ?? prev.latitude,
          longitude: coords?.lng ?? prev.longitude,
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
    try {
      const payload = {
        nome: form.nome,
        nome_mae: form.nome_mae || null,
        email: form.email || '',
        telefone: form.telefone || '',
        cpf: form.cpf || '',
        endereco: form.endereco || '',
        numero: form.numero || null,
        bairro: form.bairro || '',
        cidade: form.cidade || 'São Paulo',
        estado: form.estado || 'SP',
        cep: form.cep || '',
        latitude: form.latitude ?? null,
        longitude: form.longitude ?? null,
        comunidade_id: form.comunidade_id || null,
        indicador_id: form.indicador_id || null,
        nivel: form.nivel || 'eleitor',
        lider_id: form.lider_id || null,
        tags: form.tags || [],
        status: form.status || 'ativo',
        observacoes: form.observacoes || '',
        data_nascimento: form.data_nascimento ? form.data_nascimento : null,
      };

      if (isEdit && eleitor) {
        await update(eleitor.id, payload);
      } else {
        await insert(payload);
      }
      setForm({ nivel: 'eleitor', status: 'ativo', tags: [], lider_id: null });
      setAbaAtiva('eleitor');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar eleitor');
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof Eleitor>(key: K, value: Eleitor[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const config = abaConfig[abaAtiva];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar' : 'Novo'} {config.label.toLowerCase()}
          </DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar.</DialogDescription>
        </DialogHeader>

        {/* Abas */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {(Object.keys(abaConfig) as AbaNivel[]).map((aba) => {
            const cfg = abaConfig[aba];
            const AbIcon = cfg.icon;
            return (
              <button
                key={aba}
                onClick={() => setAbaAtiva(aba)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                  abaAtiva === aba ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <AbIcon className={`w-3.5 h-3.5 ${abaAtiva === aba ? cfg.color : 'text-slate-400'}`} />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner da aba */}
          <div className={`p-3 ${config.bg} rounded-lg`}>
            <p className={`text-sm font-medium ${config.color}`}>Cadastro de {config.label}</p>
            <p className="text-xs text-slate-500">{config.desc}</p>
          </div>

          {/* Campos principais */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input id="nome" value={form.nome || ''} onChange={e => setField('nome', capitalizeWords(e.target.value))} placeholder="Nome completo" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nome_mae">Nome da mãe</Label>
            <Input id="nome_mae" value={form.nome_mae || ''} onChange={e => setField('nome_mae', capitalizeWords(e.target.value))} placeholder="Nome completo da mãe" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={form.email || ''} onChange={e => setField('email', e.target.value)} placeholder="nome@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={form.telefone || ''} onChange={e => setField('telefone', maskPhone(e.target.value))} placeholder="(11) 98765-4321" maxLength={15} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" value={form.cpf || ''} onChange={e => setField('cpf', maskCPF(e.target.value))} placeholder="123.456.789-00" maxLength={14} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_nascimento">Data de nascimento</Label>
              <input
                id="data_nascimento"
                type="date"
                min="1900-01-01"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                value={formatDateForInput(form.data_nascimento)}
                onChange={e => setField('data_nascimento', e.target.value || null)}
                onBlur={e => {
                  const val = e.target.value;
                  if (!val) return;
                  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];
                  if (val > maxDate) setField('data_nascimento', maxDate);
                  else if (val < '1900-01-01') setField('data_nascimento', '1900-01-01');
                }}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>

          {/* Líder (só aparece quando aba = eleitor) */}
          {abaAtiva === 'eleitor' && (
            <div className="space-y-1.5">
              <Label htmlFor="lider_id">Líder responsável</Label>
              <select
                id="lider_id"
                value={form.lider_id || ''}
                onChange={e => setField('lider_id', e.target.value || null)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Sem líder</option>
                {lideres.filter(l => l.nivel === 'lider').map(l => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>
          )}

          {/* Campos comuns */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cep">CEP</Label>
                <div className="flex gap-2">
                  <Input id="cep" value={form.cep || ''} onChange={e => setField('cep', maskCEP(e.target.value))} onBlur={e => buscarCep(e.target.value)} placeholder="01001-000" className="flex-1" maxLength={9} />
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

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" value={form.endereco || ''} onChange={e => setField('endereco', capitalizeWords(e.target.value))} placeholder="Rua, avenida" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" value={form.numero || ''} onChange={e => setField('numero', e.target.value.toUpperCase())} placeholder="S/N" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <AutocompleteBairro
                  id="bairro"
                  label="Bairro"
                  value={form.bairro || ''}
                  onChange={v => setField('bairro', v)}
                  cidade={form.cidade || ''}
                  placeholder="Bairro"
                />
              </div>
              <div className="space-y-1.5">
                <AutocompleteCidade
                  id="cidade"
                  label="Cidade"
                  value={form.cidade || ''}
                  onChange={(v, uf) => {
                    setField('cidade', v);
                    if (uf) setField('estado', uf);
                  }}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estado">Estado</Label>
                <Input id="estado" value={form.estado || ''} onChange={e => setField('estado', e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} placeholder="SP" maxLength={2} />
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : `Cadastrar ${config.label}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
