import { User, Mail, Phone, MapPin, Calendar, Tag, Shield, Users, Heart, Pencil, Trash2, Link2, X } from '@/lib/icons';
import { Card, CardContent } from '@/components/ui/card';
import type { Eleitor } from '@/lib/supabase';

interface Props {
  eleitor: Eleitor;
  comunidadeNome?: string;
  indicadorNome?: string;
  afiliados?: Eleitor[];
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onLink?: () => void;
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

export default function EleitorPreviewCard({ eleitor, comunidadeNome, indicadorNome, afiliados, onClose, onEdit, onDelete, onLink }: Props) {
  return (
    <Card className="border-blue-100">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
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
          <div className="flex flex-col gap-1">
            {onEdit && (
              <button onClick={onEdit} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"><Pencil className="w-3 h-3"/>Editar</button>
            )}
            {eleitor.nivel === 'lider' && onLink && (
              <button onClick={onLink} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 rounded"><Link2 className="w-3 h-3"/>Link</button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3"/>Excluir</button>
            )}
            {onClose && (
              <button onClick={onClose} className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-500 hover:bg-slate-100 rounded"><X className="w-3 h-3"/>Fechar</button>
            )}
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
              <span className="text-slate-600">{new Date(eleitor.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
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
          {(eleitor.titulo_eleitor || eleitor.zona || eleitor.secao) && (
            <div className="flex items-center gap-2 text-sm sm:col-span-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                {eleitor.titulo_eleitor && `Título: ${eleitor.titulo_eleitor}`}
                {eleitor.zona && ` · Zona: ${eleitor.zona}`}
                {eleitor.secao && ` · Seção: ${eleitor.secao}`}
              </span>
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

        {eleitor.nivel === 'lider' && afiliados && afiliados.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2">Eleitores vinculados ({afiliados.length})</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {afiliados.map(a => (
                <div key={a.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-[10px]">{a.nome?.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{a.nome}</p>
                    <p className="text-[10px] text-slate-400">{a.cidade}/{a.estado}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[a.status || 'ativo']}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
