import { Component, OnInit } from '@angular/core';
import { CONST } from '@constants';
import { Observable } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PollingService, SessionService, BreakpointService } from '@services';
import {
  ExportJobsService,
  FormsService,
  FormInterface,
  ExportJobInterface,
  UsersService,
} from '@mzima-client/sdk';

@UntilDestroy()
@Component({
  selector: 'app-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss'],
})
export class DataExportComponent implements OnInit {
  public isDesktop$: Observable<boolean>;
  forms: FormInterface[] = [];
  fieldsMap: any = {};
  exportJobs: ExportJobInterface[] = [];
  hxlEnabled = false;
  hxlApiKey = false;
  showProgress = false;
  exportView = true;
  exportJobsReady = false;

  constructor(
    private formsService: FormsService,
    private sessionService: SessionService,
    private usersService: UsersService,
    private exportJobsService: ExportJobsService,
    private pollingService: PollingService,
    private breakpointService: BreakpointService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

  ngOnInit() {
    this.formsService.get().subscribe((forms) => {
      this.forms = forms.results;
      this.attachFormAttributes();
    });
    this.initUserSettings();

    this.hxlEnabled = !!this.sessionService.getFeatureConfigurations().hxl?.enabled;
    this.loadExportJobs();
  }

  initUserSettings() {
    const userId = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}userId`);
    if (userId) {
      this.usersService.getUserSettings(userId).subscribe({
        next: (response) => {
          this.hxlApiKey = response.results?.some((setting: any) => {
            return setting.config_key === 'hdx_api_key';
          });
        },
      });
    }
  }

  loadExportJobs() {
    this.exportJobsReady = false;
    this.exportJobsService.get().subscribe({
      next: (jobs) => {
        this.exportJobs = jobs.reverse();
        this.exportJobsReady = true;
      },
      error: (err) => {
        console.error('Export failed: ', err);
        this.exportJobsReady = true;
      },
    });
  }

  exportAll() {
    this.pollingService
      .startExport({ send_to_hdx: false, include_hxl: false, send_to_browser: true })
      .subscribe();
    this.showProgress = true;
  }

  selectAll(form: FormInterface) {
    if (this.isAllSelected(form)) {
      form.attributes?.forEach((attr) => {
        this.fieldsMap[form.id][attr.key] = false;
      });
    } else {
      form.attributes?.forEach((attr) => {
        this.fieldsMap[form.id][attr.key] = true;
      });
    }
  }

  isAllSelected(form: FormInterface) {
    return this.getSelectedAttrCount(form.id) === form.attributes?.length;
  }

  private getSelectedAttrCount(formId: string | number) {
    return Object.values(this.fieldsMap[formId]).filter((q) => !!q).length;
  }

  exportSelected() {
    const fields: string[] = [];
    Object.keys(this.fieldsMap).forEach((form) => {
      Object.keys(this.fieldsMap[form]).forEach((key) => {
        if (this.fieldsMap[form][key]) {
          fields.push(key);
        }
      });
    });
    this.pollingService
      .startExport({ fields, send_to_hdx: false, include_hxl: false, send_to_browser: true })
      .subscribe();
  }

  selectFields() {
    this.exportView = !this.exportView;
  }

  private attachFormAttributes() {
    this.forms.forEach((form) => {
      this.formsService
        .getAttributes(form.id.toString())
        .pipe()
        .subscribe({
          next: (attr) => {
            form.attributes = attr;
            this.fieldsMap[form.id] = {};
          },
        });
    });
  }
}
