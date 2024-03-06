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
  @Output() public selected = new EventEmitter<CategoryInterface>();
  @Output() public toggle = new EventEmitter();

  selectCategory(cat: CategoryInterface) {
    this.selected.emit(cat);
  }

  public toggleChildren(id: number) {
    this.toggle.emit(id);
  }

  public hasChildren(cat: CategoryInterface) {
    return cat.children.length > 0;
  }
}
