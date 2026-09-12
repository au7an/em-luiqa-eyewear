export function parsePriceToNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const numericStr = value.toString().replace(/[^0-9]/g, '');
  return numericStr ? parseInt(numericStr, 10) : 0;
}

export function formatIDR(value: number | string | undefined): string {
  const num = parsePriceToNumber(value);
  if (!num) return 'IDR 0';
  return 'IDR ' + new Intl.NumberFormat('en-US').format(num);
}

export function formatRupiahDisplay(value: number | string | undefined): string {
  const num = parsePriceToNumber(value);
  if (!num) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
}
