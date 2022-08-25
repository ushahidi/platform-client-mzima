import { EventEmitter } from '@angular/core';
import { Component, Input, Output } from '@angular/core';
import { NotificationService } from '@services';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
})
export class FileUploaderComponent {
  @Input() required = false;
  @Output() fileUpload = new EventEmitter();
  validation: string;

  constructor(private notificationService: NotificationService) {}

  uploadFile($event: any) {
    if (this.validateFile($event.target.files[0])) {
      var reader = new FileReader();
      reader.onload = () => {
        this.fileUpload.emit({
          file: $event.target.files[0],
          dataURI: reader.result,
          changed: true,
          deleted: false,
        });
      };
      reader.readAsDataURL($event.target.files[0]);
    } else {
      this.notificationService.showError('post.media.error_in_upload');
    }
  }

  private validateFile(file: File) {
    if (this.validation === 'image') {
      const mimeReg = /[\/.](gif|jpg|jpeg|png)$/i;
      return mimeReg.test(file.type) && file.size < 1048576;
    }
    return true;
  }
}

// $scope.required = typeof $attrs.required !== 'undefined';

// $scope.$on('event:FileUpload', function (event) {
//     angular.element(document.querySelector('#file')).val('');
// });

// $scope.uploadFile = function ($event) {
//     if (validateFile($event.target.files[0])) {
//         $scope.container.file = $event.target.files[0];
//         var reader = new FileReader();
//         reader.onload = function () {
//             var dataURL = reader.result;
//             $scope.container.dataURI = dataURL;
//             $scope.container.changed = true;
//             $scope.container.deleted = false;
//             $scope.model = 'changed';
//             $scope.$apply();
//         };
//         reader.readAsDataURL($event.target.files[0]);
//     } else {
//         Notify.error('post.media.error_in_upload');
//     }
// };

// function validateFile(container) {
//     if ($scope.validation === 'image') {
//         var mimeReg = /[\/.](gif|jpg|jpeg|png)$/i;
//         var mimeCheck = mimeReg.test(container.type);
//         var sizeCheck = container.size < 1048576;
//         return mimeCheck && sizeCheck;
//     }
//     return true;
// }
