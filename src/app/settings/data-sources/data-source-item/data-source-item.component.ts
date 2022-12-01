import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSourceConfigInterface } from '@models';
import {
  ConfigService,
  ConfirmModalService,
  DataSourcesService,
  FormsService,
  SurveysService,
} from '@services';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-data-source-item',
  templateUrl: './data-source-item.component.html',
  styleUrls: ['./data-source-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSourceItemComponent implements AfterContentChecked, OnInit {
  public provider: any;
  public surveyList: any[];
  public form: FormGroup = this.fb.group({});
  public dataSourceList: any[];
  private allProvidersData: DataSourceConfigInterface;
  public isImportToSurvey = true;
  public surveyAttributesList: any;
  public currentProviderId: string | null;
  public availableProviders: any[];
  public onCreating: boolean;

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
  ) {}

  ngOnInit(): void {
    this.currentProviderId = this.route.snapshot.paramMap.get('id');
    if (!this.currentProviderId) {
      this.onCreating = true;
    }
    this.getProviders();
    this.getSurveys();
  }

  private getSurveys(): void {
    this.surveysService.get().subscribe({
      next: (response) => (this.surveyList = response.results),
    });
  }

  private getProviders(): void {
    const tempControls: any[] = [];
    const dataSourceData$ = this.configService.getProvidersData();
    const dataSourceList$ = this.dataSourcesService.get();
    combineLatest([dataSourceData$, dataSourceList$]).subscribe({
      next: ([dataSourceData, dataSourceList]) => {
        this.allProvidersData = dataSourceData;
        for (const dataSourceKey in dataSourceData) {
          const item = dataSourceList.results.find((el: { id: string }) => el.id === dataSourceKey);
          if (item) {
            const dataSourceDataItem = dataSourceData[item.id];
            for (const dataKey in item.options) {
              const ctrl = item.options[dataKey];
              if (ctrl.rules) ctrl.rules = ctrl.rules.map((el: any) => ({ [el]: true }));
              ctrl.form_label = dataKey;
              if (dataSourceDataItem.hasOwnProperty(dataKey) && dataSourceKey === item.id) {
                ctrl.value = dataSourceDataItem[dataKey] || null;
              }
            }
            item.options = Object.values(item.options);
            item.available_provider = dataSourceData.providers[dataSourceKey];
            item.visible_survey = !!Object.keys(dataSourceData[dataSourceKey]).length;

            let inboundFieldsArr = [];
            for (const dataKey in item.inbound_fields) {
              inboundFieldsArr.push({
                form_label: dataKey.toLowerCase(),
                type: item.inbound_fields[dataKey],
              });
            }
            item.inbound_fields = inboundFieldsArr;
            tempControls.push(item);
          }
        }
        this.dataSourceList = tempControls.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
        this.setCurrentProvider();
      },
    });
  }

  public setCurrentProvider(providerId?: string): void {
    if (!this.currentProviderId && !providerId) {
      this.availableProviders = this.dataSourceList.filter(
        (provider) => !provider.available_provider,
      );
      this.currentProviderId = this.availableProviders[0]?.id as string;
    }

    const id = this.currentProviderId || providerId;

    if (id) {
      this.provider = this.dataSourceList.find((provider) => provider.id === id);
      this.removeControls(this.form.controls);
      this.createForm(this.provider);
      this.addControlsToForm('id', this.fb.control(this.provider.id, Validators.required));
    } else {
      this.router.navigate(['/settings/data-sources']);
    }
  }

  public getSurveyAttributes(id: number): void {
    const queryParams = {
      order: 'asc',
      orderby: 'priority',
    };
    this.formsService.getAttributes(id.toString(), queryParams).subscribe({
      next: (response) => {
        this.surveyAttributesList = response;
      },
    });
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  private createForm(provider: any) {
    this.createControls(provider.options);
    this.createControls(provider.inbound_fields);
  }

  private removeControls(controls: any) {
    for (const [key] of Object.entries(controls)) {
      this.form.removeControl(key);
    }
  }

  private createControls(controls: any) {
    for (const control of controls) {
      const validatorsToAdd = [];

      if (control?.rules) {
        for (const [key] of Object.entries(control.rules)) {
          switch (key) {
            case 'required':
              validatorsToAdd.push(Validators.required);
              break;
            default:
              break;
          }
        }
      }
      this.addControlsToForm(control.form_label, this.fb.control(control.value, validatorsToAdd));
    }
  }

  private addControlsToForm(name: string, control: AbstractControl) {
    this.form.addControl(name, control);
  }

  public async turnOffDataSource(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: `Are you sure you want to Delete ${this.provider.name} Data Source?`,
      description:
        '<p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Remember, you won’t be able to redo this action.</p>',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'No, go back',
    });
    if (!confirmed) return;

    console.log('remove: ', this.provider);
  }

  // TODO: Check the API when an endpoint object check will be added
  public changeAvailableProviders(event: any): void {
    const providers = JSON.parse(JSON.stringify(this.allProvidersData.providers));
    providers[this.provider.id] = event.checked;
    const body = { providers };
    console.log(body);
    // this.configService.updateProviders(providers).subscribe(() => this.getProvidersList());
  }

  // TODO: Check the API when an endpoint object check will be added
  public saveProviderData(event: any): void {
    console.log('submit > formControls', event);
    // this.configService.updateProviders(providersData).subscribe(() => this.getProvidersList());
  }
}
