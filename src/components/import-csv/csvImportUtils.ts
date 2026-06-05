import type { Eleitor } from '@/lib/supabase';

export interface CSVRow {
  [key: string]: string;
}

export interface FieldDef {
  key: string;
  label: string;
  required: boolean;
  example: string;
  synonyms: string[];
  isMapped?: boolean;
}

export const FIELDS: FieldDef[] = [
  { key: 'nome', label: 'Nome', required: true, example: 'João Silva', synonyms: ['nome completo', 'name', 'eleitor', 'pessoa', 'contato'] },
  { key: 'email', label: 'E-mail', required: false, example: 'joao@email.com', synonyms: ['e-mail', 'mail', 'correio', 'endereco eletronico'] },
  { key: 'telefone', label: 'Telefone', required: false, example: '(11) 98765-4321', synonyms: ['celular', 'whatsapp', 'fone', 'tel', 'contato', 'phone'] },
  { key: 'cpf', label: 'CPF', required: false, example: '123.456.789-00', synonyms: ['documento', 'cadastro'] },
  { key: 'endereco', label: 'Endereço', required: false, example: 'Rua das Flores, 123', synonyms: ['rua', 'logradouro', 'end', 'address'] },
  { key: 'bairro', label: 'Bairro', required: false, example: 'Centro', synonyms: ['vizinhanca', 'bair'] },
  { key: 'cidade', label: 'Cidade', required: false, example: 'São Paulo', synonyms: ['municipio', 'cidd', 'city'] },
  { key: 'estado', label: 'Estado', required: false, example: 'SP', synonyms: ['uf', 'est', 'state'] },
  { key: 'cep', label: 'CEP', required: false, example: '01001-000', synonyms: ['codigo postal', 'zip'] },
  { key: 'comunidade_id', label: 'Comunidade', required: false, example: 'Nome da comunidade', synonyms: ['comunidade', 'grupo', 'regiao', 'area', 'zona'] },
  { key: 'nivel', label: 'Nível', required: false, example: 'eleitor, apoiador, influenciador, lider', synonyms: ['nivel de engajamento', 'engajamento', 'categoria', 'tipo', 'classificacao', 'perfil'] },
  { key: 'tags', label: 'Tags', required: false, example: 'saude, educacao', synonyms: ['etiquetas', 'marcadores', 'interesses', 'demandas', 'areas'] },
  { key: 'status', label: 'Status', required: false, example: 'ativo, inativo, pendente', synonyms: ['situacao', 'estado cadastro', 'ativo'] },
  { key: 'observacoes', label: 'Observações', required: false, example: 'Observação livre', synonyms: ['obs', 'notas', 'comentarios', 'anotacoes', 'info'] },
  { key: 'data_nascimento', label: 'Data Nascimento', required: false, example: '1990-01-31', synonyms: ['nascimento', 'dt nasc', 'aniversario', 'data de nascimento'] },
];

export const VALID_NIVEIS = ['lider', 'influenciador', 'apoiador', 'eleitor'];
export const VALID_STATUS = ['ativo', 'inativo', 'pendente'];

export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function ajustarCPF(cpf: string): string {
  let clean = limparCPF(cpf);
  if (clean.length > 0 && clean.length < 11) {
    clean = clean.padStart(11, '0');
  }
  return clean;
}

export function validarCPF(cpf: string): boolean {
  const clean = ajustarCPF(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;
  return true;
}

export function limparTelefone(tel: string): string {
  return tel.replace(/\D/g, '');
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSV(text: string): { headers: string[]; rows: CSVRow[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('Arquivo CSV vazio ou inválido');

  const headers = splitCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length === 1 && values[0] === '') continue;
    const row: CSVRow = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }

  return { headers, rows };
}

export function findFieldMatch(header: string): FieldDef | undefined {
  const normalized = header.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  for (const field of FIELDS) {
    const fieldNorm = field.key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const labelNorm = field.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

    if (normalized === fieldNorm || normalized === labelNorm) return field;
    if (normalized.includes(labelNorm) || labelNorm.includes(normalized)) return field;

    for (const syn of field.synonyms) {
      const synNorm = syn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
      if (normalized === synNorm || normalized.includes(synNorm) || synNorm.includes(normalized)) return field;
    }
  }

  return undefined;
}

export interface PreviewRow {
  data: Partial<Eleitor>;
  errors: string[];
  raw: CSVRow;
  valid: boolean;
}

export function validateRow(
  row: CSVRow,
  map: Record<string, string>,
  cMap: Record<string, string>
): PreviewRow {
  const data: Partial<Eleitor> = {};
  const errors: string[] = [];

  FIELDS.forEach(field => {
    const csvHeader = Object.keys(map).find(k => map[k] === field.key);
    const value = csvHeader ? row[csvHeader] || '' : '';

    if (field.required && !value) {
      errors.push(`${field.label} é obrigatório`);
      return;
    }

    switch (field.key) {
      case 'nome':
        data.nome = value;
        break;
      case 'email':
        if (value && !validarEmail(value)) errors.push('E-mail inválido');
        data.email = value || undefined;
        break;
      case 'telefone': {
        const clean = value ? limparTelefone(value) : '';
        // Normaliza: remove 55 do início se existir, garante 11 dígitos
        let digits = clean;
        if (digits.startsWith('55') && digits.length > 11) {
          digits = digits.slice(2);
        }
        // Validação: deve ter 11 dígitos (DDD + 9 + 8 números)
        if (digits && digits.length !== 11) {
          errors.push(`Telefone inválido: "${value}". Use formato (DD) 98765-4321`);
        }
        data.telefone = digits || undefined;
        break;
      }
      case 'cpf':
        if (value && !validarCPF(value)) errors.push('CPF inválido');
        data.cpf = value ? ajustarCPF(value) : undefined;
        break;
      case 'nivel':
        data.nivel = VALID_NIVEIS.includes(value.toLowerCase()) ? (value.toLowerCase() as Eleitor['nivel']) : 'eleitor';
        break;
      case 'status':
        data.status = VALID_STATUS.includes(value.toLowerCase()) ? (value.toLowerCase() as Eleitor['status']) : 'ativo';
        break;
      case 'tags':
        data.tags = value ? value.split(/[,;]/).map(t => t.trim()).filter(Boolean) : [];
        break;
      case 'comunidade_id':
        if (value) {
          const cid = cMap[value.toLowerCase()];
          if (cid) data.comunidade_id = cid;
        }
        break;
      default:
        (data as any)[field.key] = value || undefined;
    }
  });

  return { data, errors, raw: row, valid: errors.length === 0 && !!data.nome };
}
