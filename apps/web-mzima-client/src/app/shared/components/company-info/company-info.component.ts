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
  // Added to keep track of the arrow down icon in the expansion panel whether it is expanded or collapsed
  public expanded: boolean = false;

  public isDescriptionOpen = true;

  constructor(private sessionService: SessionService) {
    const isDescriptionOpen = localStorage.getItem('is_description_open');
    this.isDescriptionOpen = isDescriptionOpen ? JSON.parse(isDescriptionOpen) : true;

    this.sessionService.deploymentInfo$.pipe(untilDestroyed(this)).subscribe({
      next: (deploymentInfo) => {
        this.title = deploymentInfo.title;
        this.description = deploymentInfo.description;
        this.logo = deploymentInfo.logo;
      },
    });
  }

  public descriptionToggleHandle(state: boolean) {
    // Changes expanded to true or false
    this.expanded = !this.expanded;
    localStorage.setItem('is_description_open', JSON.stringify(state));
  }
}
