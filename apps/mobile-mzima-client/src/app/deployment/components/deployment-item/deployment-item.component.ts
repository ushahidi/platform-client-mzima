import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-deployment-item',
  templateUrl: './deployment-item.component.html',
  styleUrls: ['./deployment-item.component.scss'],
})
export class DeploymentItemComponent {
  @Input() deployment: any = new Map();
  @Input() buttonVisible = true;
  @Input() checkboxVisible = false;
  @Input() isBackgroundVisible = true;
  @Input() isBorderVisible = true;
  @Output() selectedDeployment = new EventEmitter();

  indeterminateState: boolean;

  selectDeployment(event: any, deployment: any) {
    this.selectedDeployment.emit({ checked: !event.target.checked, deployment });
  }

  removeDeployment(event: any, deployment: any) {
    event.stopPropagation();
    this.selectedDeployment.emit({ checked: false, deployment });
  }
}
