import { useMemo } from 'react';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Alerta {
  tipo: 'tarefa' | 'solicitacao' | 'evento';
  titulo: string;
  descricao: string;
  data: string;
  urgente: boolean;
}

interface Props {
  tarefasUrgentes: any[];
  solicitacoesPendentes: any[];
  eventosHoje: any[];
}

export default function AlertasPanel({ tarefasUrgentes, solicitacoesPendentes, eventosHoje }: Props) {
  const alertas = useMemo<Alerta[]>(() => {
    const lista: Alerta[] = [];

    eventosHoje.forEach(e => {
      lista.push({
        tipo: 'evento',
        titulo: e.titulo,
        descricao: `Hoje às ${e.hora_inicio} — ${e.local}`,
        data: e.data,
        urgente: false,
      });
    });

    tarefasUrgentes.forEach(t => {
      const hoje = new Date().toISOString().split('T')[0];
      const atrasada = t.data_prazo && t.data_prazo < hoje;
      lista.push({
        tipo: 'tarefa',
        titulo: t.titulo,
        descricao: atrasada ? `Atrasada (prazo: ${t.data_prazo})` : `Prazo hoje (${t.data_prazo})`,
        data: t.data_prazo,
        urgente: atrasada,
      });
    });

    solicitacoesPendentes.forEach(s => {
      lista.push({
        tipo: 'solicitacao',
        titulo: s.titulo,
        descricao: `Pendente há mais de 7 dias — ${s.eleitor_nome}`,
        data: s.created_at?.split('T')[0],
        urgente: true,
      });
    });

    return lista;
  }, [tarefasUrgentes, solicitacoesPendentes, eventosHoje]);

  if (alertas.length === 0) return null;

  const tipoConfig = {
    tarefa: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    solicitacao: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    evento: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-700">Alertas e Lembretes ({alertas.length})</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alertas.map((a, i) => {
          const cfg = tipoConfig[a.tipo];
          const Icon = cfg.icon;
          return (
            <Card key={i} className={`border-l-[3px] ${a.urgente ? 'border-l-red-500' : 'border-l-amber-400'}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{a.titulo}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{a.descricao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
