import { Component } from '@angular/core';
import { SurveysService, SurveyItem, generalHelpers } from '@mzima-client/sdk';

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
        this.types.map((el) => {
          el.visible =
            el.everyone_can_create ||
            el.can_create.includes(
              localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}role`),
            );
        });
      },
    });
  }
}
