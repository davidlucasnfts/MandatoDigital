import { User, Mail, Phone, MapPin, Calendar, Tag, Shield, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Eleitor } from '@/lib/supabase';

interface Props {
  eleitor: Eleitor;
  comunidadeNome?: string;
  indicadorNome?: string;
  onClose?: () => void;
}

const nivelColors: Record<string, string> = {
  lider: 'bg-purple-100 text-purple-700',
  influenciador: 'bg-blue-100 text-blue-700',
  apoiador: 'bg-green-100 text-green-700',
  eleitor: 'bg-slate-100 text-slate-600',
};

const statusColors: Record<string, string> = {
  ativo: 'bg-green-50 text-green-600',
  inativo: 'bg-slate-100 text-slate-500',
  pendente: 'bg-amber-50 text-amber-600',
};

export default function EleitorPreviewCard({ eleitor, comunidadeNome, indicadorNome }: Props) {
  return (
    <Card className="border-blue-100">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-bold text-lg">
              {eleitor.nome?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-800">{eleitor.nome}</h3>
            {eleitor.nome_mae && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Heart className="w-3 h-3" /> Mãe: {eleitor.nome_mae}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${nivelColors[eleitor.nivel || 'eleitor']}`}>
                {eleitor.nivel}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[eleitor.status || 'ativo']}`}>
                {eleitor.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {eleitor.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 truncate">{eleitor.email}</span>
            </div>
          )}
          {eleitor.telefone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{eleitor.telefone}</span>
            </div>
          )}
          {eleitor.cpf && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{eleitor.cpf}</span>
            </div>
          )}
          {eleitor.data_nascimento && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{new Date(eleitor.data_nascimento).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {(eleitor.endereco || eleitor.bairro || eleitor.cidade) && (
            <div className="flex items-center gap-2 text-sm sm:col-span-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {[eleitor.endereco, eleitor.bairro, eleitor.cidade, eleitor.estado].filter(Boolean).join(', ')}
                {eleitor.cep && ` - CEP: ${eleitor.cep}`}
              </span>
            </div>
          )}
          {comunidadeNome && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">{comunidadeNome}</span>
            </div>
          )}
          {indicadorNome && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">Indicado por: {indicadorNome}</span>
            </div>
          )}
          {eleitor.tags && eleitor.tags.length > 0 && (
            <div className="flex items-start gap-2 text-sm sm:col-span-2">
              <Tag className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {eleitor.tags.map((t, i) => (
                  <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {eleitor.observacoes && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Observações</p>
            <p className="text-sm text-slate-700 mt-0.5">{eleitor.observacoes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
