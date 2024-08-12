import { Component, HostListener, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Iti } from 'intl-tel-input';
import intlTelInput from 'intl-tel-input/intlTelInputWithUtils';

@Component({
  selector: 'app-phone-field',
  templateUrl: './phone-field.component.html',
  styleUrls: ['./phone-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneFieldComponent),
      multi: true,
    },
  ],
})
export class PhoneFieldComponent implements ControlValueAccessor, OnInit, OnDestroy {
  onChange: any = () => {};
  onTouched: any = () => {};
  phoneInput: Iti;
  value: string;
  input: HTMLInputElement;

  ngOnInit() {
    this.input = <HTMLInputElement>document.querySelector('.phone-field-input');
    this.phoneInput = intlTelInput(this.input, {
      strictMode: true,
      separateDialCode: false,
    });
    this.input.addEventListener('countrychange', () => {
      this.onChange(this.phoneInput.getNumber());
    });
  }

  writeValue(value: string): void {
    this.value = value;
    this.phoneInput.setNumber(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.phoneInput.setDisabled(isDisabled);
  }

  public handleInputChange(): void {
    this.onChange(this.phoneInput.getNumber());
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    this.input.remove();
  }
}
