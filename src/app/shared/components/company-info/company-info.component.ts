import { Component } from '@angular/core';
import { SessionService } from '@services';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
})
export class CompanyInfoComponent {
  public logo: string;
  public title: string;
  public description: string;

  public isDescriptionOpen = true;

  constructor(private sessionService: SessionService) {
    const isDescriptionOpen = localStorage.getItem('is_description_open');
    this.isDescriptionOpen = isDescriptionOpen ? JSON.parse(isDescriptionOpen) : true;

    this.sessionService.deploymentInfo$.subscribe({
      next: (deploymentInfo) => {
        this.title = deploymentInfo.title;
        this.description = deploymentInfo.description;
        this.logo = deploymentInfo.logo;
      },
    });
  }

  public descriptionToggleHandle(state: boolean) {
    localStorage.setItem('is_description_open', JSON.stringify(state));
  }
}
