import { Loader2, CheckCircle, AlertTriangle } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DoneProps {
  result: { success: number; errors: number; details: string[] };
  onReset: () => void;
  onClose: () => void;
}

export function ImportingState({ progress }: { progress: number }) {
  return (
    <div className="py-8 space-y-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm text-slate-600">Importando eleitores...</p>
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-center text-xs text-slate-500">{progress}%</p>
    </div>
  );
}

export function DoneState({ result, onReset, onClose }: DoneProps) {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        {result.success > 0 ? (
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        ) : (
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        )}
        <p className="text-lg font-semibold text-slate-800">
          {result.success} importados com sucesso
        </p>
        {result.errors > 0 && (
          <p className="text-sm text-red-600 mt-1">{result.errors} com erro</p>
        )}
      </div>

      {result.details.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs max-h-32 overflow-y-auto">
            {result.details.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onReset}>Importar outro</Button>
        <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">Fechar</Button>
      </div>
    </div>
  );
}

export function ErrorState({ details, onReset }: { details: string[]; onReset: () => void }) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertDescription className="text-xs">
          {details.join(', ')}
        </AlertDescription>
      </Alert>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onReset}>Tentar novamente</Button>
      </div>
    </div>
  );
}
