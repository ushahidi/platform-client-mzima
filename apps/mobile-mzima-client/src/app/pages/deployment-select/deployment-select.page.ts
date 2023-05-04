import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-deployment-select',
  templateUrl: './deployment-select.page.html',
  styleUrls: ['./deployment-select.page.scss'],
})
export class DeploymentSelectPage implements AfterViewInit {
  @ViewChild('logo') logo: ElementRef;
  @ViewChild('inputContentContainer') inputContentContainer: ElementRef;
  @ViewChild('listContentContainer') listContentContainer: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => {
      this.startAnimation();
    }, 3000);
  }

  startAnimation() {
    this.logo.nativeElement.classList.add('logo-animation');
    this.inputContentContainer.nativeElement.classList.add('input-animation');
  }
}
