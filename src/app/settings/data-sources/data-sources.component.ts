import { Component, OnInit } from '@angular/core';
import { SurveyItem } from '@models';
import { combineLatest } from 'rxjs';
import { ConfigService, DataSourcesService } from '@services';

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

  provider: any;

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
    const dataSourceList$ = this.dataSourcesService.get();
    combineLatest([dataSourceData$, dataSourceList$]).subscribe({
      next: ([dataSourceData, dataSourceList]) => {
        for (const dataSourceKey in dataSourceData) {
          const item = dataSourceList.results.find((el: { id: string }) => el.id === dataSourceKey);
          if (item) {
            const dataSourceDataItem = dataSourceData[item.id];
            for (const dataKey in item.options) {
              const ctrl = item.options[dataKey];
              if (ctrl.rules) ctrl.rules = ctrl.rules.map((el: any) => ({ [el]: true }));
              ctrl.form_label = dataKey;
              if (dataSourceDataItem.hasOwnProperty(dataKey) && dataSourceKey === item.id) {
                ctrl.value = dataSourceDataItem[dataKey] || null;
              }
            }
            item.options = Object.values(item.options);
            item.available_provider = dataSourceData.providers[dataSourceKey];
            item.visible_survey = !!Object.keys(dataSourceData[dataSourceKey]).length;

            let inboundFieldsArr = [];
            for (const dataKey in item.inbound_fields) {
              inboundFieldsArr.push({
                form_label: dataKey.toLowerCase(),
                type: item.inbound_fields[dataKey],
              });
            }
            item.inbound_fields = inboundFieldsArr;
            tempControls.push(item);
          }
        }
        this.dataSourceList = tempControls.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
        this.isAllProvidersAdded = !this.dataSourceList.find(
          (provider) => !provider.available_provider,
        );
      },
    });
  }
}
