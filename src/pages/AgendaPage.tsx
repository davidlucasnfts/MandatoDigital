import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useEventos } from '@/hooks/useSupabaseData';
import NovoEventoDialog from '@/components/NovoEventoDialog';
import type { Evento } from '@/lib/supabase';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function AgendaPage() {
  const { data: eventos, loading, fetch, remove } = useEventos();
  const [novaOpen, setNovaOpen] = useState(false);
  const [editEvento, setEditEvento] = useState<Evento | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 1));
  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(), daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventos.filter(e => e.data === dateStr);
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600"/>Agenda</h2>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setNovaOpen(true)}><Plus className="w-4 h-4 mr-1.5"/>Novo Evento</Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">{monthNames[month]} {year}</h3>
              <div className="flex items-center gap-1"><button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-500"/></button><button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5 text-slate-500"/></button></div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {diasSemana.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase py-2">{d}</div>)}
              {Array.from({length: firstDay}).map((_,i) => <div key={`e-${i}`} className="aspect-square"/>)}
              {Array.from({length: daysInMonth}).map((_,i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = day === 23;
                return <div key={day} className={`aspect-square p-1.5 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 ${isToday ? 'border-blue-300 bg-blue-50' : 'border-transparent'}`}><div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</div>{dayEvents.length > 0 && <div className="mt-0.5 space-y-0.5">{dayEvents.slice(0,2).map((e,j) => <div key={j} className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate">{e.titulo}</div>)}{dayEvents.length > 2 && <div className="text-[9px] text-slate-400">+{dayEvents.length-2}</div>}</div>}</div>;
              })}
            </div>
          </CardContent></Card>
        </motion.div>

        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <Card><CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-slate-700 mb-2">Próximos Eventos</h3>
            {loading ? Array.from({length:3}).map((_,i) => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"/>) :
            eventos.slice(0, 5).map(e => (
              <div key={e.id} className="p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-blue-600"/></div>
                  <div className="min-w-0 flex-1"><h4 className="text-sm font-medium text-slate-800 truncate">{e.titulo}</h4><div className="flex items-center gap-2 mt-1 text-xs text-slate-500"><span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{e.hora_inicio}</span><span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{e.local}</span></div><div className="text-xs text-slate-400 mt-1">{e.data}</div></div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditEvento(e)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={() => { if (confirm('Excluir este evento?')) { remove(e.id); fetch(); } }} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent></Card>
        </motion.div>
      </div>
      <NovoEventoDialog open={novaOpen || !!editEvento} onClose={() => { setNovaOpen(false); setEditEvento(null); }} onSuccess={fetch} evento={editEvento} />
    </div>
  );
}


