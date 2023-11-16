import { Component, Input } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AlertService, SessionService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss'],
})
export class ProfilePhotoComponent {
  @Input() photo: string;
  // @Output() deletePhoto = new EventEmitter();
  // @Output() changePhoto = new EventEmitter();

  constructor(private alertService: AlertService, private sessionService: SessionService) {}

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
    };
    reader.readAsDataURL(file);
  }

  // My Proposed Code for API

  // ngOnDestroy(): void {
  //   this.saveImageOnUnload();
  // }

  // private saveImageOnUnload(): void {
  //   //api to save image
  //   console.log('Saving image', this.photo);
  // }

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
