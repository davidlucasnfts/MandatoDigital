import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Search, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { equipe } from '@/data/mockData';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const permissaoColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  editor: 'bg-blue-100 text-blue-700',
  visualizador: 'bg-slate-100 text-slate-600',
};

export default function EquipePage() {
  const [search, setSearch] = useState('');

  const filtered = equipe.filter(m =>
    !search || m.nome.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Equipe
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} membros</p>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-1.5" /> Convidar
          </Button>
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar membro..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
        </div>
      </motion.div>

      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Membro</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Cargo</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Permissão</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Último Acesso</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">{m.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{m.nome}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {m.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{m.cargo}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${permissaoColors[m.permissao]}`}>{m.permissao}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{m.ultimoAcesso}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
