import { Component, EventEmitter, Input, Output, ViewChild, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { IonInput } from '@ionic/angular';

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
  @Input() public clearable = false;
  @Input() public readonly = false;
  @Input() public togglePassword = false;
  @Input() public errors: string[] = [];
  @Input() public color: 'light' | 'default' = 'default';
  @Input() public rows = 1;
  @Output() public inputFocus = new EventEmitter();
  @Output() public inputBlur = new EventEmitter();
  @Output() public inputClear = new EventEmitter();
  @ViewChild('input') input: IonInput;
  public isPasswordVisible = false;
  public isOnFocus: boolean;

  @Input() public value: string;
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
    this.inputBlur.emit();
  }

  public handleFocus(): void {
    this.isOnFocus = true;
    this.inputFocus.emit();
  }

  public clearInput(event?: Event): void {
    event?.stopPropagation();
    this.value = '';
    this.inputClear.emit();
  }

  public blurInput(): void {
    this.clearInput();
    this.input.getInputElement().then((el) => {
      el.blur();
    });
  }

  public setFocus(): void {
    this.input.getInputElement().then((el) => {
      el.focus();
    });
  }
}
