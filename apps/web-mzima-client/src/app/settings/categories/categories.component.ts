import { Component, QueryList, ViewChildren } from '@angular/core';
import { CategoryItemComponent } from './category-item/category-item.component';
import { CategoriesService, CategoryInterface } from '@mzima-client/sdk';
import { forkJoin } from 'rxjs';
import { ConfirmModalService, NotificationService } from '@services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent {
  @ViewChildren('categoryItem') categoryItems: QueryList<CategoryItemComponent>;
  public categories: CategoryInterface[];
  selectedCategories: CategoryInterface[] = [];
  isShowActions = false;
  openedParents: [number?] = [];

  constructor(
    private categoriesService: CategoriesService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private router: Router, // Inject Router for checking the current route
  ) {
    this.getCategories();
  }

  public getCategories(): void {
    this.categoriesService.get().subscribe({
      next: (data) => {
        this.categories = data.results;
        // Show success notification only if the current route is '/create'
        if (this.router.url === '/create') {
          this.showSuccessNotification('Category successfully created');
        }
        this.updateDisplayedChildren();
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.showErrorNotification('Sorry, Not able to create the category');
      },
    });
  }

  public displayChildren(id: number): boolean {
    return this.openedParents.includes(id);
  }

  public toggleChildren(id: number): void {
    const index = this.openedParents.indexOf(id);
    if (index > -1) {
      this.openedParents.splice(index, 1);
    } else {
      this.openedParents.push(id);
    }
    this.updateDisplayedChildren();
  }

  private showSuccessNotification(key: string): void {
    this.notificationService.showSuccess(this.translate.instant(key));
  }

  private showErrorNotification(key: string): void {
    this.notificationService.showError(this.translate.instant(key));
  }

  private updateDisplayedChildren(): void {
    this.categories.forEach((category) => {
      category.displayChildren = this.openedParents.includes(category.id);
    });
  }

  public async deleteCategories() {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.category.bulk_destroy_confirm', {
        count: this.selectedCategories.length,
      }),
      description: this.translate.instant('notify.category.bulk_destroy_confirm_desc'),
      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
    if (!confirmed) return;
    forkJoin(this.selectedCategories.map((cat) => this.categoriesService.delete(cat.id))).subscribe(
      {
        complete: () => {
          this.getCategories();
          this.selectedCategories = [];
          this.notificationService.showError(
            this.translate.instant('Category has been successfully deleted'),
          );
        },
      },
    );
  }

  public showActions(event: boolean) {
    this.isShowActions = event;
    if (!event) this.selectedCategories = [];
  }

  selectCategory(cat: CategoryInterface) {
    const i = this.selectedCategories.findIndex((sC) => sC.id === cat.id);
    if (i < 0) {
      this.selectedCategories.push(cat);
    } else {
      this.selectedCategories = this.selectedCategories.filter((sC) => sC.id !== cat.id);
    }
  }
}
