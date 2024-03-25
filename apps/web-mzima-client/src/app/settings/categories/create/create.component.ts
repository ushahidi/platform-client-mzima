import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService } from '@mzima-client/sdk';
import { NotificationService } from '@services'; // Import the NotificationService

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
    private notificationService: NotificationService, // Inject the NotificationService
  ) {}

  public createCategory(category: any): void {
    this.isFormOnSubmit = true;

    this.categoriesService.post(category).subscribe({
      next: () => {
        this.isFormOnSubmit = false;
        this.router.navigate(['settings/categories']);
        this.showSuccessNotification('Category successfully created'); // Trigger success notification
      },
      error: ({ error }) => {
        this.categoriesService.categoryErrors.next(error.errors.failed_validations);
        this.isFormOnSubmit = false;
      },
    });
  }

  private showSuccessNotification(message: string): void {
    this.notificationService.showSuccess(message); // Call the showSuccess method from the NotificationService
  }
}
