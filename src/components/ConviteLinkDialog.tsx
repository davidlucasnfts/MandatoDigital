import { useState } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConvitesEleitores } from '@/hooks/useSupabaseData';
import type { Eleitor } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  lider: Eleitor;
}

export default function ConviteLinkDialog({ open, onClose, lider }: Props) {
  const { criarConvite } = useConvitesEleitores();
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const gerarLink = async () => {
    setLoading(true);
    const convite = await criarConvite(lider.id, {
      nome: nome || undefined,
      email: email || undefined,
      telefone: telefone || undefined,
    });
    if (convite) {
      const url = `${window.location.origin}/convite/${convite.token}`;
      setLink(url);
    }
    setLoading(false);
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Link de Afiliação
          </DialogTitle>
          <DialogDescription>
            Gere um link para {lider.nome} convidar eleitores para sua rede.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {!link ? (
            <>
              <div className="space-y-1.5">
                <Label>Nome do convidado (opcional)</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Pré-preencher nome" />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail (opcional)</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Pré-preencher e-mail" />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone (opcional)</Label>
                <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Pré-preencher telefone" />
              </div>
              <Button onClick={gerarLink} disabled={loading} className="w-full bg-blue-600">
                {loading ? 'Gerando...' : 'Gerar Link de Convite'}
              </Button>
            </>
          ) : (
            <>
              <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                Link gerado com sucesso! Envie para o eleitor se cadastrar.
              </div>
              <div className="flex gap-2">
                <Input value={link} readOnly className="flex-1 text-sm" />
                <Button variant="outline" size="sm" onClick={copiarLink} className="h-10 px-3">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button variant="outline" onClick={() => { setLink(''); setNome(''); setEmail(''); setTelefone(''); }} className="w-full">
                Gerar novo link
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
