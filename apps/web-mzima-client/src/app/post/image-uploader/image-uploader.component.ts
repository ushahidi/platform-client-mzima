import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  caption: string;
  photo: File | null;
  preview: string | SafeUrl | null;
  isDisabled = false;
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private sanitizer: DomSanitizer) {}

  writeValue(obj: any): void {
    if (obj) {
      this.caption = obj.caption;
      this.photo = obj.photo;
      this.preview = URL.createObjectURL(obj.photo);
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
      this.photo = inputElement.files[0];
      this.preview = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.photo));
      this.onChange({ caption: this.caption, photo: this.photo });
      inputElement.value = '';
    }
  }

  deletePhoto() {
    this.photo = null;
    this.preview = null;
    this.onChange({ caption: this.caption, photo: this.photo });
  }

  captionChanged() {
    this.onChange({ caption: this.caption, photo: this.photo });
  }
}
