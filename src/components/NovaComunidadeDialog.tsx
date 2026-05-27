import { useState, useEffect, useRef } from 'react';
import { Plus, MapPin, Loader2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useComunidades, useEleitores } from '@/hooks/useSupabaseData';
import { useGeocoding } from '@/hooks/useGeocoding';
import AutocompleteCidade from '@/components/AutocompleteCidade';
import AutocompleteBairro from '@/components/AutocompleteBairro';
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
  const { geocodeByCep, refineWithNumber, isLoading: geocodingLoading } = useGeocoding();
  const lideres = eleitores.filter(e => e.nivel === 'lider');
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const isEdit = !!comunidade;
  const lastNumeroRefinedRef = useRef('');
  const lastCepBuscadoRef = useRef('');

  const buildForm = (c?: Comunidade | null) => ({
    nome: c?.nome || '',
    descricao: c?.descricao || '',
    lider_id: c?.lider_id || null,
    cor: '#2563EB',
    icone: 'Users',
    cep: c?.cep || '',
    logradouro: c?.logradouro || '',
    numero: c?.numero || '',
    bairro: c?.bairro || '',
    cidade: c?.cidade || '',
    estado: c?.estado || '',
    latitude: c?.latitude ?? null,
    longitude: c?.longitude ?? null,
  });
  const [form, setForm] = useState(buildForm(comunidade));

  useEffect(() => { setForm(buildForm(comunidade)); }, [comunidade?.id, open]);

  // Busca CEP no ViaCEP e geocodifica com CNEFE (custo zero)
  const buscarCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    // Evita chamar 2x para o mesmo CEP
    if (lastCepBuscadoRef.current === clean) return;
    lastCepBuscadoRef.current = clean;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data: ViaCepResponse = await res.json();

      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          cep: clean,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));

        // Geocodifica com CNEFE (custo zero) — sempre que tiver CEP
        const coords = await geocodeByCep(clean, data.localidade || '', data.uf || '', data.logradouro || '');
        if (coords) {
          setForm(prev => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng,
          }));
        }
      }
    } catch {
      // ignora erro de CEP
    } finally {
      setBuscandoCep(false);
    }
  };

  // Limpa endereco quando CEP é removido
  const handleCepChange = (v: string) => {
    const clean = v.replace(/\D/g, '').slice(0, 8);
    if (clean === '') {
      // CEP limpo → limpa endereco tambem
      setForm(prev => ({
        ...prev,
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: '',
        latitude: null,
        longitude: null,
      }));
      lastCepBuscadoRef.current = '';
    } else {
      setField('cep', clean);
    }
  };

  // Campos bloqueados quando CEP preenchido
  const enderecoBloqueado = !!form.cep && form.cep.length === 8;

  // Refina coordenadas com numero da casa (Here API) — chamada apenas quando numero muda
  const refinarComNumero = async (numero: string): Promise<{ lat: number; lng: number } | null> => {
    // Evita chamar Here API 2x para o mesmo numero
    if (lastNumeroRefinedRef.current === numero) {
      return form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null;
    }

    const coords = await refineWithNumber(
      form.logradouro || '',
      numero,
      form.bairro || '',
      form.cidade,
      form.estado,
      form.cep,
      form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null
    );

    if (coords) {
      setForm(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
    }
    lastNumeroRefinedRef.current = numero;
    return coords;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome?.trim()) return;

    // Validacao: CEP obrigatorio
    const cepLimpo = (form.cep || '').replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      alert('CEP é obrigatório para geocodificação');
      return;
    }

    // Validacao: numero obrigatorio (ou S/N)
    if (!form.numero || form.numero.trim() === '') {
      alert('Número é obrigatório. Marque "Sem número (S/N)" se não houver.');
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<Comunidade> = {
        nome: form.nome.trim(),
        descricao: form.descricao || undefined,
        lider_id: form.lider_id || null,
        cor: form.cor || '#2563EB',
        icone: form.icone || 'Users',
        cep: cepLimpo || null,
        logradouro: form.logradouro || null,
        numero: form.numero || null,
        bairro: form.bairro || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
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
      lastNumeroRefinedRef.current = '';
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
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
              CEP *
            </Label>
            <div className="flex gap-2">
              <Input
                id="cep"
                value={maskCEP(form.cep)}
                onChange={e => handleCepChange(e.target.value)}
                onBlur={e => buscarCep(e.target.value)}
                placeholder="00000-000"
                className="flex-1"
                required
              />
              <Button type="button" variant="outline" size="sm" onClick={() => buscarCep(form.cep || '')} className="h-10 px-3">Buscar</Button>
              {buscandoCep && <span className="text-xs text-slate-400 self-center">Buscando...</span>}
            </div>
          </div>

          {/* Endereço — Logradouro + Número */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="logradouro">Rua / Avenida</Label>
              <Input id="logradouro" value={form.logradouro} onChange={e => setField('logradouro', capitalizeWords(e.target.value))} placeholder="Nome da rua" disabled={enderecoBloqueado} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor="numero" className="text-xs">Nº</Label>
                <label className="flex items-center gap-0.5 text-[9px] text-slate-400 cursor-pointer leading-none">
                  <input
                    type="checkbox"
                    checked={form.numero === "S/N"}
                        onChange={(e) => {
                      if (e.target.checked) {
                        setField('numero', 'S/N');
                        // S/N nao chama Here API, mantem coordenadas do CEP
                      } else {
                        setField('numero', '');
                      }
                    }}
                    className="w-3 h-3"
                  />
                  <span>S/N</span>
                </label>
              </div>
              <Input
                id="numero"
                value={form.numero === "S/N" ? "" : (form.numero || '')}
                disabled={form.numero === "S/N"}
                onChange={e => {
                  const novoNumero = e.target.value.toUpperCase();
                  // Reset flag quando numero muda (permite refinar novamente)
                  if (novoNumero !== lastNumeroRefinedRef.current) {
                    lastNumeroRefinedRef.current = '';
                  }
                  setField('numero', novoNumero);
                }}
                onBlur={(e) => {
                  const numero = e.target.value.toUpperCase();
                  if (form.logradouro && form.cidade && form.estado && numero && numero !== "S/N") {
                    refinarComNumero(numero);
                  }
                }}
                placeholder={form.numero === "S/N" ? "S/N" : "123"}
                className="px-2"
              />
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
                disabled={enderecoBloqueado}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cidade">Cidade</Label>
              <AutocompleteCidade id="cidade" value={form.cidade} onChange={v => {
                setField('cidade', v);
                setField('bairro', '');
              }} placeholder="Cidade" disabled={enderecoBloqueado} />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" value={form.estado} onChange={e => setField('estado', e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" maxLength={2} className="w-20" disabled={enderecoBloqueado} />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading || geocodingLoading}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading || geocodingLoading}>
              {geocodingLoading ? (
                <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Geocodificando...</span>
              ) : loading ? (
                'Salvando...'
              ) : isEdit ? (
                'Salvar alterações'
              ) : (
                'Criar comunidade'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
