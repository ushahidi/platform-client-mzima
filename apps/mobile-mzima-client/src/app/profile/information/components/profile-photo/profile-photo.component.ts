import { Component, Input } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AlertService, SessionService } from '@services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { MediaService } from 'libs/sdk/src/lib/services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { UsersService } from 'libs/sdk/src/lib/services';

@UntilDestroy()
@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss'],
})
export class ProfilePhotoComponent {
  @Input() photo: string;
  userId: string;
  // @Output() deletePhoto = new EventEmitter();
  // @Output() changePhoto = new EventEmitter();

  constructor(
    // private http: HttpClient,
    private alertService: AlertService,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private usersService: UsersService,
  ) {}

  selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.changePhoto(file);
    }
  }

  changePhoto(file: File): void {
    const reader = new FileReader();
    console.log(reader);
    console.log(file);
    reader.onload = () => {
      this.photo = reader.result as string;

      // this.mediaService.uploadFile(file, 'Test caption').subscribe((data: any) => {
      //   console.log(data);
      //   const mediaId = data.result.id;
      //   const photoUrl = data.result.original_file_url;

      this.mediaService.uploadFile(file, 'Test caption').subscribe((response: any) => {
        console.log(response);
        const mediaId = response.id;
        const photoUrl = response.original_file_url;
        this.updateUserProfilePhoto(mediaId, photoUrl);
      });
    };

    reader.readAsDataURL(file);
  }

  // updateUserPhoto(userId: string, photoUrl: string, mediaId: number): void {
  //   // Update user's photo URL using UsersService
  //   this.usersService.getUserSettings(userId).subscribe((settings: any) => {
  //     if (settings) {
  //       // If user settings exist, update the existing photo URL
  //       this.usersService.updateUserSettings(userId, { photoUrl }).subscribe(() => {
  //         console.log('User photo URL updated successfully');
  //       });
  //     } else {
  //       // If user settings don't exist, add the photo URL as a user setting
  //       this.usersService.addUserSettings(userId, mediaId, photoUrl).subscribe(() => {
  //         console.log('User photo URL added successfully');
  //       });
  //     }
  //   });
  // }

  updateUserProfilePhoto(mediaId: number, photoUrl: string): void {
    //getting current user data
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        if (userData && userData.userId) {
          const userId = userData.userId as string;
          // this.usersService.getUserSettings(userId).subscribe((settings: any) => {
          // this.usersService.getUserSettings(userId).subscribe((response: any) => {
          //   const settingsList = response.results;

          //   if (Array.isArray(settingsList) && settingsList.length > 0) {
          //     // Assuming there's only one profile photo setting for a user
          //     const profilePhotoSetting = settingsList[0];

          //     const settingsId = profilePhotoSetting.id;
          this.usersService.getUserSettings(userId).subscribe((response: any) => {
            console.log(response);
            const settings = response.results.find(
              (setting: any) => setting.config_key === 'profile_photo',
            );
            console.log(settings.config_key);

            if (settings && settings.id) {
              console.log(settings);

              const configValue: any = {
                media_id: mediaId,
                photo_url: photoUrl,
              };
              this.usersService
                .updateUserSettings(userId, configValue, 'settings/' + settings.id)
                .subscribe(
                  () => {
                    console.log('Profile photo updated successfully');
                    this.photo = photoUrl;
                  },
                  (error) => {
                    console.error('Failed to update profile photo', error);
                  },
                );
            } else {
              console.error('Settings object with config key "profile_photo" not found');
            }
          });
        } else {
          console.error('User data or user ID is missing');
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
          this.photo = `https://www.gravatar.com/avatar/${
            userData.gravatar || '00000000000000000000000000000000'
          }?d=retro&s=256`;
        });
    }
  }
}
