function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : String(value);
  if (str.includes(',') || str.includes('\"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function objectsToCsv(rows: any[], columns: { label: string; key: string; transform?: (v: any, row?: any) => any }[]) {
  const header = columns.map((c) => c.label).join(',');
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const raw = col.transform ? col.transform(row[col.key], row) : row[col.key];
        return escapeCsv(raw);
      })
      .join(',')
  );
  return [header, ...lines].join('\n');
}

export default objectsToCsv;
