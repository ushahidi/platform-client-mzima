import { Component, OnInit } from '@angular/core';
import { FormInterface, ExportJobInterface } from '@models';
import { ExportJobsService, FormsService, PollingService, SessionService } from '@services';

@Component({
  selector: 'app-data-export',
  templateUrl: './data-export.component.html',
  styleUrls: ['./data-export.component.scss'],
})
export class DataExportComponent implements OnInit {
  forms: FormInterface[] = [];
  fieldsMap: any = {};
  exportJobs: ExportJobInterface[] = [];
  hxlEnabled = false;
  hxlApiKey = false;
  showProgress = false;
  exportView = true;

  constructor(
    private formsService: FormsService,
    private sessionService: SessionService,
    private exportJobsService: ExportJobsService,
    private pollingService: PollingService,
  ) {}

  ngOnInit() {
    this.formsService.get().subscribe((forms) => {
      this.forms = forms.results;
      this.attachFormAttributes();
    });

    this.hxlEnabled = !!this.sessionService.getFeatureConfigurations().hxl?.enabled;
    this.loadExportJobs();
  }

  loadExportJobs() {
    this.exportJobsService.get().subscribe((jobs) => {
      this.exportJobs = jobs.results.reverse();
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
