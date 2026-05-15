import { useState } from 'react';
import { MessageSquare, Phone, MapPin, Mail, Video, FileText, Plus, X, Trash2 } from 'lucide-react';
import { formatDateForInput } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useInteracoes } from '@/hooks/useSupabaseData';
import type { Interacao } from '@/lib/supabase';

const tipoIcons: Record<string, React.ReactNode> = {
  ligacao: <Phone className="w-3.5 h-3.5" />,
  reuniao: <Video className="w-3.5 h-3.5" />,
  whatsapp: <MessageSquare className="w-3.5 h-3.5" />,
  visita: <MapPin className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  outro: <FileText className="w-3.5 h-3.5" />,
};

const tipoLabels: Record<string, string> = {
  ligacao: 'Ligação',
  reuniao: 'Reunião',
  whatsapp: 'WhatsApp',
  visita: 'Visita',
  email: 'E-mail',
  outro: 'Outro',
};

const tipoColors: Record<string, string> = {
  ligacao: 'bg-blue-100 text-blue-700',
  reuniao: 'bg-purple-100 text-purple-700',
  whatsapp: 'bg-green-100 text-green-700',
  visita: 'bg-orange-100 text-orange-700',
  email: 'bg-slate-100 text-slate-700',
  outro: 'bg-gray-100 text-gray-700',
};

interface Props {
  eleitorId: string;
  eleitorNome: string;
  onClose: () => void;
}

export default function InteracoesPanel({ eleitorId, eleitorNome, onClose }: Props) {
  const { data: interacoes, loading, insert, remove } = useInteracoes(eleitorId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Interacao>>({
    tipo: 'ligacao',
    data: new Date().toISOString().split('T')[0],
    descricao: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao?.trim() || !form.data) return;
    await insert({
      eleitor_id: eleitorId,
      tipo: form.tipo || 'ligacao',
      descricao: form.descricao,
      data: form.data,
    });
    setForm({ tipo: 'ligacao', data: new Date().toISOString().split('T')[0], descricao: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Interações</h3>
          <p className="text-sm text-slate-500">{eleitorNome}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Nova
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Tipo</label>
                  <select
                    value={form.tipo || 'ligacao'}
                    onChange={e => setForm({ ...form, tipo: e.target.value as Interacao['tipo'] })}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="ligacao">Ligação</option>
                    <option value="reuniao">Reunião</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="visita">Visita</option>
                    <option value="email">E-mail</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Data</label>
                  <input
                    type="date"
                    value={formatDateForInput(form.data)}
                    onChange={e => setForm({ ...form, data: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Descrição</label>
                <textarea
                  value={form.descricao || ''}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva o que foi tratado..."
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[80px]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">Registrar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : interacoes.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma interação registrada</p>
          <p className="text-xs mt-1">Clique em "Nova" para registrar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {interacoes.map(i => (
            <Card key={i.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tipoColors[i.tipo]}`}>
                    {tipoIcons[i.tipo]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{tipoLabels[i.tipo]}</span>
                      <span className="text-[10px] text-slate-400">{i.data}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{i.descricao}</p>
                  </div>
                  <button
                    onClick={() => { if (confirm('Excluir esta interação?')) remove(i.id); }}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
