import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryInterface } from '@mzima-client/sdk';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent {
  isChecked = false;
  constructor(private router: Router) {}
  @Input() public category: CategoryInterface;
  @Input() public customClass: string;
  @Input() public isCheckbox: boolean;
  @Input() public displayChildren: boolean;
  @Output() public selected = new EventEmitter<CategoryInterface>();
  @Output() public toggle = new EventEmitter();

  selectCategory(cat: CategoryInterface) {
    this.selected.emit(cat);
  }

  public gotoCategory(id: number) {
    this.router.navigate(['/settings/categories', id]);
  }

  public toggleChildren(id: number) {
    this.toggle.emit(id);
  }

  public hasChildren(cat: CategoryInterface) {
    return cat.children.length > 0;
  }
}
