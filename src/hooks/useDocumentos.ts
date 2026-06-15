import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const BUCKET = 'documentos';

export interface DocumentoFile {
  id: string;
  nome: string;
  tamanho: number;
  tipo: string;
  pasta: string;
  dataUpload: string;
  url: string | null;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('image')) return 'img';
  if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return 'xls';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  return 'outro';
}

function getFileName(path: string) {
  return path.split('/').pop() || path;
}

function getFolder(path: string) {
  const parts = path.split('/');
  return parts.length > 1 ? parts[0] : 'Geral';
}

export function useDocumentos() {
  const [data, setData] = useState<DocumentoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: listData, error: listError } = await supabase.storage.from(BUCKET).list('', { limit: 1000 });
      if (listError) throw listError;

      const files: DocumentoFile[] = await Promise.all(
        (listData || []).map(async (item) => {
          const { data: urlData } = await supabase.storage.from(BUCKET).createSignedUrl(item.name, 60 * 60);
          return {
            id: item.id,
            nome: getFileName(item.name),
            tamanho: item.metadata?.size || 0,
            tipo: getFileType(item.metadata?.mimetype || ''),
            pasta: getFolder(item.name),
            dataUpload: item.created_at || item.updated_at || new Date().toISOString(),
            url: urlData?.signedUrl || null,
          };
        })
      );

      setData(files);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    list();
  }, [list]);

  const upload = useCallback(async (file: File, pasta: string = 'Geral') => {
    setUploading(true);
    setError(null);
    try {
      const filePath = pasta === 'Geral' ? file.name : `${pasta}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        upsert: false,
      });
      if (uploadError) throw uploadError;
      await list();
      return true;
    } catch (e: any) {
      setError(e.message || 'Erro ao fazer upload');
      return false;
    } finally {
      setUploading(false);
    }
  }, [list]);

  const remove = useCallback(async (path: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase.storage.from(BUCKET).remove([path]);
      if (deleteError) throw deleteError;
      await list();
      return true;
    } catch (e: any) {
      setError(e.message || 'Erro ao excluir documento');
      return false;
    }
  }, [list]);

  const download = useCallback(async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = getFileName(path);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e: any) {
      setError(e.message || 'Erro ao baixar documento');
      return false;
    }
  }, []);

  return { data, loading, error, uploading, upload, remove, download, list, formatBytes };
}
