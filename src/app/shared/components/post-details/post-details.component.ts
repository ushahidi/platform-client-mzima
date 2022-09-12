import { Component, Input, OnInit } from '@angular/core';
import { CategoryInterface, PostResult, SurveyItem } from '@models';
import { SurveysService } from '@services';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent implements OnInit {
  @Input() post: PostResult;
  @Input() feedView: boolean;
  public survey: SurveyItem;

  constructor(private surveysService: SurveysService) {}

  ngOnInit(): void {
    if (this.post.form_id) {
      this.surveysService.getById(this.post.form_id).subscribe({
        next: (response) => {
          this.survey = response.result;
          console.log('survey: ', this.survey);
        },
      });
    }
  }

  public isParentCategory(
    categories: CategoryInterface[] | undefined,
    category_id: number,
  ): boolean {
    return !!categories?.find((category: CategoryInterface) => category.parent_id === category_id);
  }
}
