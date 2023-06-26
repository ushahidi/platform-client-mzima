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
  @Input() public disabled = false;
  @Input() public type: 'item' | 'default' = 'default';
  @Input() public justify: 'start' | 'end' | 'space-between' = 'start';
  @Output() optionDelete = new EventEmitter();
  @Output() optionEdit = new EventEmitter();

  public deleteHandle(): void {
    this.optionDelete.emit();
  }

  public editHandle(): void {
    this.optionEdit.emit();
  }
}
