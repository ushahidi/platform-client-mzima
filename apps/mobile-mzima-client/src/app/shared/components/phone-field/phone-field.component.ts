import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import intlTelInput from 'intl-tel-input';

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
export class PhoneFieldComponent implements ControlValueAccessor, OnInit {
  private value: string;

  ngOnInit() {
    const input = <Element>document.querySelector('.phone-field-input');
    intlTelInput(input, {
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.8.0/build/js/utils.js',
    });
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    throw new Error('Method not implemented.' + fn);
  }

  registerOnTouched(fn: any): void {
    throw new Error('Method not implemented.' + fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.' + isDisabled);
  }
}
