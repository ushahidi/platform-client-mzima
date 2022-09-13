import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryInterface, PostResult, SurveyItem } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, SurveysService } from '@services';
import { CollectionsModalComponent } from '../collections-modal/collections-modal.component';

@Component({
  selector: 'app-post-details',
  templateUrl: './post-details.component.html',
  styleUrls: ['./post-details.component.scss'],
})
export class PostDetailsComponent implements OnInit {
  @Input() post: PostResult;
  @Input() feedView: boolean;
  public survey: SurveyItem;

  constructor(
    private surveysService: SurveysService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private confirmModalService: ConfirmModalService,
  ) {}

  ngOnInit(): void {
    if (this.post.form_id) {
      this.surveysService.getById(this.post.form_id).subscribe({
        next: (response) => {
          this.survey = response.result;
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

  public addToCollection(): void {
    this.dialog.open(CollectionsModalComponent, {
      width: '100%',
      maxWidth: 480,
      height: 'auto',
      maxHeight: '90vh',
      data: {
        title: this.translate.instant('app.edit_collection'),
      },
    });
  }

  public async deletePost(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.post.destroy_confirm'),
      description: this.translate.instant('notify.default.proceed_warning'),
    });
    if (!confirmed) return;
    console.log('delete post');
  }
}
