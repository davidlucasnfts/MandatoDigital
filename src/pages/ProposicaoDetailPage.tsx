import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Calendar, Building2, User, Link2, Plus, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { trpc } from '@/providers/trpc';
import { useNavigate, useParams } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const tipoLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei',
  emenda: 'Emenda',
  indicacao: 'Indicação',
  requerimento: 'Requerimento',
  parecer: 'Parecer',
  mocao: 'Moção',
  decreto: 'Decreto',
};

const statusLabels: Record<string, string> = {
  em_elaboracao: 'Em elaboração',
  protocolado: 'Protocolado',
  em_tramitacao: 'Em tramitação',
  em_comissao: 'Em comissão',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  sancionado: 'Sancionado',
  arquivado: 'Arquivado',
  vetoado: 'Vetado',
  retirado: 'Retirado',
};

const statusColors: Record<string, string> = {
  em_elaboracao: 'bg-slate-100 text-slate-600',
  protocolado: 'bg-blue-50 text-blue-600',
  em_tramitacao: 'bg-amber-50 text-amber-600',
  em_comissao: 'bg-purple-50 text-purple-600',
  aprovado: 'bg-green-50 text-green-600',
  rejeitado: 'bg-red-50 text-red-600',
  sancionado: 'bg-emerald-50 text-emerald-600',
  arquivado: 'bg-gray-100 text-gray-500',
  vetoado: 'bg-orange-50 text-orange-600',
  retirado: 'bg-stone-100 text-stone-500',
};

const statusOptions = [
  { value: 'em_elaboracao', label: 'Em elaboração' },
  { value: 'protocolado', label: 'Protocolado' },
  { value: 'em_tramitacao', label: 'Em tramitação' },
  { value: 'em_comissao', label: 'Em comissão' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'sancionado', label: 'Sancionado' },
  { value: 'arquivado', label: 'Arquivado' },
  { value: 'vetoado', label: 'Vetado' },
  { value: 'retirado', label: 'Retirado' },
];

export default function ProposicaoDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showAddTramitacao, setShowAddTramitacao] = useState(false);
  const [showDeleteTramitacao, setShowDeleteTramitacao] = useState<string | null>(null);
  const [tramForm, setTramForm] = useState({ data: '', orgao: '', status: 'em_elaboracao' as const, descricao: '' });

  const utils = trpc.useUtils();
  const { data: proposicao, isLoading } = trpc.proposicoes.byId.useQuery(
    { id: id! },
    { enabled: !!id }
  );
  const { data: tramitacoes } = trpc.proposicoes.listTramitacoes.useQuery(
    { proposicaoId: id! },
    { enabled: !!id }
  );

  const createTramMutation = trpc.proposicoes.createTramitacao.useMutation({
    onSuccess: () => {
      setShowAddTramitacao(false);
      setTramForm({ data: '', orgao: '', status: 'em_elaboracao', descricao: '' });
      utils.proposicoes.listTramitacoes.invalidate({ proposicaoId: id! });
      utils.proposicoes.byId.invalidate({ id: id! });
    },
  });

  const deleteTramMutation = trpc.proposicoes.deleteTramitacao.useMutation({
    onSuccess: () => {
      setShowDeleteTramitacao(null);
      utils.proposicoes.listTramitacoes.invalidate({ proposicaoId: id! });
      utils.proposicoes.byId.invalidate({ id: id! });
    },
  });

  const handleAddTramitacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tramForm.data || !tramForm.orgao) return;
    createTramMutation.mutate({
      proposicaoId: id!,
      data: new Date(tramForm.data),
      orgao: tramForm.orgao,
      status: tramForm.status,
      descricao: tramForm.descricao,
    });
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400">Carregando...</div>;
  }

  if (!proposicao) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Proposição não encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/proposicoes')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/proposicoes')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[proposicao.status]}`}>
                {statusLabels[proposicao.status]}
              </span>
              <span className="text-xs text-slate-400">{tipoLabels[proposicao.tipo]}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mt-1">{proposicao.titulo}</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/proposicoes/${id}/editar`)}>
            Editar
          </Button>
        </div>
      </motion.div>

      {/* Detalhes */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {proposicao.numero && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Número:</span>
                  <span className="font-medium text-slate-700">{proposicao.numero}{proposicao.ano ? `/${proposicao.ano}` : ''}</span>
                </div>
              )}
              {proposicao.tema && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Tema:</span>
                  <span className="font-medium text-slate-700">{proposicao.tema}</span>
                </div>
              )}
              {proposicao.dataApresentacao && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Apresentação:</span>
                  <span className="font-medium text-slate-700">{new Date(proposicao.dataApresentacao).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {proposicao.orgaoAtual && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Órgão:</span>
                  <span className="font-medium text-slate-700">{proposicao.orgaoAtual}</span>
                </div>
              )}
              {proposicao.relator && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">Relator:</span>
                  <span className="font-medium text-slate-700">{proposicao.relator}</span>
                </div>
              )}
              {proposicao.linkOficial && (
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="w-4 h-4 text-slate-400" />
                  <a href={proposicao.linkOficial} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                    Link oficial
                  </a>
                </div>
              )}
            </div>
            {proposicao.ementa && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Ementa</p>
                <p className="text-sm text-slate-700">{proposicao.ementa}</p>
              </div>
            )}
            {proposicao.observacoes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Observações</p>
                <p className="text-sm text-slate-700">{proposicao.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Timeline de tramitação */}
      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Tramitação
          </h3>
          <Button size="sm" variant="outline" onClick={() => setShowAddTramitacao(true)}>
            <Plus className="w-4 h-4 mr-1" /> Registrar movimentação
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            {!tramitacoes || tramitacoes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Nenhuma movimentação registrada</div>
            ) : (
              <div className="relative">
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200" />
                <div className="space-y-6">
                  {tramitacoes.map((t) => (
                    <div key={t.id} className="relative flex gap-4">
                      <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${statusColors[t.status] || 'bg-slate-100'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${t.status === 'aprovado' ? 'bg-green-500' : t.status === 'rejeitado' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{t.orgao}</p>
                            <p className="text-xs text-slate-500">{statusLabels[t.status] || t.status}</p>
                            {t.descricao && <p className="text-xs text-slate-600 mt-1">{t.descricao}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-slate-400">{new Date(t.data).toLocaleDateString('pt-BR')}</span>
                            <button onClick={() => setShowDeleteTramitacao(t.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog: Nova tramitação */}
      <Dialog open={showAddTramitacao} onOpenChange={setShowAddTramitacao}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar movimentação</DialogTitle>
            <DialogDescription>Adicione uma nova etapa na tramitação desta proposição.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTramitacao} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Data *</label>
                <input type="date" value={tramForm.data} onChange={e => setTramForm({ ...tramForm, data: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Órgão *</label>
                <input value={tramForm.orgao} onChange={e => setTramForm({ ...tramForm, orgao: e.target.value })} placeholder="Ex: CCJ, Plenário" className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                <select value={tramForm.status} onChange={e => setTramForm({ ...tramForm, status: e.target.value as any })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Descrição</label>
              <textarea value={tramForm.descricao} onChange={e => setTramForm({ ...tramForm, descricao: e.target.value })} placeholder="Detalhes da movimentação" rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddTramitacao(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-blue-600" disabled={createTramMutation.isPending}>
                {createTramMutation.isPending ? 'Salvando...' : 'Registrar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir tramitação */}
      <Dialog open={!!showDeleteTramitacao} onOpenChange={() => setShowDeleteTramitacao(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Excluir movimentação
            </DialogTitle>
            <DialogDescription>Tem certeza? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteTramitacao(null)}>Cancelar</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => showDeleteTramitacao && deleteTramMutation.mutate({ id: showDeleteTramitacao })} disabled={deleteTramMutation.isPending}>
              {deleteTramMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
