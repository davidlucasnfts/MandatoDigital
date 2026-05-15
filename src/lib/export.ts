export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  formatter?: (value: any, row: T) => string;
}

function getValue<T>(row: T, key: keyof T | string, formatter?: (value: any, row: T) => string): string {
  let value: any;
  if (typeof key === 'string' && key.includes('.')) {
    const keys = key.split('.');
    value = keys.reduce((obj, k) => obj?.[k], row as any);
  } else {
    value = (row as any)[key];
  }
  if (formatter) value = formatter(value, row);
  if (value === null || value === undefined) value = '';
  if (Array.isArray(value)) value = value.join('; ');
  return String(value);
}

// ========== CSV ==========
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string
) {
  if (data.length === 0) return;

  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(row => {
    return columns.map(col => {
      const str = getValue(row, col.key, col.formatter);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  });

  const csv = ['\uFEFF' + headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${fileName}.csv`);
}

// ========== DOC (HTML formatado) ==========
export function exportToDOC<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  title?: string
) {
  if (data.length === 0) return;

  const headers = columns.map(c => `<th style="border:1px solid #ccc;padding:8px;background:#f5f5f5;font-weight:bold;">${c.label}</th>`).join('');
  const rows = data.map(row => {
    return `<tr>${columns.map(col => {
      const str = getValue(row, col.key, col.formatter);
      return `<td style="border:1px solid #ccc;padding:8px;">${escapeHtml(str)}</td>`;
    }).join('')}</tr>`;
  }).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || fileName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; font-size: 18px; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: bold; }
    .footer { margin-top: 20px; font-size: 10px; color: #666; }
  </style>
</head>
<body>
  <h1>${title || fileName}</h1>
  <table>
    <thead><tr>${headers}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Exportado em ${new Date().toLocaleString('pt-BR')} — MandatoDigital</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8;' });
  downloadBlob(blob, `${fileName}.doc`);
}

// ========== PDF (usando jsPDF se disponível, senão HTML) ==========
export async function exportToPDF<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  fileName: string,
  title?: string
) {
  if (data.length === 0) return;

  // Tenta usar jsPDF dinamicamente
  try {
    const { jsPDF } = await import('jspdf');
    const { autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(title || fileName, 40, 40);

    const headers = [columns.map(c => c.label)];
    const rows = data.map(row =>
      columns.map(col => getValue(row, col.key, col.formatter))
    );

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 60,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`${fileName}.pdf`);
  } catch {
    // Fallback: exporta como HTML se jsPDF não estiver disponível
    exportToDOC(data, columns, fileName, title);
    alert('PDF requer biblioteca adicional. Arquivo DOC foi gerado como alternativa.');
  }
}

// ========== Utilitários ==========
function downloadBlob(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
