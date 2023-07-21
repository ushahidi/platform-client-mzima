import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-textarea-control',
  templateUrl: './textarea-control.component.html',
  styleUrls: ['./textarea-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaControlComponent),
      multi: true,
    },
  ],
})
export class TextareaControlComponent implements ControlValueAccessor {
  @Input() public label?: string;
  @Input() public placeholder: string = '';
  @Input() public hint?: string;
  @Input() public hintHTML?: string;
  @Input() public required = false;
  @Input() public rounded = false;
  @Input() public disabled = false;
  @Input() public clearable = false;
  @Input() public errors: string[] = [];
  @Input() public color: 'light' | 'default' = 'default';
  @Input() public rows: number = 2;
  @Output() public inputFocus = new EventEmitter();
  @Output() public inputBlur = new EventEmitter();
  @Output() public inputClear = new EventEmitter();
  @ViewChild('textarea') textarea: IonInput;
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
    this.textarea.getInputElement().then((el) => {
      el.blur();
    });
  }

  public setFocus(): void {
    this.textarea.getInputElement().then((el) => {
      el.focus();
    });
  }
}
