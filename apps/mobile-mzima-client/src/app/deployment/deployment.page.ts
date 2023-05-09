import { Component } from '@angular/core';

@Component({
  selector: 'app-deployment',
  templateUrl: './deployment.page.html',
  styleUrls: ['./deployment.page.scss'],
})
export class DeploymentPage {
  deploymentList: any[] = [
    { id: 1, icon: '', name: 'Kenya Election #1', server: 'kenyaelection.ushahidi.io' },
    { id: 2, icon: '', name: 'Kenya #2', server: 'kenyaelection.ushahidi.io' },
  ];
}
