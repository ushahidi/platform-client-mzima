import { Directory, Filesystem } from '@capacitor/filesystem';
import { MediaService } from '@mzima-client/sdk';
import { lastValueFrom } from 'rxjs';

export class UploadFileHelper {
  constructor(private mediaService: MediaService) {}

  async uploadFile(postData: any, { data, name, caption, path }: any) {
    const fetchPhoto = await fetch(data);
    const blob = await fetchPhoto.blob();
    const file = new File([blob], name);
    try {
      const uploadObservable = this.mediaService.uploadFile(file, caption);
      const response: any = await lastValueFrom(uploadObservable);

      for (const content of postData.post_content) {
        for (const field of content.fields) {
          if (field.input === 'upload') {
            field.value.value = response.id;
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
