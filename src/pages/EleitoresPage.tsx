import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Download, Upload, Pencil, Trash2, MessageSquare, Link2, Eye, ChevronDown, CheckCircle, XCircle } from '@/lib/icons';
// Eye = ícone de visualizar/preview — sempre usar com texto "Ver" ou "Preview", nunca sozinho
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useEleitores, useInteracoes, useComunidades } from '@/hooks/useSupabaseData';
import type { Eleitor } from '@/lib/supabase';
import ImportarEleitoresDialog from '@/components/import-csv/ImportarEleitoresDialog';
import NovoEleitorDialog from '@/components/NovoEleitorDialog';
import ExportarEleitoresDialog from '@/components/ExportarEleitoresDialog';
import InteracoesPanel from '@/components/InteracoesPanel';
import EleitorPreviewCard from '@/components/EleitorPreviewCard';
import ConviteLinkDialog from '@/components/ConviteLinkDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };
const nivelColors: Record<string, string> = { lider: 'bg-purple-100 text-purple-700', eleitor: 'bg-slate-100 text-slate-600' };

export default function EleitoresPage() {
  const { data: eleitores, loading, fetch, remove, update } = useEleitores();
  const { data: comunidades } = useComunidades();
  const { data: todasInteracoes } = useInteracoes();
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [novoOpen, setNovoOpen] = useState(false);
  const [editEleitor, setEditEleitor] = useState<Eleitor | null>(null);
  const [interacoesEleitor, setInteracoesEleitor] = useState<Eleitor | null>(null);
  const [previewEleitor, setPreviewEleitor] = useState<Eleitor | null>(null);
  const [conviteLider, setConviteLider] = useState<Eleitor | null>(null);
  const [search, setSearch] = useState('');
  const [comunidadeFilter, setComunidadeFilter] = useState('');
  const [nivelFilter, setNivelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [liderFilter, setLiderFilter] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'pendentes'>('todos');

  const filtered = useMemo(() => {
    let rows = eleitores;
    if (abaAtiva === 'pendentes') {
      rows = rows.filter(e => e.status === 'pendente');
    }
    return rows.filter(e => {
      const s = search.toLowerCase();
      const matchSearch = !search || e.nome?.toLowerCase().includes(s) || e.email?.toLowerCase().includes(s) || e.telefone?.includes(search);
      const matchComunidade = !comunidadeFilter || e.comunidade_id === comunidadeFilter;
      const matchNivel = !nivelFilter || e.nivel === nivelFilter;
      const matchStatus = !statusFilter || e.status === statusFilter;
      const matchLider = !liderFilter || e.lider_id === liderFilter;
      return matchSearch && matchComunidade && matchNivel && matchStatus && matchLider;
    });
  }, [eleitores, search, comunidadeFilter, nivelFilter, statusFilter, liderFilter, abaAtiva]);

  const pendentesCount = eleitores.filter(e => e.status === 'pendente').length;

  const getComunidadeNome = (id: string | null) => comunidades.find(c => c.id === id)?.nome;
  const getIndicadorNome = (id: string | null) => eleitores.find(e => e.id === id)?.nome;
  const getLiderNome = (id: string | null) => eleitores.find(e => e.id === id)?.nome;
  const getLiderVinculadoNome = (id: string | null) => eleitores.find(e => e.id === id)?.nome;

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/>Eleitores</h2>
            <p className="text-sm text-slate-500 mt-1">{filtered.length} eleitores {abaAtiva === 'pendentes' ? 'pendentes' : 'cadastrados'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-1.5"/>Importar</Button>
            <Button variant="outline" size="sm" className="h-9" onClick={() => setExportOpen(true)}><Download className="w-4 h-4 mr-1.5"/>Exportar</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9" onClick={() => setNovoOpen(true)}><Plus className="w-4 h-4 mr-1.5"/>Adicionar</Button>
          </div>
        </div>
      </motion.div>

      {/* Abas */}
      <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button onClick={() => setAbaAtiva('todos')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${abaAtiva === 'todos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Todos
          </button>
          <button onClick={() => setAbaAtiva('pendentes')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${abaAtiva === 'pendentes' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            Pendentes
            {pendentesCount > 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">{pendentesCount}</span>}
          </button>
        </div>
      </motion.div>

      <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
        <Card><CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><Input placeholder="Buscar por nome, e-mail ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10"/></div>
            <select value={comunidadeFilter} onChange={e => setComunidadeFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm"><option value="">Todas as comunidades</option>{comunidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
            <select value={nivelFilter} onChange={e => setNivelFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm"><option value="">Todos os níveis</option><option value="lider">Líder</option><option value="eleitor">Eleitor</option></select>
            <select value={liderFilter} onChange={e => setLiderFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm"><option value="">Todos os líderes</option>{eleitores.filter(e => e.nivel === 'lider').map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}</select>
            {abaAtiva === 'todos' && <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm"><option value="">Todos os status</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option><option value="pendente">Pendente</option></select>}
          </div>
        </CardContent></Card>
      </motion.div>

      {/* Preview */}
      <AnimatePresence>
        {previewEleitor && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <EleitorPreviewCard
              eleitor={previewEleitor}
              comunidadeNome={getComunidadeNome(previewEleitor.comunidade_id)}
              indicadorNome={getIndicadorNome(previewEleitor.indicador_id)}
              liderVinculadoNome={getLiderVinculadoNome(previewEleitor.lider_vinculado_id)}
              afiliados={previewEleitor.nivel === 'lider' ? eleitores.filter(e => e.lider_id === previewEleitor.id) : undefined}
              onEdit={() => setEditEleitor(previewEleitor)}
              onDelete={async () => { if (confirm('Excluir este eleitor?')) { await remove(previewEleitor.id); setPreviewEleitor(null); fetch(); } }}
              onLink={previewEleitor.nivel === 'lider' ? () => setConviteLider(previewEleitor) : undefined}
            />
            <div className="flex justify-center mt-3">
              <button onClick={() => setPreviewEleitor(null)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
                <ChevronDown className="w-4 h-4"/>Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50">{(abaAtiva === 'pendentes' ? ['Ações','Nome','Contato','CPF','Comunidade','Líder','Nível','Tags','Status','Interações'] : ['Nome','Contato','CPF','Comunidade','Líder','Nível','Tags','Status','Interações']).map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>
                {loading ? Array.from({length:5}).map((_,i) => <tr key={i} className="border-b border-slate-50"><td colSpan={abaAtiva === 'pendentes' ? 10 : 9} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse"/></td></tr>) :
                filtered.map(e => (
                  <tr key={e.id} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => setPreviewEleitor(previewEleitor?.id === e.id ? null : e)}>
                    {abaAtiva === 'pendentes' && (
                      <td className="py-3 px-2">
                        <div className="flex flex-col gap-1">
                          <button onClick={async (ev) => { ev.stopPropagation(); await update(e.id, { status: 'ativo' }); fetch(); }} className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-600 hover:bg-green-100 rounded"><CheckCircle className="w-3 h-3"/>Aprovar</button>
                          <button onClick={async (ev) => { ev.stopPropagation(); if (confirm('Recusar este cadastro?')) { await remove(e.id); fetch(); } }} className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded"><XCircle className="w-3 h-3"/>Recusar</button>
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-xs">{e.nome?.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{e.nome}</div>
                          <div className="text-xs text-slate-400">{e.cidade}/{e.estado}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500"><div>{e.email}</div><div className="text-xs">{e.telefone}</div></td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{e.cpf || '—'}</td>
                    <td className="py-3 px-4"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{getComunidadeNome(e.comunidade_id) || '—'}</span></td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {e.lider_id ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-[8px]">{getLiderNome(e.lider_id)?.split(' ').map((n: string) => n[0]).join('').slice(0,2)}</span>
                          </span>
                          {getLiderNome(e.lider_id)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${nivelColors[e.nivel || 'eleitor']}`}>{e.nivel}</span></td>
                    <td className="py-3 px-4"><div className="flex flex-wrap gap-1">{(e.tags || []).slice(0,2).map((t,i) => <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{t}</span>)}{(e.tags || []).length > 2 && <span className="text-[10px] text-slate-400">+{(e.tags || []).length - 2}</span>}</div></td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.status === 'ativo' ? 'bg-green-50 text-green-600' : e.status === 'pendente' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{e.status}</span></td>
                    <td className="py-3 px-4">
                      <button onClick={() => setInteracoesEleitor(e)} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors">
                        <MessageSquare className="w-3 h-3" />{todasInteracoes.filter(i => i.eleitor_id === e.id).length}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && <div className="text-center py-12 text-slate-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-40"/><p className="text-sm">Nenhum eleitor encontrado</p><p className="text-xs mt-1">Cadastre seu primeiro eleitor ou ajuste os filtros</p></div>}
        </CardContent></Card>
      </motion.div>

      <ImportarEleitoresDialog open={importOpen} onClose={() => setImportOpen(false)} onSuccess={fetch} />
      <ExportarEleitoresDialog open={exportOpen} onClose={() => setExportOpen(false)} data={filtered} />
      <NovoEleitorDialog open={novoOpen || !!editEleitor} onClose={() => { setNovoOpen(false); setEditEleitor(null); }} onSuccess={fetch} eleitor={editEleitor} />
      <Dialog open={!!interacoesEleitor} onOpenChange={() => setInteracoesEleitor(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {interacoesEleitor && <InteracoesPanel eleitorId={interacoesEleitor.id} eleitorNome={interacoesEleitor.nome} onClose={() => setInteracoesEleitor(null)} />}
        </DialogContent>
      </Dialog>
      {conviteLider && <ConviteLinkDialog open={!!conviteLider} onClose={() => setConviteLider(null)} lider={conviteLider} />}
    </div>
  );
}

