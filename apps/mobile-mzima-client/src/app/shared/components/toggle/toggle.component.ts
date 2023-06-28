import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() public required = false;
  @Input() public disabled = false;
  @Input() public checked: boolean;
  @Input() public type: 'item' | 'default' = 'default';
  @Output() toggleChange = new EventEmitter<boolean>();

  value: boolean;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public handleInputChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement)?.checked;
    this.onChange(isChecked);
    this.toggleChange.emit(isChecked);
  }

  public switchToggle(event: Event): void {
    if (!(event.target as HTMLElement).classList.contains('toggle-item')) return;
    this.value = !this.value;
    this.onChange(this.value);
    this.toggleChange.emit(this.value);
  }
}
