import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortByField',
})
export class SortByFieldPipe implements PipeTransform {
  transform(array: any[], field: string, order: string = 'asc'): any[] {
    array.sort((a: any, b: any) => {
      if (a[field] < b[field]) {
        return order === 'asc' ? -1 : 1;
      } else if (a[field] > b[field]) {
        return order === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
    return array;
  }
}
