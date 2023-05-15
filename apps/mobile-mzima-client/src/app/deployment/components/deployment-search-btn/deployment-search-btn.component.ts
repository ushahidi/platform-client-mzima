import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deployment-search-btn',
  templateUrl: './deployment-search-btn.component.html',
  styleUrls: ['./deployment-search-btn.component.scss'],
})
export class DeploymentSearchBtnComponent {
  @ViewChild('searchContainer') logo: ElementRef;

  constructor(private router: Router) {}

  public goToSearchDeployment() {
    this.router.navigate(['/deployment-search']);
  }
}
