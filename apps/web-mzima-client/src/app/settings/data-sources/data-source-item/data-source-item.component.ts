import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { arrayHelpers } from '@helpers';
import { combineLatest } from 'rxjs';
import { Location } from '@angular/common';
import { FormsService, DataSourcesService, SurveysService } from '@mzima-client/sdk';
import { ConfigService } from '../../../core/services/config.service';
import { ConfirmModalService } from '../../../core/services/confirm-modal.service';
import { BreakpointService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-data-source-item',
  templateUrl: './data-source-item.component.html',
  styleUrls: ['./data-source-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSourceItemComponent implements AfterContentChecked, OnInit {
  public provider: any;
  public surveyList: any[];
  public form: FormGroup;
  private dataSourceList: any[];
  public selectedSurvey: any;
  public surveyAttributesList: any;
  public currentProviderId: string | null;
  private availableProviders: any[];
  public onCreating: boolean;
  public isDesktop = false;
  providersData: any;
  cloneProviders: any;

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private configService: ConfigService,
    private dataSourcesService: DataSourcesService,
    private confirmModalService: ConfirmModalService,
    private surveysService: SurveysService,
    private formsService: FormsService,
    private translate: TranslateService,
    private breakpointService: BreakpointService,
    private location: Location,
  ) {
    this.breakpointService.isDesktop$.pipe(untilDestroyed(this)).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.currentProviderId = this.route.snapshot.paramMap.get('id');
    if (!this.currentProviderId) {
      this.onCreating = true;
    }
    this.getProviders();
  }

  private getAvailableProviders(providers: any) {
    const tempProviders: any[] = [];
    for (const key in providers) {
      tempProviders.push({
        id: key.toLowerCase(),
        name: key.toLowerCase(),
        type: providers[key as keyof typeof providers],
      });
    }
    return arrayHelpers.sortArray(tempProviders.filter((provider) => !provider.type));
  }

  private getProviders(): void {
    const providers$ = this.configService.getProvidersData(true);
    const surveys$ = this.surveysService.get();
    const dataSources$ = this.dataSourcesService.getDataSource();

    combineLatest([providers$, surveys$, dataSources$]).subscribe({
      next: ([providersData, surveys, dataSources]) => {
        this.providersData = providersData;
        this.cloneProviders = JSON.parse(JSON.stringify(this.providersData));
        this.availableProviders = this.getAvailableProviders(this.providersData.providers);
        this.surveyList = surveys.results;
        this.dataSourceList = this.dataSourcesService.combineDataSource(
          providersData,
          dataSources,
          this.surveyList,
        );
        this.setCurrentProvider();
      },
    });
  }

  public setCurrentProvider(providerId?: any): void {
    if (!this.currentProviderId && !providerId) {
      this.currentProviderId = this.availableProviders[1]?.id as string;
    }
    const id = this.currentProviderId || providerId;
    if (id) {
      this.provider = this.dataSourceList.find((provider) => provider.id === id);
      this.removeControls(this.form.controls);
      this.createForm(this.provider);
      this.addControlsToForm('id', this.fb.control(this.provider.id, Validators.required));
      this.getSurveyAttributes(this.provider.selected_survey);
    } else {
      this.router.navigate(['/settings/data-sources']);
    }
  }

  public getSurveyAttributes(survey: any): void {
    if (!survey) return;
    this.form.patchValue({ form_id: survey });
    this.selectedSurvey = survey;
    const queryParams = {
      order: 'asc',
      orderby: 'priority',
    };
    this.formsService.getAttributes(survey.id, queryParams).subscribe({
      next: (response) => {
        this.surveyAttributesList = response;
        for (const el of this.provider.control_inbound_fields) {
          this.form.patchValue({
            [el.control_label]: this.checkKeyFields(el.control_value),
          });
        }
      },
    });
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  private createForm(provider: any) {
    this.addControlsToForm('form_id', this.fb.control(this.provider?.selected_survey));
    this.createControls(provider.control_options);
    this.createControls(provider.control_inbound_fields);
  }

  private removeControls(controls: any) {
    for (const [key] of Object.entries(controls)) {
      this.form.removeControl(key);
    }
  }

  private createControls(controls: any[]) {
    for (const control of controls) {
      const validatorsToAdd = [];

      if (control?.control_rules) {
        for (const rule of control.control_rules) {
          switch (Object.keys(rule).join()) {
            case 'required':
              validatorsToAdd.push(Validators.required);
              break;
            default:
              break;
          }
        }
      }
      this.addControlsToForm(
        control.control_label,
        this.fb.control(control.control_value, validatorsToAdd),
      );
    }
  }

  private addControlsToForm(name: string, control: AbstractControl) {
    this.form.addControl(name, control);
  }

  public async turnOffDataSource(event: any): Promise<void> {
    if (!event.checked) {
      this.cloneProviders.providers[this.provider.id] = event.checked;
      const confirmed = await this.confirmModalService.open({
        title: this.translate.instant(`settings.data_sources.provider_name`, {
          providerName: this.provider.name,
        }),
        description: this.translate.instant(
          'settings.data_sources.do_you_really_want_to_disconnect',
        ),
        confirmButtonText: this.translate.instant('app.yes_delete'),
        cancelButtonText: this.translate.instant('app.no_go_back'),
      });
      if (!confirmed) {
        this.provider.available_provider = true;
        return;
      }
    }

    this.cloneProviders.providers[this.provider.id] = event.checked;
  }

  public saveProviderData(): void {
    if (this.form.value.form_id) {
      for (const field of this.provider.control_inbound_fields) {
        this.form.patchValue({
          [field.control_label]: this.fillForApi(
            this.filterAttributes('key', this.form.controls[field.control_label].value),
          ),
        });
      }
    }

    if (this.cloneProviders[this.form.value.id]) {
      for (const providerKey in this.cloneProviders[this.form.value.id]) {
        this.cloneProviders[this.form.value.id][providerKey] = this.form.value[providerKey];
      }
      if (this.provider.visible_survey) {
        this.cloneProviders[this.form.value.id].form_id = this.form.value.form_id.id;
        if (this.cloneProviders[this.form.value.id].form_id) {
          const obj: any = {};
          for (const field of this.provider.control_inbound_fields) {
            obj[field.key] = this.form.value[field.control_label];
          }
          console.log('inbound_fields', obj);
          this.cloneProviders[this.form.value.id].inbound_fields = obj;
        }
      } else {
        delete this.cloneProviders[this.form.value.id].form_id;
        delete this.cloneProviders[this.form.value.id].inbound_fields;
      }
    } else {
      const provider: any = {};
      provider[this.form.value.id] = this.form.value;
      if (this.provider.visible_survey) {
        provider[this.form.value.id].form_id = this.form.value.form_id.id;
        if (provider[this.form.value.id].form_id) {
          const obj: any = {};
          for (const field of this.provider.control_inbound_fields) {
            obj[field.key] = this.form.value[field.control_label];
          }
          console.log('provider obj', obj);
          provider[this.form.value.id].inbound_fields = obj;
        }
        console.log('provider', provider);
      } else {
        delete provider[this.form.value.id].form_id;
        delete provider[this.form.value.id].inbound_fields;
      }
      this.cloneProviders = { ...this.cloneProviders, ...provider };
    }

    this.configService.updateProviders(this.cloneProviders).subscribe(() => {
      this.router.navigate(['/settings/data-sources']);
    });
  }

  private checkKeyFields(field: string): any {
    if (field === 'title' || field === 'content') {
      return this.filterAttributes('type', field === 'title' ? field : 'description')?.key;
    } else if (field) {
      return field.replace(/values./gi, '');
    }
  }

  private filterAttributes(param: string, value: string) {
    return this.surveyAttributesList.find((el: any) => el[param] === value);
  }

  private fillForApi(obj: any): string {
    if (!obj) return '';
    if (obj.type === 'title' || obj.type === 'description') {
      return obj.type === 'title' ? obj.type : 'content';
    } else {
      return `values.${obj.key}`;
    }
  }

  public back() {
    if (this.isDesktop) {
      this.router.navigate(['settings/data-sources']);
    } else {
      this.location.back();
    }
  }
}
