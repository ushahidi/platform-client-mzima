import { Component, QueryList, ViewChildren } from '@angular/core';
import { CategoryItemComponent } from './category-item/category-item.component';
import { apiHelpers, CategoriesService, CategoryInterface } from '@mzima-client/sdk';
import { forkJoin } from 'rxjs';
import { ConfirmModalService, NotificationService } from '@services';
import { TranslateService } from '@ngx-translate/core';

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
  ) {
    this.getCategories();
  }

  public getCategories(): void {
    this.categoriesService
      .getCategories({ only: apiHelpers.ONLY.TAG_ID_PARENTID_PARENT_SLUG_CHILDREN })
      .subscribe({
        next: (data) => {
          this.categories = data.results;
        },
      });
  }

  public displayChildren(id: number) {
    if (this.isShowActions) {
      return true;
    } else {
      return this.openedParents.includes(id);
    }
  }

  public toggleChildren(id: number) {
    const index = this.openedParents.indexOf(id);
    if (index > -1) {
      this.openedParents.splice(index, 1);
    } else {
      this.openedParents.push(id);
    }
  }

  public async deleteCategories() {
    const messages = this.confirmationMessages();
    const confirmed = await this.confirmModalService.open({
      title: messages.title,
      description: messages.description,
      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
    if (!confirmed) return;
    forkJoin(this.selectedCategories.map((cat) => this.categoriesService.delete(cat.id))).subscribe(
      {
        complete: () => {
          this.getCategories();
          this.selectedCategories = [];
          this.notificationService.showError(messages.toast);
        },
      },
    );
  }

  public confirmationMessages(): { title: string; description: string; toast: string } {
    const isBulk = this.selectedCategories.length > 1;
    const count = this.selectedCategories.length;
    return {
      title: this.getMessage('destroy_confirm', isBulk, count),
      description: this.getMessage('destroy_confirm_desc', isBulk, count),
      toast: this.getMessage('destroy_success', isBulk, count),
    };
  }

  private getMessage(baseKey: string, isBulk: boolean = false, count?: number): string {
    const prefix = isBulk ? 'bulk_' : '';
    const countProperty = count !== undefined ? { count: count } : {};
    return this.translate.instant(`notify.category.${prefix}${baseKey}`, countProperty);
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
    if (cat.children.length) {
      cat.children.forEach((child) => {
        if (i < 0) {
          const c = this.selectedCategories.findIndex((sC) => sC.id === child.id);
          if (c < 0) {
            this.selectedCategories.push(child);
          }
        } else {
          this.selectedCategories = this.selectedCategories.filter((sC) => sC.id !== child.id);
        }
      });
    }
  }
}
