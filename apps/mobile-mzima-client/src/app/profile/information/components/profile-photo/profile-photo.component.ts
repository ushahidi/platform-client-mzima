import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AlertService, SessionService, ToastService } from '@services';
import { map } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MediaService } from 'libs/sdk/src/lib/services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { UsersService } from 'libs/sdk/src/lib/services';
import { UserInterface } from '@mzima-client/sdk';

@UntilDestroy()
@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss'],
})
export class ProfilePhotoComponent {
  @Input() photo: string;
  userId: string;
  @Output() uploadStarted = new EventEmitter<void>();
  @Output() uploadCompleted = new EventEmitter<void>();
  @Output() photoChanged = new EventEmitter<boolean>();
  uploadingInProgress = false;
  uploadingSpinner = false;
  hasUploadedPhoto = false;

  public currentUser: UserInterface;
  constructor(
    private alertService: AlertService,
    private sessionService: SessionService,
    private toastService: ToastService,
    private mediaService: MediaService,
    private usersService: UsersService,
  ) {}

  //Enabling/disabling delete button by checking if photo was uploaded initially
  ngOnInit(): void {
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        if (userData && userData.userId) {
          const userId = userData.userId as string;
          this.usersService.getUserSettings(userId).subscribe((response: any) => {
            const settings = response.results.find(
              (setting: any) => setting.config_key === 'profile_photo',
            );

            //Check to see if user setting/config value/photo url exists so as to enable/disable delete button
            if (settings && settings.config_value && settings.config_value.photo_url) {
              this.hasUploadedPhoto = true;
            }
          });
        }
      });
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    //Ressetting the value of the file input
    fileInput.value = '';
    //trigerring the dialog to upload the file
    fileInput.click();
  }

  selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validFileTypes.includes(file.type)) {
        this.alertService.presentAlert({
          header: 'Wrong type of file',
          message: 'Please select a valid image file',
        });
        return;
      }
      //showing the loading icon
      this.uploadingInProgress = true;
      this.uploadStarted.emit();
      this.uploadingSpinner = true;
      this.changePhoto(file);
    }
  }

  changePhoto(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      // this.photo = reader.result as string;

      this.sessionService
        .getCurrentUserData()
        .pipe(untilDestroyed(this))
        .subscribe((userData) => {
          const caption = userData.realname;

          this.mediaService.uploadFile(file, caption).subscribe({
            next: (response: any) => {
              const mediaId = response?.result?.id;
              const photoUrl = response?.result?.original_file_url;
              if (mediaId && photoUrl) {
                this.saveUserProfilePhoto(mediaId, photoUrl);
              } else {
                console.error('Failed to extract mediaId or photoUrl from the response');
                this.uploadingInProgress = false;
                this.uploadingSpinner = false;
                this.uploadCompleted.emit();
              }
            },
            error: (error) => {
              console.error('Failed to upload file', error);
              this.uploadingInProgress = false;
              this.uploadingSpinner = false;
              this.uploadCompleted.emit();
              this.toastService.presentToast({
                message: 'Failed to upload image. Please try again',
                duration: 3000,
                position: 'bottom',
              });
            },
          });
        });
    };

    reader.readAsDataURL(file);
  }

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
                  this.photo = photoUrl;
                  this.photoChanged.emit(true);
                  this.uploadingSpinner = false;
                  //activating delete button if the upload is successful
                  this.hasUploadedPhoto = true;
                  this.uploadingInProgress = false;
                  this.uploadCompleted.emit();
                  this.toastService.presentToast({
                    message: 'Profile photo updated successfully',
                    duration: 3000,
                    position: 'bottom',
                  });
                },
                error: (error) => {
                  console.error('Failed to update profile photo. Please try again', error);
                  this.uploadingInProgress = false;
                  this.uploadingSpinner = false;
                  this.uploadCompleted.emit();
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
                  this.photo = photoUrl;
                  this.photoChanged.emit(true);
                  this.uploadingSpinner = false;
                  //activating delete button if the upload is successful
                  this.hasUploadedPhoto = true;
                  this.uploadingInProgress = false;
                  this.uploadCompleted.emit();
                  this.toastService.presentToast({
                    message: 'Profile photo updated successfully',
                    duration: 3000,
                    position: 'bottom',
                  });
                },
                (error) => {
                  console.error('Failed to add profile photo', error);
                  this.uploadingInProgress = false;
                  this.uploadingSpinner = false;
                  this.uploadCompleted.emit();
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
          this.uploadingInProgress = false;
          this.uploadingSpinner = false;
          this.uploadCompleted.emit();
        }
      });
  }

  public async deletePhotoHandle(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: 'Are you sure you want to delete profile photo? ',
      message: 'Deleting means that from now you will not have profile photo.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      this.sessionService
        .getCurrentUserData()
        .pipe(untilDestroyed(this))
        .subscribe((userData) => {
          if (userData && userData.userId) {
            const userId = userData.userId as string;
            this.usersService.getUserSettings(userId).subscribe((response: any) => {
              const settings = response.results.find(
                (setting: any) => setting.config_key === 'profile_photo',
              );

              if (settings && settings.id) {
                // Call the delete method of the service
                this.usersService.delete(userId, 'settings/' + settings.id).subscribe(
                  () => {
                    console.log('Profile photo deleted successfully');
                    this.photo = `https://www.gravatar.com/avatar/${
                      userData.gravatar || '00000000000000000000000000000000'
                    }?d=retro&s=256`;
                    this.photoChanged.emit(true);
                    this.hasUploadedPhoto = false;
                  },
                  (error) => {
                    console.error('Failed to delete profile photo', error);
                  },
                );
              } else {
                console.error('Profile photo settings not found');
              }
            });
          } else {
            console.error('User data or user ID is missing');
          }
        });
      this.toastService.presentToast({
        header: 'Successfully Deleting',
        message: 'You successfully deleted the profile photo',
        duration: 3000,
        position: 'bottom',
      });
    }
  }
}
