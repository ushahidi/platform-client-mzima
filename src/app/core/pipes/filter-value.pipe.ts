import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { CategoryInterface } from '../interfaces/category.interface';
import { SurveyItem } from '../interfaces/surveys.interface';

@Pipe({
  name: 'filterValue',
})
export class FilterValuePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: any, key: any, surveys: SurveyItem[], categories: CategoryInterface[]): unknown {
    switch (key) {
      case 'order_unlocked_on_top':
        var boolText = value === 'true' ? 'yes' : 'no';
        return this.translate.instant(
          'global_filter.filter_tabs.order_group.unlocked_on_top_' + boolText,
        );

      case 'order':
        return this.translate.instant(
          'global_filter.filter_tabs.order_group.order.' + value.toLowerCase(),
        );

      case 'orderby':
        return this.translate.instant('global_filter.filter_tabs.order_group.orderby.' + value);

      case 'tags':
        return categories.find((category: CategoryInterface) => category.id === value)?.tag;

      case 'center_point':
        return this.translate.instant('global_filter.filter_tabs.location_value', {
          value: `${value.location?.lat} ${value.location?.lng}`,
          km: value.distance,
        });

      case 'date_before':
        return dayjs(value).format('MMM D, YYYY');

      case 'date_after':
        return dayjs(value).format('MMM D, YYYY');

      case 'status':
        return this.translate.instant('post.' + value);

      case 'form':
        return surveys.find((survey: SurveyItem) => survey.id === value)?.name;

      default:
        return value;
    }
  }
}
