import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BreakpointService, SessionService } from '@services';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BaseComponent {
  public isSignupActive: boolean;
  public isDisableClose: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private matDialogRef: MatDialogRef<LoginComponent>,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
    this.isSignupActive = this.data.isSignupActive;
    this.isDisableClose = this.data.isDisableClose;
  }

  loadData(): void {}

  public cancel(): void {
    this.matDialogRef.close('cancel');
  }

  public successfully(state: boolean): void {
    this.matDialogRef.close(state);
  }
}
