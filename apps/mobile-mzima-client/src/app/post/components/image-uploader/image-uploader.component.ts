import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
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
  // preview: string;
  isDisabled = false;
  upload = false;
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(obj: any): void {
    if (obj) {
      this.upload = false;
      this.captionControl.patchValue(obj.caption);
      this.id = obj.id;
      this.photo = obj.photo;
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

  async loadFiles() {
    const options = {
      directory: Directory.Data,
      path: IMAGE_DIR,
    };

    try {
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

    this.photo = {
      name: file.name,
      path: filePath,
      data: `data:image/jpeg;base64,${readFile.data}`,
    };

    this.transferData({ upload: this.upload });

    // for (const file of files) {
    //   const filePath = `${IMAGE_DIR}/${this.fileName}`;
    //   const readFile = await Filesystem.readFile({
    //     directory: Directory.Data,
    //     path: filePath,
    //   });
    //
    //   this.files.push({
    //     name: file.name,
    //     path: filePath,
    //     data: `data:image/jpeg;base64,${readFile.data}`,
    //   });
    // }
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
      if (image) this.saveImage(image);
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
    await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${this.fileName}`,
      data: base64Data,
    });
    this.loadFiles();
  }

  async startUpload() {
    const response = await fetch(this.photo!.data);
    console.log('response', response);

    const blob = await response.blob();
    console.log('blob', blob);

    const formData = new FormData();
    formData.append('file', blob, this.photo!.name);
    this.uploadData(formData);
  }

  async uploadData(formData: FormData) {
    console.log(formData);
    // upload to server
  }

  async deleteImage() {
    // const confirmed = await this.confirm.open({
    //   title: this.translate.instant('notify.default.are_you_sure_you_want_to_delete_this'),
    //   description: this.translate.instant('notify.default.proceed_warning'),
    // });

    // if (!сonfirmed) return;

    this.photo = null;

    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: this.photo!.path,
    });

    this.loadFiles();
    this.transferData({ delete: true });
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
