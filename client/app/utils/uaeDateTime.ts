const UAE_OFFSET_MS = 4 * 60 * 60 * 1000;

export function normalizeHHmm(value: string) {
  const parts = String(value || '').trim().split(':');
  const hour = Number.parseInt(parts[0], 10);
  const minute = Number.parseInt(parts[1] ?? '0', 10);
  const h = Number.isNaN(hour) ? 0 : hour;
  const m = Number.isNaN(minute) ? 0 : minute;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function toUaeParts(input: Date | string | number) {
  const date = input instanceof Date ? input : new Date(input);
  const iso = new Date(date.getTime() + UAE_OFFSET_MS).toISOString();
  return {
    dateStr: iso.slice(0, 10),
    hour: Number(iso.slice(11, 13)),
    minute: Number(iso.slice(14, 16)),
    timeStr: iso.slice(11, 16),
  };
}

export function uaeDateStr(input: Date = new Date()) {
  return toUaeParts(input).dateStr;
}

export function fromUaeDateTime(dateStr: string, timeStr = '00:00') {
  const date = String(dateStr || '').trim().split('T')[0];
  const time = normalizeHHmm(timeStr);
  return new Date(`${date}T${time}:00+04:00`);
}
