import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export function toUTC(date: Dayjs, format?: string): string {
  return dayjs.utc(date).format(format ?? 'YYYY-MM-DD');
}
