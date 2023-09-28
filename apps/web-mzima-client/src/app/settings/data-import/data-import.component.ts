import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { omit, clone, invert, keys, includes } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import {
  DataImportService,
  FormsService,
  FormAttributeInterface,
  FormCSVInterface,
  FormInterface,
} from '@mzima-client/sdk';
import { BaseComponent } from '../../base.component';
import { NotificationService } from '../../core/services/notification.service';
import { PollingService } from '../../core/services/polling.service';
import { LoaderService } from '../../core/services/loader.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { BreakpointService, SessionService } from '@services';
import _ from 'lodash';

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
export class DataImportComponent extends BaseComponent implements OnInit {
  PostStatus = PostStatus;
  selectedFile: File;
  selectedForm: FormInterface;
  forms$: Observable<FormInterface[]>;
  uploadedCSV: FormCSVInterface;
  hasRequiredTask = false;
  requiredFields = new Map<string, string>();
  maps_to: any = {};
  uploadErrors: any[] = [];
  fileChanged = false;

  statusOption: string;
  selectedStatus: PostStatus;
  displayedColumns: string[] = ['survey', 'csv'];

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private importService: DataImportService,
    private translateService: TranslateService,
    private notification: NotificationService,
    private pollingService: PollingService,
    private loader: LoaderService,
    private router: Router,
    private route: ActivatedRoute,
    private confirm: ConfirmModalService,
    private formsService: FormsService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();
  }

  ngOnInit() {
    this.forms$ = this.formsService.getFresh();
  }

  loadData(): void {}

  uploadFile($event: any) {
    this.fileChanged = true;
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedFile = $event.target.files[0];
      this.checkFormAndFile();
    };
    reader.readAsDataURL($event.target.files[0]);
  }

  transformAttributes(attributes: any) {
    const titleAttr = _.find(attributes, { type: 'title' });
    const descAttr = _.find(attributes, { type: 'description' });
    const titleLabel = titleAttr
      ? titleAttr.label
      : this.translateService.instant('post.modify.form.title');
    const descLabel = descAttr
      ? descAttr.label
      : this.translateService.instant('post.modify.form.description');

    attributes = _.chain(attributes)
      .reject({ type: 'point' })
      .reject({ type: 'title' })
      .reject({ type: 'description' })
      .push(
        {
          key: 'title',
          label: titleLabel,
          priority: 0,
          required: true,
        },
        {
          key: 'content',
          label: descLabel,
          priority: 1,
          required: true,
        },
      )
      .sortBy('priority')
      .value();

    return attributes;
  }

  private checkFormAndFile() {
    if (this.selectedFile && this.selectedForm) {
      if (this.fileChanged) {
        this.loader.show();
        this.importService.uploadFile(this.selectedFile, this.selectedForm.id).subscribe({
          next: (csv) => {
            this.uploadedCSV = csv;
            this.fileChanged = false;

            if (this.uploadedCSV.columns?.every((c: any) => c === ''))
              return this.notification.showError(
                this.translateService.instant('notify.data_import.empty_mapping_empty'),
              );

            this.proceedAttributes();
            this.uploadErrors = [];
          },
          error: (err) => {
            this.uploadErrors = err.error.errors;
            this.notification.showError(err);
            this.loader.hide();
          },
        });
      } else {
        this.proceedAttributes();
      }
    }
  }

  private proceedAttributes() {
    forkJoin([
      this.formsService.getStages(this.selectedForm.id.toString()),
      this.formsService.getAttributes(this.selectedForm.id.toString()),
    ]).subscribe({
      next: (result) => {
        this.loader.hide();
        this.selectedForm.tasks = result[0];
        this.selectedForm.attributes = this.transformAttributes(result[1]);
        this.hasRequiredTask = this.selectedForm.tasks.some((task) => task.required);
        this.setRequiredFields(this.selectedForm.attributes!);
      },
    });
  }

  formChanged() {
    if (this.selectedFile && this.selectedForm) {
      this.checkFormAndFile();
    }
  }

  setRequiredFields(attributes: FormAttributeInterface[]) {
    this.requiredFields.clear();
    attributes.forEach((attr) => {
      if (attr.required) {
        this.requiredFields.set(attr.key, attr.label);
      }
    });
  }

  cancelImport() {
    this.confirm
      .open({
        title: this.translateService.instant('notify.data_import.csv_import_cancel_confirm'),
      })
      .then(() => {
        this.notification.showError(
          this.translateService.instant('notify.data_import.csv_import_cancel'),
        );
        this.importService.delete(this.uploadedCSV.id).subscribe(() => {
          if (this.isDesktop) {
            this.router.navigate([`/settings/data-import`]);
          } else {
            this.router.navigate([`/settings`]);
          }
        });
      });
  }

  private remapColumns() {
    let map: any = invert(clone(this.maps_to));
    map = omit(map, '');
    const mKeys = keys(map);
    this.uploadedCSV.columns.forEach((col, i) => {
      map[i] = includes(mKeys, i.toString()) ? map[i] : null;
    });
    return map;
  }

  validateCSV() {
    const csvIsValid = true;
    if (_.every(this.uploadedCSV.maps_to, _.isEmpty)) {
      this.notification.showError(this.translateService.instant('notify.data_import.no_mappings'));
      return false;
    }

    const duplicateVars = this.checkForDuplicates();
    const allDuplicatesAreEmpty =
      duplicateVars.filter((o) => o === '').length === duplicateVars.length;
    // if duplicate var only holds '' , warn that column names cannot be empty
    if (duplicateVars.length > 0 && !allDuplicatesAreEmpty) {
      this.notification.showError(
        this.translateService.instant('notify.data_import.duplicate_fields', {
          duplicates: duplicateVars.join(', '),
        }),
      );
      return false;
    } else if (duplicateVars.length > 0) {
      // if duplicate var only holds '' , warn that column names cannot be empty
      this.notification.showError(
        this.translateService.instant('notify.data_import.empty_mapping_empty'),
      );
      return false;
    }

    //Check required fields are set
    const missing = this.checkRequiredFields(this.maps_to);
    if (!_.isEmpty(missing)) {
      this.notification.showError(
        this.translateService.instant('notify.data_import.required_fields', {
          required: missing.join(', '),
        }),
      );
      return false;
    }
    return csvIsValid;
  }

  checkForDuplicates() {
    // Check to make sure the user hasn't double mapped a key
    // First, collect the counts for all keys
    // Remove empty fields
    const map = _.omitBy(this.maps_to, _.isNil);
    return _.chain(map)
      .map((item) => {
        return this.uploadedCSV.columns[item];
      })
      .countBy((item) => {
        return item;
      })
      .pickBy((v) => {
        return v > 1;
      })
      .keys()
      .value();
  }

  checkRequiredFields(fields: any) {
    const missing: any = [];
    this.requiredFields.forEach((v, k) => {
      if (_.isNil(fields[k])) {
        missing.push(v);
      }
    });
    return missing;
  }

  finish() {
    this.uploadedCSV.maps_to = this.remapColumns();
    if (!this.validateCSV()) {
      return;
    }
    this.uploadedCSV.fixed = { form: this.selectedForm.id };

    if (this.statusOption === 'mark_as') {
      this.uploadedCSV.fixed.status = this.selectedStatus;
    } else {
      this.uploadedCSV.maps_to[this.selectedStatus] = 'status';
    }

    this.updateAndImport();
  }

  updateAndImport() {
    this.importService.update(this.uploadedCSV.id, this.uploadedCSV).subscribe(() => {
      this.importService.import({ id: this.uploadedCSV.id, action: 'import' }).subscribe({
        next: () => {
          // this.pollingService.getImportJobs();
          this.router.navigate(['results'], {
            relativeTo: this.route,
            queryParams: { job: this.uploadedCSV.id },
          });
        },
        error: (err) => {
          this.notification.showError(err);
        },
      });
    });
  }
}
