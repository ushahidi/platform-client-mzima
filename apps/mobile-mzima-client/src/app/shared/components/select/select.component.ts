import { Component, EventEmitter, Input, Output, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() public options?: { label: string; value: any }[];
  @Input() public label?: string;
  @Input() public placeholder: string = '';
  @Input() public hint?: string;
  @Input() public type?: 'text' | 'email' | 'password' = 'text';
  @Input() public required = false;
  @Input() public rounded = false;
  @Input() public disabled = false;
  @Input() public clearable = false;
  @Input() public togglePassword = false;
  @Input() public errors: string[] = [];
  @Input() public color: 'light' | 'default' = 'default';
  @Output() public inputFocus = new EventEmitter();
  @Output() public inputBlur = new EventEmitter();
  @ViewChild('input') input: IonInput;
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

  public handleSelectChange(event: Event): void {
    this.onChange((event.target as HTMLInputElement)?.value);
  }
}
