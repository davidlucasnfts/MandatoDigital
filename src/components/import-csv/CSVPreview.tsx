import { X, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PreviewRow, FieldDef } from './csvImportUtils';

interface Props {
  fileName: string;
  rawRowsCount: number;
  headers: string[];
  mapping: Record<string, string>;
  mappedFields: FieldDef[];
  preview: PreviewRow[];
  onMappingChange: (header: string, fieldKey: string) => void;
  onImport: () => void;
  onReset: () => void;
}

export default function CSVPreview({
  fileName,
  rawRowsCount,
  headers,
  mapping,
  mappedFields,
  preview,
  onMappingChange,
  onImport,
  onReset,
}: Props) {
  const nomeMapeado = mappedFields.find(f => f.key === 'nome')?.isMapped ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-medium">{fileName}</span> — {rawRowsCount} registros
        </p>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-500">
          <X className="w-4 h-4 mr-1" /> Trocar arquivo
        </Button>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Campos mapeados
        </p>
        <div className="flex flex-wrap gap-1.5">
          {mappedFields.map(f => (
            <span
              key={f.key}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                f.isMapped
                  ? 'bg-blue-100 text-blue-700'
                  : f.required
                  ? 'bg-red-100 text-red-600'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {f.isMapped && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
              {f.label}{f.required ? ' *' : ''}
            </span>
          ))}
        </div>
        {!nomeMapeado && (
          <p className="text-[10px] text-red-600 mt-2 font-medium">⚠️ Coluna "nome" não mapeada — é obrigatória</p>
        )}
      </div>

      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-xs font-semibold text-slate-700 mb-2">Mapeamento de colunas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {headers.map(h => (
            <div key={h} className="flex items-center gap-2">
              <span className="text-xs text-slate-600 truncate flex-1 font-medium">{h}:</span>
              <select
                value={mapping[h] || ''}
                onChange={e => onMappingChange(h, e.target.value)}
                className="text-xs h-7 px-2 rounded border border-slate-200 bg-white"
              >
                <option value="">Ignorar</option>
                {mappedFields.map(f => (
                  <option key={f.key} value={f.key}>
                    {f.label}{f.required ? ' *' : ''}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-700 mb-2">Preview (primeiras 5 linhas)</p>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-slate-600">Status</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600">Nome</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600">CPF</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600">Telefone</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600">Nível</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600">Status</th>
                <th className="text-left py-2 px-3 font-semibold text-slate-600">Erros</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p, i) => (
                <tr key={i} className={p.valid ? 'border-b border-slate-50' : 'border-b border-slate-50 bg-red-50/30'}>
                  <td className="py-2 px-3">
                    {p.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">{p.data.nome || '-'}</td>
                  <td className="py-2 px-3 text-slate-600">{p.data.cpf || '-'}</td>
                  <td className="py-2 px-3 text-slate-600">{p.data.telefone || '-'}</td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      p.data.nivel === 'lider' ? 'bg-purple-100 text-purple-700' :
                      p.data.nivel === 'eleitor' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{p.data.nivel}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      p.data.status === 'ativo' ? 'bg-green-100 text-green-700' :
                      p.data.status === 'inativo' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>{p.data.status}</span>
                  </td>
                  <td className="py-2 px-3">
                    {p.errors.length > 0 && (
                      <span className="text-red-600 text-[10px]">{p.errors.join(', ')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        <Button variant="outline" onClick={onReset} size="sm" className="text-xs sm:text-sm">Cancelar</Button>
        <Button onClick={onImport} className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm" size="sm">
          Importar {rawRowsCount} eleitores
        </Button>
      </div>
    </div>
  );
}
