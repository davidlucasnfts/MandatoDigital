import { useState, useEffect } from 'react';
import { Link2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { Eleitor } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  lider: Eleitor;
}

type CampoConfig = {
  key: string;
  label: string;
  obrigatorio: boolean;
};

const CAMPOS_PADRAO: CampoConfig[] = [
  { key: 'nome', label: 'Nome completo', obrigatorio: true },
  { key: 'nome_mae', label: 'Nome da mãe', obrigatorio: false },
  { key: 'email', label: 'E-mail', obrigatorio: false },
  { key: 'telefone', label: 'Telefone', obrigatorio: false },
  { key: 'cpf', label: 'CPF', obrigatorio: false },
  { key: 'data_nascimento', label: 'Data de nascimento', obrigatorio: false },
  { key: 'cep', label: 'CEP', obrigatorio: false },
  { key: 'endereco', label: 'Endereço', obrigatorio: false },
  { key: 'bairro', label: 'Bairro', obrigatorio: false },
  { key: 'cidade', label: 'Cidade', obrigatorio: false },
  { key: 'estado', label: 'Estado', obrigatorio: false },
  { key: 'comunidade_id', label: 'Comunidade', obrigatorio: false },
  { key: 'observacoes', label: 'Observações', obrigatorio: false },
];

export default function ConviteLinkDialog({ open, onClose, lider }: Props) {
  const [copied, setCopied] = useState(false);
  const [campos, setCampos] = useState<string[]>(CAMPOS_PADRAO.map(c => c.key));
  const [salvando, setSalvando] = useState(false);
  const link = `${window.location.origin}/afiliar/${lider.id}`;

  useEffect(() => {
    if (open) {
      buscarConfig();
    }
  }, [open]);

  const buscarConfig = async () => {
    const { data: convite } = await supabase
      .from('convites_eleitores')
      .select('campos_obrigatorios')
      .eq('indicador_id', lider.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (convite?.campos_obrigatorios && Array.isArray(convite.campos_obrigatorios)) {
      setCampos(convite.campos_obrigatorios as string[]);
    }
  };

  const salvarConfig = async () => {
    setSalvando(true);
    const { data: convite } = await supabase
      .from('convites_eleitores')
      .select('id')
      .eq('indicador_id', lider.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (convite) {
      await supabase
        .from('convites_eleitores')
        .update({ campos_obrigatorios: campos })
        .eq('id', convite.id);
    }
    setSalvando(false);
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCampo = (key: string) => {
    if (key === 'nome') return;
    setCampos(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Link de convite
          </DialogTitle>
          <DialogDescription>
            Link para {lider.nome} convidar eleitores para sua rede.
          </DialogDescription>
        </DialogHeader>

        {/* Campos do formulário */}
        <div className="space-y-3 mt-2">
          <p className="text-sm font-medium text-slate-700">
            Campos do formulário de cadastro:
          </p>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-72 overflow-y-auto border rounded-lg p-3">
            {CAMPOS_PADRAO.map(campo => (
              <div key={campo.key} className="flex items-center gap-2">
                <Checkbox
                  id={`campo-${campo.key}`}
                  checked={campos.includes(campo.key)}
                  onCheckedChange={() => toggleCampo(campo.key)}
                  disabled={campo.obrigatorio}
                />
                <Label
                  htmlFor={`campo-${campo.key}`}
                  className={`text-sm cursor-pointer truncate ${campo.obrigatorio ? 'text-slate-800 font-medium' : 'text-slate-600'}`}
                  title={campo.label}
                >
                  {campo.label}
                  {campo.obrigatorio && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                {campos.includes(campo.key) ? (
                  <Eye className="w-3.5 h-3.5 text-blue-500 ml-auto shrink-0" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={salvarConfig}
            disabled={salvando}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {salvando ? 'Salvando...' : 'Salvar configuração'}
          </Button>

          <p className="text-xs text-slate-500">
            <strong>Nota:</strong> O nome completo é sempre obrigatório. Os demais campos podem ser ocultados.
          </p>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Link de convite:
          </p>

          <div className="flex gap-2">
            <Input value={link} readOnly className="flex-1 text-sm" />
            <Button variant="outline" size="sm" onClick={copiarLink} className="h-10 px-3">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Este link é <strong>sempre o mesmo</strong>. O líder pode compartilhar no WhatsApp, Instagram ou panfletos. Eleitores cadastrados aparecerão na aba <strong>Pendentes</strong> para aprovação.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
