import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File, Settings, Eye, FileOutput } from 'lucide-react';
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
type Aba = 'config' | 'colunas' | 'preview';

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
  const [aba, setAba] = useState<Aba>('config');
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

  const previewColumns = checkedColumns.slice(0, 5);
  const previewData = data.slice(0, 3);

  const formatos = [
    { key: 'csv' as ExportFormat, label: 'CSV', icon: FileSpreadsheet, desc: 'Excel' },
    { key: 'doc' as ExportFormat, label: 'DOC', icon: FileText, desc: 'Word' },
    { key: 'pdf' as ExportFormat, label: 'PDF', icon: File, desc: 'PDF' },
  ];

  const abas = [
    { key: 'config' as Aba, label: 'Config', icon: Settings },
    { key: 'colunas' as Aba, label: 'Colunas', icon: FileOutput },
    { key: 'preview' as Aba, label: 'Preview', icon: Eye },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden">
        {/* Header fixo */}
        <DialogHeader className="p-4 pb-2 space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0" />
            Exportar eleitores
          </DialogTitle>
          <DialogDescription className="text-xs">
            {data.length} registros disponíveis
          </DialogDescription>
        </DialogHeader>

        {/* Abas */}
        <div className="flex border-b border-slate-100">
          {abas.map(a => {
            const Icon = a.icon;
            const ativa = aba === a.key;
            return (
              <button
                key={a.key}
                onClick={() => setAba(a.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  ativa
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            );
          })}
        </div>

        {/* Conteúdo da aba */}
        <div className="p-4">
          {aba === 'config' && (
            <div className="space-y-3">
              {/* Nome do arquivo */}
              <div className="space-y-1">
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
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs transition-colors ${
                          selecionado
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{f.label}</span>
                        <span className="text-[9px] text-slate-400">{f.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Resumo */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Registros</span>
                  <span className="font-medium text-slate-700">{data.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Colunas</span>
                  <span className="font-medium text-slate-700">{checkedColumns.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Formato</span>
                  <span className="font-medium text-blue-600">{formato.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {aba === 'colunas' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">{checkedColumns.length} de {columns.length} selecionadas</p>
              <div className="grid grid-cols-2 gap-1">
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 rounded px-1 py-1">
                    <Checkbox checked={col.checked} onCheckedChange={() => toggleColumn(col.key)} className="w-3.5 h-3.5" />
                    <span className="text-xs text-slate-700 truncate">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {aba === 'preview' && previewColumns.length > 0 && previewData.length > 0 && (
            <div className="space-y-2">
              <div className="overflow-x-auto border rounded-lg -mx-1 px-1">
                <table className="w-full text-xs min-w-[300px]">
                  <thead className="bg-slate-50">
                    <tr>
                      {previewColumns.map(c => (
                        <th key={c.key} className="text-left py-1.5 px-2 font-semibold text-slate-600 whitespace-nowrap">{c.label}</th>
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
                          return <td key={col.key} className="py-1.5 px-2 text-slate-600 whitespace-nowrap">{val || '—'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400 text-center">Mostrando 3 de {data.length} registros</p>
            </div>
          )}

          {aba === 'preview' && previewColumns.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Selecione colunas na aba anterior</p>
            </div>
          )}
        </div>

        {/* Footer fixo */}
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
