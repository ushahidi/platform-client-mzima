import { Directory, Filesystem } from '@capacitor/filesystem';
import { MediaService } from '@mzima-client/sdk';
import { lastValueFrom } from 'rxjs';

export class UploadFileProgressHelper {
  constructor(private mediaService: MediaService) {}

  async uploadFile(postData: any, { data, name, caption, path }: any) {
    console.log('uploadFile > photo', data, name, caption, path);
    const fetchPhoto = await fetch(data);
    const blob = await fetchPhoto.blob();
    console.log('uploadFile > blob', blob);
    const file = new File([blob], name);
    console.log('uploadFile > file ', file);
    try {
      const uploadObservable = this.mediaService.uploadFileProgress(file, caption);
      const response: any = await lastValueFrom(uploadObservable);
      console.log(response);
      for (const content of postData.post_content) {
        for (const field of content.fields) {
          if (field.input === 'upload') {
            field.value.value = response.result.id;
          }
        }
      }

      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: path,
      });

      delete postData.file;

      return postData;
    } catch (error: any) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }
}
