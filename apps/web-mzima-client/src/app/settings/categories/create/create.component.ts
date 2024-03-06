import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService } from '@mzima-client/sdk';
import { NotificationService } from '@services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  public isFormOnSubmit: boolean;

  constructor(
    private categoriesService: CategoriesService,
    private router: Router,
    private notificationService: NotificationService,
    private translate: TranslateService,
  ) {}

  public createCategory(category: any): void {
    this.isFormOnSubmit = true;

    this.categoriesService.post(category).subscribe({
      next: () => {
        this.isFormOnSubmit = false;
        this.router.navigate(['settings/categories']);
      },
      error: ({ error }) => {
        if (error.errors[0].status === 404) {
          this.notificationService.showError(
            this.translate.instant('An error occured, please try again'),
          );
        }
        this.categoriesService.categoryErrors.next(error.errors.failed_validations);
        this.isFormOnSubmit = false;
      },
    });
  }
}
