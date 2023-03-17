import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

export interface MultilevelSelectionOption {
  name: string;
  id: number | string;
  children?: Omit<MultilevelSelectionOption, 'children'>[];
}

interface CategoryFlatNode {
  expandable: boolean;
  name: string;
  id: string | number;
  level: number;
}

@Component({
  selector: 'app-multilevel-selection',
  templateUrl: './multilevel-selection.component.html',
  styleUrls: ['./multilevel-selection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => MultilevelSelectionComponent),
    },
  ],
})
export class MultilevelSelectionComponent implements ControlValueAccessor, OnChanges {
  @Input() public data: any[];
  @Input() public fields: string[] = ['id', 'name'];
  public value: any;
  public touched = false;
  public disabled = false;
  public isAllSelected = false;
  public checklistSelection = new SelectionModel<CategoryFlatNode>(true);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) {
      setTimeout(() => {
        this.dataSource = new MatTreeFlatDataSource(
          this.treeControl,
          this.treeFlattener,
          changes['data'].currentValue || [],
        );
      }, 10);
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

  private onChange = (values: any) => {
    console.log(values);
  };
  private onTouched = () => {};

  public hasChild = (_: number, node: CategoryFlatNode) => node.expandable;

  public valueChanged(): void {
    this.markAsTouched();
    this.onChange(this.value);
  }

  public writeValue(value: any) {
    this.value = value;
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

  public descendantsHasSelected(option: CategoryFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(option);
    const descHasSelected =
      descendants.length > 0 &&
      !!descendants.find((child) => this.checklistSelection.isSelected(child));
    return descHasSelected;
  }

  public categorySelectionToggle(node: CategoryFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
    this.checkAllSelection();
    this.onChange(this.checklistSelection.selected.map((n) => n.id));
  }

  public categoryLeafSelectionToggle(option: CategoryFlatNode): void {
    this.checklistSelection.toggle(option);
    this.checkAllParentsSelection(option);
    this.checkAllSelection();
    this.onChange(this.checklistSelection.selected.map((node) => node.id));
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
    const descendants = this.treeControl.getDescendants(option);

    const descHasSelected =
      descendants.length > 0 &&
      !!descendants.find((child) => this.checklistSelection.isSelected(child));

    descHasSelected
      ? this.checklistSelection.select(option)
      : this.checklistSelection.deselect(option);
  }

  public toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.checklistSelection.select(...this.treeControl.dataNodes);
    } else {
      this.checklistSelection.deselect(...this.treeControl.dataNodes);
    }
    this.onChange(this.checklistSelection.selected.map((node) => node.id));
  }

  private checkAllSelection(): void {
    this.isAllSelected =
      this.checklistSelection.selected.length === this.treeControl.dataNodes.length;
  }
}
