import { useState, useEffect } from 'react';
import { MessageSquare, Mail, X, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useTemplates } from '@/hooks/useTemplates';
import type { TemplateMensagem } from '@/lib/supabase';

interface Props {
  open: boolean;
  onClose: () => void;
  templateEditando?: TemplateMensagem | null;
  onSuccess?: () => void;
}

const VARIAVEIS_PADRAO = ['{{nome}}', '{{nome_completo}}', '{{cidade}}', '{{bairro}}', '{{comunidade}}', '{{telefone}}', '{{endereco}}'];

export default function NovoTemplateDialog({ open, onClose, templateEditando, onSuccess }: Props) {
  const { insert, update } = useTemplates();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'whatsapp' | 'email'>('whatsapp');
  const [assunto, setAssunto] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [variaveis, setVariaveis] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Carregar dados do template em edição
  useEffect(() => {
    if (open && templateEditando) {
      setNome(templateEditando.nome);
      setTipo(templateEditando.tipo);
      setAssunto(templateEditando.assunto || '');
      setConteudo(templateEditando.conteudo);
      setVariaveis(templateEditando.variaveis || []);
    } else if (open && !templateEditando) {
      setNome('');
      setTipo('whatsapp');
      setAssunto('');
      setConteudo('');
      setVariaveis([]);
    }
  }, [open, templateEditando]);

  const handleClose = () => {
    onClose();
  };

  const inserirVariavel = (v: string) => {
    setConteudo(prev => prev + ' ' + v);
    if (!variaveis.includes(v)) setVariaveis(prev => [...prev, v]);
  };

  const [erro, setErro] = useState('');

  const salvar = async () => {
    if (!nome.trim() || !conteudo.trim()) return;
    setSaving(true);
    setErro('');
    
    try {
      if (templateEditando) {
        await update(templateEditando.id, {
          nome: nome.trim(),
          tipo,
          assunto: assunto.trim() || null,
          conteudo: conteudo.trim(),
          variaveis,
        });
      } else {
        await insert({
          nome: nome.trim(),
          tipo,
          assunto: assunto.trim() || null,
          conteudo: conteudo.trim(),
          variaveis,
        });
      }
      onSuccess?.();
      handleClose();
    } catch (e: any) {
      console.error('Erro ao salvar template:', e);
      setErro(e.message || 'Erro ao salvar. Verifique permissões e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            {templateEditando ? 'Editar Template' : 'Novo Template'}
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
              maxLength={100}
              className="h-10"
            />
            <p className="text-[10px] text-slate-400 mt-1">{nome.length}/100 caracteres</p>
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
            <div className="bg-blue-50 rounded-lg p-2 mb-2">
              <p className="text-[10px] text-blue-700">
                <strong>Como usar:</strong> Clique em uma variável para inserir no texto. 
                No envio, ela será substituída automaticamente pelos dados de cada eleitor.
              </p>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Exemplo: "Olá <strong>{'{{nome}}'}</strong>, tudo bem em <strong>{'{{cidade}}'}</strong>?" 
                → "Olá João, tudo bem em João Pessoa?"
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VARIAVEIS_PADRAO.map(v => (
                <button
                  key={v}
                  onClick={() => inserirVariavel(v)}
                  className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors border border-blue-200"
                  title={`Clique para inserir ${v} no texto`}
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none break-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">{conteudo.length} caracteres</p>
          </div>

          {/* Preview */}
          {conteudo && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Preview</p>
              <p className="text-xs text-slate-700 whitespace-pre-wrap break-all">
                {conteudo
                  .replace(/{{nome}}/g, 'João')
                  .replace(/{{nome_completo}}/g, 'João Silva')
                  .replace(/{{cidade}}/g, 'João Pessoa')
                  .replace(/{{bairro}}/g, 'Centro')
                  .replace(/{{comunidade}}/g, 'Associação do Bessa')
                  .replace(/{{telefone}}/g, '(83) 99999-9999')
                  .replace(/{{endereco}}/g, 'Rua das Flores, 123')}
              </p>
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
              <p className="text-[11px] text-red-600">{erro}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" className="w-full sm:flex-1" onClick={handleClose}>
              <X className="w-4 h-4 mr-1.5" /> Cancelar
            </Button>
            <Button
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={salvar}
              disabled={!nome.trim() || !conteudo.trim() || saving}
            >
              {templateEditando ? <Pencil className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
              {saving ? 'Salvando...' : (templateEditando ? 'Atualizar Template' : 'Salvar Template')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
