import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
})
export class RadioComponent {
  @Input() public value?: string | number | null;
  @Input() public editable = false;
  @Input() public deletable = false;
  @Output() optionDelete = new EventEmitter();
  @Output() optionEdit = new EventEmitter();

  public deleteHandle(): void {
    this.optionDelete.emit();
  }

  public editHandle(): void {
    this.optionEdit.emit();
  }
}
