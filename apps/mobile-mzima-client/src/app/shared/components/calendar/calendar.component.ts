import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {
  CalendarComponentOptions,
  CalendarComponentPayloadTypes,
  CalendarComponentTypeProperty,
} from 'ion2-calendar';
import { DateRangeFormat } from '@models';
import dayjs from 'dayjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true,
    },
  ],
})
export class CalendarComponent implements ControlValueAccessor {
  @Input() public required = false;
  @Input() public disabled = false;
  @Input() public format: string = 'YYYY-MM-DD';
  @Input() public type: CalendarComponentTypeProperty = 'string';
  public optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
    from: new Date().setFullYear(2000),
    to: new Date(),
  };
  value: DateRangeFormat;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: DateRangeFormat): void {
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

  public handleInputChange(value: CalendarComponentPayloadTypes): void {
    this.onChange(value);
  }

  public formattedDate(val: DateRangeFormat): string {
    return `${dayjs(val.from).format('MMM D, YYYY')} - ${dayjs(val.to).format('MMM D, YYYY')}`;
  }
}
