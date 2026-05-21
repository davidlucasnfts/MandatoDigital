import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Save } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/providers/trpc';
import { useNavigate, useParams } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const tipoOptions = [
  { value: 'projeto_lei', label: 'Projeto de Lei' },
  { value: 'emenda', label: 'Emenda' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'requerimento', label: 'Requerimento' },
  { value: 'parecer', label: 'Parecer' },
  { value: 'mocao', label: 'Moção' },
  { value: 'decreto', label: 'Decreto' },
];

const statusOptions = [
  { value: 'em_elaboracao', label: 'Em elaboração' },
  { value: 'protocolado', label: 'Protocolado' },
  { value: 'em_tramitacao', label: 'Em tramitação' },
  { value: 'em_comissao', label: 'Em comissão' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'sancionado', label: 'Sancionado' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'veteado', label: 'Vetado' },
  { value: 'retirado', label: 'Retirado' },
];

export default function ProposicaoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id && id !== 'nova';

  const utils = trpc.useUtils();
  const { data: existing } = trpc.proposicoes.byId.useQuery(
    { id: id! },
    { enabled: !!isEdit }
  );

  const [form, setForm] = useState<{
    tipo: 'projeto_lei' | 'emenda' | 'indicacao' | 'requerimento' | 'parecer' | 'mocao' | 'decreto';
    numero: string;
    ano: number;
    titulo: string;
    ementa: string;
    tema: string;
    status: 'em_elaboracao' | 'protocolado' | 'em_tramitacao' | 'em_comissao' | 'aprovado' | 'rejeitado' | 'sancionado' | 'arquivado' | 'veteado' | 'retirado';
    dataApresentacao: string;
    dataAprovacao: string;
    orgaoAtual: string;
    relator: string;
    linkOficial: string;
    observacoes: string;
  }>({
    tipo: 'projeto_lei',
    numero: '',
    ano: new Date().getFullYear(),
    titulo: '',
    ementa: '',
    tema: '',
    status: 'em_elaboracao',
    dataApresentacao: '',
    dataAprovacao: '',
    orgaoAtual: '',
    relator: '',
    linkOficial: '',
    observacoes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (existing) {
      setForm({
        tipo: existing.tipo,
        numero: existing.numero || '',
        ano: existing.ano || new Date().getFullYear(),
        titulo: existing.titulo,
        ementa: existing.ementa || '',
        tema: existing.tema || '',
        status: existing.status,
        dataApresentacao: existing.dataApresentacao ? new Date(existing.dataApresentacao).toISOString().split('T')[0] : '',
        dataAprovacao: existing.dataAprovacao ? new Date(existing.dataAprovacao).toISOString().split('T')[0] : '',
        orgaoAtual: existing.orgaoAtual || '',
        relator: existing.relator || '',
        linkOficial: existing.linkOficial || '',
        observacoes: existing.observacoes || '',
      });
    }
  }, [existing]);

  const createMutation = trpc.proposicoes.create.useMutation({
    onSuccess: () => {
      utils.proposicoes.list.invalidate();
      navigate('/dashboard/proposicoes');
    },
    onError: (e) => setError(e.message),
  });

  const updateMutation = trpc.proposicoes.update.useMutation({
    onSuccess: () => {
      utils.proposicoes.list.invalidate();
      navigate('/dashboard/proposicoes');
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      ano: form.ano || undefined,
      dataApresentacao: form.dataApresentacao ? new Date(form.dataApresentacao) : undefined,
      dataAprovacao: form.dataAprovacao ? new Date(form.dataAprovacao) : undefined,
    };
    if (isEdit) {
      updateMutation.mutate({ id: id!, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/proposicoes')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {isEdit ? 'Editar Proposição' : 'Nova Proposição'}
          </h2>
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-6">
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Tipo *</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as any })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required>
                    {tipoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Título *</label>
                  <Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Título da proposição" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Tema</label>
                  <Input value={form.tema} onChange={e => setForm({ ...form, tema: e.target.value })} placeholder="Ex: Saúde, Educação" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Ementa</label>
                <textarea value={form.ementa} onChange={e => setForm({ ...form, ementa: e.target.value })} placeholder="Resumo objetivo da proposição..." rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Número</label>
                  <Input value={form.numero} onChange={e => setForm({ ...form, numero: e.target.value.replace(/\D/g, '') })} placeholder="Ex: 123" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Ano</label>
                  <Input type="number" value={form.ano} onChange={e => setForm({ ...form, ano: parseInt(e.target.value) || new Date().getFullYear() })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Data de apresentação</label>
                  <Input type="date" value={form.dataApresentacao} onChange={e => setForm({ ...form, dataApresentacao: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Órgão atual</label>
                  <Input value={form.orgaoAtual} onChange={e => setForm({ ...form, orgaoAtual: e.target.value })} placeholder="Ex: CCJ, Plenário" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Relator</label>
                  <Input value={form.relator} onChange={e => setForm({ ...form, relator: e.target.value })} placeholder="Nome do relator" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Link oficial</label>
                <Input type="url" value={form.linkOficial} onChange={e => setForm({ ...form, linkOficial: e.target.value })} placeholder="https://..." />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Informações adicionais..." rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/dashboard/proposicoes')}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-blue-600" disabled={isPending}>
                  <Save className="w-4 h-4 mr-1.5" />
                  {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar proposição'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
