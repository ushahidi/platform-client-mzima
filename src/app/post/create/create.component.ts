import { Component } from '@angular/core';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  constructor() {
    this.loadData();
  }

  private loadData() {
    // let requests = [SurveysSdk.findSurveyTo($scope.formId, 'get_minimal_form')];
    // return $q.all(requests).then(function (results) {
    //     $scope.post.form = results[0];
    //     $scope.post.post_content = results[0].tasks;
    //     $scope.languages = {default: results[0].enabled_languages.default, active: results[0].enabled_languages.default,  available: [results[0].enabled_languages.default, ...results[0].enabled_languages.available]}
    //     // Initialize values on new post
    //     $scope.post.post_content.map(task => {
    //         console.log('task: ', task);
    //         task.fields.map (attr => {
    //             // Create associated media entity
    //             if (!attr.value) {
    //                 attr.value = {};
    //             }
    //             if (attr.input === 'upload') {
    //                 $scope.medias[attr.id] = {};
    //             }
    //             if (attr.type === 'decimal') {
    //                 if (attr.value.value) {
    //                     attr.value.value = parseFloat(attr.value.value);
    //                 } else if (attr.default) {
    //                     attr.value.value = parseFloat(attr.default);
    //                 }
    //             }
    //             if (attr.type === 'int') {
    //                 if (attr.value.value) {
    //                     attr.value.value = parseInt(attr.value.value);
    //                 } else if (attr.default) {
    //                     attr.value.value = parseInt(attr.default);
    //                 }
    //             }
    //             if (attr.input === 'datetime') {
    //                 // Date picker requires date object
    //                 // ensure that dates are preserved in UTC
    //                 if (attr.value.value) {
    //                     attr.value.value = dayjs(attr.value.value).toDate();
    //                 } else if (attr.default) {
    //                     attr.value.value = new Date(attr.default);
    //                 } else {
    //                     attr.value.value = attr.required ? dayjs(new Date()).toDate() : null;
    //                 }
    //             }
    //             if (attr.input === 'date') {
    //                 // We are only interested in year-month-day for date-fields
    //                 if (attr.value.value) {
    //                     attr.value.value = dayjs(attr.value.value).format('YYYY-MM-DD');
    //                 } else if (attr.default) {
    //                     try {
    //                         let defaultValue = dayjs(new Date(attr.default));
    //                         // Safeguarding against invalid default dates below. We should add validation in the survey setup instead
    //                         if (defaultValue.isValid()) {
    //                             attr.value.value = defaultValue.format('YYYY-MM-DD');
    //                         }
    //                     } catch (err) {
    //                         // What do do if the default-value is in the wrong format?
    //                     }
    //                 }
    //                 else {
    //                     attr.value.value = attr.required ? dayjs(new Date()).format('YYYY-MM-DD') : null;
    //                 }
    //             }
    //         });
    //     });
    // });
  }
}
