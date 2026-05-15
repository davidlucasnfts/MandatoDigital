import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
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
  { key: 'data_nascimento', label: 'Data Nascimento', checked: false },
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

  const previewColumns = checkedColumns.slice(0, 6);
  const previewData = data.slice(0, 3);

  const formatos = [
    { key: 'csv' as ExportFormat, label: 'CSV', icon: FileSpreadsheet, desc: 'Planilha Excel' },
    { key: 'doc' as ExportFormat, label: 'DOC', icon: FileText, desc: 'Documento Word' },
    { key: 'pdf' as ExportFormat, label: 'PDF', icon: File, desc: 'Documento PDF' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Exportar eleitores
          </DialogTitle>
          <DialogDescription>
            Selecione as colunas e o formato de exportação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome do arquivo */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Nome do arquivo</label>
            <input
              type="text"
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              placeholder="eleitores"
            />
          </div>

          {/* Formato */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Formato</label>
            <div className="flex gap-2">
              {formatos.map(f => {
                const Icon = f.icon;
                const selecionado = formato === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFormato(f.key)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      selecionado
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">{f.label}</div>
                      <div className="text-[10px] text-slate-400">{f.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colunas */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-700 mb-2">Colunas disponíveis ({checkedColumns.length} selecionadas)</p>
            <div className="grid grid-cols-3 gap-2">
              {columns.map(col => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 rounded px-1 py-0.5">
                  <Checkbox checked={col.checked} onCheckedChange={() => toggleColumn(col.key)} />
                  <span className="text-xs text-slate-700">{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewColumns.length > 0 && previewData.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Preview ({data.length} registros)</p>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {previewColumns.map(c => (
                        <th key={c.key} className="text-left py-2 px-3 font-semibold text-slate-600">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        {previewColumns.map(col => {
                          let val: any = (row as any)[col.key];
                          if (col.key === 'comunidade_id') val = comunidades.find(c => c.id === val)?.nome || '';
                          if (Array.isArray(val)) val = val.join('; ');
                          return <td key={col.key} className="py-2 px-3 text-slate-600">{val || '—'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-between items-center pt-2">
            <p className="text-xs text-slate-500">{data.length} registros serão exportados</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700" disabled={checkedColumns.length === 0 || exportando}>
                <Download className="w-4 h-4 mr-1.5" />
                {exportando ? 'Exportando...' : `Exportar ${formato.toUpperCase()}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
