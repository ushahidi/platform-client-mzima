import { Component, OnInit } from '@angular/core';
import { ConfigService, DataSourcesService, BreakpointService } from '@services';
import { arrayHelpers } from '@helpers';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  public isDesktop$ = this.breakpointService.isDesktop$;
  public isAllProvidersAdded: boolean;
  public providersData: any;

  constructor(
    private configService: ConfigService,
    private dataSourcesService: DataSourcesService,
    private breakpointService: BreakpointService,
  ) {}

  ngOnInit() {
    this.getProvidersList();
  }

  public getProvidersList() {
    this.dataSourcesService
      .getDataSource()
      .pipe(switchMap((dataSources) => this.configService.getProvidersData(false, dataSources)))
      .subscribe({
        next: (providers) => {
          this.providersData = arrayHelpers.sortArray(providers, 'label');
          this.isAllProvidersAdded = !!this.providersData.filter((el: any) => !el.value);
        },
      });
  }
}
