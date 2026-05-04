export interface CSVColumn<T> {
  key: keyof T | string;
  label: string;
  formatter?: (value: any, row: T) => string;
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: CSVColumn<T>[],
  fileName: string
) {
  if (data.length === 0) return;

  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      let value: any;
      if (typeof col.key === 'string' && col.key.includes('.')) {
        const keys = col.key.split('.');
        value = keys.reduce((obj, k) => obj?.[k], row);
      } else {
        value = row[col.key as keyof T];
      }

      if (col.formatter) {
        value = col.formatter(value, row);
      }

      if (value === null || value === undefined) value = '';
      if (Array.isArray(value)) value = value.join('; ');
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
