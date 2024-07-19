import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AlertService, SessionService, ToastService, DatabaseService } from '@services';
// import { map } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MediaService } from 'libs/sdk/src/lib/services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { UsersService } from 'libs/sdk/src/lib/services';
import { UserInterface } from '@mzima-client/sdk';
import { STORAGE_KEYS } from '@constants';
import { filter } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss'],
})
export class ProfilePhotoComponent {
  @Input() photo: string;
  userId: string;
  // @Output() uploadStarted = new EventEmitter<void>();
  // @Output() uploadCompleted = new EventEmitter<void>();
  @Output() photoChanged = new EventEmitter<boolean>();
  @Output() photoSelected = new EventEmitter<{ key: string }>();
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
    private databaseService: DatabaseService,
  ) {}

  //Enabling/disabling delete button by checking if photo was uploaded initially
  ngOnInit(): void {
    this.sessionService
      .getCurrentUserData()
      .pipe(
        untilDestroyed(this),
        filter((userData): userData is UserInterface => !!userData && !!userData.userId),
      )
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

        this.loadStoredPhoto();
      });
  }

  async loadStoredPhoto(): Promise<void> {
    const storedPhoto = await this.databaseService.get(STORAGE_KEYS.PROFILE_PHOTO);
    if (storedPhoto) {
      this.photo = storedPhoto.dataURL;
      // console.log(this.photo);
      const photoFile = this.dataURLtoFile(storedPhoto.dataURL, storedPhoto.filename);
      this.emitStoredPhoto(photoFile);
    }
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
      // this.uploadStarted.emit();
      this.uploadingSpinner = true;
      this.changePhoto(file);
    }
  }

  changePhoto(file: File): void {
    const reader = new FileReader();
    reader.onload = async () => {
      this.photo = reader.result as string;

      await this.databaseService.set(STORAGE_KEYS.PROFILE_PHOTO, {
        dataURL: this.photo,
        filename: file.name,
      });
      console.log(STORAGE_KEYS.PROFILE_PHOTO, file.name);

      const key = STORAGE_KEYS.PROFILE_PHOTO;
      this.photoSelected.emit({ key });
      this.uploadingSpinner = false;
      console.log(this.photoSelected);
    };
    reader.readAsDataURL(file);
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
        .pipe(
          untilDestroyed(this),
          filter((userData): userData is UserInterface => !!userData && !!userData.userId),
        )
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
                  async () => {
                    console.log('Profile photo deleted successfully');
                    this.photo = `https://www.gravatar.com/avatar/${
                      userData.gravatar || '00000000000000000000000000000000'
                    }?d=retro&s=256`;
                    this.photoChanged.emit(true);
                    this.hasUploadedPhoto = false;
                    await this.databaseService.remove(STORAGE_KEYS.PROFILE_PHOTO);
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

  private emitStoredPhoto(file: File): void {
    this.uploadingInProgress = true;
    // this.uploadStarted.emit();

    const key = STORAGE_KEYS.PROFILE_PHOTO;
    this.photoSelected.emit({ key });
    console.log(file);
    console.log(this.photoSelected);
    this.uploadingInProgress = false;
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
}
