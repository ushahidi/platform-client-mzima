import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertService } from '@services';

@Component({
  selector: 'app-profile-photo',
  templateUrl: './profile-photo.component.html',
  styleUrls: ['./profile-photo.component.scss'],
})
export class ProfilePhotoComponent {
  @Input() photo: string;
  @Output() deletePhoto = new EventEmitter();
  @Output() changePhoto = new EventEmitter();

  constructor(private alertService: AlertService) {}

  public uploadNewPhoto(): void {
    console.log('uploadNewPhoto');
    this.changePhoto.emit();
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
      this.deletePhoto.emit();
    }
  }
}
