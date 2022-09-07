import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { FormAttributeInterface, FormCSVInterface, FormInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { DataImportService, FormsService, LoaderService, NotificationService } from '@services';
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
  @ViewChild('stepper') stepper: MatStepper;
  PostStatus = PostStatus;

  selectedFile: File;
  selectedForm: FormInterface;
  forms$: Observable<FormInterface[]>;
  uploadedCSV: FormCSVInterface;
  hasRequiredTask = false;
  requiredFields = new Map<string, string>();
  maps_to: any = {};

  statusOption: string;
  selectedStatus: PostStatus;
  displayedColumns: string[] = ['survey', 'csv'];

  constructor(
    private importService: DataImportService,
    private translateService: TranslateService,
    private notification: NotificationService,
    private loader: LoaderService,
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
    if (!this.selectedFile)
      return this.notification.showError(
        this.translateService.instant('notify.data_import.file_missing'),
      );
    if (!this.selectedForm)
      return this.notification.showError(
        this.translateService.instant('notify.data_import.form_missing'),
      );

    this.loader.show();
    this.importService.uploadFile(this.selectedFile, this.selectedForm.id).subscribe({
      next: (csv) => {
        this.uploadedCSV = csv;
        this.stepper.selected!.completed = true;
        this.stepper.selected!.editable = false;
        this.stepper.next();
        this.initStepTwo();
      },
    });
  }

  initStepTwo() {
    if (this.uploadedCSV.columns?.every((c: any) => c === ''))
      return this.notification.showError(
        this.translateService.instant('notify.data_import.empty_mapping_empty'),
      );

    forkJoin([
      this.formsService.getStages(this.selectedForm.id.toString()),
      this.formsService.getAttributes(this.selectedForm.id.toString()),
    ]).subscribe({
      next: (result) => {
        this.loader.hide();
        console.log('res, ', result);
        this.selectedForm.tasks = result[0];
        this.selectedForm.attributes = result[1];
        this.hasRequiredTask = this.selectedForm.tasks.some((task) => task.required);
        this.setRequiredFields(this.selectedForm.attributes);
        console.log(1111, this.stepper.steps);
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

  cancelImport() {}

  completeStepTwo() {}
}
