import { Component, OnInit } from '@angular/core';
import { arrayHelpers } from '@helpers';
import { Observable, switchMap } from 'rxjs';
import { ConfigService } from '../../core/services/config.service';
import { DataSourcesService } from '@mzima-client/sdk';
import { BreakpointService } from '@services';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  public isDesktop$: Observable<boolean>;
  public isAllProvidersAdded: boolean;
  public providersData: any;

  constructor(
    private configService: ConfigService,
    private dataSourcesService: DataSourcesService,
    private breakpointService: BreakpointService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$;
  }

  ngOnInit() {
    this.getProvidersList();
  }

  public getProvidersList() {
    this.dataSourcesService
      .getDataSource()
      .pipe(switchMap((dataSources) => this.configService.getProvidersData(dataSources)))
      .subscribe({
        next: (providers) => {
          this.providersData = arrayHelpers.sortArray(
            providers.filter((provider: any) => provider.enabled),
            'name',
          );
          this.isAllProvidersAdded = !!this.providersData.find(
            (provider: any) => !provider.enabled,
          );
        },
      });
  }
}
