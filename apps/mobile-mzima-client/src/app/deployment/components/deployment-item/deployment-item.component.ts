import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-deployment-item',
  templateUrl: './deployment-item.component.html',
  styleUrls: ['./deployment-item.component.scss'],
})
export class DeploymentItemComponent {
  @Input() deployment: any = new Map();
}
