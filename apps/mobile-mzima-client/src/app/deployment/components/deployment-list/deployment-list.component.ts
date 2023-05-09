import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-deployment-list',
  templateUrl: './deployment-list.component.html',
  styleUrls: ['./deployment-list.component.scss'],
})
export class DeploymentListComponent {
  @Input() deploymentList: any[] = [];
}
