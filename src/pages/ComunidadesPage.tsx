import { motion } from 'framer-motion';
import { Users, MapPin, Plus, Pencil, Trash2, icons } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useComunidades } from '@/hooks/useSupabaseData';
import NovaComunidadeDialog from '@/components/NovaComunidadeDialog';
import type { Comunidade } from '@/lib/supabase';
import { useState } from 'react';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

export default function ComunidadesPage() {
  const { data: comunidades, loading, fetch, remove } = useComunidades();
  const [novaOpen, setNovaOpen] = useState(false);
  const [editComunidade, setEditComunidade] = useState<Comunidade | null>(null);

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-slate-800">Comunidades</h2><p className="text-sm text-slate-500 mt-1">{comunidades.length} comunidades cadastradas</p></div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setNovaOpen(true)}><Plus className="w-4 h-4 mr-1.5"/>Nova Comunidade</Button>
        </div>
      </motion.div>

      {loading ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><Card key={i} className="animate-pulse"><CardContent className="p-5"><div className="h-20 bg-slate-100 rounded"/></CardContent></Card>)}</div> :
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {comunidades.map((c, i) => (
          <motion.div key={c.id} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
            <Card className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  {(() => {
                    const IconComp = (icons as Record<string, React.ComponentType<{className?: string; style?: React.CSSProperties}> >)[c.icone || 'Users'] || Users;
                    return <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor:(c.cor||'#2563EB')+'20'}}><IconComp className="w-5 h-5" style={{color:c.cor||'#2563EB'}}/></div>;
                  })()}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditComunidade(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar"><Pencil className="w-3.5 h-3.5"/></button>
                    <button onClick={() => { if (confirm('Excluir esta comunidade?')) { remove(c.id); fetch(); } }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Excluir"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{c.nome}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.descricao}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><Users className="w-3.5 h-3.5"/>{c.total_eleitores || 0} eleitores</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5"/>{c.lider}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>}
      <NovaComunidadeDialog open={novaOpen || !!editComunidade} onClose={() => { setNovaOpen(false); setEditComunidade(null); }} onSuccess={fetch} comunidade={editComunidade} />
    </div>
  );
}
