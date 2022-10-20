import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss'],
})
export class CompanyInfoComponent {
  @Input() public logo?: string;
  @Input() public title?: string;
  @Input() public description?: string;

  public isDescriptionOpen = true;

  constructor() {
    const isDescriptionOpen = localStorage.getItem('is_description_open');
    this.isDescriptionOpen = isDescriptionOpen ? JSON.parse(isDescriptionOpen) : true;
  }

  public descriptionToggleHandle(state: boolean) {
    localStorage.setItem('is_description_open', JSON.stringify(state));
  }
}
