import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-settings-header',
  templateUrl: './settings-header.component.html',
  styleUrls: ['./settings-header.component.scss'],
})
export class SettingsHeaderComponent {
  @Input() settingsTitle: string;
  @Input() newButtonTitle: string;
  @Input() selectedItem: any;
  @Input() isShowActionsButton = true;
  @Output() isShowActionsChange = new EventEmitter();
  @Output() deleteCall = new EventEmitter();
  @Output() createCall = new EventEmitter();
  public isShowActions = false;

  public deleteEmit() {
    this.deleteCall.emit(true);
  }

  public createEmit() {
    this.createCall.emit(true);
  }

  public showActions() {
    this.isShowActionsChange.emit((this.isShowActions = !this.isShowActions));
  }
}
