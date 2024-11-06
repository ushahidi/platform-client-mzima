import { HttpErrorResponse, HttpEventType /*, HttpProgressEvent */ } from '@angular/common/http';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { formHelper } from '@helpers';
import { MediaFile, MediaFileError, MediaFileStatus, MediaService } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, last, Observable, tap, throwError } from 'rxjs';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { MediaUploaderError, MediaType, mediaTypes } from '../../core/interfaces/media';

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
    {
      provide: NG_VALIDATORS,
      useExisting: MediaUploaderComponent,
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
  isDisabled = false;
  error: MediaUploaderError = MediaUploaderError.NONE;
  mediaType: MediaType;
  onChange: any = () => {};
  onTouched: any = () => {};
  mediaFiles: MediaFile[] = [];
  // uploadProgress$: BehaviorSubject<number>[] = [];
  uploads: Map<number, Observable<any>> = new Map();

  constructor(
    protected sanitizer: DomSanitizer,
    private confirm: ConfirmModalService,
    private translate: TranslateService,
    private mediaService: MediaService,
  ) {}

  ngOnInit() {
    this.mediaType = mediaTypes.get(this.media)!;
  }

  // helper method and enum imports for the template
  MediaUploaderError = MediaUploaderError;
  MediaFileError = MediaFileError;
  MediaFileStatus = MediaFileStatus;

  writeValue(obj: MediaFile[]): void {
    if (Array.isArray(obj)) {
      this.mediaFiles = obj;
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

  validate(): ValidationErrors | null {
    for (const upload of this.mediaFiles) {
      if (upload.status === MediaFileStatus.ERROR) {
        if (upload.error === MediaFileError.UNKNOWN) return { uploadError: true };

        if (upload.error === MediaFileError.TOO_BIG) return { uploadsInvalid: true };

        if (upload.error === MediaFileError.INVALID_TYPE) return { uploadsInvalid: true };
      } else if (upload.status === MediaFileStatus.UPLOADING) return { uploadInProgress: true };
    }
    return null;
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files) {
      if (
        this.maxFiles !== -1 &&
        this.mediaFiles.length + inputElement.files.length > this.maxFiles
      ) {
        this.error = MediaUploaderError.MAX_FILES;
        event.preventDefault();
      } else if (inputElement.files.length) {
        for (let i = 0; i < inputElement.files.length; i++) {
          const aFile = inputElement.files.item(i);
          if (aFile) {
            const photoUrl = formHelper.prepareImageFileToUpload(aFile);
            const mediaFile = new MediaFile(aFile, URL.createObjectURL(photoUrl));

            if (mediaFile.size > this.maxUploadSize * 1000000) {
              mediaFile.status = MediaFileStatus.ERROR;
              mediaFile.error = MediaFileError.TOO_BIG;
            } else if (!this.mediaType.fileTypes.includes(mediaFile.mimeType)) {
              mediaFile.status = MediaFileStatus.ERROR;
              mediaFile.error = MediaFileError.INVALID_TYPE;
            } else mediaFile.status = MediaFileStatus.UPLOADING;

            this.mediaFiles.push(mediaFile);
          }
        }
        this.uploads = new Map();
        this.mediaFiles
          .filter((mediaFile) => mediaFile.status === MediaFileStatus.UPLOADING)
          .forEach((aMediaFile) => {
            const uploadObservable: Observable<any> = this.mediaService
              .uploadFileProgress(aMediaFile.file!, '')
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
                    this.updateMediaFileById(
                      aMediaFile.generatedId,
                      uploadEvent.body,
                      (mediaFile, resultBody) => {
                        mediaFile.status = MediaFileStatus.UPLOADED;
                        mediaFile.value = resultBody.result.id;
                        return mediaFile;
                      },
                    );
                    // if (this.progressCallback)
                    //     this.progressCallback(100);
                    setTimeout(
                      (mediaFile: MediaFile) => {
                        this.updateMediaFileById(
                          mediaFile.generatedId,
                          uploadEvent.body,
                          (theMediaFile) => {
                            theMediaFile.status = MediaFileStatus.READY;
                            return theMediaFile;
                          },
                        );
                      },
                      3000,
                      aMediaFile,
                    );
                  }
                }),
                last(),
                catchError((error: HttpErrorResponse) => {
                  this.updateMediaFileById(aMediaFile.generatedId, null, (mediaFile) => {
                    mediaFile.status = MediaFileStatus.ERROR;
                    return mediaFile;
                  });
                  return throwError(() => new Error(error.statusText));
                }),
              );
            this.uploads.set(aMediaFile.generatedId, uploadObservable);
          });
        forkJoin(Array.from(this.uploads.values())).subscribe((results) => {
          for (const result of results) {
            const filename = MediaFile.getFileNameFromUrl(result.body.result.original_file_url);
            this.updateMediaFileByNameAndSize(
              filename,
              result.body.result.original_file_size,
              (mediaFile) => {
                mediaFile.value = result.body.result.id;
                return mediaFile;
              },
            );
          }
          this.onChange(this.mediaFiles);
          inputElement.value = '';
        });
      }
      this.onChange(this.mediaFiles);
    }
  }

  async clickDeleteButton(value: number | undefined, generatedId: number) {
    let mediaFile;
    let index = 0;
    for (let i = 0; i < this.mediaFiles.length; i++) {
      mediaFile = this.mediaFiles[i];
      if (
        (mediaFile.value && mediaFile.value === value) ||
        (mediaFile.generatedId && mediaFile.generatedId === generatedId)
      ) {
        index = i;
        break;
      }
    }

    if (mediaFile) {
      if (
        mediaFile.status === MediaFileStatus.UPLOAD ||
        mediaFile.status === MediaFileStatus.READY
      ) {
        const confirmed = await this.confirm.open({
          title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
          description: this.translate.instant('notify.default.proceed_warning'),
        });
        if (!confirmed) return;
      } else if (mediaFile.status === MediaFileStatus.UPLOADING) {
        const uploadObservable = this.uploads.get(generatedId);
        if (uploadObservable) {
          const uploadSubscription = uploadObservable.subscribe(() =>
            uploadSubscription.unsubscribe(),
          );
        }
      } else if (mediaFile.status !== MediaFileStatus.ERROR) {
        return;
      }

      // this.mediaFiles[index].status = MediaFileStatus.DELETE;
      this.mediaFiles.splice(index, 1);

      // Check for errors
      const filteredItems = this.mediaFiles.filter((item) => item.status === MediaFileStatus.ERROR);
      if (filteredItems.length === 0) this.error = MediaUploaderError.NONE;
    }
    this.onChange(this.mediaFiles);
  }

  updateMediaFileById(
    id: number,
    resultBody: any,
    updateCallback: (mediaFile: MediaFile, body: any) => MediaFile,
  ) {
    for (let i = 0; i < this.mediaFiles.length; i++) {
      if (this.mediaFiles[i].generatedId === id) {
        this.mediaFiles[i] = updateCallback(this.mediaFiles[i], resultBody);
        i = this.mediaFiles.length;
      }
    }
  }

  updateMediaFileByNameAndSize(
    filename: string,
    size: number,
    updateCallback: (mediaFile: MediaFile) => MediaFile,
  ) {
    for (let i = 0; i < this.mediaFiles.length; i++) {
      let mediaFile = this.mediaFiles[i];
      if (
        mediaFile.file?.name.toLowerCase() === filename.toLowerCase() &&
        mediaFile.file?.size === size
      ) {
        mediaFile = updateCallback(mediaFile);
        i = this.mediaFiles.length;
      }
    }
  }
}
