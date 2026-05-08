import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [valido, setValido] = useState(false);
  const [liderNome, setLiderNome] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    bairro: '',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '',
    data_nascimento: '',
  });

  useEffect(() => {
    async function validar() {
      if (!token) { setLoading(false); return; }
      const { data: convite } = await supabase
        .from('convites_eleitores')
        .select('*, lider:indicador_id(nome)')
        .eq('token', token)
        .eq('status', 'pendente')
        .single();

      if (convite && new Date(convite.data_expiracao) > new Date()) {
        setValido(true);
        setLiderNome(convite.lider?.nome || 'Líder');
        if (convite.nome) setForm(prev => ({ ...prev, nome: convite.nome }));
        if (convite.email) setForm(prev => ({ ...prev, email: convite.email }));
        if (convite.telefone) setForm(prev => ({ ...prev, telefone: convite.telefone }));
      }
      setLoading(false);
    }
    validar();
  }, [token]);

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
    } catch { /* ignora */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !token) return;

    setLoading(true);
    const { data: convite } = await supabase
      .from('convites_eleitores')
      .select('*')
      .eq('token', token)
      .single();

    if (!convite) { setLoading(false); return; }

    const { data: eleitor } = await supabase.from('eleitores').insert({
      nome: form.nome,
      email: form.email || null,
      telefone: form.telefone || null,
      cpf: form.cpf || null,
      endereco: form.endereco || null,
      bairro: form.bairro || null,
      cidade: form.cidade || 'São Paulo',
      estado: form.estado || 'SP',
      cep: form.cep || null,
      data_nascimento: form.data_nascimento || null,
      lider_id: convite.indicador_id,
      nivel: 'eleitor',
      status: 'ativo',
      tags: [],
      user_id: convite.owner_id,
      owner_id: convite.owner_id,
    }).select().single();

    if (eleitor) {
      await supabase.from('convites_eleitores').update({ status: 'aprovado' }).eq('id', convite.id);
      setSucesso(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400">Verificando convite...</div>
      </div>
    );
  }

  if (!valido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-800">Convite inválido ou expirado</h2>
            <p className="text-sm text-slate-500 mt-1">Este link não é mais válido. Solicite um novo convite ao líder.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/')}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-800">Cadastro realizado!</h2>
            <p className="text-sm text-slate-500 mt-1">Você foi cadastrado como eleitor de {liderNome}.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/')}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Cadastro de Eleitor</h1>
          <p className="text-sm text-slate-500">Você foi convidado por <span className="font-medium text-slate-700">{liderNome}</span></p>
        </div>

        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Seu nome completo" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 98765-4321" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="123.456.789-00" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="data_nascimento">Data Nascimento</Label>
                  <Input id="data_nascimento" type="date" value={form.data_nascimento} onChange={e => setForm({ ...form, data_nascimento: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cep">CEP</Label>
                <div className="flex gap-2">
                  <Input id="cep" value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} placeholder="01001-000" className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={() => buscarCep(form.cep)} className="h-10 px-3">Buscar</Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} placeholder="Bairro" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} placeholder="SP" maxLength={2} />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar como Eleitor'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
