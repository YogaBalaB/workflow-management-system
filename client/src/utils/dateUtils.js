export const formatTimestamp = (value) => {
  if (!value) return '—';

  const raw = String(value).trim();
  const normalized = raw.replace(' ', 'T');
  const hasZone = /[Zz]|[+-]\d{2}:\d{2}$/.test(normalized);
  const timestamp = hasZone ? normalized : `${normalized}Z`;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};
