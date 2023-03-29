import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { DateRange } from '@angular/material/datepicker';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService } from '@services';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { fromEvent, Observable } from 'rxjs';

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

@UntilDestroy()
@Component({
  selector: 'app-filter-control',
  templateUrl: './filter-control.component.html',
  styleUrls: ['./filter-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FilterControlComponent),
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
  @Input() public selectedFields: any;
  @Output() public filterChange = new EventEmitter();
  @Output() public editOption = new EventEmitter();
  @Output() public clear = new EventEmitter();
  @ViewChild('calendar') public calendar: any;
  @ViewChild('button') public button: MatButton;
  public isDesktop$: Observable<boolean>;
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
  public treeControl: FlatTreeControl<CategoryFlatNode>;

  constructor(private breakpointService: BreakpointService) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.treeControl = new FlatTreeControl<CategoryFlatNode>(this.getLevel, this.isExpandable);
  }

  private getLevel = (node: CategoryFlatNode) => node.level;
  private isExpandable = (node: CategoryFlatNode) => node.expandable;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buttonWidth = this.button._elementRef?.nativeElement.clientWidth ?? 0;
    }, 500);

    fromEvent(window, 'resize').subscribe({
      next: () => {
        this.buttonWidth = this.button._elementRef?.nativeElement.clientWidth ?? 0;
      },
    });

    if (this.selectedFields) {
      this.value = this.selectedFields;
      setTimeout(() => {
        if (this.treeControl?.dataNodes) {
          for (const node of this.treeControl.dataNodes) {
            if (this.value.includes(node.id)) {
              const { expandable, level } = node;
              !expandable && level === 0
                ? this.categorySelectionToggle(node, true)
                : this.categoryLeafSelectionToggle(node, true);
            }
          }
        }
      }, 500);
    }
  }

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

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
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

  onTouched = (value?: any) => {
    console.log(value);
  };

  public hasChild = (_: number, node: CategoryFlatNode) => node.expandable;

  public valueChanged(): void {
    this.markAsTouched();
    this.onChange(this.value);
  }

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

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  setDisabledState() {}

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
    const start: Date | null = new Date(dayjs(this.calendarValue.start, 'DD-MM-YYYY').toDate());
    let end: Date | null = new Date(dayjs(this.calendarValue.end, 'DD-MM-YYYY').toDate());

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

  /** Whether all the descendants of the node are selected. */
  public descendantsAllSelected(option: CategoryFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(option);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: CategoryFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the category item selection. Select/deselect all the descendants node */
  public categorySelectionToggle(node: CategoryFlatNode, isInit = false): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
    if (!isInit) this.selectItems(this.checklistSelection);
  }

  /** Toggle a leaf category item selection. Check all the parents to see if they changed */
  public categoryLeafSelectionToggle(option: CategoryFlatNode, isInit = false): void {
    this.checklistSelection.toggle(option);
    this.checkAllParentsSelection(option);

    if (!isInit) this.selectItems(this.checklistSelection);
  }

  private selectItems(data: any) {
    if (data) {
      this.value = this.treeControl.dataNodes
        .filter((nodeEl: any) => data.isSelected(nodeEl))
        .map((nodeEl) => nodeEl.id);
      this.onChange(this.value);
    }
  }

  /** Checks all the parents when a leaf node is selected/unselected */
  private checkAllParentsSelection(option: CategoryFlatNode): void {
    let parent: CategoryFlatNode | null = this.getParentNode(option);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Get the parent node of a node */
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

  /** Check root node checked state and change it accordingly */
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
