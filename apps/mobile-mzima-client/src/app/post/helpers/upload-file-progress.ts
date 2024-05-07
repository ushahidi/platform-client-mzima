import { HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
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
      const uploadProgress: Observable<HttpEvent<any>> = this.mediaService
        .uploadFileProgress(file, caption)
        .pipe(
          tap((event) => {
            const progressEvent: HttpProgressEvent = event as HttpProgressEvent;
            const percentDone = progressEvent.total
              ? Math.round((100 * progressEvent.loaded) / progressEvent.total)
              : 0;
            console.log(`File "${file.name}" is ${percentDone}% uploaded.`);
            progressCallback(percentDone);
          }),
        );
      const event: HttpEvent<any> = await lastValueFrom(uploadProgress);
      switch (event.type) {
        case HttpEventType.Response:
          console.log(`File was completely uploaded!`);
          for (const content of postData.post_content) {
            for (const field of content.fields) {
              if (field.input === 'upload') {
                field.value.value = event.body.result.id;
              }
            }
          }
          break;
      }

      Filesystem.deleteFile({
        directory: Directory.Data,
        path: path,
      });

      delete postData.file;
      console.log('Postdata - ' + postData);
    } catch (error: any) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    return postData;
  }
}
