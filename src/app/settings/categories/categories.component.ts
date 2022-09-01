import { Component, QueryList, ViewChildren } from '@angular/core';
import { CategoryInterface } from '@models';
import { forkJoin } from 'rxjs';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ConfirmModalService } from 'src/app/core/services/confirm-modal.service';
import { CategoryItemComponent } from 'src/app/shared/components/category-item/category-item.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  @ViewChildren('categoryItem') categoryItems: QueryList<CategoryItemComponent>;
  public categories: CategoryInterface[];
  public selectedCategories: number[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private confirmModalService: ConfirmModalService,
  ) {
    this.getCategories();
  }

  public getCategories(): void {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categories = data.results;
      },
    });
  }

  public getLanguage(lang: string): string {
    return lang;
  }

  public deleteCategory(event: { id: number }): void {
    const { id } = event;
    this.categoriesService.delete(id).subscribe({
      next: () => {
        this.getCategories();
      },
    });
  }

  public async deleteSelectedCategories(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: 'Are you sure you want to delete these categories?',
      description:
        'Deleting these categories will remove it from all existing posts. This action cannot be undone.',
    });
    if (!confirmed) return;
    // FIXME: delete categories by array of IDs

    forkJoin(this.selectedCategories.map((c) => this.categoriesService.delete(c))).subscribe({
      complete: () => {
        this.selectedCategories = [];
        this.getCategories();
      },
    });

    // this.selectedCategories.map((category, index) => {
    //   this.categoriesService.delete(category).subscribe({
    //     next: () => {
    //       if (index === this.selectedCategories.length - 1) {
    //         this.getCategories();
    //         this.selectedCategories = [];
    //       }
    //     },
    //   });
    // });
  }

  public selectCategory(event: { value: boolean; id: number }): void {
    const { value, id } = event;
    value
      ? this.selectedCategories.push(id)
      : this.selectedCategories.splice(this.selectedCategories.indexOf(id), 1);
  }

  public getChildCategories(id: number): CategoryInterface[] {
    return this.categories.filter((category) => category.parent_id === id);
  }

  public deselectAll(): void {
    this.categoryItems.map((category) => {
      category.deselect();
    });
  }

  public selectAll(): void {
    this.categoryItems.map((category) => {
      category.select();
    });
  }

  public createNewCategory(): void {
    console.log('createNewCategory');
  }
}
