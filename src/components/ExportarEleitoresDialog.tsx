import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File, Eye } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { exportToCSV, exportToDOC, exportToPDF } from '@/lib/export';
import { useComunidades } from '@/hooks/useSupabaseData';
import type { Eleitor } from '@/lib/supabase';

interface ColumnOption {
  key: string;
  label: string;
  checked: boolean;
}

const DEFAULT_COLUMNS: ColumnOption[] = [
  { key: 'nome', label: 'Nome', checked: true },
  { key: 'email', label: 'E-mail', checked: true },
  { key: 'telefone', label: 'Telefone', checked: true },
  { key: 'cpf', label: 'CPF', checked: true },
  { key: 'endereco', label: 'Endereço', checked: false },
  { key: 'numero', label: 'Número', checked: false },
  { key: 'bairro', label: 'Bairro', checked: false },
  { key: 'cidade', label: 'Cidade', checked: false },
  { key: 'estado', label: 'Estado', checked: false },
  { key: 'cep', label: 'CEP', checked: false },
  { key: 'comunidade_id', label: 'Comunidade', checked: true },
  { key: 'nivel', label: 'Nível', checked: true },
  { key: 'tags', label: 'Tags', checked: false },
  { key: 'status', label: 'Status', checked: true },
  { key: 'observacoes', label: 'Observações', checked: false },
  { key: 'data_nascimento', label: 'Data Nasc.', checked: false },
];

type ExportFormat = 'csv' | 'doc' | 'pdf';

interface Props {
  open: boolean;
  onClose: () => void;
  data: Eleitor[];
}

export default function ExportarEleitoresDialog({ open, onClose, data }: Props) {
  const [columns, setColumns] = useState<ColumnOption[]>(DEFAULT_COLUMNS);
  const [fileName, setFileName] = useState('eleitores');
  const [formato, setFormato] = useState<ExportFormat>('csv');
  const [exportando, setExportando] = useState(false);
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const { data: comunidades } = useComunidades();

  const toggleColumn = (key: string) => {
    setColumns(prev => prev.map(c => c.key === key ? { ...c, checked: !c.checked } : c));
  };

  const checkedColumns = columns.filter(c => c.checked);

  const handleExport = async () => {
    if (checkedColumns.length === 0 || data.length === 0) return;

    setExportando(true);

    const cols = checkedColumns.map(c => ({
      key: c.key,
      label: c.label,
      formatter: c.key === 'comunidade_id'
        ? (_v: any, row: Eleitor) => comunidades.find(cm => cm.id === row.comunidade_id)?.nome || ''
        : undefined,
    }));

    try {
      if (formato === 'csv') {
        exportToCSV(data, cols, fileName);
      } else if (formato === 'doc') {
        exportToDOC(data, cols, fileName, 'Relatório de Eleitores');
      } else if (formato === 'pdf') {
        await exportToPDF(data, cols, fileName, 'Relatório de Eleitores');
      }
      onClose();
    } catch (err: any) {
      alert('Erro ao exportar: ' + (err?.message || 'Falha desconhecida'));
    } finally {
      setExportando(false);
    }
  };

  const previewColumns = checkedColumns.slice(0, 4);
  const previewData = data.slice(0, 3);

  const formatos = [
    { key: 'csv' as ExportFormat, label: 'CSV', icon: FileSpreadsheet, desc: 'Excel' },
    { key: 'doc' as ExportFormat, label: 'DOC', icon: FileText, desc: 'Word' },
    { key: 'pdf' as ExportFormat, label: 'PDF', icon: File, desc: 'PDF' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-2 space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0" />
            Exportar eleitores
          </DialogTitle>
          <DialogDescription className="text-xs">
            {data.length} registros disponíveis
          </DialogDescription>
        </DialogHeader>

        {/* Toggle Preview */}
        <div className="px-4">
          <button
            onClick={() => setMostrarPreview(!mostrarPreview)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              mostrarPreview
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {mostrarPreview ? 'Ocultar preview' : 'Ver preview'}
          </button>
        </div>

        {/* Conteúdo scrollável apenas se necessário */}
        <div className="px-4 py-2 space-y-3 max-h-[50vh] overflow-y-auto">
          {/* Preview (quando ativo) */}
          {mostrarPreview && previewColumns.length > 0 && previewData.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-50">
                    <tr>
                      {previewColumns.map(c => (
                        <th key={c.key} className="text-left py-1.5 px-2 font-semibold text-slate-600 whitespace-nowrap">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {previewColumns.map(col => {
                          let val: any = (row as any)[col.key];
                          if (col.key === 'comunidade_id') val = comunidades.find(c => c.id === val)?.nome || '';
                          if (Array.isArray(val)) val = val.join('; ');
                          return <td key={col.key} className="py-1.5 px-2 text-slate-600 truncate">{val || '—'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400 text-center py-1 border-t border-slate-100">3 de {data.length} registros</p>
            </div>
          )}

          {mostrarPreview && previewColumns.length === 0 && (
            <div className="text-center py-4 text-slate-400 bg-slate-50 rounded-lg">
              <p className="text-xs">Selecione colunas para ver o preview</p>
            </div>
          )}

          {/* Nome do arquivo */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Nome do arquivo</label>
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm"
              placeholder="eleitores"
            />
          </div>

          {/* Formato */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Formato</label>
            <div className="grid grid-cols-3 gap-2">
              {formatos.map(f => {
                const Icon = f.icon;
                const selecionado = formato === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFormato(f.key)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-xs transition-colors ${
                      selecionado
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colunas */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">Colunas</label>
              <span className="text-[10px] text-slate-400">{checkedColumns.length} selecionadas</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
              {columns.map(col => (
                <label key={col.key} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 rounded px-1 py-1">
                  <Checkbox checked={col.checked} onCheckedChange={() => toggleColumn(col.key)} className="w-3.5 h-3.5" />
                  <span className="text-xs text-slate-700 truncate">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} size="sm" className="flex-1 text-xs">Cancelar</Button>
          <Button onClick={handleExport} className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs" disabled={checkedColumns.length === 0 || exportando} size="sm">
            <Download className="w-3.5 h-3.5 mr-1" />
            {exportando ? 'Exportando...' : `Exportar ${formato.toUpperCase()}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
