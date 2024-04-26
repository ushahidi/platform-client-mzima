import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryInterface } from '@mzima-client/sdk';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent {
  @Input() public category: CategoryInterface;
  @Input() public customClass: string;
  @Input() public isCheckbox: boolean;
  @Input() public displayChildren: boolean;
  @Input() public selectedCategories: CategoryInterface[] = [];
  @Output() public selected = new EventEmitter<CategoryInterface>();
  @Output() public toggle = new EventEmitter();

  selectCategory(cat: CategoryInterface) {
    this.selected.emit(cat);
  }

  isChecked(id: number) {
    return this.selectedCategories.findIndex((sC) => sC.id === id) >= 0;
  }

  isDisabled(category: CategoryInterface) {
    if (category.parent_id && this.isChecked(category.parent_id)) return true;
    return false;
  }

  public toggleChildren(id: number) {
    this.toggle.emit(id);
  }

  public hasChildren(cat: CategoryInterface) {
    return cat.children.length > 0;
  }
}
