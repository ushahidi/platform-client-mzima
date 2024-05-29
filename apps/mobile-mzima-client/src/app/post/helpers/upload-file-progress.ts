import { HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { MediaService } from '@mzima-client/sdk';
import { lastValueFrom, Observable, tap } from 'rxjs';

export class UploadFileProgressHelper {
  constructor(private mediaService: MediaService) {}

  async uploadFile(
    postData: any,
    fieldId: number,
    { data, name, caption, path }: any,
    progressCallback: (progress: number) => void,
  ) {
    try {
      const fetchPhoto = await fetch(data);
      const blob = await fetchPhoto.blob();
      const file = new File([blob], name);
      const uploadProgress: Observable<any> = this.mediaService
        .uploadFileProgress(file, caption)
        .pipe(
          tap((event) => {
            if (event.type === HttpEventType.UploadProgress) {
              const progressEvent: HttpProgressEvent = event as HttpProgressEvent;
              const percentDone = progressEvent.total
                ? Math.round((100 * progressEvent.loaded) / progressEvent.total)
                : 0;
              progressCallback(percentDone);
            }
          }),
        );
      const event: any = await lastValueFrom(uploadProgress);

      if (event?.body?.result?.id) {
        for (const content of postData.post_content) {
          for (const field of content.fields) {
            if (field.input === 'upload' && field.id === fieldId) {
              field.value = event.body.result.id;
            }
          }
        }

        Filesystem.deleteFile({
          directory: Directory.Data,
          path: path,
        });

        delete postData.file;
      } else {
        throw new Error('Error uploading file!');
      }
    } catch (error: any) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    return postData;
  }

  async uploadFileField(
    field: any,
    { data, name, caption, path }: any,
    progressCallback: (progress: number) => void,
  ) {
    try {
      const fetchPhoto = await fetch(data);
      const blob = await fetchPhoto.blob();
      const file = new File([blob], name);
      const uploadProgress: Observable<any> = this.mediaService
        .uploadFileProgress(file, caption)
        .pipe(
          tap((event) => {
            if (event.type === HttpEventType.UploadProgress) {
              const progressEvent: HttpProgressEvent = event as HttpProgressEvent;
              // const percentDone = progressEvent.total
              //   ? Math.round((100 * progressEvent.loaded) / progressEvent.total)
              //   : 0;
              const percentDone = progressEvent.total
                ? progressEvent.loaded / progressEvent.total
                : 0;
              progressCallback(percentDone);
            }
          }),
        );
      const event: any = await lastValueFrom(uploadProgress);

      if (event?.body?.result?.id) {
        field.value = event.body.result.id;
      }

      Filesystem.deleteFile({
        directory: Directory.Data,
        path: path,
      });
    } catch (error: any) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    return field;
  }
}
