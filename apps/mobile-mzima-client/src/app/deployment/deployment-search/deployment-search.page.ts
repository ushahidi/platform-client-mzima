import { Component } from '@angular/core';

@Component({
  selector: 'app-deployment-search',
  templateUrl: './deployment-search.page.html',
  styleUrls: ['./deployment-search.page.scss'],
})
export class DeploymentSearchPage {
  query: string;
  deploymentList: any[] = [
    { id: 1, icon: '', name: 'Kenya Election #1', server: 'kenyaelection.ushahidi.io' },
    { id: 2, icon: '', name: 'Kenya #2', server: 'kenyaelection.ushahidi.io' },
  ];

  updateSearch() {}

  onInputQuery() {
    console.log(this.query);
  }

  onBack() {}
}
