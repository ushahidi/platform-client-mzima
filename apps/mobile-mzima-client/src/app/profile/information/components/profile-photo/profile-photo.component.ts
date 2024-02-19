import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AlertService, SessionService } from '@services';
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
  @Output() photoUpdated = new EventEmitter<boolean>();

  public currentUser: UserInterface;
  public currentUserSettings;
  constructor(
    // private http: HttpClient,
    private alertService: AlertService,
    private sessionService: SessionService,
    private mediaService: MediaService,
    private usersService: UsersService,
  ) {
    // this.usersService.getCurrentUser().pipe(
    //   map((res) => {
    //     console.log(res);
    //     this.currentUser = res.result;
    //   }),
    // );
    // this.getCurrentUserSettings(this.currentUser?.userId).pipe(
    //   map((res) => {
    //     this.currentUserSettings = res;
    //   }),
    // );
  }

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

      this.mediaService.uploadFile(file, 'Test caption').subscribe((response: any) => {
        console.log(response);
        // const mediaId = response.id;
        // const photoUrl = response.original_file_url;
        const mediaId = response?.result?.id;
        const photoUrl = response?.result?.original_file_url;

        console.log(mediaId, photoUrl);
        // this.updateUserProfilePhoto(mediaId, photoUrl);

        if (mediaId && photoUrl) {
          this.updateUserProfilePhoto(mediaId, photoUrl);
        } else {
          console.error('Failed to extract mediaId or photoUrl from the response');
        }
      });
    };

    reader.readAsDataURL(file);
  }

  getCurrentUserSettings(userId: string | number) {
    return this.usersService.getUserSettings(userId).pipe(
      map((response: any) => {
        console.log(response);
        return response;
      }),
    );
  }

  updateUserProfilePhoto(mediaId: number, photoUrl: string): void {
    //getting current user data
    this.sessionService
      .getCurrentUserData()
      .pipe(untilDestroyed(this))
      .subscribe((userData) => {
        if (userData && userData.userId) {
          const userId = userData.userId as string;

          this.usersService.getUserSettings(userId).subscribe((response: any) => {
            console.log(response);
            // const settingsMap = response.results.map((setting: any) => setting);
            // console.log(settingsMap);

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
              this.usersService.updateUserSettings(userId, configValue, settings.id).subscribe(
                (result) => {
                  console.log('Profile photo updated successfully');
                  this.photo = photoUrl;
                  console.log(result);
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
    this.photoUpdated.emit(true);
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
      this.photoUpdated.emit(false);
    }
  }
}
