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

  fileName: string;
  captionControl = new FormControl('', AlphanumericValidator());
  id?: number;
  photo: LocalFile | null;
  preview: string | SafeUrl | null;
  isDisabled = false;
  upload = false;
  onChange: any = () => {};
  onTouched: any = () => {};

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

  /**
   * Take image from camera or choosing from photos
   */
  async takePicture() {
    try {
      if (Capacitor.getPlatform() != 'web') await Camera.requestPermissions();
      const options = {
        quality: 90,
        allowEditing: false,
        source: CameraSource.Prompt,
        width: 600,
        resultType: CameraResultType.Uri,
      };
      const image = await Camera.getPhoto(options);
      const folderExist = await this.checkFolder();
      if (folderExist) {
        if (image) await this.saveImage(image);
      }
    } catch (e) {
      console.log('takePicture error: ', e);
    }
  }

  async checkFolder(): Promise<boolean> {
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

  /**
   * Save image to storage
   */
  async saveImage(photo: Photo) {
    const base64Data = await new ConvertImage().readAsBase64(photo);
    this.fileName = new Date().getTime() + '.jpeg';
    try {
      await Filesystem.writeFile({
        directory: Directory.Data,
        path: `${IMAGE_DIR}/${this.fileName}`,
        data: base64Data,
      });
      this.loadFiles();
    } catch (e) {
      console.log(e);
    }
  }

  async loadFiles() {
    const options = {
      directory: Directory.Data,
      path: IMAGE_DIR,
    };

    try {
      if (Capacitor.getPlatform() != 'web') await Filesystem.requestPermissions();
      const result = await Filesystem.readdir(options);
      this.loadFileData(result.files);
    } catch (e) {
      console.log('readdir', e);
      await Filesystem.mkdir(options);
    }
  }

  async loadFileData(files: FileInfo[]) {
    const file = files.find((el) => el.name === this.fileName)!;
    const filePath = `${IMAGE_DIR}/${file.name}`;
    const readFile = await Filesystem.readFile({
      directory: Directory.Data,
      path: filePath,
    });

    this.upload = true;
    this.preview = null;
    this.photo = {
      name: file.name,
      path: filePath,
      data: `data:image/jpeg;base64,${readFile.data}`,
    };

    console.log('loadFileData', this.photo);

    this.transferData({ upload: this.upload });
  }

  async deleteSelectedImage() {
    try {
      await this.deleteImage();
      this.loadFiles();
      this.transferData({ delete: true });
    } catch (e) {
      console.log(e);
    }
  }

  async deleteImage() {
    try {
      await Filesystem.deleteFile({
        directory: Directory.Data,
        path: this.photo!.path,
      });
      this.photo = null;
    } catch (e) {
      console.log(e);
    }
  }

  captionChanged() {
    this.transferData({ upload: this.upload });
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
