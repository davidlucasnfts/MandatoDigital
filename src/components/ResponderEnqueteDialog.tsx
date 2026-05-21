import { useState, useEffect } from 'react';
import { Vote, Check } from '@/lib/icons';
import { maskPhone } from '@/lib/masks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/providers/trpc';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  enqueteId: string | null;
}

export default function ResponderEnqueteDialog({ open, onClose, onSuccess, enqueteId }: Props) {
  const [selectedOpcoes, setSelectedOpcoes] = useState<string[]>([]);
  const [nomeRespondente, setNomeRespondente] = useState('');
  const [telefoneRespondente, setTelefoneRespondente] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: enquete } = trpc.enquetes.byId.useQuery(
    { id: enqueteId! },
    { enabled: !!enqueteId }
  );
  const responderMutation = trpc.enquetes.responder.useMutation({ onSuccess: () => onSuccess?.() });

  useEffect(() => {
    if (open) {
      setSelectedOpcoes([]);
      setNomeRespondente('');
      setTelefoneRespondente('');
      setObservacao('');
    }
  }, [open, enqueteId]);

  const toggleOpcao = (opcaoId: string) => {
    if (enquete?.permiteMultiplaEscolha) {
      setSelectedOpcoes(prev =>
        prev.includes(opcaoId) ? prev.filter(id => id !== opcaoId) : [...prev, opcaoId]
      );
    } else {
      setSelectedOpcoes([opcaoId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqueteId || selectedOpcoes.length === 0) return;

    setLoading(true);
    await responderMutation.mutateAsync({
      enqueteId,
      opcaoIds: selectedOpcoes,
      nomeRespondente: nomeRespondente || undefined,
      telefoneRespondente: telefoneRespondente || undefined,
      observacao: observacao || undefined,
    });
    setLoading(false);
    onSuccess?.();
    onClose();
  };

  if (!enquete) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-green-600" />
            Registrar resposta
          </DialogTitle>
          <DialogDescription>
            {enquete.titulo}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Opções {enquete.permiteMultiplaEscolha ? '(múltipla escolha)' : '(escolha uma)'}</Label>
            <div className="space-y-2">
              {enquete.opcoes?.map((opcao: any) => {
                const selected = selectedOpcoes.includes(opcao.id);
                return (
                  <button
                    key={opcao.id}
                    type="button"
                    onClick={() => toggleOpcao(opcao.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}>
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm">{opcao.texto}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do respondente</Label>
              <Input id="nome" value={nomeRespondente} onChange={e => setNomeRespondente(e.target.value)} placeholder="Opcional" />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefoneRespondente} onChange={e => setTelefoneRespondente(maskPhone(e.target.value))} placeholder="Opcional" maxLength={15} />
            </div>
          </div>
          <div>
            <Label htmlFor="obs">Observação</Label>
            <Textarea id="obs" value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} placeholder="Opcional" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || selectedOpcoes.length === 0} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Registrando...' : 'Registrar voto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
