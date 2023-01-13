import { Component } from '@angular/core';
import { BreakpointService } from '@services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  public isPasswordSent: boolean;
  public isDesktop = false;

  constructor(private breakpointService: BreakpointService) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  public submitted(state: boolean | string): void {
    this.isPasswordSent = state === 'sent';
  }
}
