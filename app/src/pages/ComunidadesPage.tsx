import { motion } from 'framer-motion';
import { Users, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { comunidades } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } })
};

export default function ComunidadesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Comunidades</h2>
            <p className="text-sm text-slate-500 mt-1">{comunidades.length} comunidades cadastradas</p>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" /> Nova Comunidade
          </Button>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {comunidades.map((c, i) => (
          <motion.div key={c.id} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate('/dashboard/eleitores')}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.cor + '20' }}>
                    <Users className="w-5 h-5" style={{ color: c.cor }} />
                  </div>
                  <span className="text-xs text-slate-400">{c.bairros.length} bairro(s)</span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{c.nome}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.descricao}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    {c.totalEleitores} eleitores
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {c.lider}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
