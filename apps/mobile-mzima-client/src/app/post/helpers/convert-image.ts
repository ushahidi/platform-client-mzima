import { Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';

export class ConvertImage {
  async readAsBase64(photo: Photo) {
    if (Capacitor.getPlatform() === 'hybrid') {
      console.log('Reading in Hybrid mode');
      const file = await Filesystem.readFile({
        path: photo.path!,
      });

      return file.data;
    } else {
      console.log('Reading in Web mode');
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return (await this.blobToBase64(blob)) as string;
    }
  }

  blobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

  dataUrlToBlob(dataURI: any): Blob {
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const byteString = atob(dataURI.split(',')[1]);
    const arrayBufer = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(arrayBufer);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBufer], { type: mimeString });
  }
}
