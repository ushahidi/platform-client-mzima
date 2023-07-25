import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(localizedFormat);

export function toUTC(date: Dayjs, format?: string): string {
  return dayjs.utc(date).format(format ?? 'YYYY-MM-DD');
}

export function setDate(date: Dayjs, format?: string): any {
  switch (format) {
    case 'date':
      return dayjs(date).format('YYYY-MM-DD');
    case 'datetime':
      return dayjs(date).set('millisecond', 0).toDate();
    default:
      return dayjs(date).toDate();
  }
}

export function getDateWithTz(date: Dayjs, format?: string): string {
  return dayjs(date).format(format);
}
