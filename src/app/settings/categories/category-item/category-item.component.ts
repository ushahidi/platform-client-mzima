import { Component, Input } from '@angular/core';
import { CategoryInterface } from '@models';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent {
  @Input() public category: CategoryInterface;
  @Input() public customClass: string;
}
