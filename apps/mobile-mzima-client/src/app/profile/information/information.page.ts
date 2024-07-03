import { Component, ViewChild } from '@angular/core';
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
import { ProfilePhotoComponent } from './components';
import { map } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-information',
  templateUrl: 'information.page.html',
  styleUrls: ['information.page.scss'],
})
export class InformationPage {
  @ViewChild(ProfilePhotoComponent) profilePhotoComponent: ProfilePhotoComponent;
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
  public isPhotoChanged: boolean = false;
  public mediaId: number;
  public photoUrl: string;
  private newMediaId: number | null = null;
  private newPhotoUrl: string | null = null;

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
        const userId = userData.userId as string;
        this.usersService.getUserSettings(userId).subscribe((response: any) => {
          const settings = response.results.find(
            (setting: any) => setting.config_key === 'profile_photo',
          );
          if (settings?.config_value?.photo_url) {
            this.userPhoto = settings?.config_value.photo_url;
          }
        });

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

  // public handlePhotoChange(): void {
  //   this.isPhotoChanged = true;
  // }

  public handlePhotoUploaded(event: { mediaId: number; photoUrl: string }): void {
    if (this.mediaId !== event.mediaId || this.photoUrl !== event.photoUrl) {
      this.newMediaId = event.mediaId;
      this.newPhotoUrl = event.photoUrl;
      this.isPhotoChanged = true;
      console.log('Photo changed in information page');
    }
    return;
  }

  ionViewWillEnter(): void {
    this.getRoles();
  }

  //logic shipped from profilePhotoComponent
  getCurrentUserSettings(userId: string | number) {
    return this.usersService.getUserSettings(userId).pipe(
      map((response: any) => {
        return response;
      }),
    );
  }

  saveUserProfilePhoto(mediaId: number, photoUrl: string): void {
    //getting current user data
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        if (userData && userData.userId) {
          const userId = userData.userId as string;

          this.usersService.getUserSettings(userId).subscribe((response: any) => {
            const configKey = 'profile_photo';
            const configValue = {
              media_id: mediaId,
              photo_url: photoUrl,
            };

            const settings = response.results.find(
              (setting: any) => setting.config_key === configKey,
            );

            // If profile_photo config exists
            if (settings && settings.id) {
              const payload = {
                config_value: configValue,
              };
              this.usersService.update(userId, payload, 'settings/' + settings.id).subscribe({
                next: () => {
                  console.log('Profile photo updated successfully');
                  this.profilePhotoComponent.isPhotoUploaded = true;
                  this.userPhoto = photoUrl;
                  // this.isPhotoChanged = false;
                  // this.uploadingSpinner = false;
                  //activating delete button if the upload is successful
                  // this.uploadingInProgress = false;
                  // this.uploadCompleted.emit();
                  this.toastService.presentToast({
                    message: 'Profile photo updated successfully',
                    duration: 3000,
                    position: 'bottom',
                  });
                },
                error: (error) => {
                  console.error('Failed to update profile photo. Please try again', error);
                  // this.uploadingInProgress = false;
                  // this.uploadingSpinner = false;
                  // this.uploadCompleted.emit();
                  this.toastService.presentToast({
                    message: 'Failed to add profile photo',
                    duration: 3000,
                    position: 'bottom',
                  });
                },
              });
            } else {
              const payload: any = {
                config_key: configKey,
                config_value: configValue,
              };
              this.usersService.postUserSettings(userId, payload).subscribe(
                () => {
                  this.userPhoto = photoUrl;
                  // this.photoChanged.emit(true);
                  // this.uploadingSpinner = false;
                  //activating delete button if the upload is successful
                  // this.hasUploadedPhoto = true;
                  // this.uploadingInProgress = false;
                  // this.uploadCompleted.emit();
                  // this.toastService.presentToast({
                  //   message: 'Profile photo updated successfully',
                  //   duration: 3000,
                  //   position: 'bottom',
                  // });
                },
                (error) => {
                  console.error('Failed to add profile photo', error);
                  // this.uploadingInProgress = false;
                  // this.uploadingSpinner = false;
                  // this.uploadCompleted.emit();
                  this.toastService.presentToast({
                    message: 'Failed to add profile photo. Please try again',
                    duration: 3000,
                    position: 'bottom',
                  });
                },
              );
            }
          });
        } else {
          console.error('User data or user ID is missing');
          // this.uploadingInProgress = false;
          // this.uploadingSpinner = false;
          // this.uploadCompleted.emit();
        }
      });
  }

  public back(): void {
    // if (!this.isUploadInProgress) {
    //   this.router.navigate(['profile']);
    // } else {
    //   this.toastService.presentToast({
    //     message: 'Profile photo is still uploading. Please wait...',
    //     duration: 3000,
    //   });
    //   console.log('Upload in progress. Cannot navigate back.');
    // }
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
    this.form.disable();
    console.log('Starting update process');

    try {
      if (this.isPhotoChanged) {
        if (this.newMediaId && this.newPhotoUrl) {
          await this.saveUserProfilePhoto(this.newMediaId, this.newPhotoUrl);
        }
        this.isPhotoChanged = false;
        this.newMediaId = null;
        this.newPhotoUrl = null;
        this.profilePhotoComponent.isPhotoUploaded = true;
      }

      if (this.form.dirty) {
        console.log('Updating form data');
        const formData = { realname: this.form.value.realname! };
        await this.updateFormAsync(this.form, formData);
      }

      this.isPhotoChanged = false;
      console.log('Information updated');
    } catch (error) {
      console.log('Error updating information');
    } finally {
      this.form.enable();
      this.form.markAsPristine();
    }

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
    // if (form.invalid) {
    //   console.log('Form is invalid, not updating');
    //   return;
    // }
    console.log('Updating form data');
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
