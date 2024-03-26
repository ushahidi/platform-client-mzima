import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SafeUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Directory, FileInfo, Filesystem } from '@capacitor/filesystem';
import { AlphanumericValidator } from '@validators';
import { ConvertImage } from '../../helpers';

const IMAGE_DIR = 'ush-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
  altText?: string;
}

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
  @Input() public requiredError?: boolean;
  @Input() public isConnection: boolean;

  fileName: string;
  captionControl = new FormControl('', AlphanumericValidator());
  id?: number;
  photo: LocalFile | null;
  preview: string | SafeUrl | null;
  altText?: string;
  isDisabled = false;
  upload = false;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(obj: any): void {
    if (obj) {
      console.log('writeValue > obj', obj);
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

  /**
   * Take image from camera or choosing from photos
   */
  async takePicture() {
    try {
      if (Capacitor.getPlatform() != 'web') await Camera.requestPermissions();
      const options = {
        quality: 100,
        allowEditing: false,
        source: CameraSource.Prompt,
        width: 600,
        resultType: CameraResultType.Uri,
      };
      const image = await Camera.getPhoto(options);
      // Check if the storage folder exists or can be read
      const folderExist = await this.checkFolder();
      if (folderExist) {
        if (image) await this.saveImage(image);
      }
      this.transferData({ upload: this.upload });
    } catch (e) {
      console.log('takePicture error: ', e);
    }
  }

  /**
   * Save image to storage
   */
  async saveImage(photo: Photo) {
    const base64Data = await new ConvertImage().readAsBase64(photo);
    this.fileName = new Date().getTime() + '.jpeg';
    const filePath = `${IMAGE_DIR}/${this.fileName}`;
    try {
      const savedFile = await Filesystem.writeFile({
        directory: Directory.Data,
        path: filePath,
        data: base64Data,
      });
      // const file = await this.loadFile();

      if (Capacitor.getPlatform() === 'hybrid') {
        // Display the new image by rewriting the 'file://' path to HTTP
        // Details: https://ionicframework.com/docs/building/webview#file-protocol
        this.photo = {
          name: this.fileName,
          path: savedFile.uri,
          data: Capacitor.convertFileSrc(savedFile.uri),
        };
      } else {
        // Use webPath to display the new image instead of base64 since it's
        // already loaded into memory
        this.photo = {
          name: this.fileName,
          path: filePath,
          data: photo.webPath!,
          // data: `data:image/jpeg;base64,${file.data}`,
        };
      }

      this.upload = true;
      this.preview = null;
    } catch (e) {
      console.log(e);
    }
  }

  async deleteSelectedImage() {
    try {
      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: this.photo!.path,
      });
      this.photo = null;
      this.upload = false;
      this.preview = null;
      this.transferData({ delete: true });
    } catch (e) {
      console.log(e);
    }
  }

  async loadFile() {
    const options = {
      directory: Directory.Data,
      path: IMAGE_DIR,
    };

    try {
      if (Capacitor.getPlatform() != 'web') await Filesystem.requestPermissions();
      const result = await Filesystem.readdir(options);
      return await this.loadFileData(result.files);
    } catch (e) {
      console.log('readdir', e);
      await Filesystem.mkdir(options);
      return false;
    }
  }

  async loadFileData(files: FileInfo[]) {
    const file = files.find((el) => el.name === this.fileName)!;
    const filePath = `${IMAGE_DIR}/${file.name}`;
    const result = await Filesystem.readFile({
      directory: Directory.Data,
      path: filePath,
    });

    return result;
  }

  captionChanged() {
    this.transferData({ upload: this.upload });
  }

  private async checkFolder(): Promise<boolean> {
    const options = {
      directory: Directory.Data,
      path: IMAGE_DIR,
    };
    try {
      const result = await Filesystem.readdir(options);
      return !!result.files;
    } catch (e) {
      await Filesystem.mkdir(options);
      return true;
    }
  }

  private transferData(action: any) {
    let params = {
      caption: this.captionControl.value,
      photo: this.photo,
      id: this.id,
    };
    params = { ...params, ...action };

    console.log('transferData > params', params);

    this.onChange(params);
  }
}
