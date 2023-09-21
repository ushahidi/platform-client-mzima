import { Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SessionService } from '../../../core/services/session.service';

@UntilDestroy()
@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
})
export class CompanyInfoComponent {
  public logo: string;
  public title: string;
  public description: string;
  public email: string;

  public isDescriptionOpen = true;

  constructor(private sessionService: SessionService) {
    const isDescriptionOpen = localStorage.getItem('is_description_open');
    this.isDescriptionOpen = isDescriptionOpen ? JSON.parse(isDescriptionOpen) : true;

    this.sessionService.deploymentInfo$.pipe(untilDestroyed(this)).subscribe({
      next: ({ email, title, description, logo }) => {
        this.email = email;
        this.title = title;
        this.description = description;
        this.logo = logo;
      },
    });
  }

  public descriptionToggleHandle(state: boolean) {
    localStorage.setItem('is_description_open', JSON.stringify(state));
  }
}
