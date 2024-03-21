import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { formHelper } from '@helpers';

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploaderComponent),
      multi: true,
    },
  ],
})
export class ImageUploaderComponent implements ControlValueAccessor {
  @Input() public hasCaption: boolean;
  @Input() public maxSizeError?: boolean;
  @Input() public requiredError?: boolean;
  id?: number;
  captionControl = new FormControl('');
  altText?: string = '';
  photo: File | null;
  preview: string | SafeUrl | null;
  isDisabled = false;
  upload = false;
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(
    private sanitizer: DomSanitizer,
    private confirm: ConfirmModalService,
    private translate: TranslateService,
  ) {}

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

    if (inputElement.files && inputElement.files.length) {
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

  async deletePhoto() {
    const confirmed = await this.confirm.open({
      title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
      description: this.translate.instant('notify.default.proceed_warning'),
    });

    if (!confirmed) return;

    this.photo = this.preview = null;
    this.onChange({
      caption: this.captionControl.value,
      photo: this.photo,
      id: this.id,
      delete: true,
    });
  }

  captionChanged() {
    console.log(this.captionControl.value);
    this.onChange({
      caption: this.captionControl.value,
      photo: this.photo,
      id: this.id,
      upload: this.upload,
    });
  }
}
