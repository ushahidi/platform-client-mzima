import { Component, OnInit } from '@angular/core';
import { SurveyItem } from '@models';
import { combineLatest } from 'rxjs';
import { ConfigService, DataSourcesService, SurveysService } from '@services';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  providerName: string;
  dataSourceList: any[] = [];
  formControls: any[] = [];
  public surveyList: SurveyItem[] = [];
  isAvailableProvider = false;
  visibleSurvey = false;
  isImportToSurvey = true;
  allProvidersData: any;

  constructor(
    private dataSourcesService: DataSourcesService, //
    private configService: ConfigService,
    private surveysService: SurveysService,
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

  private getProvidersList() {
    const tempControls: any[] = [];
    const dataSourceData$ = this.configService.getProvidersData();
    const dataSourceList$ = this.dataSourcesService.get();
    combineLatest([dataSourceData$, dataSourceList$]).subscribe({
      next: ([dataSourceData, dataSourceList]) => {
        this.allProvidersData = dataSourceData;
        // console.log('dataSourceData', dataSourceData); // data-provider data
        // console.log('dataSourceList', dataSourceList.results); // dataproviders data
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
            item.availableProvider = dataSourceData.providers[dataSourceKey];
            item.visibleSurvey = !!Object.keys(dataSourceData[dataSourceKey]).length;
            tempControls.push(item);
          }
        }
        this.dataSourceList = tempControls.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
        console.log(this.dataSourceList);
        this.formControls = this.initialViewProvider('email').options;
        this.providerName = this.initialViewProvider('email').id;
        this.visibleSurvey = this.initialViewProvider('email').visibleSurvey;
        this.isAvailableProvider = this.initialViewProvider('email').isAvailableProvider;
      },
    });
  }

  initialViewProvider(providerName: string) {
    return this.dataSourceList.find((el) => el.id === providerName);
  }

  selectProvider({ id, options, visibleSurvey, availableProvider }: any) {
    this.formControls = options;
    this.providerName = id;
    this.visibleSurvey = visibleSurvey;
    this.isAvailableProvider = availableProvider;
  }

  public changeAvailableProviders(): void {
    const providers = this.allProvidersData.providers;
    providers[this.providerName] = this.isAvailableProvider;
    this.configService.updateProviders(providers).subscribe(() => this.getProvidersList());
  }

  saveProviderData(event: any) {
    console.log('submit > formControls', event);
    // * frontlinesms
    //   * form_id: 1
    //   * key: "6b0c9468-05ff-47fc-9973-e23ff7e2ef9d"
    //   * secret: "TheTuxIsTheCrux"
    //   * server_url: "https://endpoint.com
    // this.dataSourcesService.updateProviders(providers).subscribe(() => this.getProvidersList());
  }
}
