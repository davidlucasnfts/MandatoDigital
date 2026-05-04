import { useState, useRef, useCallback, useMemo } from 'react';
import { Loader2, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useComunidades } from '@/hooks/useSupabaseData';
import { parseCSV, findFieldMatch, validateRow, FIELDS } from './csvImportUtils';
import type { CSVRow, PreviewRow } from './csvImportUtils';
import CSVUploadZone from './CSVUploadZone';
import CSVPreview from './CSVPreview';
import { ImportingState, DoneState, ErrorState } from './ImportProgress';

type ImportStatus = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportarEleitoresDialog({ open, onClose, onSuccess }: Props) {
  const { data: comunidades } = useComunidades();
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<CSVRow[]>([]);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState({ success: 0, errors: 0, details: [] as string[] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const comunidadeMap = useMemo(() => {
    const map: Record<string, string> = {};
    comunidades.forEach(c => {
      map[c.nome.toLowerCase()] = c.id;
      map[c.id] = c.id;
    });
    return map;
  }, [comunidades]);

  const mappedFields = useMemo(() => {
    const mapped = new Set(Object.values(mapping));
    return FIELDS.map(f => ({ ...f, isMapped: mapped.has(f.key) }));
  }, [mapping]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('parsing');

    try {
      const text = await file.text();
      const { headers: h, rows } = parseCSV(text);
      setHeaders(h);
      setRawRows(rows);

      const autoMap: Record<string, string> = {};
      h.forEach(header => {
        const match = findFieldMatch(header);
        if (match) autoMap[header] = match.key;
      });
      setMapping(autoMap);

      const previewRows = rows.slice(0, 5).map(row => validateRow(row, autoMap, comunidadeMap));
      setPreview(previewRows);
      setStatus('preview');
    } catch (err: any) {
      setStatus('error');
      setResult({ success: 0, errors: 1, details: [err.message || 'Erro ao ler arquivo'] });
    }
  }, [comunidadeMap]);

  const handleMappingChange = (header: string, fieldKey: string) => {
    const newMapping = { ...mapping, [header]: fieldKey };
    if (!fieldKey) delete newMapping[header];
    setMapping(newMapping);
    setPreview(rawRows.slice(0, 5).map(row => validateRow(row, newMapping, comunidadeMap)));
  };

  const handleImport = async () => {
    setStatus('importing');
    setProgress(0);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setStatus('error');
      setResult({ success: 0, errors: 1, details: ['Usuário não autenticado'] });
      return;
    }

    let success = 0;
    let errors = 0;
    const details: string[] = [];
    const batchSize = 50;

    for (let i = 0; i < rawRows.length; i += batchSize) {
      const batch = rawRows.slice(i, i + batchSize);
      const validRows = batch
        .map(row => validateRow(row, mapping, comunidadeMap))
        .filter(r => r.valid && r.data.nome)
        .map(r => ({ ...r.data, user_id: userId }));

      if (validRows.length > 0) {
        const { error } = await supabase.from('eleitores').insert(validRows);
        if (error) {
          errors += validRows.length;
          details.push(`Lote ${i + 1}-${i + batchSize}: ${error.message}`);
        } else {
          success += validRows.length;
        }
      }

      const invalidCount = batch.filter(r => !validateRow(r, mapping, comunidadeMap).valid).length;
      errors += invalidCount;
      setProgress(Math.round(((i + batch.length) / rawRows.length) * 100));
    }

    setResult({ success, errors, details });
    setStatus('done');
    if (success > 0) onSuccess();
  };

  const reset = () => {
    setStatus('idle');
    setFileName('');
    setHeaders([]);
    setRawRows([]);
    setPreview([]);
    setMapping({});
    setProgress(0);
    setResult({ success: 0, errors: 0, details: [] });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            Importar Eleitores via CSV
          </DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV para importar eleitores em lote.
          </DialogDescription>
        </DialogHeader>

        {status === 'idle' && <CSVUploadZone onFileSelect={handleFileSelect} />}

        {status === 'parsing' && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600">Lendo arquivo...</p>
          </div>
        )}

        {status === 'preview' && (
          <CSVPreview
            fileName={fileName}
            rawRowsCount={rawRows.length}
            headers={headers}
            mapping={mapping}
            mappedFields={mappedFields}
            preview={preview}
            onMappingChange={handleMappingChange}
            onImport={handleImport}
            onReset={handleClose}
          />
        )}

        {status === 'importing' && <ImportingState progress={progress} />}

        {status === 'done' && (
          <DoneState result={result} onReset={reset} onClose={handleClose} />
        )}

        {status === 'error' && (
          <ErrorState details={result.details} onReset={reset} />
        )}
      </DialogContent>
    </Dialog>
  );
}
