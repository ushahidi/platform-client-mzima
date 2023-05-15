import { Component, Input } from '@angular/core';

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

  indeterminateState: boolean;

  checkCheckbox(item: any, event: any) {
    console.log('item', item);
    console.log('checkCheckbox', event.target.checked);
  }
}
