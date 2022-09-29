import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataSourceConfigInterface, SurveyItem } from '@models';
import { combineLatest } from 'rxjs';
import { ConfigService, DataSourcesService, FormsService, SurveysService } from '@services';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  public dataSourceList: any[] = [];
  public surveyList: SurveyItem[] = [];
  public isImportToSurvey = true;
  private allProvidersData: DataSourceConfigInterface;
  public surveyAttributesList: any;

  provider: any;

  constructor(
    private dataSourcesService: DataSourcesService, //
    private configService: ConfigService,
    private surveysService: SurveysService,
    private formsService: FormsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getProvidersList();
    this.getSurveys();
  }

  private getSurveys(): void {
    this.surveysService.get().subscribe({
      next: (response) => (this.surveyList = response.results),
    });
  }

  public getProvidersList() {
    const tempControls: any[] = [];
    const dataSourceData$ = this.configService.getProvidersData();
    const dataSourceList$ = this.dataSourcesService.get();
    combineLatest([dataSourceData$, dataSourceList$]).subscribe({
      next: ([dataSourceData, dataSourceList]) => {
        this.allProvidersData = dataSourceData;
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
        console.log(this.dataSourceList);
        this.provider = this.initialViewProvider('email');
        this.provider.active = true;
        console.log(this.provider);
      },
    });
  }

  initialViewProvider(providerName: string) {
    return this.dataSourceList.find((el) => el.id === providerName);
  }

  // TODO need add interface
  selectProvider(provider: any) {
    this.provider = provider;
    // console.log(this.provider);
    this.dataSourceList.map((el) => (el.active = el.id === provider.id));
  }

  getSurveyAttributes(id: number): void {
    const queryParams = {
      order: 'asc',
      orderby: 'priority',
    };
    this.formsService.getAttributes(id.toString(), queryParams).subscribe({
      next: (response) => {
        this.surveyAttributesList = response;
      },
    });
  }

  // TODO: Check the API when an endpoint object check will be added
  public changeAvailableProviders(event: any): void {
    const providers = JSON.parse(JSON.stringify(this.allProvidersData.providers));
    providers[this.provider.id] = event.checked;
    const body = { providers };
    console.log(body);
    // this.configService.updateProviders(providers).subscribe(() => this.getProvidersList());
  }

  // TODO: Check the API when an endpoint object check will be added
  saveProviderData(event: any) {
    console.log('submit > formControls', event);
    // this.configService.updateProviders(providersData).subscribe(() => this.getProvidersList());
  }

  cancel(event: any) {
    console.log(event);
    this.getProvidersList();
  }
}
