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
import { SelectionModel } from '@angular/cdk/collections';
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
  public checklistSelection = new SelectionModel<CategoryFlatNode>(true);

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
      this.calendarValue = {
        start: dayjs(this.value.start).format('DD-MM-YYYY'),
        end: this.value.end ? dayjs(this.value.end).format('DD-MM-YYYY') : '',
      };
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
    // utc adapter
    date = dayjs(date).add(dayjs(date).utcOffset(), 'minute').toDate();

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

  public descendantsAllSelected(option: CategoryFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(option);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  public categorySelectionToggle(node: CategoryFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  public categoryLeafSelectionToggle(option: CategoryFlatNode): void {
    this.checklistSelection.toggle(option);
    this.checkAllParentsSelection(option);
  }

  private checkAllParentsSelection(option: CategoryFlatNode): void {
    let parent: CategoryFlatNode | null = this.getParentNode(option);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  private getParentNode(option: CategoryFlatNode): CategoryFlatNode | null {
    const currentLevel = this.getLevel(option);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(option) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  private getLevel = (option: CategoryFlatNode) => option.level;

  private checkRootNodeSelection(option: CategoryFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(option);
    const descendants = this.treeControl.getDescendants(option);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(option);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(option);
    }
  }
}
