import { Component, OnInit } from '@angular/core';
import { SurveyItem } from '@models';
import { combineLatest } from 'rxjs';
import { ConfigService, DataSourcesService } from '@services';
import { DataSourceOptions } from '../../core/interfaces';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  public dataSourceList: any[] = [];
  public surveyList: SurveyItem[] = [];
  public surveyAttributesList: any;
  public isAllProvidersAdded: boolean;

  constructor(
    private dataSourcesService: DataSourcesService,
    private configService: ConfigService,
  ) {}

  ngOnInit() {
    this.getProvidersList();
  }

  public getProvidersList() {
    const tempControls: any[] = [];

    const dataSourceData$ = this.configService.getProvidersData();
    const dataSourceList$ = this.dataSourcesService.getDataSource();

    combineLatest([dataSourceData$, dataSourceList$]).subscribe({
      next: ([dataSourceData, dataSourceList]) => {
        console.log('dataSourceList', dataSourceList.results);
        console.log(dataSourceData.providers);

        this.isAllProvidersAdded = !Object.values(dataSourceData.providers).includes(false);

        for (const dataSourceKey in dataSourceData) {
          const item = dataSourceList.results.find((el: { id: string }) => el.id === dataSourceKey);
          if (item) {
            const dataSourceDataItem = dataSourceData[item.id];
            for (const dataKey in item.options) {
              const key = dataKey as string;
              const ctrl = item.options[key as keyof DataSourceOptions];

              if (ctrl?.rules) {
                const rule = ctrl.rules.map((el: string) => ({ [el]: true }));
                ctrl.control_rules = rule;
                ctrl.control_label = dataKey;

                if (dataSourceDataItem.hasOwnProperty(dataKey) && dataSourceKey === item.id) {
                  ctrl.control_value = dataSourceDataItem[dataKey] || null;
                }
              }
            }

            item.control_options = Object.values(item.options);
            item.available_provider = dataSourceData.providers[dataSourceKey];
            item.visible_survey = !!Object.keys(dataSourceData[dataSourceKey]).length;

            let inboundFieldsArr: any[] = [];
            for (const dataKey in item.inbound_fields) {
              inboundFieldsArr.push({
                form_label: dataKey.toLowerCase(),
                type: item.inbound_fields[dataKey],
              });
            }
            item.inbound_fields = inboundFieldsArr;
            tempControls.push(item);
          }
          // console.log(item);
        }
        this.dataSourceList = tempControls.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
      },
    });
  }
}
