import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
// import { RadioGroupChangeEventDetail } from '@ionic/angular';

export interface GroupCheckboxItemInterface {
  name: string;
  value: string | number;
  icon?: string;
  checked: boolean;
  disabled?: boolean;
  options?: GroupCheckboxItemOptionInterface[];
}

export interface GroupCheckboxItemOptionInterface {
  name: string;
  value: string | number;
  checked?: boolean;
  disabled?: boolean;
}

export interface GroupCheckboxValueInterface {
  value: string | number;
  options?: (string | number)[];
  disabled?: boolean;
}

@Component({
  selector: 'app-group-checkbox-select',
  templateUrl: './group-checkbox-select.component.html',
  styleUrls: ['./group-checkbox-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => GroupCheckboxSelectComponent),
    },
  ],
})
export class GroupCheckboxSelectComponent implements ControlValueAccessor {
  @Input() public data: GroupCheckboxItemInterface[] = [];
  @Input() public disabled = false;
  @Input() public value: GroupCheckboxValueInterface = {
    value: '',
    options: [],
    disabled: false,
  };
  public touched = false;

  onTouched = () => {};

  onChange: any = () => {};

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  writeValue(value: GroupCheckboxValueInterface) {
    if (!value) return;
    this.value = value;
    this.data.find((item) => item.value === value.value)!.checked = true;
    if (value.value === 'only_me') {
      this.radioGroupChanged('only_me');
    }
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public radioGroupChanged(newVal: string | number): void {
    this.data.filter((item) => item.value !== newVal).map((item) => (item.checked = false));
    this.value.value = newVal;
    this.value.options = (
      this.data
        .find((item) => item.value === this.value.value)
        ?.options?.filter((option) => option.checked) || []
    ).map(({ value }) => value);
    this.onChange(this.value);
  }

  public checkboxChanged(): void {
    this.value.options = (
      this.data
        .find((item) => item.value === this.value.value)
        ?.options?.filter((option) => option.checked) || []
    ).map(({ value }) => value);
    this.onChange(this.value);
  }
}
