import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Download, Upload, CheckCircle, XCircle, MessageSquare, ChevronDown, MapPin, Phone, Mail, Crown, Building2, Hash, Vote, Section, Calendar, Tag, Pencil, Trash2, Link2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PanelCard, EmptyState } from '@/components/dashboard';
import { useEleitores, useInteracoes, useComunidades } from '@/hooks/useSupabaseData';
import type { Eleitor } from '@/lib/supabase';
import ImportarEleitoresDialog from '@/components/import-csv/ImportarEleitoresDialog';
import NovoEleitorDialog from '@/components/NovoEleitorDialog';
import ExportarEleitoresDialog from '@/components/ExportarEleitoresDialog';
import InteracoesPanel from '@/components/InteracoesPanel';
import ConviteLinkDialog from '@/components/ConviteLinkDialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };
const nivelColors: Record<string, string> = { lider: 'bg-purple-100 text-purple-700', eleitor: 'bg-slate-100 text-slate-600' };
const statusColors: Record<string, string> = { ativo: 'bg-green-50 text-green-600', pendente: 'bg-amber-50 text-amber-600', inativo: 'bg-slate-100 text-slate-500' };

export default function EleitoresPageV3() {
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
  // Preview inline sempre ativo (padrão desde V3)

  const filtered = useMemo(() => {
    let rows = eleitores;
    if (abaAtiva === 'pendentes') rows = rows.filter(e => e.status === 'pendente');
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
  const totalLideres = eleitores.filter(e => e.nivel === 'lider').length;
  const totalAtivos = eleitores.filter(e => e.status === 'ativo').length;

  const getComunidadeNome = (id: string | null) => comunidades.find(c => c.id === id)?.nome;
  const getLiderNome = (id: string | null) => eleitores.find(e => e.id === id)?.nome;
  const getAfiliadosCount = (liderId: string) => eleitores.filter(e => e.lider_id === liderId).length;

  const getIniciais = (nome: string) => nome?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600"/>Eleitores
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
              {filtered.length} eleitores {abaAtiva === 'pendentes' ? 'pendentes' : 'cadastrados'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setImportOpen(true)}>
              <Upload className="w-3.5 h-3.5 mr-1.5"/>Importar
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs" onClick={() => setExportOpen(true)}>
              <Download className="w-3.5 h-3.5 mr-1.5"/>Exportar
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 text-xs" onClick={() => setNovoOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5"/>Adicionar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-4">
        {[
          { label: 'Total', value: eleitores.length, icon: Users, color: 'blue' },
          { label: 'Ativos', value: totalAtivos, icon: CheckCircle, color: 'green' },
          { label: 'Líderes', value: totalLideres, icon: Crown, color: 'purple' },
          { label: 'Pendentes', value: pendentesCount, icon: ChevronDown, color: 'amber' },
        ].map((stat, i) => (
          <motion.div key={stat.label} custom={i + 1} variants={fadeIn} initial="hidden" animate="visible">
            <div className={`rounded-xl border border-slate-200 bg-white border-t-[3px] border-t-${stat.color}-600 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-3 lg:p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</div>
              <div className="text-[10px] lg:text-xs text-slate-500 font-medium mt-1">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Abas */}
      <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible">
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

      {/* Filtros */}
      <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible">
        <PanelCard title="Filtros" icon={Search} iconColor="text-blue-600" iconBg="bg-blue-50" delay={6}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <Input placeholder="Buscar por nome, e-mail ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-10"/>
            </div>
            <select value={comunidadeFilter} onChange={e => setComunidadeFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Todas as comunidades</option>
              {comunidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select value={nivelFilter} onChange={e => setNivelFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Todos os níveis</option>
              <option value="lider">Líder</option>
              <option value="eleitor">Eleitor</option>
            </select>
            <select value={liderFilter} onChange={e => setLiderFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
              <option value="">Todos os líderes</option>
              {eleitores.filter(e => e.nivel === 'lider').map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
            {abaAtiva === 'todos' && (
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
            )}
          </div>
        </PanelCard>
      </motion.div>

      {/* Preview Card — Topo (modo legado, só aparece se toggle desligado) */}
      {previewEleitor && !previewInline && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header do Preview */}
            <div className="p-4 lg:p-6 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg lg:text-xl">{getIniciais(previewEleitor.nome || '')}</span>
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-slate-800">{previewEleitor.nome}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${nivelColors[previewEleitor.nivel || 'eleitor']}`}>
                        {previewEleitor.nivel || 'eleitor'}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${statusColors[previewEleitor.status || 'ativo']}`}>
                        {previewEleitor.status || 'ativo'}
                      </span>
                      {previewEleitor.nivel === 'lider' && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-medium">
                          {getAfiliadosCount(previewEleitor.id)} afiliados
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Ações principais */}
                <div className="flex flex-col gap-2">
                  <button onClick={() => setEditEleitor(previewEleitor)} className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md">
                    <Pencil className="w-3.5 h-3.5"/>Editar
                  </button>
                  {previewEleitor.nivel === 'lider' && (
                    <button onClick={() => setConviteLider(previewEleitor)} className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors shadow-sm hover:shadow-md">
                      <Link2 className="w-3.5 h-3.5"/>Gerar Link
                    </button>
                  )}
                  <button onClick={async () => { if (confirm('Excluir este eleitor?')) { await remove(previewEleitor.id); setPreviewEleitor(null); fetch(); } }} className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-sm hover:shadow-md">
                    <Trash2 className="w-3.5 h-3.5"/>Excluir
                  </button>
                </div>
              </div>
            </div>

            {/* Informações em Grid */}
            <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Contato */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5"/>Contato
                </h4>
                <div className="space-y-2">
                  {previewEleitor.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{previewEleitor.email}
                    </div>
                  )}
                  {previewEleitor.telefone && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{previewEleitor.telefone}
                    </div>
                  )}
                  {previewEleitor.cpf && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>CPF: {previewEleitor.cpf}
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5"/>Endereço
                </h4>
                <div className="space-y-2">
                  {(previewEleitor.endereco || previewEleitor.cidade) && (
                    <div className="text-sm text-slate-700">
                      {previewEleitor.endereco && `${previewEleitor.endereco}, `}{previewEleitor.bairro && `${previewEleitor.bairro}, `}{previewEleitor.cidade || '—'}/{previewEleitor.estado || '—'}
                    </div>
                  )}
                  {previewEleitor.cep && (
                    <div className="text-xs text-slate-500">CEP: {previewEleitor.cep}</div>
                  )}
                  {previewEleitor.comunidade_id && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{getComunidadeNome(previewEleitor.comunidade_id) || '—'}
                    </div>
                  )}
                </div>
              </div>

              {/* Dados Eleitorais */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5"/>Dados Eleitorais
                </h4>
                <div className="space-y-2">
                  {previewEleitor.titulo_eleitor && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Vote className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>Título: {previewEleitor.titulo_eleitor}
                    </div>
                  )}
                  {previewEleitor.zona && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Section className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>Zona {previewEleitor.zona} / Seção {previewEleitor.secao || '—'}
                    </div>
                  )}
                  {previewEleitor.data_nascimento && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{new Date(previewEleitor.data_nascimento).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>

              {/* Liderança */}
              {(previewEleitor.lider_id || previewEleitor.lider_vinculado_id) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5"/>Liderança
                  </h4>
                  <div className="space-y-2">
                    {previewEleitor.lider_id && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Crown className="w-3.5 h-3.5 text-purple-400 flex-shrink-0"/>Líder: {getLiderNome(previewEleitor.lider_id)}
                      </div>
                    )}
                    {previewEleitor.lider_vinculado_id && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>Vinculado a: {getLiderNome(previewEleitor.lider_vinculado_id)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {previewEleitor.tags && previewEleitor.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5"/>Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {previewEleitor.tags.map((t, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interações */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5"/>Interações
                </h4>
                <button onClick={() => setInteracoesEleitor(previewEleitor)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {todasInteracoes.filter(i => i.eleitor_id === previewEleitor.id).length} interações
                </button>
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <div className="flex justify-center">
            <button onClick={() => setPreviewEleitor(null)} className="flex items-center gap-1 px-4 py-2 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
              <ChevronDown className="w-4 h-4"/>Fechar
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabela */}
      <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible">
        <PanelCard title="Lista de Eleitores" icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" badge={filtered.length} delay={7}>
          <div className="overflow-x-auto -mx-4 lg:-mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Eleitor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Contato</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Local</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Nível</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Interações</th>
                  {abaAtiva === 'pendentes' && <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length:5}).map((_,i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td colSpan={6} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse"/></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8">
                      <EmptyState icon={Users} title="Nenhum eleitor encontrado" description="Cadastre seu primeiro eleitor ou ajuste os filtros" action={{ label: 'Adicionar eleitor', onClick: () => setNovoOpen(true) }} />
                    </td>
                  </tr>
                ) : (
                  filtered.map(e => (
                    <>
                      <tr key={e.id} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => setPreviewEleitor(previewEleitor?.id === e.id ? null : e)}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-xs">{getIniciais(e.nome || '')}</span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-800">{e.nome}</div>
                              {e.lider_id && (
                                <div className="text-[10px] text-purple-500 flex items-center gap-1">
                                  <Crown className="w-3 h-3"/>{getLiderNome(e.lider_id)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">
                          <div className="text-xs">{e.telefone || '—'}</div>
                          <div className="text-[10px] text-slate-400">{e.email || '—'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell">
                          {e.cidade || '—'}/{e.estado || '—'}
                          {e.bairro && <div className="text-[10px] text-slate-400">{e.bairro}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${nivelColors[e.nivel || 'eleitor']}`}>{e.nivel || 'eleitor'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status || 'ativo']}`}>{e.status || 'ativo'}</span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <button onClick={(ev) => { ev.stopPropagation(); setInteracoesEleitor(e); }} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors">
                            <MessageSquare className="w-3 h-3" />{todasInteracoes.filter(i => i.eleitor_id === e.id).length}
                          </button>
                        </td>
                        {abaAtiva === 'pendentes' && (
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1">
                              <button onClick={async (ev) => { ev.stopPropagation(); await update(e.id, { status: 'ativo' }); fetch(); }} className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-600 hover:bg-green-100 rounded">
                                <CheckCircle className="w-3 h-3"/>Aprovar
                              </button>
                              <button onClick={async (ev) => { ev.stopPropagation(); if (confirm('Recusar este cadastro?')) { await remove(e.id); fetch(); } }} className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded">
                                <XCircle className="w-3 h-3"/>Recusar
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                      {/* Preview Inline */}
                      {previewEleitor?.id === e.id && (
                        <tr key={`${e.id}-preview`}>
                          <td colSpan={abaAtiva === 'pendentes' ? 7 : 6} className="p-0 border-0">
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mx-4 my-2">
                              {/* Header */}
                              <div className="p-4 lg:p-6 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <span className="text-blue-600 font-bold text-lg lg:text-xl">{getIniciais(previewEleitor.nome || '')}</span>
                                    </div>
                                    <div>
                                      <h3 className="text-lg lg:text-xl font-bold text-slate-800">{previewEleitor.nome}</h3>
                                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${nivelColors[previewEleitor.nivel || 'eleitor']}`}>{previewEleitor.nivel || 'eleitor'}</span>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${statusColors[previewEleitor.status || 'ativo']}`}>{previewEleitor.status || 'ativo'}</span>
                                        {previewEleitor.nivel === 'lider' && (
                                          <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-medium">{getAfiliadosCount(previewEleitor.id)} afiliados</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <button onClick={() => setEditEleitor(previewEleitor)} className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow-md"><Pencil className="w-3.5 h-3.5"/>Editar</button>
                                    {previewEleitor.nivel === 'lider' && (
                                      <button onClick={() => setConviteLider(previewEleitor)} className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors shadow-sm hover:shadow-md"><Link2 className="w-3.5 h-3.5"/>Gerar Link</button>
                                    )}
                                    <button onClick={async () => { if (confirm('Excluir este eleitor?')) { await remove(previewEleitor.id); setPreviewEleitor(null); fetch(); } }} className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-sm hover:shadow-md"><Trash2 className="w-3.5 h-3.5"/>Excluir</button>
                                  </div>
                                </div>
                              </div>
                              {/* Info Grid */}
                              <div className="p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-3">
                                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/>Contato</h4>
                                  <div className="space-y-2">
                                    {previewEleitor.email && <div className="flex items-center gap-2 text-sm text-slate-700"><Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{previewEleitor.email}</div>}
                                    {previewEleitor.telefone && <div className="flex items-center gap-2 text-sm text-slate-700"><Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{previewEleitor.telefone}</div>}
                                    {previewEleitor.cpf && <div className="flex items-center gap-2 text-sm text-slate-700"><Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>CPF: {previewEleitor.cpf}</div>}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>Endereço</h4>
                                  <div className="space-y-2">
                                    {(previewEleitor.endereco || previewEleitor.cidade) && <div className="text-sm text-slate-700">{previewEleitor.endereco && `${previewEleitor.endereco}, `}{previewEleitor.bairro && `${previewEleitor.bairro}, `}{previewEleitor.cidade || '—'}/{previewEleitor.estado || '—'}</div>}
                                    {previewEleitor.cep && <div className="text-xs text-slate-500">CEP: {previewEleitor.cep}</div>}
                                    {previewEleitor.comunidade_id && <div className="flex items-center gap-2 text-sm text-slate-700"><Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{getComunidadeNome(previewEleitor.comunidade_id) || '—'}</div>}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Vote className="w-3.5 h-3.5"/>Dados Eleitorais</h4>
                                  <div className="space-y-2">
                                    {previewEleitor.titulo_eleitor && <div className="flex items-center gap-2 text-sm text-slate-700"><Vote className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>Título: {previewEleitor.titulo_eleitor}</div>}
                                    {previewEleitor.zona && <div className="flex items-center gap-2 text-sm text-slate-700"><Section className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>Zona {previewEleitor.zona} / Seção {previewEleitor.secao || '—'}</div>}
                                    {previewEleitor.data_nascimento && <div className="flex items-center gap-2 text-sm text-slate-700"><Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>{new Date(previewEleitor.data_nascimento).toLocaleDateString('pt-BR')}</div>}
                                  </div>
                                </div>
                                {(previewEleitor.lider_id || previewEleitor.lider_vinculado_id) && (
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Crown className="w-3.5 h-3.5"/>Liderança</h4>
                                    <div className="space-y-2">
                                      {previewEleitor.lider_id && <div className="flex items-center gap-2 text-sm text-slate-700"><Crown className="w-3.5 h-3.5 text-purple-400 flex-shrink-0"/>Líder: {getLiderNome(previewEleitor.lider_id)}</div>}
                                      {previewEleitor.lider_vinculado_id && <div className="flex items-center gap-2 text-sm text-slate-700"><Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/>Vinculado a: {getLiderNome(previewEleitor.lider_vinculado_id)}</div>}
                                    </div>
                                  </div>
                                )}
                                {previewEleitor.tags && previewEleitor.tags.length > 0 && (
                                  <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Tag className="w-3.5 h-3.5"/>Tags</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                      {previewEleitor.tags.map((t: string, i: number) => <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{t}</span>)}
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-3">
                                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5"/>Interações</h4>
                                  <button onClick={() => setInteracoesEleitor(previewEleitor)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-colors">
                                    <MessageSquare className="w-3.5 h-3.5" />{todasInteracoes.filter(i => i.eleitor_id === previewEleitor.id).length} interações
                                  </button>
                                </div>
                              </div>
                              {/* Botão Fechar */}
                              <div className="flex justify-center pb-4">
                                <button onClick={() => setPreviewEleitor(null)} className="flex items-center gap-1 px-4 py-2 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                                  <ChevronDown className="w-4 h-4"/>Fechar
                                </button>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PanelCard>
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
