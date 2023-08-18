import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { profileMenu } from '@constants';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService, SessionService, ToastService } from '@services';
import { fieldErrorMessages, regexHelper } from '@helpers';
import {
  generalHelpers,
  RolesService,
  UserDataInterface,
  UserInterfaceResponse,
  UsersService,
} from '@mzima-client/sdk';
import { SelectOptionInterface } from '@models';

@UntilDestroy()
@Component({
  selector: 'app-information',
  templateUrl: 'information.page.html',
  styleUrls: ['information.page.scss'],
})
export class InformationPage {
  public profileMenu: profileMenu.ProfileMenuItem[] = profileMenu.profileMenu;
  public profileInformationMenu = profileMenu.profileInformationMenu;
  public userPhoto: string;
  public form = this.formBuilder.group({
    realname: ['', [Validators.required]],
    role: ['', [Validators.required]],
  });
  private checkEmails: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) return null;
    return group.get('newEmail')?.value === group.get('repeatEmail')?.value
      ? null
      : { notSame: true };
  };
  private checkCurrentEmail: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) return null;
    return group.get('currentEmail')?.value === this.userEmail?.join('')
      ? null
      : { notSameAsCurrent: true };
  };
  public changeEmailForm = this.formBuilder.group(
    {
      currentEmail: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
      newEmail: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
      repeatEmail: ['', [Validators.required, Validators.pattern(regexHelper.emailValidate())]],
    },
    { validators: [this.checkEmails, this.checkCurrentEmail] },
  );
  private checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (!group) return null;
    return group.get('newPassword')?.value === group.get('repeatPassword')?.value
      ? null
      : { notSame: true };
  };
  public changePasswordForm = this.formBuilder.group(
    {
      // currentPassword: [
      //   '',
      //   [
      //     Validators.required,
      //     Validators.minLength(CONST.MIN_PASSWORD_LENGTH),
      //     Validators.maxLength(CONST.MAX_PASSWORD_LENGTH),
      //   ],
      // ],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(generalHelpers.CONST.MIN_PASSWORD_LENGTH),
          Validators.maxLength(generalHelpers.CONST.MAX_PASSWORD_LENGTH),
        ],
      ],
      repeatPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(generalHelpers.CONST.MIN_PASSWORD_LENGTH),
          Validators.maxLength(generalHelpers.CONST.MAX_PASSWORD_LENGTH),
        ],
      ],
    },
    { validators: this.checkPasswords },
  );
  public fieldErrorMessages = fieldErrorMessages;
  public roleOptions: SelectOptionInterface[] = [];
  public userEmail?: string[];
  public isChangeEmailModalOpen = false;
  public isChangePasswordModalOpen = false;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private usersService: UsersService,
    private toastService: ToastService,
    private authService: AuthService,
  ) {
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        this.userPhoto = `https://www.gravatar.com/avatar/${
          userData.gravatar || '00000000000000000000000000000000'
        }?d=retro&s=256`;

        this.form.patchValue({
          realname: userData.realname,
          role: userData.role,
        });
        this.form.controls['role'].disable();
        this.userEmail = userData.email?.split('@');
        if (this.userEmail?.length) {
          this.userEmail[1] = `@${this.userEmail[1]}`;
        }
      });
  }

  ionViewWillEnter(): void {
    this.getRoles();
  }

  public back(): void {
    this.router.navigate(['profile']);
  }

  private getRoles() {
    this.rolesService
      .getRoles()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          this.roleOptions = response.results.map((role) => ({
            value: role.name,
            label: role.display_name,
          }));
        },
      });
  }

  public async updateUserInformation(): Promise<void> {
    await this.updateFormAsync(this.form, { realname: this.form.value.realname! });
    this.form.controls['role'].disable();
  }

  public async updateUserEmail(): Promise<void> {
    await this.updateFormAsync(this.changeEmailForm, {
      email: this.changeEmailForm.value.newEmail!,
    });
    this.toggleChangeEmailModal(false);
    this.changeEmailForm.reset();
    this.changeEmailForm.markAsPristine();
  }

  public async updateUserPassword(): Promise<void> {
    await this.updateFormAsync(this.changePasswordForm, {
      password: this.changePasswordForm.value.newPassword!,
    });
    this.toggleChangePasswordModal(false);
    this.changePasswordForm.reset();
    this.changePasswordForm.markAsPristine();
  }

  private async updateFormAsync(form: FormGroup, props: UserDataInterface): Promise<void> {
    if (form.invalid) return;
    form.disable();
    try {
      await this.updateProfileAsync(props);
      form.enable();
    } catch (error) {
      console.error(error);
      form.enable();
    }
  }

  private updateProfileAsync(options: UserDataInterface): Promise<UserInterfaceResponse> {
    return new Promise<UserInterfaceResponse>((resolve, reject) => {
      const obs = this.usersService.updateCurrentUser(options);
      const subscription = obs.subscribe({
        next: (response) => {
          const { result } = response;
          this.toastService.presentToast({
            message: 'Profile information has been updated successfully',
            buttons: [],
          });
          resolve(response);
          this.authService.setCurrentUserToSession(result);
        },
        error: (error) => {
          reject(error);
        },
      });
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  public toggleChangeEmailModal(isOpen?: boolean): void {
    this.isChangeEmailModalOpen = isOpen !== undefined ? isOpen : !this.isChangeEmailModalOpen;
  }

  public toggleChangePasswordModal(isOpen?: boolean): void {
    this.isChangePasswordModalOpen =
      isOpen !== undefined ? isOpen : !this.isChangePasswordModalOpen;
  }
}
