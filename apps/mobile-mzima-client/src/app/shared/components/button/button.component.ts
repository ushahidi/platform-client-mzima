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
    | 'gray'
    | 'custom' = 'primary';
  @Input() public type: 'submit' | 'button' = 'button';
  @Input() public expand: 'block' | 'inline' = 'block';
  @Input() public size: 'small' | 'default' = 'default';
  @Input() public shape: 'round' | 'normal' = 'round';
  @Input() public disabled = false;
  @Input() public radius = '100px';
  @Input() public shadow = false;
  @Input() public height = '40px';
  @Input() public iconName?: string;
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
