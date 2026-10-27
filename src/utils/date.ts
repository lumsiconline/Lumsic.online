/**
 * UK Date formatting utility
 * Formats dates as DD/MM/YYYY
 */
export function formatUKDate(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatUKTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatSecondsToMinutes(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
