import { ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { Component, Input, Output } from '@angular/core';
import { validateFile } from '@helpers';
import { NotificationService } from '@services';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent {
  @Input() required = false;
  @Input() imageSrc: any;
  @Input() validation = 'image';
  @Input() multiple?: boolean;
  @Output() fileUpload = new EventEmitter<File>();
  @Output() delete = new EventEmitter();
  @ViewChild('input') public input: ElementRef<HTMLInputElement>;

  constructor(private notificationService: NotificationService) {}

  uploadFile($event: any) {
    if (!$event.target.files[0]) return;
    if (validateFile($event.target.files[0])) {
      var reader = new FileReader();
      reader.onload = () => {
        const currentFile: any = {
          file: $event.target.files[0],
          dataURI: reader.result,
          changed: true,
          deleted: false,
        };
        this.fileUpload.emit(currentFile);
      };
      reader.readAsDataURL($event.target.files[0]);
    } else {
      this.notificationService.showError('post.media.error_in_upload');
    }
  }

  public deleteImage(index?: number) {
    this.delete.emit(index ?? true);
  }

  public chooseFile(): void {
    this.input.nativeElement.click();
  }
}
