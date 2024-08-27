import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { formHelper } from '@helpers';

enum ErrorEnum {
  NONE = 'none',
  MAX_SIZE = 'post.media.messages.max_size',
  REQUIRED = 'post.media.messages.required',
  MAX_FILES = 'post.media.messages.max_files',
}

type MediaFile = {
  id?: number;
  file: File | null;
  fileExtension?: string;
  preview: string | SafeUrl | null;
  caption?: string;
  delete?: boolean;
};

@Component({
  selector: 'app-media-uploader',
  templateUrl: './media-uploader.component.html',
  styleUrls: ['./media-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MediaUploaderComponent),
      multi: true,
    },
  ],
})
export class MediaUploaderComponent implements ControlValueAccessor {
  @Input() public maxUploadSize: number = 2;
  @Input() public maxFiles?: number = -1;
  @Input() public hasCaption?: boolean;
  @Input() public requiredError?: boolean;
  @Input() public mediaType: 'image' | 'audio' | 'document';

  id?: number;
  captionControl = new FormControl('');
  photo: File | null;
  preview: string | SafeUrl | null;
  isDisabled = false;
  upload = false;
  error: ErrorEnum = ErrorEnum.NONE;
  fileTypes = '';
  onChange: any = () => {};
  onTouched: any = () => {};
  mediaFiles: MediaFile[];

  constructor(
    private sanitizer: DomSanitizer,
    private confirm: ConfirmModalService,
    private translate: TranslateService,
  ) {
    switch (this.mediaType) {
      case 'image':
        this.fileTypes = 'image/jpeg, image/png';
        break;
      case 'audio':
        this.fileTypes = 'audio/mp3, audio/ogg, audio/aac';
        this.hasCaption = false;
        break;
      case 'document':
        this.fileTypes =
          'application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        this.hasCaption = false;
        break;
    }
  }

  writeValue(obj: any): void {
    if (obj) {
      this.upload = false;
      this.captionControl.patchValue(obj.caption);
      this.id = obj.id;
      this.photo = this.preview = obj.photo;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files) {
      if (this.maxFiles && inputElement.files.length > this.maxFiles) {
        this.error = ErrorEnum.MAX_FILES;
        event.preventDefault();
      } else if (inputElement.files.length) {
        this.photo = formHelper.prepareImageFileToUpload(inputElement.files[0]);
        this.upload = true;
        this.preview = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.photo));
        this.onChange({
          caption: this.captionControl.value,
          photo: this.photo,
          id: this.id,
          upload: this.upload,
        });
        this.id = undefined;
        inputElement.value = '';
      }
    }
  }

  async deletePhoto(index: number) {
    const confirmed = await this.confirm.open({
      title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
      description: this.translate.instant('notify.default.proceed_warning'),
    });

    if (!confirmed) return;

    // if create remove from array
    this.mediaFiles = this.mediaFiles.splice(index, 1);

    // if edit set to delete
    this.mediaFiles[index].delete = true;
    this.onChange(this.mediaFiles);
  }

  captionChanged() {
    this.onChange({
      caption: this.captionControl.value,
      photo: this.photo,
      id: this.id,
      upload: this.upload,
    });
  }

  getDocumentThumbnail(mediaFile: File) {
    console.log(mediaFile);
  }
}
