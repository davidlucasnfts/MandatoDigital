import { useState, useMemo, useRef } from 'react';
import { FolderOpen, Plus, FileText, Image, FileSpreadsheet, File, Search, Trash2, AlertTriangle, Download, Eye, X } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  PageHeader,
  StatCard,
  SkeletonList,
  EmptyState,
  SearchFilterBar,
} from '@/components/dashboard';
import { useDocumentos } from '@/hooks/useDocumentos';
import type { DocumentoFile } from '@/hooks/useDocumentos';

const typeConfig: Record<string, { icon: typeof FileText; color: string; bg: string; label: string }> = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' },
  doc: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Documento' },
  xls: { icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-50', label: 'Planilha' },
  img: { icon: Image, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Imagem' },
  outro: { icon: File, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Arquivo' },
};

const pastas = ['Todos', 'Projetos de Lei', 'Relatórios', 'Fotos', 'Dados', 'Ofícios', 'Geral'];

export default function DocumentosPageV2() {
  const { data: documentos, loading, error, uploading, upload, remove, download, formatBytes } = useDocumentos();
  const [search, setSearch] = useState('');
  const [pasta, setPasta] = useState('Todos');
  const [showUpload, setShowUpload] = useState(false);
  const [showDelete, setShowDelete] = useState<DocumentoFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPasta, setSelectedPasta] = useState('Geral');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = [...documentos];
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter((d) => d.nome.toLowerCase().includes(term));
    }
    if (pasta !== 'Todos') {
      list = list.filter((d) => d.pasta === pasta);
    }
    return list.sort((a, b) => new Date(b.dataUpload).getTime() - new Date(a.dataUpload).getTime());
  }, [documentos, search, pasta]);

  const stats = useMemo(() => {
    const totalSize = documentos.reduce((acc, d) => acc + d.tamanho, 0);
    return {
      total: documentos.length,
      pdf: documentos.filter((d) => d.tipo === 'pdf').length,
      img: documentos.filter((d) => d.tipo === 'img').length,
      xls: documentos.filter((d) => d.tipo === 'xls').length,
      tamanhoTotal: formatBytes(totalSize),
    };
  }, [documentos, formatBytes]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const ok = await upload(selectedFile, selectedPasta);
    if (ok) {
      setSelectedFile(null);
      setShowUpload(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    const path = showDelete.pasta === 'Geral' ? showDelete.nome : `${showDelete.pasta}/${showDelete.nome}`;
    const ok = await remove(path);
    if (ok) setShowDelete(null);
  };

  const handleDownload = (d: DocumentoFile) => {
    const path = d.pasta === 'Geral' ? d.nome : `${d.pasta}/${d.nome}`;
    download(path);
  };

  const handlePreview = (d: DocumentoFile) => {
    if (d.tipo === 'img' && d.url) {
      setPreviewUrl(d.url);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="Gerencie arquivos e documentos da campanha."
        icon={FolderOpen}
        action={{ label: 'Upload', onClick: () => setShowUpload(true), icon: Plus }}
        delay={0}
      />

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonList count={4} delay={1} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard label="Total" value={stats.total} icon={File} color="blue" delay={1} />
          <StatCard label="PDFs" value={stats.pdf} icon={FileText} color="red" delay={2} />
          <StatCard label="Imagens" value={stats.img} icon={Image} color="purple" delay={3} />
          <StatCard label="Planilhas" value={stats.xls} icon={FileSpreadsheet} color="green" delay={4} />
        </div>
      )}

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar documentos..."
        delay={2}
      />

      <div className="flex flex-wrap gap-2">
        {pastas.map((p) => (
          <button
            key={p}
            onClick={() => setPasta(p)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium ${
              p === pasta ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum documento encontrado"
          description={search || pasta !== 'Todos' ? 'Tente ajustar os filtros.' : 'Faça upload do primeiro documento.'}
          action={!search && pasta === 'Todos' ? { label: 'Fazer upload', onClick: () => setShowUpload(true) } : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((d, i) => {
            const cfg = typeConfig[d.tipo] || typeConfig.outro;
            const Icon = cfg.icon;
            return (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 ${cfg.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${cfg.color}`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-800 truncate" title={d.nome}>{d.nome}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{cfg.label} • {d.pasta}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{formatBytes(d.tamanho)}</span>
                      <span className="text-xs text-slate-400">{new Date(d.dataUpload).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {d.tipo === 'img' && d.url && (
                    <button
                      onClick={() => handlePreview(d)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-3 h-3" strokeWidth={2} /> Visualizar
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(d)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Download className="w-3 h-3" strokeWidth={2} /> Baixar
                  </button>
                  <button
                    onClick={() => setShowDelete(d)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={2} /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload de documento</DialogTitle>
            <DialogDescription>Selecione um arquivo e a pasta de destino.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Pasta</label>
              <select
                value={selectedPasta}
                onChange={(e) => setSelectedPasta(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {pastas.filter((p) => p !== 'Todos').map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Arquivo</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="text-xs text-slate-500 mt-2">
                  {selectedFile.name} ({formatBytes(selectedFile.size)})
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpload(false)}>Cancelar</Button>
              <Button
                className="flex-1 bg-blue-600"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDelete} onOpenChange={() => setShowDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Excluir documento
            </DialogTitle>
            <DialogDescription className="break-all">
              Tem certeza que deseja excluir <strong>{showDelete?.nome}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDelete(null)}>Cancelar</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
