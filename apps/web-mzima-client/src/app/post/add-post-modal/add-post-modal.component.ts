import { Component } from '@angular/core';
import { CONST } from '@constants';
import { SurveyItem } from '@models';
import {SurveysService} from "../../core/services/surveys.service";
// import { SurveysService } from '@services';

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
            el.everyone_can_create || !!localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}role`);
        });
      },
    });
  }
}
