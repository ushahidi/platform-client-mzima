import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { DataSourceConfigInterface } from '@models';
import {
  ConfigService,
  ConfirmModalService,
  DataSourcesService,
  FormsService,
  SurveysService,
} from '@services';
import { arrayHelpers } from '@helpers';
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
  // private allProvidersData: DataSourceConfigInterface;
  public isImportToSurvey = true;
  public selectedSurvey: any;
  public surveyAttributesList: any;
  public currentProviderId: string | null;
  public availableProviders: any[];
  public onCreating: boolean;

  providersData: any;

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
    return arrayHelpers.sortArray(tempProviders.filter((provider) => !provider.type));
  }

  ngOnInit(): void {
    this.currentProviderId = this.route.snapshot.paramMap.get('id');
    if (!this.currentProviderId) {
      this.onCreating = true;
    }
    this.getProviders();
  }

  private getProviders(): void {
    const providers$ = this.configService.getProvidersData(true);
    const surveys$ = this.surveysService.get();
    const dataSources$ = this.dataSourcesService.getDataSource();

    combineLatest([providers$, surveys$, dataSources$]).subscribe({
      next: ([providersData, surveys, dataSources]) => {
        this.providersData = providersData;
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
      this.currentProviderId = this.availableProviders[0]?.id as string;
    }
    const id = this.currentProviderId || providerId;
    if (id) {
      this.provider = this.dataSourceList.find((provider) => provider.id === id);
      this.removeControls(this.form.controls);
      this.createForm(this.provider);
      this.addControlsToForm('id', this.fb.control(this.provider.id, Validators.required));
      this.getSurveyAttributes(this.provider.selected_survey);

      console.log(this.provider);
    } else {
      // this.router.navigate(['/settings/data-sources']);
    }
  }

  public getSurveyAttributes(survey: any): void {
    this.selectedSurvey = survey;
    const queryParams = {
      order: 'asc',
      orderby: 'priority',
    };
    this.formsService.getAttributes(survey.id, queryParams).subscribe({
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

  // TODO: add translate
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
    // const providers = JSON.parse(JSON.stringify(this.providersData.providers));
    // providers[this.provider.id] = event.checked;
    // console.log(providers);

    // const body = { providers };
    // console.log(body);

    this.providersData.providers[this.provider.id] = event.checked;
    console.log('providersData', this.providersData);

    // allowed_privileges: ['read', 'create', 'update', 'delete', 'search']
    // authenticable-providers:  {gmail: true}
    // email: {incoming_type: 'IMAP', incoming_server: 'asdf', incoming_port: 3, incoming_security: 'SSL', incoming_username: 'sadf', …}
    // frontlinesms: {server_url: 'https://server.url.com/', key: '6187c7f5-7195-4039-9fa5-6980094d3a9f', secret: '1234567890', form_id: undefined}
    // gmail: {redirect_uri: 'urn:ietf:wg:oauth:2.0:oob', authenticated: false}
    // id: "data-provider"
    // nexmo: {from: 'sdfasdf', api_key: 'sdfas', api_secret: 'asfd'}
    // providers: {smssync: true, email: false, outgoingemail: true, twilio: true, nexmo: true, …}
    // smssync: {secret: 'dsfsdfasdf'}
    // twilio: {}
    // twitter: {consumer_key: 'ds', consumer_secret: 'ss', oauth_access_token: 'ss', oauth_access_token_secret: 'ss', twitter_search_terms: 's'}
    // url: "https://tuxpiper.api.ushahidi.io/api/v3/config/data-provider"

    // this.configService.updateProviders(providers).subscribe(() => this.getProvidersList());
  }

  // TODO: Check the API when an endpoint object check will be added
  public saveProviderData(): void {
    console.log('submit > formControls', this.form.value);

    // allowed_privileges: ['read', 'create', 'update', 'delete', 'search']
    // authenticable-providers : {gmail: true}
    // email : {incoming_type: 'IMAP', incoming_server: 'asdf', incoming_port: 3, incoming_security: 'SSL', incoming_username: 'sadf', …}
    // frontlinesms : {server_url: 'https://server.url.com/', key: '6187c7f5-7195-4039-9fa5-6980094d3a9f', secret: '1234567890'}
    // gmail : {redirect_uri: 'urn:ietf:wg:oauth:2.0:oob', authenticated: false}
    // id : "data-provider"
    // nexmo : {from: 'sdfasdf', api_key: 'sdfas', api_secret: 'asfd'}
    // providers : {smssync: true, email: true, outgoingemail: true, twilio: true, nexmo: true, …}
    // smssync : {secret: 'dsfsdfasdf'}
    // twilio : {}
    // twitter : {consumer_key: 'ds', consumer_secret: 'ss', oauth_access_token: 'ss', oauth_access_token_secret: 'ss', twitter_search_terms: 's'}
    // url : "https://tuxpiper.api.ushahidi.io/api/v3/config/data-provider"

    console.log('dataSourceList', this.dataSourceList);

    console.log('providersData', this.providersData);

    // this.configService.updateProviders(providersData).subscribe(() => this.getProvidersList());
  }
}
