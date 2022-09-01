import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { CategoriesService, ConfirmModalService } from '@services';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent {
  public category: CategoryInterface;
  public isFormOnSubmit: boolean;
  public categoryId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
  ) {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    this.categoriesService.getById(this.categoryId).subscribe({
      next: (data) => {
        this.category = data.result;
        console.log('category: ', this.category);
      },
    });
  }

  public updateCategory(data: any): void {
    this.isFormOnSubmit = true;

    this.categoriesService.update(this.categoryId, data).subscribe({
      next: () => {
        this.isFormOnSubmit = false;
        this.router.navigate(['settings/categories']);
      },
    });
  }

  public async deleteCategory(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.category.destroy_confirm'),
      description: `<p>${this.translate.instant('notify.category.destroy_confirm_desc')}</p>`,
    });
    if (!confirmed) return;

    this.categoriesService.delete(this.categoryId).subscribe({
      next: () => {
        this.router.navigate(['settings/categories']);
      },
    });
  }
}
