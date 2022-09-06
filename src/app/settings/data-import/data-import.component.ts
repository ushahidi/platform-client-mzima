import { Component, OnInit } from '@angular/core';
import { FormAttributeInterface, FormCSVInterface, FormInterface } from '@models';
import { DataImportService, FormsService, NotificationService } from '@services';
import { forkJoin, Observable } from 'rxjs';

enum PostStatus {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}
@Component({
  selector: 'app-data-import',
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.scss'],
})
export class DataImportComponent implements OnInit {
  PostStatus = PostStatus;

  selectedFile: File;
  selectedForm: FormInterface;
  forms$: Observable<FormInterface[]>;
  uploadedCSV: FormCSVInterface;
  currentStep = 1;
  hasRequiredTask = false;
  requiredFields = new Map<string, string>();
  maps_to: any = {};

  statusOption: string;
  selectedStatus: PostStatus;

  constructor(
    private importService: DataImportService,
    private notification: NotificationService,
    private formsService: FormsService,
  ) {}

  ngOnInit() {
    this.forms$ = this.formsService.getFresh();
  }

  uploadFile($event: any) {
    var reader = new FileReader();
    reader.onload = () => {
      this.selectedFile = $event.target.files[0];
    };
    reader.readAsDataURL($event.target.files[0]);
  }

  completeStepOne() {
    if (!this.selectedFile) return this.notification.showError('notify.data_import.file_missing');
    if (!this.selectedForm) return this.notification.showError('notify.data_import.form_missing');

    this.importService.uploadFile(this.selectedFile, this.selectedForm.id).subscribe({
      next: (csv) => {
        console.log('	csvcsv', csv);
        this.uploadedCSV = csv;
        this.currentStep = 2;
        this.initStepTwo();
      },
    });
  }

  initStepTwo() {
    if (this.uploadedCSV.columns?.every((c: any) => c === ''))
      return this.notification.showError('notify.data_import.empty_mapping_empty');

    forkJoin([
      this.formsService.getStages(this.selectedForm.id.toString()),
      this.formsService.getAttributes(this.selectedForm.id.toString()),
    ]).subscribe({
      next: (result) => {
        console.log('res, ', result);
        this.selectedForm.tasks = result[0];
        this.selectedForm.attributes = result[1];
        this.hasRequiredTask = this.selectedForm.tasks.some((task) => task.required);
        this.setRequiredFields(this.selectedForm.attributes);
      },
    });
  }

  setRequiredFields(attributes: FormAttributeInterface[]) {
    attributes.forEach((attr) => {
      if (attr.required) {
        this.requiredFields.set(attr.key, attr.label);
      }
    });
  }

  setStatus(status: PostStatus) {
    this.selectedStatus = status;
  }

  cancelImport() {}

  completeStepTwo() {}
}
