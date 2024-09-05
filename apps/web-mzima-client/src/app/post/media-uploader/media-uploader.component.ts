import { HttpErrorResponse, HttpEventType /*, HttpProgressEvent */ } from '@angular/common/http';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { formHelper } from '@helpers';
import { MediaService } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, catchError, forkJoin, last, Observable, tap, throwError } from 'rxjs';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

enum ErrorEnum {
  NONE = 'none',
  MAX_SIZE = 'post.media.messages.max_size',
  REQUIRED = 'post.media.messages.required',
  MAX_FILES = 'post.media.messages.max_files',
}

type MediaType = {
  icon: string;
  buttonText: string;
  fileTypes: string;
};

type MediaFileStatus = 'ready' | 'upload' | 'uploading' | 'uploaded' | 'error' | 'delete';

const mediaTypes = new Map<string, MediaType>([
  [
    'image',
    {
      icon: 'add_a_photo',
      buttonText: 'post.media.add_photo',
      fileTypes: 'image/jpeg, image/png',
    },
  ],
  [
    'audio',
    {
      icon: 'speaker',
      buttonText: 'post.media.add_audio',
      fileTypes: 'audio/mp3, audio/ogg, audio/aac',
    },
  ],
  [
    'document',
    {
      icon: 'note_add',
      buttonText: 'post.media.add_document',
      fileTypes:
        'application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ],
]);

type MediaFile = {
  id?: number;
  generatedId: number;
  file?: File;
  fileExtension?: string;
  preview: string | SafeUrl | null;
  caption?: string;
  status: MediaFileStatus;
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
export class MediaUploaderComponent implements ControlValueAccessor, OnInit {
  @Input() public maxUploadSize: number = 2;
  @Input() public maxFiles: number = -1;
  @Input() public hasCaption?: boolean;
  @Input() public requiredError?: boolean;
  @Input() public media: 'image' | 'audio' | 'document';
  // @Input() public progressCallback?: (progress: number) => {};

  id?: number;
  captionControl = new FormControl('');
  photo: File | null;
  preview: string | SafeUrl | null;
  isDisabled = false;
  upload = false;
  error: ErrorEnum = ErrorEnum.NONE;
  mediaType: MediaType;
  onChange: any = () => {};
  onTouched: any = () => {};
  mediaFiles: MediaFile[] = [];
  uploadProgress$: BehaviorSubject<number>[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private confirm: ConfirmModalService,
    private translate: TranslateService,
    private mediaService: MediaService,
  ) {}

  ngOnInit() {
    this.mediaType = mediaTypes.get(this.media)!;
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
      if (
        this.maxFiles !== -1 &&
        this.mediaFiles.length + inputElement.files.length > this.maxFiles
      ) {
        this.error = ErrorEnum.MAX_FILES;
        event.preventDefault();
      } else if (inputElement.files.length) {
        for (let i = 0; i < inputElement.files.length; i++) {
          const aFile = inputElement.files.item(i);
          const photoUrl = formHelper.prepareImageFileToUpload(aFile!);
          const mediaFile: MediaFile = {
            generatedId: this.generateId(),
            file: photoUrl,
            status: 'uploading',
            preview: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(photoUrl)),
          };
          this.mediaFiles.push(mediaFile);
        }
        const uploads: Observable<any>[] = [];
        for (let i = 0; i < this.mediaFiles.length; i++) {
          const mediaFile = this.mediaFiles[i];
          const uploadObservable: Observable<any> = this.mediaService
            .uploadFileProgress(mediaFile.file!, '')
            .pipe(
              tap((uploadEvent) => {
                // if (uploadEvent.type === HttpEventType.UploadProgress) {
                //   const progressEvent: HttpProgressEvent = uploadEvent as HttpProgressEvent;
                //   const percentDone = progressEvent.total
                //     ? progressEvent.loaded / progressEvent.total
                //     : 0;

                //   // if (this.progressCallback)
                //   //   this.progressCallback(percentDone);
                // }
                // else
                if (uploadEvent.type === HttpEventType.Response) {
                  this.updateMediaFile(mediaFile.generatedId, (aMediaFile) => {
                    aMediaFile.status = 'uploaded';
                    return aMediaFile;
                  });
                  // if (this.progressCallback)
                  //     this.progressCallback(100);
                }
              }),
              last(),
              catchError((error: HttpErrorResponse) => {
                this.updateMediaFile(mediaFile.generatedId, (aMediaFile) => {
                  aMediaFile.status = 'error';
                  return aMediaFile;
                });
                return throwError(() => new Error(error.statusText));
              }),
            );
          uploads.push(uploadObservable);
        }
        forkJoin(uploads).subscribe((results) => {
          this.onChange(this.mediaFiles);
          inputElement.value = '';
          console.log(results);
        });
      }
    }
  }

  async clickStatusButton(index: number) {
    const mediaFile = this.mediaFiles[index];

    // Are we deleting?
    if (mediaFile.status === 'upload' || mediaFile.status === 'ready') {
      const confirmed = await this.confirm.open({
        title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
        description: this.translate.instant('notify.default.proceed_warning'),
      });

      if (!confirmed) return;

      if (mediaFile.status === 'upload') {
        this.mediaFiles = this.mediaFiles.filter((e, i) => i !== index);
      } else {
        this.mediaFiles[index].status = 'delete';
      }
    } else if (mediaFile.status === 'uploading') {
      console.log(mediaFile);
    }

    this.onChange(this.mediaFiles);
  }

  getDocumentThumbnail(mediaFile: MediaFile) {
    const path = '/assets/images/logos/';
    let thumbnail = 'unknown_document.png';
    switch (mediaFile.file?.type) {
      case 'application/pdf':
        thumbnail = 'pdf_document.png';
        break;
      case 'application/msword':
        thumbnail = 'word_document.png';
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        thumbnail = 'word_document.png';
        break;
    }
    return path + thumbnail;
  }

  getFileName(mediaFile: MediaFile): string {
    return mediaFile.file ? mediaFile.file?.name : 'unknown';
  }

  getFileSize(mediaFile: MediaFile): string {
    const filesize: number = mediaFile.file ? mediaFile.file.size : 0;
    // Megabytes
    if (filesize > 1000000) {
      return (filesize / 1000000).toFixed(2).toString() + 'MB';
    }
    // Kilobytes
    else if (filesize > 1000) {
      return (filesize / 1000).toFixed(2).toString() + 'kB';
    }
    // Bytes
    else {
      return filesize + 'bytes';
    }
  }

  updateMediaFile(id: number, updateCallback: (mediaFile: MediaFile) => MediaFile) {
    for (let i = 0; i < this.mediaFiles.length; i++) {
      if (this.mediaFiles[i].generatedId === id) {
        this.mediaFiles[i] = updateCallback(this.mediaFiles[i]);
        i = this.mediaFiles.length;
      }
    }
  }

  generateId(): number {
    return (
      Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1)) +
      Number.MIN_SAFE_INTEGER
    );
  }
}
