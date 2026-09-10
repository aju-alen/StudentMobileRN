const UAE_OFFSET_MS = 4 * 60 * 60 * 1000;

export const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

export function normalizeHHmm(value) {
  const parts = String(value || '').trim().split(':');
  const hour = Number.parseInt(parts[0], 10);
  const minute = Number.parseInt(parts[1] ?? '0', 10);
  const h = Number.isNaN(hour) ? 0 : hour;
  const m = Number.isNaN(minute) ? 0 : minute;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function toUaeParts(input) {
  const date = input instanceof Date ? input : new Date(input);
  const iso = new Date(date.getTime() + UAE_OFFSET_MS).toISOString();
  return {
    dateStr: iso.slice(0, 10),
    hour: Number(iso.slice(11, 13)),
    minute: Number(iso.slice(14, 16)),
    timeStr: iso.slice(11, 16),
  };
}

export function uaeDateStr(input = new Date()) {
  return toUaeParts(input).dateStr;
}

export function fromUaeDateTime(dateStr, timeStr = '00:00') {
  const date = String(dateStr || '').trim().split('T')[0];
  const time = normalizeHHmm(timeStr);
  return new Date(`${date}T${time}:00+04:00`);
}

export function parseDateUTC(dateStr) {
  const s = String(dateStr || '').trim().split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(dateStr);
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function isDateOnlyUtcMidnight(date) {
  const d = new Date(date);
  return d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0;
}

export function bookingDateStr(bookingDate) {
  if (!bookingDate) return '';
  const d = new Date(bookingDate);
  if (isDateOnlyUtcMidnight(d)) return d.toISOString().slice(0, 10);
  return toUaeParts(d).dateStr;
}

export function expandHourSlots(startTimeHHmm, durationHours) {
  const startHour = Number.parseInt(normalizeHHmm(startTimeHHmm).slice(0, 2), 10);
  const duration = Math.max(1, durationHours || 1);
  const slots = [];
  for (let i = 0; i < duration; i += 1) {
    const hour = startHour + i;
    if (hour > 23) break;
    slots.push(`${String(hour).padStart(2, '0')}:00`);
  }
  return slots;
}

export function slotsFromInstant(dateTime, durationHours) {
  const { dateStr, timeStr } = toUaeParts(dateTime);
  return { dateStr, slots: expandHourSlots(timeStr, durationHours) };
}
