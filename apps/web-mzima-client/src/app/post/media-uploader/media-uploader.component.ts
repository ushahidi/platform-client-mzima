import { HttpErrorResponse, HttpEventType /*, HttpProgressEvent */ } from '@angular/common/http';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { formHelper } from '@helpers';
import { MediaService } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, catchError, forkJoin, last, Observable, tap, throwError } from 'rxjs';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { ErrorEnum, MediaFile, MediaType, mediaTypes } from '../../core/interfaces/media';
import {
  getDocumentThumbnail,
  getFileNameFromUrl,
  getFileSize,
} from '../../core/helpers/media-helper';

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
  isDisabled = false;
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

  // Import Helper Methods for the template
  getDocumentThumbnail = getDocumentThumbnail;
  getFileSize = getFileSize;

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
          if (aFile) {
            const photoUrl = formHelper.prepareImageFileToUpload(aFile);
            const mediaFile: MediaFile = {
              generatedId: this.generateId(),
              filename: aFile.name,
              size: aFile.size,
              file: photoUrl,
              status: 'uploading',
              mimeType: aFile.type,
              url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(photoUrl)),
            };
            this.mediaFiles.push(mediaFile);
          }
        }
        const uploads: Observable<any>[] = [];
        this.mediaFiles
          .filter((mediaFile) => mediaFile.status === 'uploading')
          .forEach((aMediaFile) => {
            //   })
            // for (let i = 0; i < this.mediaFiles.length; i++) {
            //   const aMediaFile = this.mediaFiles[i];
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
                        mediaFile.status = 'uploaded';
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
                            theMediaFile.status = 'ready';
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
                    mediaFile.status = 'error';
                    return mediaFile;
                  });
                  return throwError(() => new Error(error.statusText));
                }),
              );
            uploads.push(uploadObservable);
          });
        forkJoin(uploads).subscribe((results) => {
          for (const result of results) {
            const filename = getFileNameFromUrl(result.body.result.original_file_url);
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
          console.log(results);
        });
      }
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

    if (mediaFile && (mediaFile.status === 'upload' || mediaFile.status === 'ready')) {
      const confirmed = await this.confirm.open({
        title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
        description: this.translate.instant('notify.default.proceed_warning'),
      });

      if (!confirmed) return;

      // this.mediaFiles[index].status = 'delete';
      this.mediaFiles.splice(index, 1);
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

  generateId(): number {
    return (
      Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER + 1)) +
      Number.MIN_SAFE_INTEGER
    );
  }
}
