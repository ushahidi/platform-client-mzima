import { Component } from '@angular/core';
import { SurveyItem } from '@models';
import { SurveysService } from '@services';

@Component({
  selector: 'app-add-post-modal',
  templateUrl: './add-post-modal.component.html',
  styleUrls: ['./add-post-modal.component.scss'],
})
export class AddPostModalComponent {
  public types: SurveyItem[];

  constructor(private surveysService: SurveysService) {
    this.getPostAllowedTypes();
  }

  private getPostAllowedTypes(): void {
    this.surveysService.get().subscribe({
      next: (types) => {
        this.types = types.results || [];
      },
    });
  }
}
