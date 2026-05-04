import { useRef } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CSVUploadZone({ onFileSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Clique para selecionar arquivo CSV</p>
        <p className="text-xs text-slate-500 mt-1">ou arraste o arquivo aqui</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={onFileSelect}
      />
      <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600 space-y-2">
        <p className="font-semibold">Formato esperado:</p>
        <p>O arquivo deve conter pelo menos a coluna <strong>nome</strong>. Colunas aceitas: nome, email, telefone, cpf, endereco, bairro, cidade, estado, cep, comunidade, nivel, tags, status, observacoes, data_nascimento.</p>
        <p>Separador: vírgula. Codificação: UTF-8 recomendado.</p>
      </div>
    </div>
  );
}
