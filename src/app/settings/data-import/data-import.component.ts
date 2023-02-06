import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { omit, clone, invert, keys, includes } from 'lodash';
import { FormAttributeInterface, FormCSVInterface, FormInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import {
  ConfirmModalService,
  DataImportService,
  FormsService,
  LoaderService,
  NotificationService,
  PollingService,
  BreakpointService,
} from '@services';
import { forkJoin, Observable } from 'rxjs';

enum PostStatus {
  Published = 'published',
  Draft = 'draft',
  Archived = 'archived',
}

@UntilDestroy()
@Component({
  selector: 'app-data-import',
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.scss'],
})
export class DataImportComponent implements OnInit {
  PostStatus = PostStatus;
  private isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
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
  public isDesktop = false;

  constructor(
    private importService: DataImportService,
    private translateService: TranslateService,
    private notification: NotificationService,
    private pollingService: PollingService,
    private loader: LoaderService,
    private router: Router,
    private route: ActivatedRoute,
    private confirm: ConfirmModalService,
    private formsService: FormsService,
    private breakpointService: BreakpointService,
  ) {
    this.isDesktop$.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  ngOnInit() {
    this.forms$ = this.formsService.getFresh();
  }

  uploadFile($event: any) {
    var reader = new FileReader();
    reader.onload = () => {
      this.selectedFile = $event.target.files[0];
      this.checkFormAndFile();
    };
    reader.readAsDataURL($event.target.files[0]);
  }

  private checkFormAndFile() {
    if (this.selectedFile && this.selectedForm) {
      this.loader.show();
      this.importService.uploadFile(this.selectedFile, this.selectedForm.id).subscribe({
        next: (csv) => {
          this.uploadedCSV = csv;

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
              this.selectedForm.tasks = result[0];
              this.selectedForm.attributes = result[1];
              this.hasRequiredTask = this.selectedForm.tasks.some((task) => task.required);
              this.setRequiredFields(this.selectedForm.attributes);
            },
          });
        },
        error: (err) => {
          this.notification.showError(err);
          this.loader.hide();
        },
      });
    }
  }

  formChanged() {
    if (this.selectedFile && this.selectedForm) {
      this.checkFormAndFile();
    }
  }

  setRequiredFields(attributes: FormAttributeInterface[]) {
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

  finish() {
    this.uploadedCSV.maps_to = this.remapColumns();
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
