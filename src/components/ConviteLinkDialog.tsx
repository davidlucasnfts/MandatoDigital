import { useState, useEffect } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { Eleitor } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  lider: Eleitor;
}

export default function ConviteLinkDialog({ open, onClose, lider }: Props) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/afiliar/${lider.id}`;

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
            Link fixo para {lider.nome} convidar eleitores para sua rede.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
            Este link é <strong>sempre o mesmo</strong>. O líder pode compartilhar no WhatsApp, Instagram ou panfletos.
          </div>

          <div className="flex gap-2">
            <Input value={link} readOnly className="flex-1 text-sm" />
            <Button variant="outline" size="sm" onClick={copiarLink} className="h-10 px-3">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-xs text-slate-500">
            Eleitores cadastrados por este link aparecerão na aba <strong>Pendentes</strong> para aprovação.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
