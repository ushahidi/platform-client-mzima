import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

export interface MultilevelSelectOption {
  name: string;
  id: number | string;
  children?: Omit<MultilevelSelectOption, 'children'>[];
}

interface CategoryFlatNode {
  expandable: boolean;
  name: string;
  id: string | number;
  level: number;
}

@Component({
  selector: 'app-multilevel-select',
  templateUrl: './multilevel-select.component.html',
  styleUrls: ['./multilevel-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MultilevelSelectComponent),
    },
  ],
})
export class MultilevelSelectComponent implements ControlValueAccessor, OnChanges {
  @Input() public data: MultilevelSelectOption[] = [];
  @Input() public placeholder: string;
  @Input() public label: string;
  public values: number[] = [];
  public touched = false;
  public disabled = false;
  public value = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener,
        changes['data'].currentValue || [],
      );
    }
  }

  private _transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      id: node.id,
      level: level,
    };
  };

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

  writeValue(value: any) {
    this.values = value;
  }

  public getNames(): string {
    return (
      this.values
        ?.reduce((acc: string[], id: number) => {
          const name = this.dataSource.data.find(
            (option: MultilevelSelectOption) => option.id === id,
          )?.name;
          return name ? [...acc, name] : acc;
        }, [])
        .join(', ') || ''
    );
  }

  public hasChild = (_: number, node: CategoryFlatNode) => node.expandable;

  public changed(): void {
    this.markAsTouched();
    this.value = this.getNames();
    this.onChange(this.values);
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
