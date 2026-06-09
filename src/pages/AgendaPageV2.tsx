import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Pencil, Trash2,
  Eye, X, CalendarDays, CheckCircle2,
  AlertCircle, Users, Flag, Star, PartyPopper
} from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventos } from '@/hooks/useSupabaseData';
import NovoEventoDialog from '@/components/NovoEventoDialog';
import type { Evento } from '@/lib/supabase';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const tipoConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  reuniao:    { label: 'Reunião',    color: 'text-blue-600',  bg: 'bg-blue-50',  icon: Users },
  evento:     { label: 'Evento',     color: 'text-purple-600',bg: 'bg-purple-50',icon: PartyPopper },
  visita:     { label: 'Visita',     color: 'text-green-600', bg: 'bg-green-50', icon: Flag },
  compromisso:{ label: 'Compromisso',color: 'text-amber-600', bg: 'bg-amber-50', icon: Calendar },
};

function getEventoIcon(tipo: string) {
  return tipoConfig[tipo]?.icon || CalendarDays;
}

function getEventoConfig(tipo: string) {
  return tipoConfig[tipo] || tipoConfig.compromisso;
}

export default function AgendaPageV2() {
  const { data: eventos, loading, fetch, remove } = useEventos();
  const [novaOpen, setNovaOpen] = useState(false);
  const [editEvento, setEditEvento] = useState<Evento | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [eventoPreview, setEventoPreview] = useState<Evento | null>(null);
  const [tabFiltro, setTabFiltro] = useState('todos');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDay = today.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.getDate());
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventos.filter(e => e.data === dateStr);
  };

  const eventosFiltrados = useMemo(() => {
    let list = [...eventos];
    if (tabFiltro !== 'todos') {
      list = list.filter(e => e.tipo === tabFiltro);
    }
    // Ordenar por data (mais próximos primeiro)
    list.sort((a, b) => a.data.localeCompare(b.data) || a.hora_inicio.localeCompare(b.hora_inicio));
    return list;
  }, [eventos, tabFiltro]);

  const stats = useMemo(() => ({
    total: eventos.length,
    esteMes: eventos.filter(e => {
      const d = new Date(e.data);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length,
    proximos7: eventos.filter(e => {
      const d = new Date(e.data);
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    }).length,
    hoje: eventos.filter(e => {
      const d = new Date(e.data);
      return d.toDateString() === today.toDateString();
    }).length,
  }), [eventos, year, month, today]);

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const handleDayClick = (day: number) => {
    setSelectedDay(day === selectedDay ? null : day);
  };

  const handleEdit = (e: React.MouseEvent, ev: Evento) => {
    e.stopPropagation();
    setEditEvento(ev);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Excluir este evento?')) {
      await remove(id);
      fetch();
      if (eventoPreview?.id === id) setEventoPreview(null);
    }
  };

  const handleCloseDialog = () => {
    setNovaOpen(false);
    setEditEvento(null);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              Agenda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gerencie seus compromissos e eventos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="hidden sm:flex"
            >
              Hoje
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-fit"
              onClick={() => { setEditEvento(null); setNovaOpen(true); }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Novo Evento
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: CalendarDays, color: 'blue' },
          { label: 'Este mês', value: stats.esteMes, icon: IconCalendarRange, color: 'purple' },
          { label: 'Próximos 7 dias', value: stats.proximos7, icon: IconCalendarClock, color: 'amber' },
          { label: 'Hoje', value: stats.hoje, icon: IconCalendarCheck, color: 'green' },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
            <Card className="border-t-[3px]" style={{ borderTopColor: s.color === 'blue' ? '#2563EB' : s.color === 'purple' ? '#7c3aed' : s.color === 'amber' ? '#d97706' : '#16a34a' }}>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`w-4 h-4 ${s.color === 'blue' ? 'text-blue-600' : s.color === 'purple' ? 'text-purple-600' : s.color === 'amber' ? 'text-amber-600' : 'text-green-600'}`} />
                </div>
                <p className="text-xl lg:text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content: Calendar + List */}
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Calendar */}
        <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-4 lg:p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">
                  {monthNames[month]} <span className="text-slate-500 font-normal">{year}</span>
                </h3>
                <div className="flex items-center gap-1">
                  <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Hoje
                  </button>
                  <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {diasSemana.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday = isCurrentMonth && day === todayDay;
                  const isSelected = selectedDay === day;
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <motion.div
                      key={day}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square p-1.5 rounded-lg border transition-all cursor-pointer relative
                        ${isSelected ? 'border-blue-400 bg-blue-50 shadow-sm' : ''}
                        ${isToday && !isSelected ? 'border-blue-300 bg-blue-50/50' : ''}
                        ${!isSelected && !isToday ? 'border-transparent hover:bg-slate-50' : ''}
                      `}
                    >
                      <div className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-blue-600 text-white' : isSelected ? 'text-blue-600' : 'text-slate-700'}
                      `}>
                        {day}
                      </div>
                      {hasEvents && (
                        <div className="mt-0.5 flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 3).map((e, j) => {
                            const cfg = getEventoConfig(e.tipo);
                            return (
                              <div key={j} className={`w-1.5 h-1.5 rounded-full ${cfg.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-slate-400 leading-none">+</span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Panel: Events List */}
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
          <Card className="h-full">
            <CardContent className="p-4 lg:p-6">
              {/* Tabs */}
              <Tabs value={tabFiltro} onValueChange={setTabFiltro} className="mb-4">
                <TabsList className="bg-white border w-full">
                  <TabsTrigger value="todos" className="text-xs flex-1">Todos</TabsTrigger>
                  <TabsTrigger value="reuniao" className="text-xs flex-1">Reuniões</TabsTrigger>
                  <TabsTrigger value="evento" className="text-xs flex-1">Eventos</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Selected Day Info */}
              {selectedDay && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-700">
                    {selectedDay} de {monthNames[month]} — {selectedDayEvents.length} evento{selectedDayEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Events List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                  ))
                ) : eventosFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Nenhum evento</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {selectedDay ? 'Nenhum evento neste dia' : 'Crie seu primeiro evento'}
                    </p>
                  </div>
                ) : (
                  eventosFiltrados.slice(0, 10).map((e, i) => {
                    const cfg = getEventoConfig(e.tipo);
                    const Icon = cfg.icon;
                    const isPast = new Date(e.data) < new Date(today.toDateString());

                    return (
                      <motion.div
                        key={e.id}
                        custom={i}
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        className={`
                          p-3 rounded-lg border transition-all cursor-pointer group
                          ${isPast ? 'bg-slate-50/50 border-slate-100 opacity-70' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}
                        `}
                        onClick={() => setEventoPreview(e)}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-sm font-medium truncate ${isPast ? 'text-slate-500' : 'text-slate-800'}`}>
                              {e.titulo}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>
                                {cfg.label}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {e.hora_inicio}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{e.local || 'Sem local'}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(ev) => handleEdit(ev, e)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                              title="Editar"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(ev) => handleDelete(ev, e.id)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                {eventosFiltrados.length > 10 && (
                  <p className="text-center text-[10px] text-slate-400 py-2">
                    +{eventosFiltrados.length - 10} eventos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Event Preview Modal */}
      <AnimatePresence>
        {eventoPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setEventoPreview(null)}
          >
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-4 lg:p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const cfg = getEventoConfig(eventoPreview.tipo);
                        const Icon = cfg.icon;
                        return (
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                            <Icon className={`w-6 h-6 ${cfg.color}`} />
                          </div>
                        );
                      })()}
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 line-clamp-2">{eventoPreview.titulo}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {(() => {
                            const cfg = getEventoConfig(eventoPreview.tipo);
                            return (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-medium`}>
                                {cfg.label}
                              </span>
                            );
                          })()}
                          <span className="text-[10px] text-slate-400">
                            {new Date(eventoPreview.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEventoPreview(null)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-4 lg:p-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Data</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(eventoPreview.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Horário</p>
                    <p className="text-sm font-medium text-slate-800">
                      {eventoPreview.hora_inicio} {eventoPreview.hora_fim && `— ${eventoPreview.hora_fim}`}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Local</p>
                    <p className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {eventoPreview.local || 'Não definido'}
                    </p>
                  </div>
                  {eventoPreview.descricao && (
                    <div className="col-span-2">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Descrição</p>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{eventoPreview.descricao}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 lg:p-6 pt-0 flex gap-2">
                  <button
                    onClick={() => { setEventoPreview(null); setEditEvento(eventoPreview); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => { setEventoPreview(null); handleDelete({ stopPropagation: () => {} } as any, eventoPreview.id); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog */}
      <NovoEventoDialog
        open={novaOpen || !!editEvento}
        onClose={handleCloseDialog}
        onSuccess={fetch}
        evento={editEvento}
      />
    </div>
  );
}

// Icon aliases for stats (nomes únicos para não conflitar com imports)
function IconCalendarRange(props: any) { return <CalendarDays {...props} />; }
function IconCalendarClock(props: any) { return <Clock {...props} />; }
function IconCalendarCheck(props: any) { return <CheckCircle2 {...props} />; }
