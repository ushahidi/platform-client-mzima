import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesService } from '@mzima-client/sdk';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  public isFormOnSubmit: boolean;

  constructor(private categoriesService: CategoriesService, private router: Router) {}

  public createCategory(category: any): void {
    this.isFormOnSubmit = true;

    this.categoriesService.post(category).subscribe({
      next: () => {
        this.isFormOnSubmit = false;
        this.router.navigate(['settings/categories']);
      },
    });
  }
}
