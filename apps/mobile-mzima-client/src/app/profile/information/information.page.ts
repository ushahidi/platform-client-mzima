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
import { AuthService, SessionService, ToastService, DatabaseService } from '@services';
import { fieldErrorMessages, regexHelper } from '@helpers';
import {
  generalHelpers,
  RolesService,
  UserDataInterface,
  UserInterfaceResponse,
} from '@mzima-client/sdk';
import { SelectOptionInterface } from '@models';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MediaService } from 'libs/sdk/src/lib/services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { UsersService } from 'libs/sdk/src/lib/services';
import { ProfilePhotoComponent } from './components';
import { STORAGE_KEYS } from '@constants';
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
  public isUploadInProgress = false;
  public isPhotoChanged: boolean = false;
  public selectedFile: File | null = null;
  public selectedCaption: string | null = null;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private formBuilder: FormBuilder,
    private rolesService: RolesService,
    private usersService: UsersService,
    private toastService: ToastService,
    private authService: AuthService,
    private mediaService: MediaService,
    private databaseService: DatabaseService,
  ) {
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        this.userPhoto = `https://www.gravatar.com/avatar/${
          userData.gravatar || '00000000000000000000000000000000'
        }?d=retro&s=256`;
        const userId = userData.userId as string;
        this.usersService.getUserSettings(userId).subscribe(async (response: any) => {
          const settings = response.results.find(
            (setting: any) => setting.config_key === 'profile_photo',
          );
          if (settings?.config_value?.photo_url) {
            this.userPhoto = settings?.config_value.photo_url;
          }

          const savedPhoto = await this.databaseService.get(STORAGE_KEYS.PROFILE_PHOTO);
          if (savedPhoto) {
            this.userPhoto = savedPhoto.dataURL;
            console.log(savedPhoto.dataURL);
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

  public handlePhotoSelected(event: { file: File; caption: string }): void {
    console.log('Photo selected:', event.file.name, event.file.type, event.file.size);
    if (this.selectedFile !== event.file || this.selectedCaption !== event.caption) {
      this.selectedFile = event.file;
      this.selectedCaption = event.caption;
      this.isPhotoChanged = true;
    }
  }

  ionViewWillEnter(): void {
    this.getRoles();
  }

  onUploadStarted(): void {
    this.isUploadInProgress = true;
  }

  onUploadCompleted(): void {
    this.isUploadInProgress = false;
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

  uploadPhoto(file: File, caption: string): void {
    console.log('Uploading file:', file.name, file.type, file.size);
    this.mediaService.uploadFile(file, caption).subscribe({
      next: (response: any) => {
        const mediaId = response?.result?.id;
        const photoUrl = response?.result?.original_file_url;
        if (mediaId && photoUrl) {
          this.saveUserProfilePhoto(mediaId, photoUrl);
        } else {
          console.error('Failed to extract mediaId or photoUrl from the response');
          this.isUploadInProgress = false;
        }
      },
      error: (error) => {
        console.error('Failed to upload file', error);
        this.isUploadInProgress = false;
        this.toastService.presentToast({
          message: 'Failed to upload image. Please try again',
          duration: 3000,
          position: 'bottom',
        });
      },
    });
  }

  getCurrentUserSettings(userId: string | number) {
    return this.usersService.getUserSettings(userId).pipe(
      map((response: any) => {
        return response;
      }),
    );
  }

  saveUserProfilePhoto(mediaId: number, photoUrl: string): void {
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
                next: async () => {
                  console.log('Profile photo updated successfully');
                  this.profilePhotoComponent.uploadingSpinner = false;
                  this.userPhoto = photoUrl;
                  this.isUploadInProgress = false;
                  //activating delete button if the upload is successful
                  this.profilePhotoComponent.hasUploadedPhoto = true;
                  await this.databaseService.remove(STORAGE_KEYS.PROFILE_PHOTO);
                  this.toastService.presentToast({
                    message: 'Profile photo updated successfully',
                    duration: 3000,
                    position: 'bottom',
                  });
                },
                error: async (error) => {
                  console.error('Failed to update profile photo. Please try again', error);
                  this.isUploadInProgress = false;
                  this.profilePhotoComponent.uploadingSpinner = false;
                  await this.databaseService.remove(STORAGE_KEYS.PROFILE_PHOTO);
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
                async () => {
                  this.profilePhotoComponent.uploadingSpinner = false;
                  this.profilePhotoComponent.hasUploadedPhoto = true;
                  this.userPhoto = photoUrl;
                  this.isUploadInProgress = false;
                  this.toastService.presentToast({
                    message: 'Profile photo updated successfully',
                    duration: 3000,
                    position: 'bottom',
                  });
                  await this.databaseService.remove(STORAGE_KEYS.PROFILE_PHOTO);
                },
                async (error) => {
                  console.error('Failed to add profile photo', error);
                  this.isUploadInProgress = false;
                  this.profilePhotoComponent.uploadingSpinner = false;
                  this.toastService.presentToast({
                    message: 'Failed to add profile photo. Please try again',
                    duration: 3000,
                    position: 'bottom',
                  });
                  await this.databaseService.remove(STORAGE_KEYS.PROFILE_PHOTO);
                },
              );
            }
          });
        } else {
          console.error('User data or user ID is missing');
          this.isUploadInProgress = false;
          this.profilePhotoComponent.uploadingSpinner = false;
        }
      });
  }

  public async updateUserInformation(): Promise<void> {
    this.form.disable();
    console.log('Starting update process');

    try {
      if (this.isPhotoChanged) {
        if (this.selectedFile && this.selectedCaption) {
          this.uploadPhoto(this.selectedFile, this.selectedCaption);
          this.isPhotoChanged = false;
          this.selectedFile = null;
          this.selectedCaption = null;
          this.profilePhotoComponent.uploadingSpinner = true;
        }
      }

      if (this.form.dirty) {
        console.log('Updating form data');
        const formData = { realname: this.form.value.realname! };
        await this.updateFormAsync(this.form, formData);
      }
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
