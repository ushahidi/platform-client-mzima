import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { formHelper } from '@helpers';
import { AuthService, SessionService } from '@services';

@Component({
  selector: 'app-restore-password-form',
  templateUrl: './restore-password-form.component.html',
  styleUrls: ['./restore-password-form.component.scss'],
})
export class RestorePasswordFormComponent implements OnInit {
  @Output() passwordRestored = new EventEmitter();
  public resetForm: FormGroup;
  public formError: string;
  public isPasswordVisible: boolean;
  public matcher = new formHelper.FormErrorStateMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private session: SessionService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.resetForm = this.formBuilder.group(
      {
        token: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
        confirmPassword: [
          '',
          [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
        ],
      },
      { validators: this.checkPasswords },
    );
  }

  ngOnInit() {
    this.session.getCurrentUserData().subscribe((userData) => {
      if (userData.userId) {
        // redirect to settings if you are logged in
        this.router.navigate(['/', 'settings', 'general']);
      }
    });
    this.route.queryParams.subscribe((params) => {
      this.resetForm.patchValue({
        token: params['token'],
      });
    });
  }

  private checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) return null;
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  };

  public getErrorMessage(field: string): string {
    switch (field) {
      case 'token':
        return this.authService.getControlError(this.resetForm, field, ['required', 'pattern']);
      case 'password':
        return this.authService.getControlError(this.resetForm, field, [
          'required',
          'minlength',
          'maxlength',
        ]);
      case 'confirmPassword':
        return this.authService.getControlError(this.resetForm, field, [
          'required',
          'minlength',
          'maxlength',
        ]);
      default:
        return '';
    }
  }

  public restorePassword(): void {
    const { token, password } = this.resetForm.value;
    this.resetForm.disable();

    this.authService.restorePassword({ token, password }).subscribe({
      next: () => {
        this.passwordRestored.emit('restored');
      },
      error: (err) => {
        this.formError = err.error?.errors[1]?.message;
        this.resetForm.enable();
        setTimeout(() => (this.formError = ''), 4000);
      },
    });
  }

  public togglePasswordVisible(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
