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
  @Output() public selected = new EventEmitter<CategoryInterface>();

  selectCategory(cat: CategoryInterface) {
    this.selected.emit(cat);
  }
}
