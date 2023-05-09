import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-deployment-search-btn',
  templateUrl: './deployment-search-btn.component.html',
  styleUrls: ['./deployment-search-btn.component.scss'],
})
export class DeploymentSearchBtnComponent {
  @ViewChild('searchContainer') logo: ElementRef;
}
