import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@services';
import { arrayHelpers } from '@helpers';

@Component({
  selector: 'app-data-sources',
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss'],
})
export class DataSourcesComponent implements OnInit {
  public isAllProvidersAdded: boolean;
  public providersData: any;

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.getProvidersList();
  }

  public getProvidersList() {
    this.configService.getProvidersData().subscribe({
      next: (providers) => {
        this.providersData = arrayHelpers.sortArray(providers, 'label');
        this.isAllProvidersAdded = !!this.providersData.filter((el: any) => !el.value);
        console.log(this.isAllProvidersAdded);
      },
    });
  }
}
