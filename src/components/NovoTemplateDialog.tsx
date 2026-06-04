import { useState } from 'react';
import { MessageSquare, Mail, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useTemplates } from '@/hooks/useTemplates';

interface Props {
  open: boolean;
  onClose: () => void;
}

const VARIAVEIS_PADRAO = ['{{nome}}', '{{cidade}}', '{{bairro}}', '{{comunidade}}', '{{telefone}}'];

export default function NovoTemplateDialog({ open, onClose }: Props) {
  const { insert } = useTemplates();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'whatsapp' | 'email'>('whatsapp');
  const [assunto, setAssunto] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [variaveis, setVariaveis] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setNome('');
    setTipo('whatsapp');
    setAssunto('');
    setConteudo('');
    setVariaveis([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const inserirVariavel = (v: string) => {
    setConteudo(prev => prev + ' ' + v);
    if (!variaveis.includes(v)) setVariaveis(prev => [...prev, v]);
  };

  const salvar = async () => {
    if (!nome.trim() || !conteudo.trim()) return;
    setSaving(true);
    await insert({
      nome: nome.trim(),
      tipo,
      assunto: assunto.trim() || null,
      conteudo: conteudo.trim(),
      variaveis,
    });
    setSaving(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Novo Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Tipo */}
          <div className="flex gap-2">
            <Button
              variant={tipo === 'whatsapp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTipo('whatsapp')}
              className={tipo === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <MessageSquare className="w-4 h-4 mr-1.5" /> WhatsApp
            </Button>
            <Button
              variant={tipo === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTipo('email')}
              className={tipo === 'email' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Mail className="w-4 h-4 mr-1.5" /> E-mail
            </Button>
          </div>

          {/* Nome */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Nome do template</label>
            <Input
              placeholder="Ex: Feliz Aniversário"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Assunto (só email) */}
          {tipo === 'email' && (
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Assunto</label>
              <Input
                placeholder="Digite o assunto..."
                value={assunto}
                onChange={e => setAssunto(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {/* Variáveis */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Variáveis disponíveis</label>
            <div className="flex flex-wrap gap-1.5">
              {VARIAVEIS_PADRAO.map(v => (
                <button
                  key={v}
                  onClick={() => inserirVariavel(v)}
                  className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Conteúdo</label>
            <textarea
              placeholder={`Digite o conteúdo da mensagem...\n\nUse as variáveis acima para personalizar.`}
              rows={6}
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">{conteudo.length} caracteres</p>
          </div>

          {/* Preview */}
          {conteudo && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Preview</p>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">
                {conteudo
                  .replace(/{{nome}}/g, 'João Silva')
                  .replace(/{{cidade}}/g, 'João Pessoa')
                  .replace(/{{bairro}}/g, 'Centro')
                  .replace(/{{comunidade}}/g, 'Associação do Bessa')
                  .replace(/{{telefone}}/g, '(83) 99999-9999')}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              <X className="w-4 h-4 mr-1.5" /> Cancelar
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={salvar}
              disabled={!nome.trim() || !conteudo.trim() || saving}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {saving ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
