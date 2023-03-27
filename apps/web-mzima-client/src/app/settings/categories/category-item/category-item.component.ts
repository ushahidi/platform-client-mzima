import { Component, Input } from '@angular/core';
import { CategoryInterface } from '@mzima-client/sdk';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent {
  @Input() public category: CategoryInterface;
  @Input() public customClass: string;
}
