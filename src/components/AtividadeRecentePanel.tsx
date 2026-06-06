import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, UserPlus, CheckCircle2, MessageSquare, FileText, Vote, ArrowRight } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

interface Atividade {
  tipo: 'eleitor' | 'solicitacao' | 'interacao' | 'proposicao' | 'enquete';
  titulo: string;
  descricao: string;
  data: string;
}

const tipoConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  eleitor: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Eleitor' },
  solicitacao: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Solicitação' },
  interacao: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Interação' },
  proposicao: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Proposição' },
  enquete: { icon: Vote, color: 'text-cyan-600', bg: 'bg-cyan-50', label: 'Enquete' },
};

function formatarTempo(dataStr: string): string {
  const data = new Date(dataStr);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHora = Math.floor(diffMin / 60);
  const diffDia = Math.floor(diffHora / 24);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHora < 24) return `${diffHora}h`;
  if (diffDia < 7) return `${diffDia}d`;
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function AtividadeRecentePanel() {
  const navigate = useNavigate();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) { setLoading(false); return; }

    const lista: Atividade[] = [];

    // Últimos eleitores cadastrados
    const { data: eleitores } = await supabase
      .from('eleitores')
      .select('nome, created_at, cidade')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })
      .limit(3);

    eleitores?.forEach(e => {
      lista.push({
        tipo: 'eleitor',
        titulo: e.nome,
        descricao: e.cidade ? `Cadastrado em ${e.cidade}` : 'Novo cadastro',
        data: e.created_at,
      });
    });

    // Últimas solicitações resolvidas
    const { data: solicitacoes } = await supabase
      .from('solicitacoes')
      .select('titulo, status, updated_at, eleitor_nome')
      .eq('owner_id', ownerId)
      .eq('status', 'resolvida')
      .order('updated_at', { ascending: false })
      .limit(2);

    solicitacoes?.forEach(s => {
      lista.push({
        tipo: 'solicitacao',
        titulo: s.titulo,
        descricao: `Resolvida para ${s.eleitor_nome}`,
        data: s.updated_at,
      });
    });

    // Últimas interações
    const { data: interacoes } = await supabase
      .from('interacoes')
      .select('tipo, data, eleitor:eleitor_id(nome)')
      .eq('owner_id', ownerId)
      .order('data', { ascending: false })
      .limit(2);

    interacoes?.forEach(i => {
      const eleitorNome = i.eleitor?.nome || 'eleitor';
      lista.push({
        tipo: 'interacao',
        titulo: `${i.tipo.charAt(0).toUpperCase() + i.tipo.slice(1)}`,
        descricao: `Com ${eleitorNome}`,
        data: i.data,
      });
    });

    // Ordena por data (mais recente primeiro) e pega top 6
    lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    setAtividades(lista.slice(0, 6));
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Atividade Recente
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[200px] bg-slate-50 rounded animate-pulse" />
        ) : atividades.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {atividades.map((a, i) => {
              const cfg = tipoConfig[a.tipo];
              const Icon = cfg.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{a.titulo}</p>
                    <p className="text-[10px] text-slate-500 truncate">{a.descricao}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{formatarTempo(a.data)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
