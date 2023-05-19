import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-form-control',
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlComponent),
      multi: true,
    },
  ],
})
export class FormControlComponent implements ControlValueAccessor {
  @Input() public label?: string;
  @Input() public placeholder: string = '';
  @Input() public hint?: string;
  @Input() public type?: 'text' | 'email' | 'password' = 'text';
  @Input() public required = false;
  @Input() public rounded = false;
  @Input() public disabled = false;
  @Input() public togglePassword = false;
  @Input() public errors: string[] = [];
  @Input() public color: 'light' | 'default' = 'default';
  public isPasswordVisible = false;
  public isOnFocus: boolean;

  value: string;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
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
    this.onChange((event.target as HTMLInputElement)?.value);
  }

  public handleBlur(): void {
    this.onTouched();
    this.isOnFocus = false;
  }

  public handleFocus(): void {
    this.isOnFocus = true;
  }
}
