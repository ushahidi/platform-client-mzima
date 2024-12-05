import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateAgo',
})
export class DateAgoPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}
  transform(value: any): unknown {
    if (!value) {
      return this.translate.instant('date.aLongTimeAgo');
    }
    let time = (Date.now() - Date.parse(value)) / 1000;
    if (time < 10) {
      return this.translate.instant('date.justNow');
    } else if (time < 60) {
      return this.translate.instant('date.aMomentAgo');
    }

    const dividers = [60, 60, 24, 30, 12];
    const string = ['second', 'minute', 'hour', 'day', 'month', 'year'];
    let i = 0;

    // Calculate the appropriate unit
    while (i < dividers.length && Math.floor(time / dividers[i]) > 0) {
      time /= dividers[i];
      i++;
    }

    const roundedTime = Math.floor(time);
    const unit = string[i];
    const pluralization = roundedTime > 1 ? 'plural' : 'singular';

    // Translate the string based on singular/plural
    return this.translate.instant(`date.${unit}.${pluralization}`, { time: roundedTime });
  }
}
