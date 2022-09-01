import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService } from '@services';

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

  constructor(
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
  ) {}

  public getLanguage(lang: string): string {
    return lang;
  }

  public async deleteCategory(id: number): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.category.destroy_confirm'),
      description: `<p>${this.translate.instant('notify.category.destroy_confirm_desc')}</p>`,
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
