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
import { DataSourceOptions } from '../../../core/interfaces';

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

  getAvailableProviders(providers: any) {
    const tempProviders: any[] = [];
    for (const key in providers) {
      tempProviders.push({
        id: key.toLowerCase(),
        name: key.toLowerCase(),
        type: providers[key as keyof typeof providers],
      });
    }
    return tempProviders.filter((provider) => !provider.type);
  }

  ngOnInit(): void {
    console.log('DataSourceItemComponent');

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
    const dataSourceList$ = this.dataSourcesService.getDataSource();
    combineLatest([dataSourceData$, dataSourceList$]).subscribe({
      next: ([dataSourceData, dataSourceList]) => {
        this.allProvidersData = dataSourceData;
        this.availableProviders = this.getAvailableProviders(this.allProvidersData.providers);

        for (const dataSourceKey in dataSourceData.providers) {
          const item = dataSourceList.results.find((el: { id: string }) => el.id === dataSourceKey);

          if (item) {
            const dataSourceDataItem = dataSourceData.providers[item.id];
            for (const dataKey in item.options) {
              const key = dataKey as string;
              const ctrl = item.options[key as keyof DataSourceOptions];
              if (ctrl?.rules) {
                const rule = ctrl.rules.map((el: string) => ({ [el]: true }));
                ctrl.control_rules = rule;
                ctrl.control_label = dataKey;

                if (dataSourceDataItem.hasOwnProperty(dataKey) && dataSourceKey === item.id) {
                  ctrl.control_value = dataSourceDataItem[dataKey] || null;
                }
              }
            }

            item.control_options = Object.values(item.options);
            item.available_provider = dataSourceData.providers[dataSourceKey] || false;
            item.visible_survey = !!Object.keys(dataSourceData[dataSourceKey] || {}).length;

            let inboundFieldsArr: any[] = [];
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

        console.log(this.dataSourceList);

        // console.log(this.availableProviders);
        this.setCurrentProvider();
      },
    });
  }

  public setCurrentProvider(providerId?: string): void {
    if (!this.currentProviderId && !providerId) {
      this.currentProviderId = this.availableProviders[0]?.id as string;
    }

    const id = this.currentProviderId || providerId;
    console.log(id);

    if (id) {
      this.provider = this.dataSourceList.find((provider) => provider.id === id);
      this.removeControls(this.form.controls);
      this.createForm(this.provider);
      this.addControlsToForm('id', this.fb.control(this.provider.id, Validators.required));
    } else {
      // this.router.navigate(['/settings/data-sources']);
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
    this.createControls(provider.control_options);
    this.createControls(provider.inbound_fields);
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
        for (const [key] of Object.entries(control.control_rules)) {
          switch (key) {
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
