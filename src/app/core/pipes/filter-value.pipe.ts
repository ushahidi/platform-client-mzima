import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Pipe({
  name: 'filterValue',
})
export class FilterValuePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: any, key: any): unknown {
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

      // case 'tags':
      //   return tags[value] ? tags[value].tag : value;

      // case 'user':
      //   return users[value] ? users[value].realname : value;

      // case 'saved_search':
      //   if (value) {
      //       return savedSearches[value.id].name;
      //   }
      //   return '';

      // case 'set':
      //   if (value) {
      //       return collections[value.id].name;
      //   }
      //   return '';

      // case 'center_point':
      //   return this.translate.instant('global_filter.filter_tabs.location_value', {
      //       value: self.rawFilters.location_text ? this.rawFilters.location_text : value,
      //       km: self.rawFilters.within_km
      //   });

      // case 'created_before':
      //   return $filter('date', 'longdate')(value);

      // case 'created_after':
      //   return $filter('date', 'longdate')(value);

      // case 'date_before':
      //   return $filter('date', 'longdate')(value);

      // case 'date_after':
      //   return $filter('date', 'longdate')(value);

      case 'status':
        return this.translate.instant('post.' + value);

      // case 'source':
      //   return PostMetadataService.formatSource(value);

      // case 'form':
      //   return forms[value] ? forms[value].name : value;

      default:
        return value;
    }
  }
}
