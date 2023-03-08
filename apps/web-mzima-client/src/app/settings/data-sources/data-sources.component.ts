import { Component, OnInit } from '@angular/core';
// import { ConfigService, DataSourcesService, BreakpointService } from '@services';
import { arrayHelpers } from '@helpers';
import { Observable, switchMap } from "rxjs";
import {ConfigService} from "../../core/services/config.service";
import {DataSourcesService} from "../../core/services/data-sources.service";
import {BreakpointService} from "../../core/services/breakpoint.service";

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
      .pipe(switchMap((dataSources) => this.configService.getProvidersData(false, dataSources)))
      .subscribe({
        next: (providers) => {
          this.providersData = arrayHelpers.sortArray(providers, 'label');
          this.isAllProvidersAdded = !!this.providersData.filter((el: any) => !el.value);
        },
      });
  }
}
