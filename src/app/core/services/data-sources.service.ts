import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DataSource, DataSourceOptions } from '../interfaces';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';
import { arrayHelpers } from '@helpers';

@Injectable({
  providedIn: 'root',
})
export class DataSourcesService extends ResourceService<any> {
  constructor(
    protected override httpClient: HttpClient, //
    protected override env: EnvService,
  ) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'dataproviders';
  }

  getDataSource(): Observable<DataSource> {
    return super.get().pipe(map((data) => data.results));
  }

  combineDataSource(providersData: any, dataSources: any, surveyList: any): any {
    const controls: any[] = [];
    for (const dataSourceKey in providersData.providers) {
      const item = dataSources.find((el: { id: string }) => el.id === dataSourceKey);

      if (item) {
        const dataSourceDataItem = providersData[item.id];

        for (const dataKey in item.options) {
          const key = dataKey as string;
          const ctrl = item.options[key as keyof DataSourceOptions];
          if (ctrl?.rules) {
            const rule = ctrl.rules.map((el: string) => ({ [el]: true }));
            ctrl.control_rules = rule;
          }
          ctrl!.control_label = dataKey;
          if (dataSourceDataItem?.hasOwnProperty(dataKey) && dataSourceKey === item.id) {
            ctrl!.control_value = dataSourceDataItem[dataKey] || null;
          }
        }

        item.control_options = Object.values(item.options);
        item.available_provider = providersData[dataSourceKey] || false;
        // item.visible_survey = !!providersData[dataSourceKey]?.form_id;
        // item.form_id = providersData[dataSourceKey]?.form_id || null;
        // item.selected_survey = surveyList.find(
        //   (el: { id: string }) => el.id === providersData[dataSourceKey]?.form_id,
        // ) || null;
        item.visible_survey = !!1;
        item.form_id = 1;

        item.selected_survey = surveyList.find((el: any) => el.id === 1) || null;

        let inboundFieldsArr: any[] = [];
        for (const dataKey in item.inbound_fields) {
          inboundFieldsArr.push({
            form_label: dataKey.toLowerCase(),
            type: item.inbound_fields[dataKey],
          });
        }
        item.control_inbound_fields = inboundFieldsArr;
        controls.push(item);
      }
    }
    return arrayHelpers.sortArray(controls);
  }
}
