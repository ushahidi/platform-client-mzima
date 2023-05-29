import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CalendarComponentOptions } from 'ion2-calendar';
import dayjs from 'dayjs';

@Component({
  selector: 'app-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateSelectComponent),
      multi: true,
    },
  ],
})
export class DateSelectComponent implements ControlValueAccessor {
  // @Input() public post: PostResult;
  @Input() public disabled = false;
  public dateOption: any = 'custom';
  public optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
  };
  public selectOptions = [
    {
      value: 'week',
      label: 'Last week',
    },
    {
      value: 'month',
      label: 'Last month',
    },
    {
      value: '3_month',
      label: 'Last 3 month',
    },
    {
      value: '6_month',
      label: 'Last 6 month',
    },
    {
      value: 'year',
      label: 'Last year',
    },
    {
      value: null,
      label: 'All time',
    },
    {
      value: 'custom',
      label: 'Custom',
    },
  ];

  value?: { from: string; to: string };
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

  public dateChangeHandle(): void {
    this.dateOption = 'custom';
  }

  public setCalendar(): void {
    switch (this.dateOption) {
      case 'week':
        this.value = {
          from: dayjs().subtract(7, 'd').format('YYYY-MM-DD'),
          to: dayjs().format('YYYY-MM-DD'),
        };
        break;

      case 'month':
        this.value = {
          from: dayjs().subtract(1, 'M').format('YYYY-MM-DD'),
          to: dayjs().format('YYYY-MM-DD'),
        };
        break;

      case '3_month':
        this.value = {
          from: dayjs().subtract(3, 'M').format('YYYY-MM-DD'),
          to: dayjs().format('YYYY-MM-DD'),
        };
        break;

      case '6_month':
        this.value = {
          from: dayjs().subtract(6, 'M').format('YYYY-MM-DD'),
          to: dayjs().format('YYYY-MM-DD'),
        };
        break;

      case 'year':
        this.value = {
          from: dayjs().subtract(1, 'y').format('YYYY-MM-DD'),
          to: dayjs().format('YYYY-MM-DD'),
        };
        break;

      case null:
      case 'custom':
        this.value = undefined;
        break;

      default:
        break;
    }
  }
}
