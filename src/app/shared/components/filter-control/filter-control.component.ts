import { FlatTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { BreakpointService } from '@services';
import { MatButton } from '@angular/material/button';
import { fromEvent } from 'rxjs';
dayjs.extend(customParseFormat);

export enum FilterType {
  Select = 'select',
  Multiselect = 'multiselect',
  Multilevelselect = 'multilevelselect',
  Daterange = 'daterange',
  Location = 'location',
}

interface CategoryFlatNode {
  expandable: boolean;
  name: string;
  id: string;
  level: number;
}

@Component({
  selector: 'app-filter-control',
  templateUrl: './filter-control.component.html',
  styleUrls: ['./filter-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FilterControlComponent,
    },
  ],
})
export class FilterControlComponent implements ControlValueAccessor, OnChanges, AfterViewInit {
  @Input() public badge?: string | number | null;
  @Input() public options: any[];
  @Input() public type: FilterType;
  @Input() public title: string;
  @Input() public canEdit?: boolean;
  @Input() public fields: string[] = ['id', 'name'];
  @Output() public filterChange = new EventEmitter();
  @Output() public editOption = new EventEmitter();
  @Output() public clear = new EventEmitter();
  @ViewChild('calendar') public calendar: any;
  @ViewChild('button') public button: MatButton;
  public isDesktop$ = this.breakpointService.isDesktop$;
  public value: any;
  public calendarValue = {
    start: '',
    end: '',
  };
  public filterType = FilterType;

  public touched = false;
  public disabled = false;
  public isModalOpen: boolean;
  public buttonWidth = 200;

  constructor(private breakpointService: BreakpointService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buttonWidth = this.button._elementRef?.nativeElement.clientWidth ?? 0;
    }, 500);

    fromEvent(window, 'resize').subscribe({
      next: () => {
        this.buttonWidth = this.button._elementRef?.nativeElement.clientWidth ?? 0;
      },
    });
  }

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      id: node.id,
      level: level,
    };
  };

  isEditable(option: any) {
    return option.allowed_privileges.includes('update') && this.value === option.id;
  }

  public treeControl = new FlatTreeControl<CategoryFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );
  public dataSource: any;

  onChange = (value: any) => {
    console.log(value);
  };

  onTouched = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']?.currentValue) {
      if (this.type === FilterType.Multilevelselect) {
        setTimeout(() => {
          this.dataSource = new MatTreeFlatDataSource(
            this.treeControl,
            this.treeFlattener,
            changes['options'].currentValue || [],
          );
        }, 10);
      }
    }
  }

  public hasChild = (_: number, node: CategoryFlatNode) => node.expandable;

  public writeValue(value: any) {
    if (this.type === this.filterType.Daterange) {
      this.value = new DateRange<Date>(new Date(value.start), new Date(value.end));
    } else {
      this.value = value;
    }
  }

  public valueChanged(): void {
    this.markAsTouched();
    this.onChange(this.value);
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  public selectedChange(date: any): void {
    if (!this.value.start) {
      this.value.start = date;
    } else if (!this.value.end && date > this.value.start) {
      this.value.end = date;
    } else {
      this.value.start = date;
      this.value.end = null;
    }

    this.calendarValue = {
      start: dayjs(this.value.start).format('DD-MM-YYYY'),
      end: this.value.end ? dayjs(this.value.end).format('DD-MM-YYYY') : '',
    };

    this.value = new DateRange(this.value.start, this.value.end);
    this.markAsTouched();
    this.onChange(this.value);
  }

  public calendarInputChangeHandle(): void {
    let start: Date | null = new Date(dayjs(this.calendarValue.start, 'DD-MM-YYYY').toDate()),
      end: Date | null = new Date(dayjs(this.calendarValue.end, 'DD-MM-YYYY').toDate());

    if (start > end) {
      end = null;
      this.calendarValue.end = '';
    }

    this.value = new DateRange<Date>(start, end);
  }

  public toggleModal(value?: boolean): void {
    this.isModalOpen = value ?? !this.isModalOpen;
  }

  public apply(): void {
    this.toggleModal(false);
    this.filterChange.emit(true);
  }

  public clearFilter(): void {
    this.clear.emit();
  }
}
