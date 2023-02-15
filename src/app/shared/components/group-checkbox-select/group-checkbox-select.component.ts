import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

export interface GroupCheckboxItemInterface {
  name: string;
  value: string | number;
  icon?: string;
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
}

@Component({
  selector: 'app-group-checkbox-select',
  templateUrl: './group-checkbox-select.component.html',
  styleUrls: ['./group-checkbox-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: GroupCheckboxSelectComponent,
    },
  ],
})
export class GroupCheckboxSelectComponent implements ControlValueAccessor {
  @Input() data: GroupCheckboxItemInterface[] = [];
  @Input() isIconVisible = false;
  public value: GroupCheckboxValueInterface = {
    value: '',
    options: [],
  };
  public touched = false;
  public disabled = false;

  onTouched = () => {};

  onChange = (values: any) => {
    console.log(values);
  };

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  writeValue(value: GroupCheckboxValueInterface) {
    if (!value) return;
    this.value = value;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public radioGroupChange(event: MatRadioChange): void {
    this.value.value = event.value;
    this.value.options = (
      this.data
        .find((item) => item.value === this.value.value)
        ?.options?.filter((option) => option.checked) || []
    ).map(({ value }) => value);
    this.onChange(this.value);
  }
}
