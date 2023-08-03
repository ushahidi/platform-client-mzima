import { Component } from '@angular/core';
import { BreakpointService, SessionService } from '@services';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent extends BaseComponent {
  public isPasswordSent: boolean;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
  }

  loadData(): void {}

  public submitted(state: boolean | string): void {
    this.isPasswordSent = state === 'sent';
  }
}
