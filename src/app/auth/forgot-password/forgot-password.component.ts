import { Component } from '@angular/core';
import { BreakpointService } from '@services';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  public isDesktop$ = this.breakpointService.isDesktop$;
  public isPasswordSent: boolean;

  constructor(private breakpointService: BreakpointService) {}

  public submitted(state: boolean | string): void {
    this.isPasswordSent = state === 'sent';
  }
}
