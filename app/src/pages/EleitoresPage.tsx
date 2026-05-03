import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { eleitores, comunidades } from '@/data/mockData';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

export default function EleitoresPage() {
  const [search, setSearch] = useState('');
  const [comunidadeFilter, setComunidadeFilter] = useState('');
  const [nivelFilter, setNivelFilter] = useState('');

  const filtered = useMemo(() => {
    return eleitores.filter(e => {
      const matchSearch = !search || e.nome.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.telefone.includes(search);
      const matchComunidade = !comunidadeFilter || e.comunidade === comunidadeFilter;
      const matchNivel = !nivelFilter || e.nivel === nivelFilter;
      return matchSearch && matchComunidade && matchNivel;
    });
  }, [search, comunidadeFilter, nivelFilter]);

  const nivelColors: Record<string, string> = {
    lider: 'bg-purple-100 text-purple-700',
    influenciador: 'bg-blue-100 text-blue-700',
    apoiador: 'bg-green-100 text-green-700',
    eleitor: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Eleitores
            </h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} eleitores cadastrados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="w-4 h-4 mr-1.5" /> Exportar
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9">
              <Plus className="w-4 h-4 mr-1.5" /> Adicionar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, e-mail ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <select
                value={comunidadeFilter}
                onChange={(e) => setComunidadeFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Todas as comunidades</option>
                {comunidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
              <select
                value={nivelFilter}
                onChange={(e) => setNivelFilter(e.target.value)}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Todos os níveis</option>
                <option value="lider">Líder</option>
                <option value="influenciador">Influenciador</option>
                <option value="apoiador">Apoiador</option>
                <option value="eleitor">Eleitor</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Nome</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Contato</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Comunidade</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Nível</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tags</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="py-3 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold text-xs">{e.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{e.nome}</div>
                            <div className="text-xs text-slate-400">{e.cidade}/{e.estado}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>{e.email}</div>
                        <div className="text-xs">{e.telefone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{e.comunidade}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${nivelColors[e.nivel]}`}>
                          {e.nivel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {e.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                          {e.tags.length > 2 && <span className="text-[10px] text-slate-400">+{e.tags.length - 2}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="p-1 hover:bg-slate-100 rounded">
                          <MoreHorizontal className="w-4 h-4 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nenhum eleitor encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
