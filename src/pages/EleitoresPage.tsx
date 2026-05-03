import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Download, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEleitores } from '@/hooks/useSupabaseData';
import { comunidades as mockComunidades } from '@/data/mockData';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };
const nivelColors: Record<string, string> = { lider: 'bg-purple-100 text-purple-700', influenciador: 'bg-blue-100 text-blue-700', apoiador: 'bg-green-100 text-green-700', eleitor: 'bg-slate-100 text-slate-600' };

export default function EleitoresPage() {
  const { data: eleitores, loading } = useEleitores();
  const [search, setSearch] = useState('');
  const [comunidadeFilter, setComunidadeFilter] = useState('');
  const [nivelFilter, setNivelFilter] = useState('');

  const filtered = useMemo(() => eleitores.filter(e => {
    const s = search.toLowerCase();
    const matchSearch = !search || e.nome?.toLowerCase().includes(s) || e.email?.toLowerCase().includes(s) || e.telefone?.includes(search);
    const matchComunidade = !comunidadeFilter || e.comunidade_id === comunidadeFilter;
    const matchNivel = !nivelFilter || e.nivel === nivelFilter;
    return matchSearch && matchComunidade && matchNivel;
  }), [eleitores, search, comunidadeFilter, nivelFilter]);

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/>Eleitores</h2><p className="text-sm text-slate-500 mt-1">{filtered.length} eleitores cadastrados</p></div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9"><Download className="w-4 h-4 mr-1.5"/>Exportar</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9"><Plus className="w-4 h-4 mr-1.5"/>Adicionar</Button>
          </div>
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <Card><CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><Input placeholder="Buscar por nome, e-mail ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10"/></div>
            <select value={comunidadeFilter} onChange={e => setComunidadeFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm"><option value="">Todas as comunidades</option>{mockComunidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
            <select value={nivelFilter} onChange={e => setNivelFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm"><option value="">Todos os níveis</option><option value="lider">Líder</option><option value="influenciador">Influenciador</option><option value="apoiador">Apoiador</option><option value="eleitor">Eleitor</option></select>
          </div>
        </CardContent></Card>
      </motion.div>

      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">{['Nome','Contato','Comunidade','Nível','Tags','Status',''].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => <tr key={i} className="border-b border-slate-50"><td colSpan={7} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse"/></td></tr>) :
                filtered.map(e => (
                  <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-blue-600 font-semibold text-xs">{e.nome?.split(' ').map(n => n[0]).join('').slice(0,2)}</span></div><div><div className="font-medium text-slate-800">{e.nome}</div><div className="text-xs text-slate-400">{e.cidade}/{e.estado}</div></div></div></td>
                    <td className="py-3 px-4 text-slate-500"><div>{e.email}</div><div className="text-xs">{e.telefone}</div></td>
                    <td className="py-3 px-4"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{mockComunidades.find(c => c.id === e.comunidade_id)?.nome || '—'}</span></td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${nivelColors[e.nivel || 'eleitor']}`}>{e.nivel}</span></td>
                    <td className="py-3 px-4"><div className="flex flex-wrap gap-1">{(e.tags || []).slice(0,2).map((t,i) => <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>)}{(e.tags || []).length > 2 && <span className="text-[10px] text-slate-400">+{(e.tags || []).length - 2}</span>}</div></td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.status === 'ativo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{e.status}</span></td>
                    <td className="py-3 px-4"><button className="p-1 hover:bg-slate-100 rounded"><MoreHorizontal className="w-4 h-4 text-slate-400"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && <div className="text-center py-12 text-slate-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-40"/><p className="text-sm">Nenhum eleitor encontrado</p><p className="text-xs mt-1">Cadastre seu primeiro eleitor ou ajuste os filtros</p></div>}
        </CardContent></Card>
      </motion.div>
    </div>
  );
}
