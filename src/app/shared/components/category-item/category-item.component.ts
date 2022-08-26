import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryInterface } from 'src/app/core/interfaces/categories.interface';
import { ConfirmModalService } from 'src/app/core/services/confirm-modal.service';

@Component({
  selector: 'app-category-item',
  templateUrl: './category-item.component.html',
  styleUrls: ['./category-item.component.scss'],
})
export class CategoryItemComponent {
  @Input() public category: CategoryInterface;
  @Output() selected = new EventEmitter<{ value: boolean; id: number }>();
  @Output() deleted = new EventEmitter<{ id: number }>();
  public isSelected: boolean;

  constructor(private confirmModalService: ConfirmModalService) {}

  public getLanguage(lang: string): string {
    return lang;
  }

  public async deleteCategory(id: number): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: 'Are you sure you want to delete this category?',
      description:
        'Deleting this category will remove it from all existing posts. This action cannot be undone.',
    });
    if (!confirmed) return;
    this.deleted.emit({ id });
  }

  public selectCategory(): void {
    this.selected.emit({ value: this.isSelected, id: this.category.id });
  }

  public select(): void {
    if (this.isSelected) return;
    this.isSelected = true;
    this.selectCategory();
  }

  public deselect(): void {
    if (!this.isSelected) return;
    this.isSelected = false;
    this.selectCategory();
  }
}
