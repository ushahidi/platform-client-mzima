import dayjs, { Dayjs } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);

export function setDate(date: Dayjs, format?: string): any {
  switch (format) {
    case 'date':
      return dayjs(date).format('YYYY-MM-DD');
    case 'datetime':
      return dayjs(date).set('millisecond', 0).toDate();
  }
}

export function getDateWithTz(date: Dayjs, format?: string): string {
  return dayjs(date).format(format);
}
