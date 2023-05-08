import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() public fill: 'solid' | 'outline' | 'clear' = 'solid';
  @Input() public color:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'light'
    | 'medium'
    | 'dark'
    | 'custom' = 'primary';
  @Input() public type: 'submit' | 'button' = 'button';
  @Input() public expand: 'block' | 'inline' = 'block';
  @Input() public radius = '100px';
  @Input() public disabled = false;
  @Input() public shadow = false;
  @Output() public buttonClick = new EventEmitter<Event>();

  public onClick(event: Event): void {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    } else {
      event.stopPropagation();
      event.preventDefault();
    }
  }
}
