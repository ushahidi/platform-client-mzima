import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mzima-client-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() public expand = true;
  @Input() public rounded = false;
  @Input() public disabled = false;
  @Input() public iconOnly = false;
  @Input() public isActive = false;
  @Input() public download?: string;
  @Input() public tabIndex: string | number;
  @Input() public id?: string;
  @Input() public href?: string;
  @Input() public target: '_blank' | '_self' | '_parent' | '_top' = '_self';
  @Input() public ariaLabel: string;
  @Input() public dataQa: string;
  @Input() public type: 'button' | 'submit' = 'button';
  @Input() public size: 'small' | 'medium' | 'big' = 'medium';
  @Input() public fill: 'solid' | 'outline' | 'clear' = 'solid';
  @Input() public color:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'gray'
    | 'light'
    | 'light-gray'
    | 'transparent-style-1'
    | 'custom' = 'primary';
  @Output() public buttonClick = new EventEmitter<Event>();

  public onClick(event: Event): void {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    } else {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  public generateAriaLabel(): string {
    let label = '';

    // Concatenate content of the button
    label += this.id || ''; // Add button id if available
    label += ' '; // Add space separator
    label += this.type || ''; // Add button type if available
    label += ' '; // Add space separator
    // Add other relevant content, such as prefix, suffix, and text
    // You can access these properties from your component's variables

    return label.trim(); // Trim to remove trailing space
  }
}
