/**
 * Export array of data to CSV file compatible with Microsoft Excel (with UTF-8 BOM)
 */
export function exportToCSV(filename: string, rows: Record<string, any>[], headers?: { key: string; label: string }[]): void {
  if (!rows || !rows.length) {
    alert('Eksport qilish uchun ma’lumot topilmadi');
    return;
  }

  const columns = headers || Object.keys(rows[0]).map((key) => ({ key, label: key }));

  // Header line
  const headerLine = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // Data lines
  const dataLines = rows.map((row) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (val === undefined || val === null) val = '';
        if (typeof val === 'object') val = JSON.stringify(val);
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Cyrillic / Uzbek characters open cleanly in Excel
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print-to-PDF utility: opens a formatted official report preview window that triggers the browser's native PDF generation
 */
export function printReportPDF(title: string, subtitle: string, headers: string[], rows: (string | number)[][]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Iltimos, brauzerda pop-up oynalarga ruxsat bering');
    return;
  }

  const dateStr = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tableHeaderHtml = headers.map((h) => `<th style="padding:10px; border:1px solid #cbd5e1; background:#f1f5f9; text-align:left; font-size:12px;">${h}</th>`).join('');
  const tableRowsHtml = rows
    .map(
      (r) =>
        `<tr>${r.map((cell) => `<td style="padding:8px 10px; border:1px solid #e2e8f0; font-size:12px;">${cell}</td>`).join('')}</tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: bold; color: #065f46; margin: 0; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 5px; }
          .meta { font-size: 11px; color: #94a3b8; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">EcoControl — ${title}</h1>
            <div class="subtitle">${subtitle}</div>
          </div>
          <div class="meta">
            <div>Sana: ${dateStr}</div>
            <div>Tizim: EcoControl Cloud Platform</div>
          </div>
        </div>
        <div style="margin-bottom: 12px;">
          <button onclick="window.print()" style="padding: 6px 14px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
            🖨️ PDF / Chop etish
          </button>
        </div>
        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <div class="footer">
          <div>O‘zbekiston Respublikasi Ekologiya qo‘mitasi | "Toza Hudud" DUK</div>
          <div>Sahifa 1 / 1</div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
