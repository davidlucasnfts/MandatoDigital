import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Check, Loader2, AlertCircle, PartyPopper } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/providers/trpc';
import { maskPhone } from '@/lib/masks';

export default function EnquetePublicaPage() {
  const { enqueteId } = useParams<{ enqueteId: string }>();
  const [selected, setSelected] = useState<string[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: enquete, isLoading, error } = trpc.enquetes.publicById.useQuery(
    { id: enqueteId! },
    { enabled: !!enqueteId }
  );

  const responder = trpc.enquetes.responderPublico.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const toggleOpcao = (id: string) => {
    if (!enquete) return;
    if (enquete.permiteMultiplaEscolha) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqueteId || selected.length === 0) return;
    responder.mutate({
      enqueteId,
      opcaoIds: selected,
      nomeRespondente: nome || undefined,
      telefoneRespondente: telefone || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !enquete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">Enquete não encontrada</h1>
          <p className="text-sm text-slate-500">
            {error?.message?.includes('encerrada')
              ? 'Esta enquete já foi encerrada.'
              : 'O link pode estar incorreto ou a enquete não está mais disponível.'}
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-2">Obrigado pela sua participação!</h1>
          <p className="text-sm text-slate-500">Seu voto foi registrado com sucesso.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Pesquisa de Opinião</h1>
          <p className="text-sm text-slate-500 mt-1">Sua opinião é muito importante para nós.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-2">{enquete.titulo}</h2>
          {enquete.descricao && (
            <p className="text-sm text-slate-500 mb-5">{enquete.descricao}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Opções {enquete.permiteMultiplaEscolha ? '(múltipla escolha)' : '(escolha uma)'}
              </Label>
              <div className="space-y-2">
                {enquete.opcoes.map((opcao: any) => {
                  const isSelected = selected.includes(opcao.id);
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => toggleOpcao(opcao.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm break-all">{opcao.texto}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <Label htmlFor="nome" className="text-xs">Nome (opcional)</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <Label htmlFor="telefone" className="text-xs">Telefone (opcional)</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(maskPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {responder.error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {responder.error.message}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={selected.length === 0 || responder.isPending}
            >
              {responder.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando voto...
                </>
              ) : (
                'Confirmar voto'
              )}
            </Button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Mandato Digital — Sua opinião faz a diferença
        </p>
      </div>
    </div>
  );
}
