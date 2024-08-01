import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

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
  writeValue(obj: any): void {
    throw new Error('Method not implemented.' + obj);
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
